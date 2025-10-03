import "./SettingsMenu.css"
import { useCallback, useRef, useState, type JSX } from "react";
import { useEffect } from "react";
import { Config } from "../models/Config";

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

    return (
        <div className="modal-container">
            <div className="modal-inner-container">
                <div className="modal-title">title</div>
                <div className="modal-body">body</div>
                <div className="modal-buttons">
                    <button
                        className="modal-button"
                        onClick={() => handleButton({} as Config)}
                    >Save</button>
                </div>
            </div>
        </div>
    );
}