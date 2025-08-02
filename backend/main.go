package main

import (
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

	io.WriteString(w, "responseString")
}

func healthcheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Request-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
}

func main() {
	http.HandleFunc("/v1/live", getLiveData)
	http.HandleFunc("/healthcheck", healthcheck)

	go getTrainUpdates()

	fmt.Println("Server listening on http://localhost:3000")
	http.ListenAndServe(":3000", nil)
}
