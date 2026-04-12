<script setup lang="ts">
import { onMounted } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import ControlPanel from '@/components/ControlPanel.vue'
import MemoryChart from '@/components/MemoryChart.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import ComparisonTable from '@/components/ComparisonTable.vue'

const store = useMemoryStore()

onMounted(() => {
  store.fetchData()
})
</script>

<template>
  <div class="container">
    <h1>星超频 - 内存配置性能对比分析工具</h1>
    <p class="subtitle">
      Intel core Ultra 250 - ASUS B860 v5 - JBD 6000 C30 24g - 5070 测试平台 | 自由选择配置对比分析
    </p>

    <div v-if="store.loading" class="loading">
      加载中...
    </div>

    <div v-else-if="store.error" class="error">
      {{ store.error }}
    </div>

    <template v-else>
      <ControlPanel />
      <MemoryChart />
      <StatsPanel />
      <ComparisonTable />
    </template>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  margin: 0 auto;
  padding: 20px 0;
}

@media (max-width: 1200px) {
  .container {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .container {
    width: 96%;
  }
}

h1 {
  text-align: center;
  font-size: 32px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 30px;
  font-size: 14px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #f87171;
}

@media (max-width: 768px) {
  h1 {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 12px;
    margin-bottom: 20px;
    padding: 0 10px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 11px;
  }
}
</style>
