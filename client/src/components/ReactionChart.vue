<template>
  <div class="reaction-chart-container">
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-if="summaryStats" class="stats-summary">
      <div class="stat-item total-reactions">
        <span class="stat-label">Total Reactions (30 min)</span>
        <span class="stat-value">{{ formatNumber(summaryStats.totalReactions) }}</span>
      </div>

      <div class="emoji-breakdown">
        <div class="breakdown-title">Emoji Breakdown</div>
        <div class="emoji-stats">
          <div
            v-for="(count, emoji) in summaryStats.emojiBreakdown"
            :key="emoji"
            class="emoji-stat-item"
          >
            <span class="emoji">{{ emoji }}</span>
            <span class="emoji-count">{{ formatNumber(count) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

// Register all Chart.js components
Chart.register(...registerables)

// Set default font size for all charts
Chart.defaults.font.size = 11

const props = defineProps({
  chartData: {
    type: Object,
    default: null
  },
  summaryStats: {
    type: Object,
    default: () => ({
      totalReactions: 0,
      emojiBreakdown: {}
    })
  }
})

const chartCanvas = ref(null)
let chartInstance = null

// Format numbers with commas
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

// Initialize or update the chart
const updateChart = () => {
  if (!chartCanvas.value || !props.chartData) return

  const chartConfig = {
    type: 'line',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              return `Time: ${tooltipItems[0].label}`
            },
            footer: (tooltipItems) => {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
              return `Total: ${total}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          ticks: {
            maxTicksLimit: 10,
            maxRotation: 0,
            autoSkip: true
          },
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          stacked: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          },
          grid: {
            drawBorder: false,
            borderDash: [2, 2]
          }
        }
      },
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hoverRadius: 4
        }
      }
    }
  }

  if (chartInstance) {
    // Update existing chart
    chartInstance.data = props.chartData
    chartInstance.update('none') // No animation for real-time updates
  } else {
    // Create new chart
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, chartConfig)
  }
}

// Watch for data changes
watch(() => props.chartData, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  updateChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.reaction-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  min-height: 300px;
}

.stats-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.total-reactions {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
}

.emoji-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-title {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.emoji-stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.emoji-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
}

.emoji {
  font-size: 1.5rem;
}

.emoji-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

@media (max-width: 640px) {
  .emoji-stats {
    gap: 0.75rem;
  }

  .emoji-stat-item {
    min-width: 50px;
  }

  .emoji {
    font-size: 1.25rem;
  }

  .emoji-count {
    font-size: 1rem;
  }
}
</style>