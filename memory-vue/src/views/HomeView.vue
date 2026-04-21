<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMemoryStore } from '@/stores/memory'
import { useAuthStore } from '@/stores/auth'
import ControlPanel from '@/components/ControlPanel.vue'
import MemoryChart from '@/components/MemoryChart.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import ComparisonTable from '@/components/ComparisonTable.vue'

const store = useMemoryStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const planId = computed(() => route.params.id as string)

onMounted(async () => {
  if (planId.value) {
    const success = await store.loadPlan(planId.value)
    if (!success) {
      // 如果加载失败，返回首页
      router.push('/')
    }
  } else {
    // 如果没有 planId，尝试加载默认数据
    await store.fetchData()
  }
})

const goBack = () => {
  router.push('/')
}

const goToDataEntry = () => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: `/data-entry?edit=true&planId=${planId.value}` }
    })
    return
  }
  router.push({
    path: '/data-entry',
    query: { edit: 'true', planId: planId.value }
  })
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        ← 返回列表
      </button>
      <div class="header-actions">
        <button class="edit-btn" @click="goToDataEntry">
          ✏️ 编辑方案
        </button>
      </div>
    </div>

    <h1>{{ store.currentPlan?.name || '内存配置性能对比分析' }}</h1>
    <p class="subtitle">
      {{ store.currentPlan?.description || 'Intel core Ultra 250 - ASUS B860 v5 - JBD 6000 C30 24g - 5070 测试平台 | 自由选择配置对比分析' }}
    </p>

    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="store.error" class="error">
      <p>{{ store.error }}</p>
      <button @click="goBack" class="back-link">返回方案列表</button>
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  /* padding: 0 4%; */
}

.back-btn {
  padding: 8px 16px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #60a5fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(96, 165, 250, 0.3);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.edit-btn {
  padding: 8px 16px;
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: rgba(52, 211, 153, 0.3);
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 60px 20px;
  color: #f87171;
}

.back-link {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #60a5fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 0;
  }

  h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 12px;
  }

  .back-btn,
  .edit-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
