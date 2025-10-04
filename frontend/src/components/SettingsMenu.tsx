import "./SettingsMenu.css"
import { useCallback, useRef, useState, type JSX } from "react";
import { useEffect } from "react";
import { Config, defaultSettings } from "../models/Config";

type ShowPromptFn = () => Promise<Config>;

let promptDefault: { show: ShowPromptFn } = {
    // @ts-ignore
    show: (): Promise<Config> => {
        console.warn("PromptContainer is not yet mounted or initialized.");
        return new Promise((res) => { res({} as Config); });
    }
};

export const settingsMenuController: { show: ShowPromptFn } = {
    show: promptDefault.show,
};


export function SettingsMenu(): JSX.Element {
    const [visible, setVisible] = useState<boolean>(false);

    const resolveRef = useRef<((res: Config) => void) | null>(null);
    const settings = useRef<Config>(defaultSettings)

    const internalShowPrompt = useCallback((): Promise<Config> => {
        setVisible(true)
        return new Promise((resolve) => {
            resolveRef.current = resolve; // Store the resolve function
        });
    }, []);

    useEffect(() => {
        settingsMenuController.show = internalShowPrompt;
        return () => {
            settingsMenuController.show = promptDefault.show
        }
    }, [internalShowPrompt])

    function handleButton(v: Config) {
        if (resolveRef.current) {
            resolveRef.current(v)
            resolveRef.current = null
        }
        setVisible(false)
    }

    if (!visible) {
        return <></>
    }

    function renderOptions() {
        return <table>
        <tr> 
            <td> Persist out of service trains </td> 
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.persistOutOfServiceTrains = !settings.current.persistOutOfServiceTrains}
                defaultChecked={settings.current.persistOutOfServiceTrains}/><br /> 
            </td> 
        </tr>
        <tr>
            <td> <b>Layers</b> </td>
        </tr>
        <tr>
            <td>Red Line</td>  
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.show.RedLine = !settings.current.show.RedLine}
                defaultChecked={settings.current.show.RedLine}/>
            </td>
        </tr>
        <tr>
            <td>Green Line</td> 
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.show.GreenLine = !settings.current.show.GreenLine}
                defaultChecked={settings.current.show.GreenLine}/>
            </td>
        </tr>
        <tr>
            <td>Orange Line</td> 
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.show.OrangeLine = !settings.current.show.OrangeLine}
                defaultChecked={settings.current.show.OrangeLine}/>
            </td>
        </tr>
        <tr>
            <td>Blue Line</td>  
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.show.BlueLine = !settings.current.show.BlueLine}
                defaultChecked={settings.current.show.BlueLine}/>
            </td>
        </tr>
        <tr>
            <td>Commuter Rail</td> 
            <td> <input type={"checkbox"} 
                onClick={() => settings.current.show.CommuterRail = !settings.current.show.CommuterRail}
                defaultChecked={settings.current.show.CommuterRail}/>
            </td>
        </tr>
    </table>
    }

    return (
        <div className="modal-container">
            <div className="modal-inner-container">
                <div className="modal-title">Settings</div>
                <div className="modal-body">
                    {renderOptions()}
                </div>
                <div className="modal-buttons">
                    <button
                        className="modal-button"
                        onClick={() => handleButton(settings.current)}
                    >Save</button>
                </div>
            </div>
        </div>
    );
}