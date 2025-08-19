import "./TimeSlider.css"
import { JSX, useState } from "react";

function TimeSlider({updateOffset}: {updateOffset: (time: number) => null}): JSX.Element {
    const [offset, setOffset] = useState(86400)
    

    function convertTimestampToDate(timestamp: number): String {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    return <>
        <table style={{ width: "100%" }}>
            <tr>
                <td style={{ width: "80%" }}>
                    <div className="slidecontainer" style={{ height: "5vh" }}>
                        <input type="range" min="0" value={offset} max={86400} className="slider" onChange={(e) => {setOffset(e.target.valueAsNumber); updateOffset(e.target.valueAsNumber)}} />
                    </div>
                </td>
                <td style={{ width: "20%" }}>
                    {convertTimestampToDate(offset)}
                </td>
            </tr>
        </table>
    </>
}

export default TimeSlider