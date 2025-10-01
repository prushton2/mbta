package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	brotli "github.com/andybalholm/brotli"
	"prushton.com/mbta/types"
)

var snapshotMutex sync.RWMutex
var snapshot types.Snapshot = types.Snapshot{}

func compress(data []byte) ([]byte, error) {
	var compressed bytes.Buffer

	writer := brotli.NewWriter(&compressed)

	_, err := writer.Write(data)

	if err != nil {
		return nil, err
	}

	writer.Close()

	b, err := io.ReadAll(&compressed)

	if err != nil {
		return nil, err
	}

	return b, nil
}

func getLiveData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	snapshotMutex.Lock()
	str, err := json.Marshal(snapshot)
	snapshotMutex.Unlock()

	if err != nil {
		http.Error(w, fmt.Sprintf("Error marshaling data: %s", err), http.StatusInternalServerError)
		return
	}

	compressed, err := compress(str)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error compressing data: %s", err), http.StatusInternalServerError)
		return
	}

	// fmt.Printf(" --- Compression Stats --- \nUncompressed Size: %d\n  Compressed Size: %d (%v%%)\n", len(str), len(compressed), 100-len(compressed)*100/len(str))

	io.Writer.Write(w, compressed)
}

func getHistoricalData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	query := r.URL.Query()
	t, err := strconv.ParseInt(query.Get("t"), 10, 64)
	now := time.Now().Unix()

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Querystring parameter t is required and must be an int of seconds")
		return
	}

	var timeframe types.Timeframe = types.Timeframe{
		Snapshots: make(map[int64]types.Snapshot),
	}

	files, err := os.ReadDir("./data/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		timeRecorded, err := strconv.ParseInt(strings.Split(file.Name(), ".")[0], 10, 64)
		if err != nil {
			continue
		}
		// if the time we go back is later than the time the snapshot was recorded, dont add to timeframe
		if now-t > timeRecorded {
			continue
		}

		data, err := os.ReadFile(fmt.Sprintf("./data/%s", file.Name()))
		if err != nil {
			log.Fatal(err)
		}

		var snapshot types.Snapshot
		err = json.Unmarshal(data, &snapshot)
		if err != nil {
			continue
		}
		timeframe.Snapshots[timeRecorded] = snapshot
	}

	// something needs to happen here, this gives a shit ton of data (bad)
	bytes, err := json.Marshal(timeframe)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Error marshaling data")
	}

	compressed, err := compress(bytes)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error compressing data: %s", err), http.StatusInternalServerError)
		return
	}

	io.Writer.Write(w, compressed)
}

func healthcheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	io.WriteString(w, "responseString")
}

func main() {
	http.HandleFunc("/v1/live", getLiveData)
	http.HandleFunc("/v1/historical", getHistoricalData)
	http.HandleFunc("/healthcheck", healthcheck)

	go getTrainUpdates()

	fmt.Println("Server listening on http://localhost:3000")
	http.ListenAndServe(":3000", nil)
}
