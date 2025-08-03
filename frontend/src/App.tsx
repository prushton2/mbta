import './App.css'
import 'leaflet/dist/leaflet.css'
import trainIconSVG from './assets/train.svg'
import arrowIconPNG from './assets/arrow.png'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker} from 'react-leaflet';
import { Icon } from 'leaflet';
import { polyline, getLines, getColor, getColorFromLineName } from './Lines';
import { JSX, useEffect, useState} from 'react';
import { getLatestTrainData } from './API';
import { Snapshot } from './models/GenericModels';

let markerMap: Map<string, JSX.Element> = new Map<string, JSX.Element>();

export function App() {
  const [slider, setSlider] = useState<number>(1440);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(0);
  const [sliderMax, setSliderMax] = useState<number>(1440);
  const [liveTrainInfo, setLiveTrainInfo] = useState<Snapshot | null>(null);
  const [persistTrains, setPersistTrains] = useState<boolean>(false);

  let icon: Icon = new Icon({
    iconUrl: trainIconSVG,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  });

  let arrowIcon: Icon = new Icon({
    iconUrl: arrowIconPNG,
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
    
    let source: Snapshot = {trains: []} as Snapshot
    if (slider == 1440 && liveTrainInfo != null) {
      source = liveTrainInfo
    } else {
      // historical data mode
    }

    if(!persistTrains) {
      [...markerMap.keys()].forEach((e) => {
        markerMap.set(e, <></>)
      })
    }

    source.trains.forEach((e) => {
      markerMap.set(e.attributes.label, <div key={e.attributes.label} style={{display: "none"}}>
        <Marker icon={icon} position={[e.attributes.latitude, e.attributes.longitude]}>
          <Popup>
            <h2>{e.attributes.label} ({e.car.brand}{e.car.type != 0 ? ` Type ${e.car.type}` : ""})</h2>
            <p>Speed: {e.attributes.speed || 0.0}</p>
            <p>Headsign: {e.trip.headsign}</p>
          </Popup>
        </Marker>
        <CircleMarker center={[e.attributes.latitude, e.attributes.longitude]} radius={15} color={getColor(e.trip.color)} fillColor={getColor(e.trip.color)} fillOpacity={1}/>
      </div>)
    });




    return [...markerMap.values()];
  }

  function convertTimestampToDate(timestamp: number): String {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  

  useEffect(() => {
    async function run() {
      let data = await getLatestTrainData()
      setLiveTrainInfo(data);
    }
    
    run()

    const interval = setInterval(() => {
      run();
    }, 10000);

    return () => clearInterval(interval);
  }, [])

  // useEffect(() => {
  //   let interval: number = 0;
  //   if (autoplaySpeed > 0) {

  //     interval = setInterval(() => {
  //       setSlider((prevSlider) => {
  //         if (prevSlider >= sliderMax) {
  //           return 0;
  //         }
  //         return prevSlider + 1;
  //       });
  //     }, 1000 / autoplaySpeed);

  //   } else {
  //     clearInterval(interval);
  //   }

  //   return () => clearInterval(interval);
  // }, [autoplaySpeed]);

  return <>
      {/* <div className="slidecontainer" style={{ height: "5vh" }}>
        <input type="range" min="1" value={slider} max={sliderMax} className="slider" onChange={(e) => setSlider(e.target.valueAsNumber)}/>
      </div> */}
      
      {/* <div style={{ position: "absolute", right: "1vh", top: "4vh", color: "white" }}>
        <h3>Time: {trainInfo == null ? 0 : convertTimestampToDate(trainInfo.elements[slider].timestamp)}</h3>
      </div> */}

      {/* <div className="slidecontainer" style={{ position: "absolute", right: "1vh", top: "10vh", height: "5vh", width: "18%"}}>
        <input type="range" min="0" max="60" className="slider" defaultValue="0" onChange={(e) => setAutoplaySpeed(e.target.valueAsNumber)}/>
        <p style={{ color: "white", fontSize: "0.8em", textAlign: "center", marginTop: "5px" }}>Adjust autoplay speed ({autoplaySpeed == 0 ? "off" : `${autoplaySpeed}min/sec`})</p>
      </div>

      <div className="slidecontainer" style={{ position: "absolute", right: "1vh", top: "15vh", height: "5vh", width: "18%"}}>
        <input type="checkbox" onChange={(e) => setPersistTrains(e.target.checked)}/><label style={{ color: "white", fontSize: "0.8em", textAlign: "center", marginTop: "5px", width: "fill"}}> Persist out of service trains</label>
      </div> */}


      <MapContainer center={[42.36041830331139, -71.0580009624248]} zoom={13} style={{ height: "98vh", width: "100%", backgroundColor:"black" }}>
        <TileLayer url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
        {renderLines()}
        {renderTrains()}
      </MapContainer>
      
    </>
}

export default App