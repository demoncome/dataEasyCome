import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MemoryData, ConfigData, Resolution, ChartType } from "@/types";

export const useMemoryStore = defineStore("memory", () => {
  // State
  const memoryData = ref<MemoryData | null>(null);
  const selectedConfigs = ref<string[]>(["16Gx1_xcp8200", "16Gx2_xmp6000"]);
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
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/mock/memoryData.json");
      if (!response.ok) throw new Error("Failed to fetch data");
      memoryData.value = await response.json();
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
    fetchData,
    toggleConfig,
    setResolution,
    setChartType,
    adjustBrightness,
  };
});
