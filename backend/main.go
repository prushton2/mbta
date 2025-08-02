package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"

	"prushton.com/mbta/types"
)

var snapshotMutex sync.RWMutex
var snapshot types.Snapshot = types.Snapshot{}

func getLiveData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	snapshotMutex.Lock()
	str, err := json.Marshal(snapshot)
	snapshotMutex.Unlock()

	if err != nil {
		http.Error(w, fmt.Sprintf("Error marshaling data: ", err), http.StatusInternalServerError)
		return
	}

	io.Writer.Write(w, str)
}

func healthcheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	io.WriteString(w, "responseString")
}

func main() {
	http.HandleFunc("/v1/live", getLiveData)
	http.HandleFunc("/healthcheck", healthcheck)

	go getTrainUpdates()

	fmt.Println("Server listening on http://localhost:3000")
	http.ListenAndServe(":3000", nil)
}
