import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import 'leaflet-rotatedmarker';
import arrowIconSVG from './assets/arrow.svg'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { polyline, getLines, getColor, getColorFromLineName } from './Lines';
import { JSX, useEffect, useRef, useState } from 'react';
import { getLatestTrainData } from './API';
import { Snapshot } from './models/GenericModels';
import TimeSlider from './components/TimeSlider';

let markerMap: Map<string, JSX.Element> = new Map<string, JSX.Element>();

export function App() {
  const trainMarkerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [slider, setSlider] = useState<number>(1440);
  // const [autoplaySpeed, setAutoplaySpeed] = useState<number>(0);
  // const [sliderMax, setSliderMax] = useState<number>(1440);
  const [displayedTrainInfo, setDisplayedTrainInfo] = useState<Snapshot | null>(null);
  const [persistTrains, setPersistTrains] = useState<boolean>(false);


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
    if (slider == 1440 && displayedTrainInfo != null) {
      source = displayedTrainInfo
    } else {
      // historical data mode
    }

    source.trains.forEach((e) => {
      const setRef = (instance: L.Marker | null) => {
        if (instance) {
          trainMarkerRefs.current.set(e.attributes.label, instance);
        } else {
          trainMarkerRefs.current.delete(e.attributes.label);
        }
      };

      markerMap.set(e.attributes.label,
        //@ts-ignore
        <Marker key={e.attributes.label} icon={icon} position={[e.attributes.latitude, e.attributes.longitude]} rotationAngle={270 + e.attributes.bearing} rotationOrigin="center" ref={setRef}>
          <Popup>
            <h2>{e.attributes.label} ({e.car.brand}{e.car.type !== 0 ? ` Type ${e.car.type}` : ""})</h2>
            <p>Speed: {e.attributes.speed || 0.0}</p>
            <p>Headsign: {e.trip.headsign}</p>
            <p>Bearing: {e.attributes.bearing}</p>
          </Popup>
          <CircleMarker center={[e.attributes.latitude, e.attributes.longitude]} radius={15} color={getColor(e.trip.color)} fillColor={getColor(e.trip.color)} fillOpacity={1} />
        </Marker>
      );
    });

    return [...markerMap.values()];
  }

  useEffect(() => {
    async function run() {
      let data = await getLatestTrainData()
      setDisplayedTrainInfo(data);
    }

    run()

    const interval = setInterval(() => {
      run();
    }, 10000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    if (displayedTrainInfo != null) {
      displayedTrainInfo.trains.forEach((e) => {
        let markerInstance = trainMarkerRefs.current.get(e.attributes.label);

        if (markerInstance != undefined) {
          //@ts-ignore
          markerInstance.setRotationAngle(e.attributes.bearing + 270);
          markerInstance.setLatLng([e.attributes.latitude, e.attributes.longitude]);
        }
      })
    }
  }, [displayedTrainInfo])

  return <>
    <MapContainer center={[42.36041830331139, -71.0580009624248]} zoom={13} style={{ height: "90vh", width: "100%", backgroundColor: "black" }}>
      <TileLayer url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
      {renderLines()}
      {renderTrains()}
    </MapContainer>
    <TimeSlider />
  </>
}

export default App