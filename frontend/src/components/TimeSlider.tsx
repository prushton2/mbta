import "./TimeSlider.css"
import { JSX, useEffect, useRef, useState } from "react";

function TimeSlider({isLoading, update}: {isLoading: boolean, update: (time: number, canFetchAPI: boolean) => void}): JSX.Element {
    const [offset, setOffset] = useState(0)
    let timeout = useRef<number>(0);

    function convertTimestampToDate(timestamp: number): String {
        if (offset == 0) {
            timestamp = timestamp - timestamp % (1000*10)
        } else {
            timestamp = timestamp - timestamp % (1000*60)
        }

        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    useEffect(() => {
        clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
            update(offset, true)
        }, 1000)
    }, [offset])

    return <>
        <table style={{ width: "100%" }}>
            <tr>
                <td style={{ width: "90%" }}>
                    <div className="slidecontainer" style={{ height: "5vh" }}>
                        <input type="range" min="0" value={offset} max={1440} className="slider" onChange={(e) => {setOffset(e.target.valueAsNumber); update(e.target.valueAsNumber, false)}} />
                    </div>
                </td>
                <td style={{ width: "10%", textAlign: "center"}}>
                    {convertTimestampToDate((new Date()).getTime() - offset*1000*60)} <br />
                    {isLoading ? " Loading..." : " "}
                </td>
            </tr>
        </table>
    </>
}

export default TimeSlider