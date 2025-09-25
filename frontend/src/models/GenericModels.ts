import { Train } from "./TrainModels"

export interface Snapshot {
    trains: Train[];
}

export interface Timeframe {
    snapshots: Map<number, Snapshot>;
}
