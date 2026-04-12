<script setup lang="ts">
import { computed } from 'vue'
import { useMemoryStore } from '@/stores/memory'

const store = useMemoryStore()

interface LowData {
  game: string
  values: number[]
  configs: string[]
}

interface ComparisonRow {
  game: string
  best1k: string
  best1kValue: number
  worst1k: string
  worst1kValue: number
  diff1k: string
  diff1kPercent: string
  best2k: string
  best2kValue: number
  worst2k: string
  worst2kValue: number
  diff2k: string
  diff2kPercent: string
}

// 计算百分比变化
function calcPercentDiff(best: number, worst: number): string {
  if (worst === 0) return '0%'
  const diff = ((best - worst) / worst) * 100
  return `+${diff.toFixed(1)}%`
}

// 1K Low帧对比数据
const low1kData = computed<ComparisonRow[]>(() => {
  if (!store.memoryData || store.selectedData.length < 2) return []

  return store.games.map((game, gameIndex) => {
    const values = store.selectedData.map(config => ({
      name: config.name,
      value: config.data['1K'].low[gameIndex]
    }))

    // 按值排序
    values.sort((a, b) => b.value - a.value)

    const best = values[0]
    const worst = values[values.length - 1]

    return {
      game,
      best1k: best.name,
      best1kValue: best.value,
      worst1k: worst.name,
      worst1kValue: worst.value,
      diff1k: `${(best.value - worst.value).toFixed(1)}`,
      diff1kPercent: calcPercentDiff(best.value, worst.value),
      best2k: '',
      worst2k: '',
      best2kValue: 0,
      worst2kValue: 0,
      diff2k: '',
      diff2kPercent: ''
    }
  })
})

// 2K Low帧对比数据
const low2kData = computed<ComparisonRow[]>(() => {
  if (!store.memoryData || store.selectedData.length < 2) return []

  return store.games.map((game, gameIndex) => {
    const values = store.selectedData.map(config => ({
      name: config.name,
      value: config.data['2K'].low[gameIndex]
    }))

    // 按值排序
    values.sort((a, b) => b.value - a.value)

    const best = values[0]
    const worst = values[values.length - 1]

    return {
      game,
      best1k: '',
      best1kValue: 0,
      worst1k: '',
      worst1kValue: 0,
      diff1k: '',
      diff1kPercent: '',
      best2k: best.name,
      best2kValue: best.value,
      worst2k: worst.name,
      worst2kValue: worst.value,
      diff2k: `${(best.value - worst.value).toFixed(1)}`,
      diff2kPercent: calcPercentDiff(best.value, worst.value)
    }
  })
})

// 合并数据
const comparisonData = computed<ComparisonRow[]>(() => {
  if (!store.memoryData || store.selectedData.length < 2) return []

  return store.games.map((game, gameIndex) => {
    const values1k = store.selectedData.map(config => ({
      name: config.name,
      value: config.data['1K'].low[gameIndex]
    }))
    const values2k = store.selectedData.map(config => ({
      name: config.name,
      value: config.data['2K'].low[gameIndex]
    }))

    values1k.sort((a, b) => b.value - a.value)
    values2k.sort((a, b) => b.value - a.value)

    const best1k = values1k[0]
    const worst1k = values1k[values1k.length - 1]
    const best2k = values2k[0]
    const worst2k = values2k[values2k.length - 1]

    return {
      game,
      best1k: best1k.name,
      best1kValue: best1k.value,
      worst1k: worst1k.name,
      worst1kValue: worst1k.value,
      diff1k: `${(best1k.value - worst1k.value).toFixed(1)}`,
      diff1kPercent: calcPercentDiff(best1k.value, worst1k.value),
      best2k: best2k.name,
      best2kValue: best2k.value,
      worst2k: worst2k.name,
      worst2kValue: worst2k.value,
      diff2k: `${(best2k.value - worst2k.value).toFixed(1)}`,
      diff2kPercent: calcPercentDiff(best2k.value, worst2k.value)
    }
  })
})

interface TableRow {
  game: string
  [key: string]: string | number
}

const tableData = computed(() => {
  if (!store.memoryData) return { headers: [], rows: [] }

  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  const headers = ['游戏']
  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      headers.push(`${config.name} ${res}`)
    })
  })

  const rows: TableRow[] = store.games.map((game, gameIndex) => {
    const row: TableRow = { game }

    store.selectedData.forEach(config => {
      resolutions.forEach(res => {
        const data = config.data[res as '1K' | '2K']
        const key = `${config.name} ${res}`
        row[key] = `${data.avg[gameIndex].toFixed(1)} / ${data.low[gameIndex].toFixed(1)}`
      })
    })

    return row
  })

  return { headers, rows }
})
</script>

<template>
  <div class="chart-wrapper" style="margin-top: 24px;">
    <h3 class="table-title">📋 详细数据对比表</h3>
    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th
              v-for="header in tableData.headers"
              :key="header"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableData.rows"
            :key="row.game"
          >
            <td class="game-name">{{ row.game }}</td>
            <td
              v-for="header in tableData.headers.slice(1)"
              :key="header"
              class="data-cell"
            >
              <span class="avg-value">{{ (row[header] as string).split(' / ')[0] }}</span>
              <span class="separator"> / </span>
              <span class="low-value">{{ (row[header] as string).split(' / ')[1] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 1K Low帧对比 -->
    <h3 class="table-title" style="margin-top: 30px;">🎯 1K Low帧对比（最佳 vs 最差）</h3>
    <div class="comparison-table">
      <table class="compact-table">
        <thead>
          <tr>
            <th>游戏</th>
            <th>最佳配置</th>
            <th>帧数</th>
            <th>最差配置</th>
            <th>帧数</th>
            <th>差值</th>
            <th>提升</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in comparisonData" :key="row.game">
            <td class="game-name">{{ row.game }}</td>
            <td class="best-config">{{ row.best1k }}</td>
            <td class="best-value">{{ row.best1kValue.toFixed(1) }}</td>
            <td class="worst-config">{{ row.worst1k }}</td>
            <td class="worst-value">{{ row.worst1kValue.toFixed(1) }}</td>
            <td class="diff-value">+{{ row.diff1k }}</td>
            <td class="percent-value">{{ row.diff1kPercent }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2K Low帧对比 -->
    <h3 class="table-title" style="margin-top: 30px;">🎯 2K Low帧对比（最佳 vs 最差）</h3>
    <div class="comparison-table">
      <table class="compact-table">
        <thead>
          <tr>
            <th>游戏</th>
            <th>最佳配置</th>
            <th>帧数</th>
            <th>最差配置</th>
            <th>帧数</th>
            <th>差值</th>
            <th>提升</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in comparisonData" :key="row.game">
            <td class="game-name">{{ row.game }}</td>
            <td class="best-config">{{ row.best2k }}</td>
            <td class="best-value">{{ row.best2kValue.toFixed(1) }}</td>
            <td class="worst-config">{{ row.worst2k }}</td>
            <td class="worst-value">{{ row.worst2kValue.toFixed(1) }}</td>
            <td class="diff-value">+{{ row.diff2k }}</td>
            <td class="percent-value">{{ row.diff2kPercent }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="legend">
      <span class="legend-item">
        <span class="legend-color avg"></span>
        平均帧
      </span>
      <span class="legend-item">
        <span class="legend-color low"></span>
        1%Low帧
      </span>
    </div>
  </div>
</template>

<style scoped>
.table-title {
  margin-bottom: 20px;
  color: #60a5fa;
  font-size: 18px;
}

.comparison-table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 13px;
}

.compact-table {
  min-width: 500px;
}

.compact-table th,
.compact-table td {
  padding: 10px 12px;
  font-size: 12px;
}

th, td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  white-space: nowrap;
}

th {
  background: rgba(51, 65, 85, 0.8);
  color: #60a5fa;
  font-weight: 600;
  position: sticky;
  top: 0;
}

th:first-child,
td:first-child {
  position: sticky;
  left: 0;
  background: rgba(30, 41, 59, 0.95);
  z-index: 1;
}

th:first-child {
  z-index: 2;
}

tr:hover {
  background: rgba(96, 165, 250, 0.05);
}

.game-name {
  font-weight: 600;
  color: #e2e8f0;
}

.data-cell {
  color: #e2e8f0;
}

.avg-value {
  color: #e2e8f0;
}

.separator {
  color: #64748b;
}

.low-value {
  color: #fbbf24;
  font-weight: 600;
}

.best-config {
  color: #4ade80;
  font-weight: 500;
}

.best-value {
  color: #4ade80;
  font-weight: 700;
}

.worst-config {
  color: #f87171;
  font-weight: 500;
}

.worst-value {
  color: #f87171;
  font-weight: 700;
}

.diff-value {
  color: #60a5fa;
  font-weight: 600;
}

.percent-value {
  color: #a78bfa;
  font-weight: 700;
  font-size: 13px;
}

.legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.avg {
  background: rgba(226, 232, 240, 0.3);
  border: 1px solid #e2e8f0;
}

.legend-color.low {
  background: rgba(251, 191, 36, 0.3);
  border: 1px solid #fbbf24;
}

@media (max-width: 768px) {
  .table-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  th, td {
    padding: 8px 10px;
    font-size: 12px;
  }

  .compact-table th,
  .compact-table td {
    padding: 8px 10px;
    font-size: 11px;
  }

  table {
    min-width: 500px;
  }

  .compact-table {
    min-width: 400px;
  }

  .legend {
    gap: 12px;
  }

  .legend-item {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  th, td {
    padding: 6px 8px;
    font-size: 11px;
  }

  .compact-table th,
  .compact-table td {
    padding: 6px 8px;
    font-size: 10px;
  }

  table {
    min-width: 400px;
  }

  .compact-table {
    min-width: 350px;
  }
}
</style>
