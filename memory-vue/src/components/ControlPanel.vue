<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMemoryStore } from '@/stores/memory'
import type { Resolution, ChartType } from '@/types'

const store = useMemoryStore()
const router = useRouter()

const chartTypes: { type: ChartType; label: string }[] = [
  { type: 'grouped', label: '分组柱状图' },
  { type: 'avgOnly', label: '仅平均帧' },
  { type: 'lowOnly', label: '仅1%Low' },
  { type: 'radar', label: '雷达图对比' },
  { type: 'line', label: '折线趋势' }
]

const resolutions: { value: Resolution; label: string }[] = [
  { value: 'both', label: '1K + 2K 对比' },
  { value: '1K', label: '仅 1K' },
  { value: '2K', label: '仅 2K' }
]

function toggleConfig(configId: string) {
  store.toggleConfig(configId)
}

function setResolution(res: Resolution) {
  store.setResolution(res)
}

function setChartType(type: ChartType) {
  store.setChartType(type)
}

function goToDataEntry() {
  router.push('/data-entry')
}
</script>

<template>
  <div class="control-panel">
    <!-- 配置选择 -->
    <div class="control-section">
      <div class="control-label">📊 选择要对比的内存配置（点击选择/取消）：</div>
      <div class="checkbox-group">
        <label
          v-for="config in store.configs"
          :key="config.id"
          class="checkbox-item"
          :class="{ active: store.selectedConfigs.includes(config.id) }"
          @click.prevent="toggleConfig(config.id)"
        >
          <input
            type="checkbox"
            :value="config.id"
            :checked="store.selectedConfigs.includes(config.id)"
          >
          <span class="check-icon">
            {{ store.selectedConfigs.includes(config.id) ? '✓' : '' }}
          </span>
          <span>{{ config.name }}</span>
        </label>
      </div>
    </div>

    <!-- 分辨率选择 -->
    <div class="control-section">
      <div class="control-label">🎯 对比分辨率：</div>
      <div class="res-toggle">
        <button
          v-for="res in resolutions"
          :key="res.value"
          class="res-btn"
          :class="{ active: store.resolution === res.value }"
          @click="setResolution(res.value)"
        >
          {{ res.label }}
        </button>
      </div>
    </div>

    <!-- 图表类型选择 -->
    <div class="control-section">
      <div class="control-label">📈 图表类型：</div>
      <div class="chart-type-group">
        <button
          v-for="ct in chartTypes"
          :key="ct.type"
          class="chart-type-btn"
          :class="{ active: store.chartType === ct.type }"
          @click="setChartType(ct.type)"
        >
          {{ ct.label }}
        </button>
      </div>
    </div>

    <!-- 数据管理 -->
    <!-- <div class="control-section">
      <div class="control-label">📝 数据管理：</div>
      <button class="data-entry-btn" @click="goToDataEntry">
        ✏️ 编辑/录入数据
      </button>
    </div> -->
  </div>
</template>

<style scoped>
.control-panel {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(51, 65, 85, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-size: 13px;
}

.checkbox-item:hover {
  background: rgba(71, 85, 105, 0.8);
  transform: translateY(-2px);
}

.checkbox-item.active {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.2);
}

.checkbox-item input {
  display: none;
}

.check-icon {
  width: 18px;
  height: 18px;
  border: 2px solid #64748b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 12px;
}

.checkbox-item.active .check-icon {
  background: #60a5fa;
  border-color: #60a5fa;
}

.res-toggle {
  display: flex;
  gap: 10px;
  background: rgba(51, 65, 85, 0.6);
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
}

.res-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.res-btn.active {
  background: #60a5fa;
  color: white;
}

.chart-type-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart-type-btn {
  padding: 10px 20px;
  border: 2px solid rgba(96, 165, 250, 0.3);
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.chart-type-btn.active {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  border-color: transparent;
  color: white;
}

.data-entry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #34d399, #22d3ee);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-entry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 211, 153, 0.3);
}

@media (max-width: 768px) {
  .control-panel {
    padding: 16px;
    border-radius: 12px;
  }

  .control-label {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .checkbox-group {
    gap: 8px;
  }

  .checkbox-item {
    padding: 6px 12px;
    font-size: 12px;
  }

  .res-toggle {
    width: 100%;
    gap: 6px;
  }

  .res-btn {
    padding: 8px 12px;
    font-size: 12px;
    flex: 1;
  }

  .chart-type-group {
    gap: 8px;
  }

  .chart-type-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .checkbox-item {
    padding: 5px 10px;
    font-size: 11px;
  }

  .chart-type-btn {
    padding: 6px 10px;
    font-size: 11px;
  }

  .res-btn {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>
