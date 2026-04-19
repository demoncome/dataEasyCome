<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  RadarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useMemoryStore } from '@/stores/memory'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  RadarComponent
])

const store = useMemoryStore()
const chartRef = ref<InstanceType<typeof VChart>>()

const chartOption = computed<EChartsOption>(() => {
  if (!store.memoryData) return {}

  switch (store.chartType) {
    case 'grouped':
      return createGroupedOption()
    case 'avgOnly':
      return createAvgOnlyOption()
    case 'lowOnly':
      return createLowOnlyOption()
    case 'radar':
      return createRadarOption()
    case 'line':
      return createLineOption()
    default:
      return createGroupedOption()
  }
})

function createGroupedOption(): EChartsOption {
  const series: any[] = []
  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      const suffix = isBoth ? ` ${res}` : ''
      const brightness = res === '1K' ? 1 : 0.7

      series.push({
        name: `${config.name}${suffix} 平均帧`,
        type: 'bar',
        data: config.data[res as '1K' | '2K'].avg,
        itemStyle: {
          color: store.adjustBrightness(config.color, brightness),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: isBoth ? '10%' : '15%',
        label: {
          show: true,
          position: store.isMobile ? 'insideTop' : 'top',
          fontSize: store.isSmallMobile ? 8 : 10,
          formatter: '{c}',
          color: store.isMobile ? '#fff' : 'inherit',
          distance: store.isMobile ? 0 : undefined
        }
      })

      series.push({
        name: `${config.name}${suffix} 1%Low`,
        type: 'bar',
        data: config.data[res as '1K' | '2K'].low,
        itemStyle: {
          color: store.adjustBrightness(config.color, brightness * 0.6),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: isBoth ? '10%' : '15%',
        label: {
          show: true,
          position: store.isMobile ? 'insideTop' : 'top',
          fontSize: store.isSmallMobile ? 8 : 10,
          formatter: '{c}',
          color: store.isMobile ? '#fff' : 'inherit',
          distance: store.isMobile ? 0 : undefined
        }
      })
    })
  })

  return {
    title: {
      text: `📊 内存配置性能对比 - ${store.resolution === 'both' ? '1K vs 2K' : store.resolution}`,
      left: 'center',
      textStyle: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 14 : 16) : 20,
        color: '#e2e8f0'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#e2e8f0',
        fontSize: store.isMobile ? 11 : 12
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: store.isMobile ? (store.isSmallMobile ? 35 : 40) : 50,
      type: 'scroll',
      textStyle: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 11
      },
      pageIconColor: '#60a5fa',
      pageTextStyle: { color: '#94a3b8' },
      itemWidth: store.isMobile ? 15 : 25,
      itemHeight: store.isMobile ? 10 : 14
    },
    grid: {
      left: store.isMobile ? '2%' : '3%',
      right: store.isMobile ? '2%' : '4%',
      bottom: store.isMobile ? (store.isSmallMobile ? '8%' : '6%') : '10%',
      top: store.isMobile ? (store.isSmallMobile ? 85 : 100) : 120,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: store.games,
      axisLabel: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 10 : 11) : 13,
        color: '#94a3b8',
        fontWeight: 'bold',
        rotate: store.isMobile ? 30 : 0,
        interval: 0
      },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '帧率 (FPS)',
      nameTextStyle: { color: '#64748b' },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series,
    animationDuration: 800
  }
}

function createAvgOnlyOption(): EChartsOption {
  const series: any[] = []
  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      const suffix = isBoth ? ` ${res}` : ''
      const brightness = res === '1K' ? 1 : 0.7

      series.push({
        name: `${config.name}${suffix}`,
        type: 'bar',
        data: config.data[res as '1K' | '2K'].avg,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: store.adjustBrightness(config.color, brightness) },
              { offset: 1, color: store.adjustBrightness(config.color, brightness * 0.5) }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: isBoth ? '12%' : '18%',
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          formatter: '{c}'
        }
      })
    })
  })

  return {
    title: {
      text: `📈 平均帧率对比 - ${store.resolution === 'both' ? '1K vs 2K' : store.resolution}`,
      left: 'center',
      textStyle: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 14 : 16) : 20,
        color: '#e2e8f0'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#e2e8f0',
        fontSize: store.isMobile ? 11 : 12
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: store.isMobile ? (store.isSmallMobile ? 35 : 40) : 50,
      type: 'scroll',
      textStyle: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 11
      },
      pageIconColor: '#60a5fa',
      pageTextStyle: { color: '#94a3b8' },
      itemWidth: store.isMobile ? 15 : 25,
      itemHeight: store.isMobile ? 10 : 14
    },
    grid: {
      left: store.isMobile ? '2%' : '3%',
      right: store.isMobile ? '2%' : '4%',
      bottom: store.isMobile ? (store.isSmallMobile ? '8%' : '6%') : '10%',
      top: store.isMobile ? (store.isSmallMobile ? 85 : 100) : 120,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: store.games,
      axisLabel: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 10 : 11) : 13,
        color: '#94a3b8',
        fontWeight: 'bold',
        rotate: store.isMobile ? 30 : 0,
        interval: 0
      },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '帧率 (FPS)',
      nameTextStyle: { color: '#64748b' },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series,
    animationDuration: 800
  }
}

function createLowOnlyOption(): EChartsOption {
  const series: any[] = []
  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      const suffix = isBoth ? ` ${res}` : ''
      series.push({
        name: `${config.name}${suffix}`,
        type: 'bar',
        data: config.data[res as '1K' | '2K'].low,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: store.adjustBrightness(config.color, res === '1K' ? 0.8 : 0.5) },
              { offset: 1, color: store.adjustBrightness(config.color, res === '1K' ? 0.4 : 0.3) }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: isBoth ? '12%' : '18%',
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          formatter: '{c}'
        }
      })
    })
  })

  return {
    title: {
      text: `📉 1%Low帧率对比（稳定性）- ${store.resolution === 'both' ? '1K vs 2K' : store.resolution}`,
      left: 'center',
      textStyle: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 14 : 16) : 20,
        color: '#e2e8f0'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#e2e8f0',
        fontSize: store.isMobile ? 11 : 12
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: store.isMobile ? (store.isSmallMobile ? 35 : 40) : 50,
      type: 'scroll',
      textStyle: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 11
      },
      pageIconColor: '#60a5fa',
      pageTextStyle: { color: '#94a3b8' },
      itemWidth: store.isMobile ? 15 : 25,
      itemHeight: store.isMobile ? 10 : 14
    },
    grid: {
      left: store.isMobile ? '2%' : '3%',
      right: store.isMobile ? '2%' : '4%',
      bottom: store.isMobile ? (store.isSmallMobile ? '8%' : '6%') : '10%',
      top: store.isMobile ? (store.isSmallMobile ? 85 : 100) : 120,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: store.games,
      axisLabel: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 10 : 11) : 13,
        color: '#94a3b8',
        fontWeight: 'bold',
        rotate: store.isMobile ? 30 : 0,
        interval: 0
      },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '帧率 (FPS)',
      nameTextStyle: { color: '#64748b' },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series,
    animationDuration: 800
  }
}

function createRadarOption(): EChartsOption {
  const indicator = store.games.map(game => ({ name: game, max: 900 }))
  const series: any[] = []
  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      series.push({
        name: `${config.name} ${res}`,
        type: 'radar',
        data: [{
          value: config.data[res as '1K' | '2K'].avg,
          name: `${config.name} ${res}`,
          itemStyle: { color: store.adjustBrightness(config.color, res === '1K' ? 1 : 0.7) },
          areaStyle: { opacity: 0.2 }
        }],
        symbol: 'circle',
        symbolSize: store.isMobile ? (store.isSmallMobile ? 4 : 5) : 8,
        lineStyle: { width: store.isMobile ? 1.5 : 2 }
      })
    })
  })

  return {
    title: {
      text: `🎯 综合性能雷达图 - ${store.resolution === 'both' ? '1K vs 2K' : store.resolution}`,
      left: 'center',
      textStyle: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 14 : 16) : 20,
        color: '#e2e8f0'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#e2e8f0',
        fontSize: store.isMobile ? 11 : 12
      }
    },
    legend: {
      data: series.map(s => s.name),
      bottom: store.isSmallMobile ? 5 : 10,
      textStyle: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 12
      },
      itemWidth: store.isMobile ? 15 : 25,
      itemHeight: store.isMobile ? 10 : 14
    },
    radar: {
      indicator,
      center: ['50%', store.isSmallMobile ? '45%' : '50%'],
      radius: store.isMobile ? (store.isSmallMobile ? '50%' : '55%') : '65%',
      axisName: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(96, 165, 250, 0.05)', 'rgba(96, 165, 250, 0.1)']
        }
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#334155' } }
    },
    series
  }
}

function createLineOption(): EChartsOption {
  const series: any[] = []
  const isBoth = store.resolution === 'both'
  const resolutions = isBoth ? ['1K', '2K'] : [store.resolution]

  store.selectedData.forEach(config => {
    resolutions.forEach(res => {
      const suffix = isBoth ? ` ${res}` : ''
      const brightness = res === '1K' ? 1 : 0.7

      series.push({
        name: `${config.name}${suffix} 平均帧`,
        type: 'line',
        data: config.data[res as '1K' | '2K'].avg,
        smooth: true,
        symbol: 'circle',
        symbolSize: store.isMobile ? (store.isSmallMobile ? 5 : 6) : 10,
        lineStyle: {
          width: store.isMobile ? 2 : 3,
          color: store.adjustBrightness(config.color, brightness)
        },
        itemStyle: { color: store.adjustBrightness(config.color, brightness) },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: store.adjustBrightness(config.color, brightness * 0.3) },
              { offset: 1, color: 'transparent' }
            ]
          }
        }
      })

      series.push({
        name: `${config.name}${suffix} 1%Low`,
        type: 'line',
        data: config.data[res as '1K' | '2K'].low,
        smooth: true,
        symbol: 'diamond',
        symbolSize: store.isMobile ? (store.isSmallMobile ? 4 : 5) : 8,
        lineStyle: {
          width: store.isMobile ? 1.5 : 2,
          type: 'dashed',
          color: store.adjustBrightness(config.color, brightness * 0.6)
        },
        itemStyle: { color: store.adjustBrightness(config.color, brightness * 0.6) }
      })
    })
  })

  return {
    title: {
      text: `📈 性能趋势折线图 - ${store.resolution === 'both' ? '1K vs 2K' : store.resolution}`,
      left: 'center',
      textStyle: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 14 : 16) : 20,
        color: '#e2e8f0'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#e2e8f0',
        fontSize: store.isMobile ? 11 : 12
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: store.isMobile ? (store.isSmallMobile ? 35 : 40) : 50,
      type: 'scroll',
      textStyle: {
        color: '#94a3b8',
        fontSize: store.isMobile ? (store.isSmallMobile ? 9 : 10) : 11
      },
      itemWidth: store.isMobile ? 15 : 25,
      itemHeight: store.isMobile ? 10 : 14
    },
    grid: {
      left: store.isMobile ? '2%' : '3%',
      right: store.isMobile ? '2%' : '4%',
      bottom: store.isMobile ? (store.isSmallMobile ? '8%' : '5%') : '3%',
      top: store.isMobile ? (store.isSmallMobile ? 70 : 85) : 120,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: store.games,
      axisLabel: {
        fontSize: store.isMobile ? (store.isSmallMobile ? 10 : 11) : 13,
        color: '#94a3b8',
        rotate: store.isMobile ? 30 : 0,
        interval: 0
      },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '帧率 (FPS)',
      nameTextStyle: { color: '#64748b' },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series
  }
}

// Handle resize
function handleResize() {
  chartRef.value?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="chart-wrapper">
    <v-chart
      ref="chartRef"
      class="chart"
      :option="chartOption"
      autoresize
    />
  </div>
</template>

<style scoped>
.chart-wrapper {
  background: rgba(30, 41, 59, 0.9);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
}

.chart {
  width: 100%;
  height: 600px;
  min-width: 0;
}

@media (max-width: 768px) {
  .chart-wrapper {
    padding: 16px;
    border-radius: 12px;
  }
  .chart {
    height: 450px;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 380px;
  }
}
</style>
