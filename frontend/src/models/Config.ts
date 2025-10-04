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

export const defaultSettings: Config = {
  persistOutOfServiceTrains: false,
  show: {
    RedLine: true,
    GreenLine: true,
    BlueLine: true,
    OrangeLine: true,
    CommuterRail: true
  }
} as Config
