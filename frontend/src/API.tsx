
import axios from 'axios';
import { Snapshot } from './models/GenericModels';

export async function getLatestTrainData(): Promise<Snapshot> {
    let response = await axios.get('http://localhost:3000/v1/live')
    let obj = response.data;
    return obj as Snapshot;
}