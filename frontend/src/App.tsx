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

let markerMap: Map<string, JSX.Element> = new Map<string, JSX.Element>();

export function App() {
  const trainMarkerRefs = useRef<Map<string, L.Marker>>(new Map());
  const historicalTrainInfo = useRef<Timeframe>({ snapshots: new Map<number, Snapshot>() } as Timeframe)
  const liveTrainInfo = useRef<Snapshot>({ trains: [] } as Snapshot)

  const [slider, setSlider] = useState<number>(0);
  const [manualRerender, setManualRerender] = useState<boolean>(false);
  // const [persistTrains, setPersistTrains] = useState<boolean>(false);

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
      } else {
        console.log("Historical data is undefined at time ", localTime - (slider * 60))
      }
    }

    // update the marker refs so we can automaticall change train data
    source.trains.forEach((e) => {
      const setRef = (instance: L.Marker | null) => {
        if (instance) {
          trainMarkerRefs.current.set(e.attributes.label, instance);
        } else {
          trainMarkerRefs.current.delete(e.attributes.label);
        }
      };

      // return marker html
      markerMap.set(e.attributes.label,
        // @ts-ignore
        <Marker key={e.attributes.label} icon={icon} position={[e.attributes.latitude, e.attributes.longitude]} rotationAngle={270 + e.attributes.bearing} rotationOrigin="center" ref={setRef}>
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
      let markerInstance = trainMarkerRefs.current.get(e.attributes.label);
      if (markerInstance != undefined) {
        //@ts-ignore
        markerInstance.setRotationAngle(e.attributes.bearing + 270);
        markerInstance.setLatLng([e.attributes.latitude, e.attributes.longitude]);
      }
    })

    return [...markerMap.values()];
  }

  useEffect(() => {
    async function run() {
      let data = await getLatestTrainData()
      liveTrainInfo.current = data;
      setManualRerender((manualRerender) => !manualRerender)
    }

    run()

    const interval = setInterval(() => {
      if (slider == 0) {
        run();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [])

  return <>
    <MapContainer center={[42.36041830331139, -71.0580009624248]} zoom={13} style={{ height: "90vh", width: "100%", backgroundColor: "black" }}>
      <TileLayer url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
      {renderLines()}
      {renderTrains()}
    </MapContainer>
    <TimeSlider update={async (time, canFetchAPI) => {
      /* get the necessary historical data if able */
      setSlider(time);
      if (canFetchAPI) {
        historicalTrainInfo.current = await getHistoricalTrainData((time * 60)+60);
        setManualRerender(manualRerender => !manualRerender);
      }
    }} />
  </>
}

export default App