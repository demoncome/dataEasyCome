import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MemoryData, ConfigData, Resolution, ChartType, Plan, PlansData } from "@/types";

export const useMemoryStore = defineStore("memory", () => {
  // State
  const memoryData = ref<MemoryData | null>(null);
  const currentPlan = ref<Plan | null>(null);
  const plans = ref<Plan[]>([]);
  const selectedConfigs = ref<string[]>([]);
  const resolution = ref<Resolution>("both");
  const chartType = ref<ChartType>("grouped");
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const configs = computed(() => memoryData.value?.configs || []);
  const games = computed(() => memoryData.value?.games || []);

  const selectedData = computed(() => {
    if (!memoryData.value) return [];
    return memoryData.value.configs.filter((c) => selectedConfigs.value.includes(c.id));
  });

  const isMobile = computed(() => window.innerWidth <= 768);
  const isSmallMobile = computed(() => window.innerWidth <= 480);

  // Actions
  async function fetchPlans(): Promise<PlansData> {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/mock/plansData.json");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data: PlansData = await response.json();
      plans.value = data.plans || [];
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
      return { plans: [] };
    } finally {
      loading.value = false;
    }
  }

  async function loadPlan(planId: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      // 先尝试从已加载的方案列表中查找
      let plan = plans.value.find(p => p.id === planId);
      
      // 如果没有找到，重新获取方案列表
      if (!plan) {
        const plansData = await fetchPlans();
        plan = plansData.plans.find(p => p.id === planId);
      }
      
      if (plan) {
        currentPlan.value = plan;
        memoryData.value = plan.data;
        // 默认选中前两个配置
        selectedConfigs.value = plan.data.configs.slice(0, 2).map(c => c.id);
        return true;
      } else {
        error.value = "Plan not found";
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 兼容旧版本，直接获取单个数据文件
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/mock/memoryData.json");
      if (!response.ok) throw new Error("Failed to fetch data");
      memoryData.value = await response.json();
      // 默认选中前两个配置
      if (memoryData.value?.configs) {
        selectedConfigs.value = memoryData.value.configs.slice(0, 2).map(c => c.id);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
    } finally {
      loading.value = false;
    }
  }

  function toggleConfig(configId: string) {
    const index = selectedConfigs.value.indexOf(configId);
    if (index > -1) {
      selectedConfigs.value.splice(index, 1);
    } else {
      selectedConfigs.value.push(configId);
    }
  }

  function setResolution(res: Resolution) {
    resolution.value = res;
  }

  function setChartType(type: ChartType) {
    chartType.value = type;
  }

  // Helper function to adjust color brightness
  function adjustBrightness(hex: string, factor: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.floor((num >> 16) * factor));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) * factor));
    const b = Math.min(255, Math.floor((num & 0x0000ff) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  return {
    memoryData,
    currentPlan,
    plans,
    selectedConfigs,
    resolution,
    chartType,
    loading,
    error,
    configs,
    games,
    selectedData,
    isMobile,
    isSmallMobile,
    fetchPlans,
    loadPlan,
    fetchData,
    toggleConfig,
    setResolution,
    setChartType,
    adjustBrightness,
  };
});
