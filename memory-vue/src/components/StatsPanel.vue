<script setup lang="ts">
import { computed } from 'vue'
import { useMemoryStore } from '@/stores/memory'

const store = useMemoryStore()

const stats = computed(() => {
  const result: Array<{
    configName: string
    resolution: string
    avg: string
    low: string
    stability: string
    color: string
  }> = []

  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      const data = config.data[res as '1K' | '2K']
      const avg = (data.avg.reduce((a, b) => a + b, 0) / data.avg.length).toFixed(1)
      const low = (data.low.reduce((a, b) => a + b, 0) / data.low.length).toFixed(1)
      const stability = ((parseFloat(low) / parseFloat(avg)) * 100).toFixed(1)

      result.push({
        configName: config.name,
        resolution: res,
        avg,
        low,
        stability,
        color: config.color
      })
    })
  })

  return result
})
</script>

<template>
  <div class="stats-panel">
    <div
      v-for="stat in stats"
      :key="`${stat.configName}-${stat.resolution}`"
      class="stat-card"
    >
      <div class="stat-header">
        <span class="stat-title">{{ stat.configName }}</span>
        <span
          class="stat-badge"
          :class="stat.resolution === '1K' ? 'badge-1k' : 'badge-2k'"
        >
          {{ stat.resolution }}
        </span>
      </div>
      <div class="stat-body">
        <div class="stat-item">
          <div class="stat-label">平均帧</div>
          <div class="stat-value">{{ stat.avg }}</div>
        </div>
        <div class="stat-item text-right">
          <div class="stat-label">1%Low</div>
          <div class="stat-value">{{ stat.low }}</div>
        </div>
      </div>
      <div class="stat-detail">
        稳定性: {{ stat.stability }}%
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1));
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-title {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
}

.stat-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.badge-1k {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.badge-2k {
  background: rgba(244, 114, 182, 0.2);
  color: #f472b6;
}

.stat-body {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.stat-item {
  flex: 1;
}

.stat-item.text-right {
  text-align: right;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(90deg, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-detail {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 20px;
  }
}
</style>
