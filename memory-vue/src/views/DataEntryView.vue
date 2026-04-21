<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ConfigData, MemoryData, Plan, PlansData } from '@/types'

const router = useRouter()
const route = useRoute()

// 判断是编辑模式还是新建模式
const isEditMode = computed(() => route.query.edit === 'true')
const editPlanId = computed(() => route.query.planId as string | undefined)

// 方案基本信息
const planName = ref('')
const planDescription = ref('')
const planId = ref('')

// 表单数据
const games = ref<string[]>([''])
const configs = reactive<ConfigData[]>([])
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const activeResolution = ref<'1K' | '2K'>('1K')

// 预设颜色
const presetColors = [
  '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa',
  '#f87171', '#22d3ee', '#a3e635', '#fb923c', '#e879f9'
]

// 生成唯一ID
function generateId(): string {
  return 'plan_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// 初始化配置
function initConfig(): ConfigData {
  const gameCount = games.value.filter(g => g.trim()).length || 1
  const colorIndex = configs.length % presetColors.length
  return {
    id: '',
    name: '',
    color: presetColors[colorIndex] ?? '#60a5fa',
    data: {
      '1K': { avg: new Array(gameCount).fill(0), low: new Array(gameCount).fill(0) },
      '2K': { avg: new Array(gameCount).fill(0), low: new Array(gameCount).fill(0) }
    }
  }
}

// 添加配置
function addConfig() {
  configs.push(initConfig())
}

// 删除配置
function removeConfig(index: number) {
  configs.splice(index, 1)
}

// 添加游戏
function addGame() {
  games.value.push('')
  configs.forEach(config => {
    config.data['1K'].avg.push(0)
    config.data['1K'].low.push(0)
    config.data['2K'].avg.push(0)
    config.data['2K'].low.push(0)
  })
}

// 删除游戏
function removeGame(index: number) {
  if (games.value.length <= 1) {
    showMessage('至少保留一个游戏', 'error')
    return
  }
  games.value.splice(index, 1)
  configs.forEach(config => {
    config.data['1K'].avg.splice(index, 1)
    config.data['1K'].low.splice(index, 1)
    config.data['2K'].avg.splice(index, 1)
    config.data['2K'].low.splice(index, 1)
  })
}

// 生成配置ID
function generateConfigId(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^\w\u4e00-\u9fa5]/g, '')
}

// 显示消息
function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

// 获取现有方案数据
async function fetchExistingPlans(): Promise<PlansData> {
  try {
    const response = await fetch('/mock/plansData.json')
    if (!response.ok) {
      return { plans: [] }
    }
    return await response.json()
  } catch {
    return { plans: [] }
  }
}

// 加载要编辑的方案
async function loadPlanForEdit() {
  if (!isEditMode.value || !editPlanId.value) return
  
  const plansData = await fetchExistingPlans()
  const plan = plansData.plans.find(p => p.id === editPlanId.value)
  
  if (plan) {
    planId.value = plan.id
    planName.value = plan.name
    planDescription.value = plan.description
    games.value = [...plan.data.games]
    configs.length = 0
    plan.data.configs.forEach(config => {
      configs.push({
        id: config.id,
        name: config.name,
        color: config.color,
        data: {
          '1K': { avg: [...config.data['1K'].avg], low: [...config.data['1K'].low] },
          '2K': { avg: [...config.data['2K'].avg], low: [...config.data['2K'].low] }
        }
      })
    })
  }
}

// 保存数据
async function saveData() {
  if (!planName.value.trim()) {
    showMessage('请输入方案名称', 'error')
    return
  }

  const validGames = games.value.filter(g => g.trim())
  if (validGames.length === 0) {
    showMessage('请至少输入一个游戏名称', 'error')
    return
  }

  if (configs.length === 0) {
    showMessage('请至少添加一个配置', 'error')
    return
  }

  for (const config of configs) {
    if (!config.name.trim()) {
      showMessage('请填写所有配置名称', 'error')
      return
    }
    config.id = generateConfigId(config.name)
  }

  const now = new Date().toISOString()
  
  // 如果是新建模式，生成新ID
  if (!isEditMode.value) {
    planId.value = generateId()
  }

  const planData: Plan = {
    id: planId.value,
    name: planName.value.trim(),
    description: planDescription.value.trim(),
    createdAt: isEditMode.value ? (await fetchExistingPlans()).plans.find(p => p.id === planId.value)?.createdAt || now : now,
    updatedAt: now,
    data: {
      games: validGames,
      configs: configs.map(config => ({
        ...config,
        data: {
          '1K': {
            avg: config.data['1K'].avg.slice(0, validGames.length),
            low: config.data['1K'].low.slice(0, validGames.length)
          },
          '2K': {
            avg: config.data['2K'].avg.slice(0, validGames.length),
            low: config.data['2K'].low.slice(0, validGames.length)
          }
        }
      }))
    }
  }

  try {
    // 获取现有方案列表
    const plansData = await fetchExistingPlans()
    
    // 如果是编辑模式，更新现有方案；否则添加新方案
    const existingIndex = plansData.plans.findIndex(p => p.id === planId.value)
    if (existingIndex >= 0) {
      plansData.plans[existingIndex] = planData
    } else {
      plansData.plans.push(planData)
    }
    
    // 保存到 localStorage
    localStorage.setItem('plansData', JSON.stringify(plansData))
    
    // 下载 JSON 文件
    const blob = new Blob([JSON.stringify(plansData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plansData.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showMessage(isEditMode.value ? '方案更新成功！文件已下载' : '方案创建成功！文件已下载', 'success')
    
    // 延迟返回首页
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    showMessage('保存失败：' + (error as Error).message, 'error')
  }
}

// 初始化数据
function initData() {
  games.value = ['PUBG', '三角洲', '无畏契约', 'CS2', '永劫无间']
  addConfig()
  addConfig()
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  if (isEditMode.value && editPlanId.value) {
    loadPlanForEdit()
  } else {
    initData()
  }
})
</script>

<template>
  <div class="data-entry-page">
    <header class="page-header">
      <h1>{{ isEditMode ? '✏️ 编辑方案' : '📝 新建方案' }}</h1>
      <button class="back-btn" @click="goBack">返回列表</button>
    </header>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <!-- 方案基本信息 -->
    <section class="plan-info-section">
      <h2>📋 方案信息</h2>
      <div class="plan-info-row">
        <div class="form-group">
          <label>方案名称 <span class="required">*</span></label>
          <input v-model="planName" type="text" placeholder="例如：DDR5 内存超频对比" class="plan-input" />
        </div>
        <div class="form-group">
          <label>方案描述</label>
          <input v-model="planDescription" type="text" placeholder="简要描述这个对比方案" class="plan-input" />
        </div>
      </div>
    </section>

    <!-- 游戏列表横向排列 -->
    <section class="games-section">
      <h2>🎮 游戏列表</h2>
      <div class="games-row">
        <div v-for="(game, index) in games" :key="index" class="game-item">
          <input v-model="games[index]" type="text" placeholder="游戏名称" class="game-input" />
          <button class="remove-btn-small" @click="removeGame(index)">×</button>
        </div>
        <button class="add-game-btn" @click="addGame">+ 游戏</button>
      </div>
    </section>

    <!-- 分辨率切换 -->
    <section class="resolution-tabs">
      <button class="tab-btn" :class="{ active: activeResolution === '1K' }" @click="activeResolution = '1K'">
        1K 分辨率数据
      </button>
      <button class="tab-btn" :class="{ active: activeResolution === '2K' }" @click="activeResolution = '2K'">
        2K 分辨率数据
      </button>
    </section>

    <!-- 数据录入表格 - 横向布局 -->
    <section class="data-section">
      <div class="section-header">
        <h2>⚙️ {{ activeResolution }} 数据录入</h2>
        <button class="add-config-btn" @click="addConfig">+ 添加配置</button>
      </div>

      <div class="data-table-wrapper">
        <table class="horizontal-data-table">
          <thead>
            <tr>
              <th class="config-header-cell">配置名称</th>
              <th class="color-header-cell">颜色</th>
              <th v-for="(game, idx) in games" :key="idx" class="game-header-cell">
                <div class="game-name">{{ game || '游戏' + (idx + 1) }}</div>
                <div class="data-type-labels">
                  <span>平均帧</span>
                  <span>Low帧</span>
                </div>
              </th>
              <th class="action-header-cell">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(config, configIdx) in configs" :key="configIdx" class="config-row">
              <td class="config-name-cell">
                <input v-model="config.name" type="text" placeholder="配置名称" class="name-input" />
              </td>
              <td class="color-cell">
                <input v-model="config.color" type="color" class="color-picker-small" />
              </td>
              <td v-for="(game, gameIdx) in games" :key="gameIdx" class="data-input-cell">
                <div class="data-inputs">
                  <input v-model.number="config.data[activeResolution].avg[gameIdx]" type="number" placeholder="0" class="avg-input" />
                  <input v-model.number="config.data[activeResolution].low[gameIdx]" type="number" placeholder="0" class="low-input" />
                </div>
              </td>
              <td class="action-cell">
                <button class="remove-config-btn" @click="removeConfig(configIdx)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="configs.length === 0" class="empty-state">
        暂无配置，点击"+ 添加配置"按钮添加
      </div>
    </section>

    <div class="actions">
      <button class="save-btn" @click="saveData">
        💾 {{ isEditMode ? '更新方案' : '保存方案' }}
      </button>
      <p class="hint">保存后会下载 JSON 文件，将其放入 public/mock/ 目录下替换原文件即可</p>
    </div>
  </div>
</template>

<style scoped>
.data-entry-page {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  color: #e2e8f0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.back-btn {
  padding: 8px 16px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #60a5fa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.message {
  padding: 10px 16px;
  border-radius: 6px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.message.error {
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
}

section {
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

section h2 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #60a5fa;
}

/* 方案信息 */
.plan-info-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 250px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.required {
  color: #f87171;
}

.plan-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
}

.plan-input:focus {
  outline: none;
  border-color: #60a5fa;
}

/* 游戏列表横向排列 */
.games-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.game-input {
  width: 120px;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 13px;
}

.game-input:focus {
  outline: none;
  border-color: #60a5fa;
}

.remove-btn-small {
  width: 24px;
  height: 24px;
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-game-btn {
  padding: 8px 14px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px dashed rgba(96, 165, 250, 0.4);
  color: #60a5fa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

/* 分辨率切换 */
.resolution-tabs {
  display: flex;
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  border-color: transparent;
  color: white;
}

/* 数据表格区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-config-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #34d399, #22d3ee);
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.data-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.horizontal-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 600px;
}

.horizontal-data-table th,
.horizontal-data-table td {
  padding: 10px 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  text-align: center;
}

.horizontal-data-table th {
  background: rgba(51, 65, 85, 0.8);
  color: #60a5fa;
  font-weight: 600;
}

.config-header-cell {
  width: 150px;
  min-width: 150px;
}

.color-header-cell {
  width: 50px;
  min-width: 50px;
}

.game-header-cell {
  min-width: 120px;
}

.game-name {
  font-size: 13px;
  margin-bottom: 5px;
  color: #e2e8f0;
}

.data-type-labels {
  display: flex;
  gap: 5px;
  font-size: 11px;
  color: #94a3b8;
}

.data-type-labels span {
  flex: 1;
}

.action-header-cell {
  width: 60px;
  min-width: 60px;
}

/* 表格内容 */
.config-row:hover {
  background: rgba(96, 165, 250, 0.05);
}

.config-name-cell {
  padding: 8px;
}

.name-input {
  width: 100%;
  padding: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 13px;
  text-align: center;
}

.color-cell {
  padding: 8px;
}

.color-picker-small {
  width: 36px;
  height: 36px;
  padding: 2px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  cursor: pointer;
}

.data-input-cell {
  padding: 6px;
}

.data-inputs {
  display: flex;
  gap: 5px;
}

.avg-input,
.low-input {
  flex: 1;
  width: 50px;
  padding: 8px 4px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 13px;
  text-align: center;
}

.avg-input:focus,
.low-input:focus {
  outline: none;
  border-color: #60a5fa;
}

.low-input {
  color: #fbbf24;
}

.action-cell {
  padding: 8px;
}

.remove-config-btn {
  padding: 6px 10px;
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 14px;
}

/* 保存按钮 */
.actions {
  text-align: center;
  padding: 20px;
}

.save-btn {
  padding: 14px 40px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.3);
}

.hint {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .data-entry-page {
    padding: 10px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  section {
    padding: 12px;
  }

  .plan-info-row {
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    min-width: 100%;
  }

  .game-input {
    width: 100px;
    font-size: 12px;
  }

  .horizontal-data-table {
    font-size: 12px;
  }

  .name-input,
  .avg-input,
  .low-input {
    font-size: 12px;
    padding: 6px 4px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
