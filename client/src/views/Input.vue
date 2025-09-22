<template>
  <div
    class="min-h-screen bg-gray-900 flex flex-col touch-manipulation select-none relative"
    :style="backgroundStyle"
  >
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p class="text-gray-600">Loading room...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center px-4">
        <h2 class="text-xl font-bold text-red-600 mb-2">Room not found</h2>
        <p class="text-gray-600 mb-4">The room "{{ roomId }}" does not exist.</p>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors" @click="$router.push('/')">
          Go to Home
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header with Room Title -->
      <header class="py-6 px-4 text-center">
        <h1 class="text-2xl font-bold text-white">{{ roomData?.name || 'Audience Reactions' }}</h1>
      </header>

      <!-- Cooldown Notice - Fixed positioned to avoid layout shift -->
      <div
        v-if="cooldownRemaining > 0"
        class="fixed top-20 left-4 right-4 z-30 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg shadow-lg"
      >
        <div class="p-4">
          <div class="flex items-center mb-2">
            <FaIcon icon="clock" class="text-yellow-500 mr-2" />
            <p class="text-yellow-700 flex-1">
              Please wait {{ Math.ceil(cooldownRemaining / 1000) }} seconds before sending more reactions
            </p>
          </div>
          <!-- Progress bar -->
          <div class="w-full bg-yellow-200 rounded-full h-2">
            <div
              class="bg-yellow-500 h-2 rounded-full transition-all duration-100 ease-linear"
              :style="{ width: `${cooldownProgress}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Emoji Buttons -->
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="w-full max-w-md">
          <div v-if="roomData?.settings?.emojis?.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <button
              v-for="emojiConfig in roomData.settings.emojis"
              :key="emojiConfig.emoji"
              :class="[
                'relative h-24 text-4xl bg-white rounded-xl shadow-md transition-colors',
                'touch-manipulation hover:scale-105',
                'flex items-center justify-center',
                getButtonState(emojiConfig.emoji).class
              ]"
              :disabled="cooldownRemaining > 0"
              @click="submitReaction(emojiConfig.emoji)"
            >
              <!-- Loading indicator -->
              <div
                v-if="getButtonState(emojiConfig.emoji).loading"
                class="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center"
              >
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
              </div>

              <!-- Success indicator -->
              <div
                v-if="getButtonState(emojiConfig.emoji).success"
                class="absolute inset-0 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center"
              >
                <div class="text-green-600 text-2xl">✓</div>
              </div>

              <div class="text-center">
                <div class="text-4xl mb-1">{{ emojiConfig.emoji }}</div>
                <div v-if="emojiConfig.label" class="text-xs text-gray-600 leading-tight">
                  {{ emojiConfig.label }}
                </div>
              </div>
            </button>
          </div>

          <!-- No emojis fallback -->
          <div v-else class="text-center text-gray-500">
            <p>No emojis configured for this room</p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="py-4 px-4 flex justify-center">
        <a
          href="https://stagetimer.io"
          target="_blank"
          rel="noopener"
          class="bg-white rounded-lg px-4 py-2 flex items-center space-x-2 text-gray-600 text-sm"
        >
          <span>Made by</span>
          <img src="/stagetimer-logomark.svg" alt="Stagetimer" class="w-5 h-5">
          <span>stagetimer.io</span>
        </a>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSpamProtection } from '../composables/useSpamProtection'
import { useRoomApi } from '../composables/useRoomApi'

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
})

const { fetchRoom, submitReaction: apiSubmitReaction } = useRoomApi()
const {
  canSubmit,
  cooldownRemaining,
  cooldownProgress,
  recordClick,
  getButtonState,
  setButtonLoading,
  setButtonSuccess,
  clearButtonState,
} = useSpamProtection(props.roomId)

const loading = ref(true)
const error = ref(false)
const roomData = ref(null)

// Computed property for background image style
const backgroundStyle = computed(() => {
  if (roomData.value?.settings?.backgroundImage) {
    return {
      backgroundImage: `url(${roomData.value.settings.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {}
})

onMounted(async () => {
  try {
    roomData.value = await fetchRoom(props.roomId)
    loading.value = false
  } catch (err) {
    console.error('Failed to fetch room:', err)
    error.value = true
    loading.value = false
  }
})

async function submitReaction (emoji) {
  // Only check cooldown, allow multiple API calls in progress
  if (!canSubmit.value) {
    return
  }

  // Set button to loading state immediately
  setButtonLoading(emoji)

  // Record the click for spam protection
  recordClick()

  try {
    await apiSubmitReaction(props.roomId, emoji)

    // Show success state
    setButtonSuccess(emoji)

    // Clear state after success animation
    setTimeout(() => {
      clearButtonState(emoji)
    }, 1000)
  } catch (err) {
    console.error('Failed to submit reaction:', err)
    // Clear loading state on error
    clearButtonState(emoji)
  }
}
</script>
