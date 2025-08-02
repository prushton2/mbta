package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"prushton.com/mbta/types"
)

func getTrainUpdates() {
	for {
		time.Sleep(1 * time.Second)
		now := time.Now().Unix()
		if now%10 == 0 {
			snapshotMutex.Lock()

			snap, err := getCurrentState()
			if err != nil {
				fmt.Printf("%s", err)
				snapshot = types.Snapshot{}
			} else {
				snapshot = snap
			}

			if now%60 == 0 {
				err = saveStateToFile(now, snapshot)
				if err != nil {
					fmt.Println(err)
				}
				deleteOldStates(now, 86400)
				if err != nil {
					fmt.Println(err)
				}
			}

			snapshotMutex.Unlock()
		}
	}
}

func getCurrentState() (types.Snapshot, error) {
	resp, err := http.Get("https://api-v3.mbta.com/vehicles?filter[route_type]=0,1,2&include=trip")
	if err != nil {
		return types.Snapshot{}, fmt.Errorf("Error making GET request: %s", err)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return types.Snapshot{}, fmt.Errorf("Error reading response body: %s", err)
	}

	var response types.APIResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return types.Snapshot{
			Train: make([]types.Train, 0),
		}, nil
	}

	// store it in a map so it can be O(1) indexed when iterating over vehicles
	var tripDataMap map[string]types.TripDataResponse = make(map[string]types.TripDataResponse)

	for _, trip := range response.Included {
		tripDataMap[trip.ID] = trip
	}

	// rewrite it to here so theres significantly less data to store
	var snapshot types.Snapshot = types.Snapshot{
		Train: make([]types.Train, 0),
	}

	for _, vehicle := range response.Data {
		var train types.Train = types.Train{}
		thisTrip, exists := tripDataMap[vehicle.Relationships.Trip.Data.ID]

		if !exists {
			fmt.Printf("Trip data missing for train info %v\n", vehicle)
			continue
		}

		train = types.Train{
			Car: types.TrainCar{
				Brand: "",
				Type:  0,
			},
			Trip: types.TrainTrip{
				Line:         "",
				Headsign:     thisTrip.Attributes.Headsign,
				DirectionID:  thisTrip.Attributes.DirectionID,
				BikesAllowed: thisTrip.Attributes.BikesAllowed,
			},
			Attributes: types.TrainAttributes{
				Bearing:         vehicle.Attributes.Bearing,
				Speed:           vehicle.Attributes.Speed,
				Label:           vehicle.Attributes.Label,
				Latitude:        vehicle.Attributes.Latitude,
				Longitude:       vehicle.Attributes.Longitude,
				CurrentStatus:   vehicle.Attributes.CurrentStatus,
				OccupancyStatus: vehicle.Attributes.OccupancyStatus,
				Revenue:         vehicle.Attributes.Revenue,
				Carriages:       vehicle.Attributes.Carriages,
			},
		}

		snapshot.Train = append(snapshot.Train, train)
	}

	// each file is one "moment" of train data
	return snapshot, nil
}

func saveStateToFile(now int64, snapshot types.Snapshot) error {
	file, err := os.OpenFile(fmt.Sprintf("./data/%d.json", now), os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return fmt.Errorf("Error opening file ./data/%d.json: %s", now, err)
	}

	bytes, err := json.Marshal(snapshot)
	if err != nil {
		return fmt.Errorf("Error marshalling storedData.Data: %s", err)
	}

	n, err := file.Write(bytes)
	if err != nil {
		return fmt.Errorf("Error writing %d to file, %d bytes written: %s", len(bytes), n, err)
	}

	return nil
}

func deleteOldStates(now int64, deleteOlderThan int64) error {
	files, err := os.ReadDir("./data")
	if err != nil {
		return fmt.Errorf("Error reading ./data directory: %s", err)
	}

	for _, file := range files {

		dateCreated, err := strconv.ParseInt(strings.Split(file.Name(), ".")[0], 10, 64)
		if err != nil {
			fmt.Println("Error parsing file name ", file.Name(), " to int64, continuing. :", err)
			continue
		}

		if dateCreated >= now-deleteOlderThan {
			continue
		}

		filePath := "./data/" + file.Name()
		err = os.Remove(filePath)
		if err != nil {
			return fmt.Errorf("Error deleting file: %s %s", filePath, err)
		}
	}

	return nil
}
