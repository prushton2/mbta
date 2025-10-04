import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import 'leaflet-rotatedmarker';
import arrowIconSVG from './assets/arrow.svg'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { polyline, getLines, getColor, getColorFromLineName } from './Lines.tsx';
import { JSX, useEffect, useRef, useState } from 'react';
import { getHistoricalTrainData, getLatestTrainData } from './API';
import { Snapshot, Timeframe } from './models/GenericModels';
import TimeSlider from './components/TimeSlider';
import { Config, defaultSettings } from './models/Config.ts';
import { SettingsMenu, settingsMenuController } from './components/SettingsMenu.tsx';

let markerMap: Map<string, JSX.Element> = new Map<string, JSX.Element>();

export function App() {
  const trainMarkerRefs = useRef<Map<string, L.Marker>>(new Map());
  const historicalTrainInfo = useRef<Timeframe>({ snapshots: new Map<number, Snapshot>() } as Timeframe)
  const liveTrainInfo = useRef<Snapshot>({ trains: [] } as Snapshot)
  const isLoading = useRef<boolean>(false);
  const settings = useRef<Config>(defaultSettings)


  const [slider, setSlider] = useState<number>(0);
  const [_manualRerender, setManualRerender] = useState<boolean>(false);

  let icon: L.Icon = L.icon({
    iconUrl: arrowIconSVG,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  });

  function renderLines(): JSX.Element[] {
    let element: JSX.Element[] = []
    getLines().forEach((e: string) => {
      element.push(
        <Polyline key={element.length} positions={polyline(e) as any} color={getColorFromLineName(e)} />
      )
    })
    return element;
  }

  function renderTrains(): JSX.Element[] {
    let source: Snapshot = { trains: [] } as Snapshot
    if (slider == 0) {
      source = liveTrainInfo.current
    } else {
      let localTime = Math.floor(new Date().getTime() / 1000);
      localTime = localTime - (localTime % 60); // align to minute
      let historicalData = historicalTrainInfo.current.snapshots.get(localTime - (slider * 60))

      if (historicalData != undefined) {
        source = historicalData
        isLoading.current = false;
      }
      else {
        // console.log("Historical data is undefined at time ", localTime - (slider * 60))
        isLoading.current = true;
      }
    }

    if(!settings.current.persistOutOfServiceTrains) {
      markerMap.clear();
    }

    // update the marker refs so we can automaticall change train data
    source.trains.forEach((e) => {
      if(
        e.trip.line.startsWith("Green") && !settings.current.show.GreenLine ||
        (e.trip.line.startsWith("Red") || e.trip.line.startsWith("Mattapan")) && !settings.current.show.RedLine ||
        e.trip.line.startsWith("Blue") && !settings.current.show.BlueLine ||
        e.trip.line.startsWith("Orange") && !settings.current.show.OrangeLine ||
        e.trip.line.startsWith("CR") && !settings.current.show.CommuterRail) {
        return
      }

      let uid = `${e.trip.line}-${e.attributes.label}`
      const setRef = (instance: L.Marker | null) => {
        if (instance) {
          trainMarkerRefs.current.set(uid, instance);
        } else {
          trainMarkerRefs.current.delete(uid);
        }
      };

      // return marker html
      markerMap.set(uid,
        // @ts-ignore
        <Marker key={uid} icon={icon} position={[e.attributes.latitude, e.attributes.longitude]} rotationAngle={270 + e.attributes.bearing} rotationOrigin="center" ref={setRef}>
          <Popup>
            <h2>{e.attributes.label} ({e.car.brand}{e.car.type !== 0 ? ` Type ${e.car.type}` : ""})</h2>
            <p>Speed: {e.attributes.speed || 0.0}mph</p>
            <p>Headsign: {e.trip.headsign}</p>
            <p>Bearing: {e.attributes.bearing}</p>
          </Popup>
          <CircleMarker center={[e.attributes.latitude, e.attributes.longitude]} radius={15} color={getColor(e.trip.color)} fillColor={getColor(e.trip.color)} fillOpacity={1} />
        </Marker>
      );
    });

    source.trains.forEach(e => {
      let uid = `${e.trip.line}-${e.attributes.label}`
      
      let markerInstance = trainMarkerRefs.current.get(uid);
      if (markerInstance != undefined) {
        //@ts-ignore
        markerInstance.setRotationAngle(e.attributes.bearing + 270);
        markerInstance.setLatLng([e.attributes.latitude, e.attributes.longitude]);
      }
    })

    return [...markerMap.values()];
  }

  useEffect(() => {
    async function fetchLiveTrainData() {
      // return
      let data = await getLatestTrainData()
      liveTrainInfo.current = data;

      let localTime = Math.floor(new Date().getTime() / 1000);
      localTime = localTime - (localTime % 10); // align to previous 10th second

      // if the time the train data was fetched is on the minute, 
      // we store it in historical data to save on api calls and fill 
      // the gap described in the timeslider update function
      
      if (localTime%60 == 0) {
        historicalTrainInfo.current.snapshots.set(localTime, data);
      }

      setManualRerender((manualRerender) => !manualRerender)
    }

    fetchLiveTrainData()

    const interval = setInterval(() => {
      if (slider == 0) {
        fetchLiveTrainData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [])

  return <>
    <SettingsMenu />
    <MapContainer center={[42.36041830331139, -71.0580009624248]} zoom={13} style={{ height: "90vh", width: "100vw", backgroundColor: "black" }}>
      <TileLayer url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
      {renderLines()}
      {renderTrains()}
    </MapContainer>
    <TimeSlider isLoading={isLoading.current} update={async (time, canFetchAPI) => {
      /* get the necessary historical data if able */
      setSlider(time);
      
      if (canFetchAPI) {
        let localTime = Math.floor(new Date().getTime() / 1000);
        localTime = localTime - (localTime % 60); // align to minute
        let historicalData = historicalTrainInfo.current.snapshots.get(localTime - (slider * 60))
        
        // This prevents refetching of known data. Assuming good health on the backend, historicalData being undefined means we havent gone back that far yet, so we need to fetch
        // This creates a gap. When you first get historical data, its can be visualized as [ historical data ][now]. As time progresses, a gap forms between the data and now
        // [ historical data ][ unfetched data ][now]. This happens because no new api calls are made to fill the gap. This is solved by filling live train info into 
        // the historical train info
        if (historicalData == undefined) {
          historicalTrainInfo.current = await getHistoricalTrainData((time * 60)+60);
          isLoading.current = false;
        }
        setManualRerender(manualRerender => !manualRerender);
      }
    }} />
    <button style={{zIndex: 100000000000, position: 'absolute', top: "10px", right: "10px"}} onClick={async() => {settings.current = await settingsMenuController.show(); console.log(settings.current); setManualRerender(m => !m)}}>Settings</button>
  </>
}

export default App