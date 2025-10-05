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
    const [settings, setSettings] = useState<Config>(defaultSettings)
    const settings_old= useRef<Config>(defaultSettings)

    const internalShowPrompt = useCallback((): Promise<Config> => {
        setVisible(true)
        settings_old.current = JSON.parse(JSON.stringify(settings))
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
        setSettings(JSON.parse(JSON.stringify(v)))
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
        return <table><tbody>
        <tr onClick={() => setSettings(prev => ({...prev, persistOutOfServiceTrains: !prev.persistOutOfServiceTrains}))}> 
            <td> Persist out of service trains </td> 
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, persistOutOfServiceTrains: e.target.checked}))}
                checked={settings.persistOutOfServiceTrains}/><br /> 
            </td> 
        </tr>
        <tr>
            <td> <b>Layers</b> </td>
        </tr>
        <tr onClick={() => setSettings(prev => ({...prev, show: {...prev.show, RedLine: !prev.show.RedLine}}))}>
            <td>Red Line</td>  
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, show: { ...prev.show, RedLine: e.target.checked }}))}
                checked={settings.show.RedLine}/>
            </td>
        </tr>
        <tr onClick={() => setSettings(prev => ({...prev, show: {...prev.show, GreenLine: !prev.show.GreenLine}}))}>
            <td>Green Line</td> 
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, show: { ...prev.show, RedLine: e.target.checked }}))}
                checked={settings.show.GreenLine}/>
            </td>
        </tr>
        <tr onClick={() => setSettings(prev => ({...prev, show: {...prev.show, OrangeLine: !prev.show.OrangeLine}}))}>
            <td>Orange Line</td> 
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, show: { ...prev.show, OrangeLine: e.target.checked }}))}
                checked={settings.show.OrangeLine}/>
            </td>
        </tr>
        <tr onClick={() => setSettings(prev => ({...prev, show: {...prev.show, BlueLine: !prev.show.BlueLine}}))}>
            <td>Blue Line</td>  
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, show: { ...prev.show, BlueLine: e.target.checked }}))}
                checked={settings.show.BlueLine}/>
            </td>
        </tr>
        <tr onClick={() => setSettings(prev => ({...prev, show: {...prev.show, CommuterRail: !prev.show.CommuterRail}}))}>
            <td>Commuter Rail</td> 
            <td> <input type={"checkbox"} 
                onChange={(e) => setSettings(prev => ({...prev, show: { ...prev.show, CommuterRail: e.target.checked }}))}
                checked={settings.show.CommuterRail}/>
            </td>
        </tr>
    </tbody></table>
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
                        onClick={() => handleButton(settings_old.current)}
                    >Cancel</button>
                    <button
                        className="modal-button"
                        onClick={() => handleButton(settings)}
                    >Save</button>
                </div>
            </div>
        </div>
    );
}