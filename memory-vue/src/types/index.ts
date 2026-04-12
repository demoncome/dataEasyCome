export interface GameData {
  avg: number[]
  low: number[]
}

export interface ConfigData {
  id: string
  name: string
  color: string
  data: {
    '1K': GameData
    '2K': GameData
  }
}

export interface MemoryData {
  games: string[]
  configs: ConfigData[]
}

export type Resolution = 'both' | '1K' | '2K'
export type ChartType = 'grouped' | 'avgOnly' | 'lowOnly' | 'radar' | 'line'

export interface AppState {
  selectedConfigs: string[]
  resolution: Resolution
  chartType: ChartType
}
