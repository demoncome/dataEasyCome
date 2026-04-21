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

// 方案（Plan）数据结构
export interface Plan {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  data: MemoryData
}

// 多方案数据根结构
export interface PlansData {
  plans: Plan[]
}

export type Resolution = 'both' | '1K' | '2K'
export type ChartType = 'grouped' | 'avgOnly' | 'lowOnly' | 'radar' | 'line'

export interface AppState {
  selectedConfigs: string[]
  resolution: Resolution
  chartType: ChartType
}
