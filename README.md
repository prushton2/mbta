# mbta.prushton.com
A website to show live and past mbta data. Visit at https://mbta.prushton.com <br />
This website is built for desktop first, and may be buggy on mobile.

# API
Want to make your own frontend? Heres the API documentation. To start, there are two types of data you can fetch: live and historical.

## Live data
Live data is refreshed and cached by the server every 10 seconds. Live data should be requested at a 10 second interval at the lowest

## Historical Data
Every 60th second, the currently cached live data is stored into the historical data. Only the last 24 hours of data is stored, after which its deleted. Historical data should be requested no more frequently that every minute, however I recommend not requesting this data unless necessary since it can be quite large.

Note any updates to structs may take 24 hours to propagate through all historical data

## Structs

### Train
Both CR and Subway are merged into a Train object, with identifiers

```json
{
    "car": {
        "brand": <string>, //CRRC, HSP-46, GP40MC, CAF, etc
        "type": <int>, //Type of car (CRRC RL is type 4, GL type 7-9, etc)
    },
    "stop_sequence": {
        "id": <int>,
        "name": <string>,
    },
    "trip": {
        "line": <string>, //Orange, Ashmont, CR-Lowell, etc
        "headsign": <string>, //headsign
        "direction_id": <int>,
        "bikes_allowed": <int>
    },
    "attributes": {
        "bearing": <int>,
        "speed": <int>, //mph
        "label": <string>,
        "latitude": <float>,
        "longitude": <float>,
        "current_status": <string>,
        "occupancy_status": <string>, //occupancy status is set here for CR, and set in carriages for Subway
        "revenue": <string>,
        "carriages": {
            "label": <string>,
            "occupancy_status": <string>,
            "occupancy_percentage": <int>
        }[]
    },
}
```

### Snapshot
A snapshot returns the state of the T at one point in time. This is returned by the live endpoint

```json
{
    "train": <Train[]>,
    "bus": null,
    "ferry": null,
}
```

### Timeframe
A Timeframe returns all stored snapshots between two timestamps, returned by the historical endpoint

```json
{
    "snapshots": Map<int, <Snapshot>> //key is the unix timestamp, it will always be divisible by 60
}
```