package types

type APIResponse struct {
	Data     []VehicleDataResponse `json:"data"`
	Included []TripDataResponse    `json:"included"`
	Jsonapi  ApiData               `json:"jsonapi"`
}

type VehicleDataResponse struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Attributes struct {
		Bearing         *int             `json:"bearing"`
		Carriages       []TrainCarriages `json:"carriages"`
		CurrentStatus   string           `json:"current_status"`
		CurrentStopSeq  int              `json:"current_stop_sequence"`
		DirectionID     int              `json:"direction_id"`
		Label           string           `json:"label"`
		Latitude        float64          `json:"latitude"`
		Longitude       float64          `json:"longitude"`
		OccupancyStatus *string          `json:"occupancy_status"`
		Revenue         string           `json:"revenue"`
		Speed           float64          `json:"speed"`
		UpdatedAt       string           `json:"updated_at"`
	} `json:"attributes"`
	Links struct {
		Self string `json:"self"`
	} `json:"links"`
	Relationships struct {
		Route struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"route"`
		Stop struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"stop"`
		Trip struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"trip"`
	} `json:"relationships"`
}

type TripDataResponse struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Attributes struct {
		BikesAllowed         int    `json:"bikes_allowed"`
		BlockID              string `json:"block_id"`
		DirectionID          int    `json:"direction_id"`
		Headsign             string `json:"headsign"`
		Name                 string `json:"name"`
		Revenue              string `json:"revenue"`
		WheelchairAccessible int    `json:"wheelchair_accessible"`
	} `json:"attributes"`
	Links struct {
		Self string `json:"self"`
	} `json:"links"`
	Relationships struct {
		Route struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"route"`
		RoutePattern struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"route_pattern"`
		Service struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"service"`
		Shape struct {
			Data struct {
				ID   string `json:"id"`
				Type string `json:"type"`
			} `json:"data"`
		} `json:"shape"`
	} `json:"relationships"`
}

type ApiData struct {
	Version string `json:"version"`
}

type TrainCar struct {
	Brand string `json:"brand"` // CRRC, HSP-46, GP40MC, CAF, etc
	Type  int    `json:"type"`  // Type of car (CRRC RL is type 4, GL type 7-9, etc)
}

type TrainTrip struct {
	Line         string `json:"line"`     // Orange, Ashmont, CR-Lowell, etc
	Headsign     string `json:"headsign"` // headsign
	DirectionID  int    `json:"direction_id"`
	BikesAllowed int    `json:"bikes_allowed"`
}

type TrainCarriages struct {
	Label               string `json:"label"`
	OccupancyPercentage int    `json:"occupancy_percentage"`
}

type TrainAttributes struct {
	Bearing         *int             `json:"bearing"`
	Speed           float64          `json:"speed"` // mph
	Label           string           `json:"label"`
	Latitude        float64          `json:"latitude"`
	Longitude       float64          `json:"longitude"`
	CurrentStatus   string           `json:"current_status"`
	OccupancyStatus *string          `json:"occupancy_status"` // occupancy status is set here for CR, and set in carriages for Subway
	Revenue         string           `json:"revenue"`
	Carriages       []TrainCarriages `json:"carriages"`
}

type Train struct {
	Car        TrainCar        `json:"car"`
	Trip       TrainTrip       `json:"trip"`
	Attributes TrainAttributes `json:"attributes"`
}

type Snapshot struct {
	Trains []Train `json:"trains"`
}

type Timeframe struct {
	Snapshots map[int]Snapshot `json:"snapshots"`
}
