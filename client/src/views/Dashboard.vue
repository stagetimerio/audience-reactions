<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Validating access...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto p-6">
        <div class="text-red-600 text-6xl mb-4">🚫</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <router-link
          to="/"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </router-link>
      </div>
    </div>

    <!-- Dashboard content -->
    <div v-else class="max-w-6xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-3xl font-bold text-gray-900">Room Dashboard</h1>
          <div class="text-sm text-gray-500">Room ID: {{ roomId }}</div>
        </div>
        <div class="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
      </div>

      <!-- Room Management Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Room Settings -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Room Settings</h2>

          <form class="space-y-4" @submit.prevent="updateRoom">
            <!-- Room Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
              <input
                v-model="roomForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room name"
              >
            </div>

            <!-- Emojis Configuration -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Reaction Emojis (2-6 required)
              </label>
              <p class="text-xs text-gray-500 mb-2">
                Need emojis? <a href="https://emoji.julien-marcou.fr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">Pick and copy from here</a>
              </p>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="(emoji, index) in roomForm.emojis" :key="index" class="flex items-center gap-2">
                  <input
                    v-model="roomForm.emojis[index]"
                    type="text"
                    maxlength="2"
                    class="w-16 px-2 py-1 border border-gray-300 rounded text-center text-lg"
                    placeholder=""
                  >
                  <button
                    v-if="roomForm.emojis.length > 2"
                    type="button"
                    class="text-red-600 hover:text-red-800 px-2"
                    @click="removeEmoji(index)"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button
                v-if="roomForm.emojis.length < 6"
                type="button"
                class="text-blue-600 hover:text-blue-800 text-sm mt-2"
                @click="addEmoji"
              >
                + Add Emoji
              </button>
            </div>

            <!-- Background Settings -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Input Background (URL or color)
                </label>
                <input
                  v-model="roomForm.backgroundInput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg or #1f2937"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Output Background (URL or color)
                </label>
                <input
                  v-model="roomForm.backgroundOutput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg or transparent"
                >
              </div>
            </div>

            <!-- Tilt Limit Settings -->
            <div class="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Spam Protection
                </label>
                <p class="text-xs text-gray-500 mb-3">
                  Prevent spam by limiting how fast users can send reactions
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    Max Reactions
                  </label>
                  <input
                    v-model.number="roomForm.tiltMaxReactions"
                    type="number"
                    min="1"
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                  <p class="text-xs text-gray-500 mt-1">Reactions before cooldown</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    Cooldown (seconds)
                  </label>
                  <input
                    v-model.number="roomForm.tiltCooldownSeconds"
                    type="number"
                    min="1"
                    max="60"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                  <p class="text-xs text-gray-500 mt-1">Wait time after limit</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="updateLoading"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="updateLoading" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating...
              </span>
              <span v-else>Update Room</span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="updateSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Room updated successfully!
          </div>
        </div>

        <!-- Screen Links -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Screen Links</h2>

          <div class="space-y-6">
            <!-- Input Screen -->
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Audience Reaction Page</h3>
              <p class="text-sm text-gray-600 mb-3">
                Share this link with your audience to let them send reactions
              </p>
              <div class="flex items-center gap-2 mb-2">
                <input
                  :value="inputUrl"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                >
                <button
                  class="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  @click="copyToClipboard(inputUrl, 'input')"
                >
                  {{ copyStatus.input ? '✓' : 'Copy' }}
                </button>
                <button
                  class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  @click="showQrCode(inputUrl, 'input-qr')"
                >
                  QR
                </button>
              </div>
            </div>

            <!-- Output Screen -->
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Display Output Screen</h3>
              <p class="text-sm text-gray-600 mb-3">
                Use this screen for displays, projectors, or as OBS/vMix overlay
              </p>
              <div class="flex items-center gap-2 mb-2">
                <input
                  :value="outputUrl"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                >
                <button
                  class="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  @click="copyToClipboard(outputUrl, 'output')"
                >
                  {{ copyStatus.output ? '✓' : 'Copy' }}
                </button>
                <button
                  class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  @click="showQrCode(outputUrl, 'output-qr')"
                >
                  QR
                </button>
              </div>
            </div>

            <!-- Dashboard Link (Admin Only) -->
            <div class="pt-4 border-t border-gray-200">
              <h3 class="font-medium text-gray-900 mb-2">Dashboard Admin Link</h3>
              <p class="text-sm text-red-600 mb-3">
                ⚠️ Do NOT share this link - it provides full admin access to this room
              </p>
              <div class="flex items-center gap-2 mb-2">
                <input
                  :value="dashboardUrl"
                  readonly
                  class="flex-1 px-3 py-2 border border-red-300 rounded-md bg-red-50 text-sm font-mono"
                >
                <button
                  class="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  @click="copyToClipboard(dashboardUrl, 'dashboard')"
                >
                  {{ copyStatus.dashboard ? '✓' : 'Copy' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Analytics -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Live Analytics (Last 30 Minutes)</h2>
        <p class="text-sm text-gray-600 mb-4">
          Reactions are processed every minute and grouped into 30-second batches for real-time visualization.
        </p>

        <!-- Loading state -->
        <div v-if="analyticsLoading && !chartData" class="flex items-center justify-center h-96">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p class="text-gray-600">Loading analytics...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="analyticsError" class="flex items-center justify-center h-96">
          <div class="text-center">
            <div class="text-red-600 text-3xl mb-2">⚠️</div>
            <p class="text-gray-600">Unable to load analytics</p>
            <p class="text-gray-400 text-sm">{{ analyticsError }}</p>
          </div>
        </div>

        <!-- Chart display -->
        <div v-else>
          <ReactionChart
            :chart-data="chartData"
            :summary-stats="summaryStats"
          />
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <QrCodeModal
      :open="qrModal.open"
      :url="qrModal.url"
      :filename="qrModal.filename"
      @update:open="qrModal.open = $event"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import QrCodeModal from '../components/modals/QrCodeModal.vue'
import ReactionChart from '../components/ReactionChart.vue'
import { useRealtimeAnalytics } from '../composables/useRealtimeAnalytics'

const route = useRoute()
const roomId = route.params.roomId
const signature = route.query.sig

// Reactive state
const loading = ref(true)
const error = ref('')
const room = ref(null)
const updateLoading = ref(false)
const updateSuccess = ref(false)

// Analytics composable
const { chartData, summaryStats, isLoading: analyticsLoading, error: analyticsError } = useRealtimeAnalytics(roomId)

// Form data
const roomForm = reactive({
  name: '',
  emojis: ['❤️', '🔥', '👏'],
  backgroundInput: '',
  backgroundOutput: '',
  tiltMaxReactions: 15,
  tiltCooldownSeconds: 10,
})

// Copy status tracking
const copyStatus = reactive({
  input: false,
  output: false,
  dashboard: false,
})

// QR Modal state
const qrModal = reactive({
  open: false,
  url: '',
  filename: '',
})

// Computed URLs
const baseUrl = computed(() => window.location.origin)
const inputUrl = computed(() => `${baseUrl.value}/room/${roomId}/input`)
const outputUrl = computed(() => `${baseUrl.value}/room/${roomId}/output`)
const dashboardUrl = computed(() => `${baseUrl.value}/room/${roomId}?sig=${signature}`)

// API base URL from environment
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://api-vh67faopca-uc.a.run.app'

// Validate signature and load room data
async function validateAndLoadRoom () {
  try {
    // Validate signature
    const validateResponse = await fetch(
      `${API_BASE_URL}/rooms/${roomId}/validate-signature?sig=${signature}`,
    )
    const validateResult = await validateResponse.json()

    if (!validateResult.valid) {
      error.value = 'Invalid dashboard access. Please use the correct dashboard link.'
      return
    }

    // Load room data
    const roomResponse = await fetch(`${API_BASE_URL}/rooms/${roomId}`)
    if (!roomResponse.ok) {
      throw new Error('Room not found')
    }

    const roomData = await roomResponse.json()
    room.value = roomData

    // Populate form
    roomForm.name = roomData.name || ''
    roomForm.emojis = roomData.settings?.emojis?.map((e) => e.emoji) || ['❤️', '🔥', '👏']
    roomForm.backgroundInput = roomData.settings?.backgroundInput || ''
    roomForm.backgroundOutput = roomData.settings?.backgroundOutput || ''
    roomForm.tiltMaxReactions = roomData.settings?.tiltLimit?.maxReactions || 15
    roomForm.tiltCooldownSeconds = roomData.settings?.tiltLimit?.cooldownSeconds || 10
  } catch (err) {
    error.value = 'Unable to load room data. Please check your connection and try again.'
    console.error('Dashboard load error:', err)
  } finally {
    loading.value = false
  }
}

// Update room settings
async function updateRoom () {
  updateLoading.value = true
  updateSuccess.value = false

  try {
    const updateData = {
      name: roomForm.name,
      settings: {
        emojis: roomForm.emojis.filter((e) => e.trim()).map((emoji) => ({ emoji })),
        backgroundInput: roomForm.backgroundInput || undefined,
        backgroundOutput: roomForm.backgroundOutput || undefined,
        tiltLimit: {
          maxReactions: roomForm.tiltMaxReactions,
          cooldownSeconds: roomForm.tiltCooldownSeconds,
        },
      },
    }

    const response = await fetch(
      `${API_BASE_URL}/rooms/${roomId}?sig=${signature}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Update failed')
    }

    updateSuccess.value = true
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  } catch (err) {
    alert(`Update failed: ${err.message}`)
  } finally {
    updateLoading.value = false
  }
}

// Emoji management
function addEmoji () {
  if (roomForm.emojis.length < 6) {
    roomForm.emojis.push('')
  }
}

function removeEmoji (index) {
  if (roomForm.emojis.length > 2) {
    roomForm.emojis.splice(index, 1)
  }
}

// Copy to clipboard
async function copyToClipboard (text, type) {
  try {
    await navigator.clipboard.writeText(text)
    copyStatus[type] = true
    setTimeout(() => {
      copyStatus[type] = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

// Show QR code modal
function showQrCode (url, filename) {
  qrModal.url = url
  qrModal.filename = filename
  qrModal.open = true
}

// Initialize dashboard
onMounted(() => {
  if (!signature) {
    error.value = 'Dashboard access requires a valid signature.'
    loading.value = false
    return
  }
  validateAndLoadRoom()
})
</script>
