<template>
  <div
    class="h-svh flex flex-col touch-manipulation select-none relative"
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
        class="fixed top-20 left-0 right-0 px-5"
      >
        <div class="max-w-xl mx-auto z-30 bg-neutral-800 text-neutral-300 shadow-lg rounded-lg p-4">
          <div class="flex items-center justify-center gap-2 mb-2">
            <FaIcon icon="clock" />
            <p>
              Please wait {{ Math.ceil(cooldownRemaining / 1000) }} seconds before sending more reactions
            </p>
          </div>
          <!-- Progress bar -->
          <div class="w-full bg-neutral-200 rounded-full h-2">
            <div
              class="bg-neutral-500 h-2 rounded-full transition-all duration-100 ease-linear"
              :style="{ width: `${cooldownProgress}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Emoji Buttons -->
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="w-full max-w-md">
          <div
            v-if="emojis.length"
            class="grid grid-cols-2 gap-4"
          >
            <button
              v-for="emojiConfig in emojis"
              :key="emojiConfig.emoji"
              :class="[
                'relative h-24 text-4xl bg-white rounded-xl shadow-md transition-colors',
                'touch-manipulation hover:scale-105 select-none',
                'flex items-center justify-center',
                getButtonState(emojiConfig.emoji).class,
                { 'pointer-events-none !touch-none': cooldownRemaining > 0 }
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

              <!-- Click count indicator -->
              <div
                v-if="getButtonState(emojiConfig.emoji).clickCount > 1"
                class="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
              >
                {{ getButtonState(emojiConfig.emoji).clickCount }}
              </div>

              <div class="text-center">
                <div class="text-4xl">{{ emojiConfig.emoji }}</div>
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
const emojis = computed(() => roomData.value?.settings?.emojis || [])

// Computed property for background style
const backgroundStyle = computed(() => {
  const backgroundInput = roomData.value?.settings?.backgroundInput

  if (backgroundInput) {
    // Check if it's a URL or a color
    if (backgroundInput.startsWith('http') || backgroundInput.startsWith('/')) {
      // It's a URL - use as background image
      return {
        backgroundImage: `url(${backgroundInput})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    } else {
      // It's a color - use as background color
      return {
        backgroundColor: backgroundInput,
      }
    }
  }

  // Default to dark gray
  return {
    backgroundColor: '#1f2937', // gray-800
  }
})

onMounted(async () => {
  // Fetch room data
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
