<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PlansData, Plan } from '@/types'

const router = useRouter()
const plans = ref<Plan[]>([])
const loading = ref(true)
const error = ref('')

const fetchPlans = async () => {
  try {
    loading.value = true
    const response = await fetch('/mock/plansData.json')
    if (!response.ok) {
      throw new Error('Failed to fetch plans')
    }
    const data: PlansData = await response.json()
    plans.value = data.plans || []
  } catch (err) {
    error.value = '加载方案列表失败，请稍后重试'
    console.error('Error fetching plans:', err)
  } finally {
    loading.value = false
  }
}

const goToPlanDetail = (planId: string) => {
  router.push(`/plan/${planId}`)
}

const goToDataEntry = () => {
  router.push('/data-entry')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortedPlans = computed(() => {
  return [...plans.value].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <div class="plan-list-container">
    <div class="logo">
      <div class="logo-icon">
        <img src="/src/assets/xcp-logo.svg" alt="logo" />
      </div>
      <div class="logo-text">
        <span class="logo-brand">星超频</span>
        <span class="logo-divider">|</span>
        <span class="logo-title">IPO 内存测试对比工具</span>
      </div>
    </div>
    <div class="header">
      <h1 class="title">📊 内存配置性能对比方案</h1>
      <button class="create-btn" @click="goToDataEntry">
        <span class="icon">+</span>
        新建方案
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchPlans">重试</button>
    </div>

    <div v-else-if="plans.length === 0" class="empty">
      <div class="empty-icon">📋</div>
      <h3>暂无方案</h3>
      <p>点击"新建方案"开始创建您的第一个性能对比方案</p>
    </div>

    <div v-else class="plans-grid">
      <div
        v-for="plan in sortedPlans"
        :key="plan.id"
        class="plan-card"
        @click="goToPlanDetail(plan.id)"
      >
        <div class="plan-main">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <p class="plan-description">{{ plan.description || '暂无描述' }}</p>
        </div>

        <div class="plan-stats">
          <div class="stat-item">
            <span class="stat-value">{{ plan.data.configs.length }}</span>
            <span class="stat-label">配置</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ plan.data.games.length }}</span>
            <span class="stat-label">游戏</span>
          </div>
        </div>

        <div class="plan-games">
          <span
            v-for="game in plan.data.games.slice(0, 5)"
            :key="game"
            class="game-tag"
          >
            {{ game }}
          </span>
          <span v-if="plan.data.games.length > 5" class="game-tag more">
            +{{ plan.data.games.length - 5 }}
          </span>
        </div>

        <div class="plan-date">
          {{ formatDate(plan.updatedAt) }}
        </div>

        <div class="plan-actions">
          <span class="view-btn">查看详情 →</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>版权及数据最终解释权归星超频所有</p>
    </footer>
  </div>
</template>

<style scoped>
.plan-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.icon {
  font-size: 20px;
  font-weight: 400;
}

/* Logo 样式 */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #60a5fa;
}

.logo-icon img {
  width: 100%;
  height: 100%;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-brand {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #4285f4 0%, #ea4335 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.logo-divider {
  color: #475569;
  font-size: 18px;
  font-weight: 300;
}

.logo-title {
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
  color: #ef4444;
}

.error button {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.error button:hover {
  background: rgba(239, 68, 68, 0.3);
}

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty h3 {
  font-size: 20px;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.plans-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.plan-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 24px;
}

.plan-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.plan-main {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 6px 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-description {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-stats {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #60a5fa;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
}

.plan-games {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
  max-width: 280px;
}

.game-tag {
  padding: 3px 8px;
  background: rgba(51, 65, 85, 0.8);
  color: #94a3b8;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
}

.game-tag.more {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.plan-date {
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
  white-space: nowrap;
}

.plan-actions {
  display: flex;
  flex-shrink: 0;
}

.view-btn {
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.3s;
  white-space: nowrap;
}

.plan-card:hover .view-btn {
  color: #60a5fa;
}

@media (max-width: 768px) {
  .plan-list-container {
    padding: 16px;
  }

  .logo {
    margin-bottom: 24px;
    padding: 12px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .logo-brand {
    font-size: 20px;
  }

  .logo-divider {
    font-size: 14px;
  }

  .logo-title {
    font-size: 13px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .title {
    font-size: 22px;
    text-align: center;
  }

  .create-btn {
    justify-content: center;
  }

  .plans-grid {
    gap: 12px;
  }

  .plan-card {
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .plan-main {
    width: 100%;
  }

  .plan-stats {
    order: 3;
    gap: 16px;
  }

  .stat-value {
    font-size: 18px;
  }

  .plan-games {
    order: 2;
    max-width: none;
    width: 100%;
  }

  .plan-date {
    order: 4;
    font-size: 11px;
  }

  .plan-actions {
    order: 5;
    margin-left: auto;
  }
}

/* Footer 样式 */
.footer {
  margin-top: auto;
  padding: 24px;
  text-align: center;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.footer p {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

@media (max-width: 768px) {
  .footer {
    margin-top: 32px;
    padding: 16px;
  }

  .footer p {
    font-size: 12px;
  }
}
</style>
