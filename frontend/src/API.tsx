
import axios from 'axios';
import { Snapshot, Timeframe } from './models/GenericModels';

export async function getLatestTrainData(): Promise<Snapshot> {
    let response = await axios.get('http://localhost:3000/v1/live')
    let obj = response.data;
    return obj as Snapshot;
}

export async function getHistoricalTrainData(time: number): Promise<Timeframe> {
    let response = await axios.get(`http://localhost:3000/v1/historical?t=${time}`)
    let obj = response.data;

    let timeframe: Timeframe = {snapshots: new Map<number, Snapshot>() } as Timeframe;
    let entries = Object.entries(obj.snapshots)

    entries.forEach(([key, value]) => {
        timeframe.snapshots.set(parseInt(key), value as Snapshot)
    })

    return timeframe
}