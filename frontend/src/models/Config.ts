export interface Config {
    persistOutOfServiceTrains: boolean,
    show: ShowLayers,
}

export interface ShowLayers {
    RedLine: boolean,
    GreenLine: boolean,
    OrangeLine: boolean,
    BlueLine: boolean,
    CommuterRail: boolean,
}