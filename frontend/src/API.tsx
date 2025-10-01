
import axios from 'axios';
import { Snapshot, Timeframe } from './models/GenericModels';
// import { decompress } from 'brotli-compress';
import brotliPromise from 'brotli-wasm'; // Import the default export
// import brotliPromise from 'brotli-wasm'; // Import the default export

export async function getLatestTrainData(): Promise<Snapshot> {
    const brotli = await brotliPromise;
    const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/live`, {
        responseType: 'arraybuffer'
    });
    const dataBuffer = new Uint8Array(response.data as ArrayBuffer);

    // console.log('Raw response data:', dataBuffer);
    const decompressedData = brotli.decompress(dataBuffer);
    const jsonString = new TextDecoder().decode(decompressedData);
    // console.log('Decompressed data:', jsonString);
    return JSON.parse(jsonString) as Snapshot;
}

export async function getHistoricalTrainData(time: number): Promise<Timeframe> {
    const brotli = await brotliPromise;
    const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/historical?t=${time}`, {
        responseType: 'arraybuffer'
    })
    const dataBuffer = new Uint8Array(response.data as ArrayBuffer);

    const decompressedData = brotli.decompress(dataBuffer);
    const jsonString = new TextDecoder().decode(decompressedData);


    let obj = JSON.parse(jsonString);

    let timeframe: Timeframe = {snapshots: new Map<number, Snapshot>() } as Timeframe;
    let entries = Object.entries(obj.snapshots) 

    entries.forEach(([key, value]) => {
        timeframe.snapshots.set(parseInt(key), value as Snapshot)
    })

    return timeframe
}