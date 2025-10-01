
import axios from 'axios';
import { Snapshot, Timeframe } from './models/GenericModels';
// import { decompress } from 'brotli-compress';
import brotliPromise from 'brotli-wasm'; // Import the default export
// import brotliPromise from 'brotli-wasm'; // Import the default export

export async function getLatestTrainData(): Promise<Snapshot> {
    const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/live`, {
        responseType: 'arraybuffer'
    });
    const dataBuffer = new Uint8Array(response.data as ArrayBuffer);

    console.log('Raw response data:', dataBuffer);
    
    const brotli = await brotliPromise; // Import is async in browsers due to wasm requirements!
    // Decompress the Brotli-compressed data
    const decompressedData = brotli.decompress(dataBuffer);

    // Convert the decompressed data to a string and parse as JSON
    const jsonString = new TextDecoder().decode(decompressedData);
    // const snapshot: Snapshot = JSON.parse(jsonString);
    console.log('Decompressed data:', jsonString);

    console.log(import.meta.url);

    return JSON.parse(jsonString) as Snapshot;
}

export async function getHistoricalTrainData(time: number): Promise<Timeframe> {
    let response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/historical?t=${time}`)
    let obj = response.data;

    let timeframe: Timeframe = {snapshots: new Map<number, Snapshot>() } as Timeframe;
    let entries = Object.entries(obj.snapshots) 

    entries.forEach(([key, value]) => {
        timeframe.snapshots.set(parseInt(key), value as Snapshot)
    })

    return timeframe
}