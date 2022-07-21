type UrlBuilderArgs = {
  date: string,
  time?: string,
  region: string,
}

export type WeatherConfig = {
  timeIntervals: Record<number, string>
  regions: {value: string, title: string}[]
  defaultRegion: string
  defaultTimeInterval: number
  builderUrl: (params: UrlBuilderArgs) => string
}
export const temperatureConfig: WeatherConfig = {
  timeIntervals: {
    0: '1',
    1: '2',
    2: '3',
    3: '4',
    4: '6',
    5: '8',
    6: '12',
    7: '24',
  },
  regions: [
    {value: 'sp', title: 'Spain'},
    {value: 'eur2', title: 'Europe'},
    {value: 'it', title: 'Italy'},
  ],
  defaultRegion: 'sp',
  defaultTimeInterval: 0,
  builderUrl: ({date, region, time}) => {
    return `https://www.meteociel.fr/cartes_obs/archives/${date}/temp_${region}-${time}.png`
  }
}
export const rainConfig: WeatherConfig = {
  timeIntervals: {
    0: '1',
    1: '2',
    2: '3',
    3: '4',
    4: '6',
    5: '8',
    6: '12',
    7: '24',
  },
  regions: [
    {value: 'sp', title: 'Spain'},
    {value: 'eur2', title: 'Europe'},
    {value: 'it', title: 'Italy'},
  ],
  defaultRegion: 'sp',
  defaultTimeInterval: 0,
  builderUrl: ({date, region, time}) => {
    return `https://www.meteociel.fr/cartes_obs/archives/${date}/rr2_${region}-${time}.png`
  }
}

export const solarLightingConfig: WeatherConfig = {
  timeIntervals: {
    0: '24',
  },
  regions: [
    {value: 'sp', title: 'Spain'},
    {value: 'eur2', title: 'Europe'},
    {value: 'it', title: 'Italy'},
  ],
  defaultRegion: 'sp',
  defaultTimeInterval: 0,
  builderUrl: ({date, region}) => {
    return `https://www.meteociel.fr/cartes_obs/archives/${date}/enso_${region}.png`
  }
}