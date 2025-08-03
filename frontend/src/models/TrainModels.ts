export interface TrainCar {
    brand: string; // CRRC, HSP-46, GP40MC, CAF, etc
    type: number;  // Type of car (CRRC RL is type 4, GL type 7-9, etc)
}

export interface TrainTrip {
    line: string;          // Orange, Ashmont, CR-Lowell, etc
    color: number;
    headsign: string;      // headsign
    direction_id: number;
    bikes_allowed: number;
}

export interface TrainCarriages {
    label: string;
    occupancy_percentage: number;
}

export interface TrainAttributes {
    bearing?: number;               // Optional
    speed: number;                  // mph
    label: string;
    latitude: number;
    longitude: number;
    current_status: string;
    occupancy_status?: string;      // Optional, occupancy status is set here for CR, and set in carriages for Subway
    revenue: string;
    carriages: TrainCarriages[];
}

export interface Train {
    car: TrainCar;
    trip: TrainTrip;
    attributes: TrainAttributes;
}