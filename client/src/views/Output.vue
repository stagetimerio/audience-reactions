<template>
  <div class="min-h-screen relative overflow-hidden touch-manipulation select-none" :style="backgroundStyle">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
        <p class="text-white">Connecting to room...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="text-center px-4">
        <h2 class="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
        <p class="text-white mb-4">{{ error }}</p>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          @click="$router.push('/')"
        >
          Go to Home
        </button>
      </div>
    </div>

    <!-- Mouse Wiggle Help Overlay -->
    <Transition name="help-fade">
      <div
        v-if="showHelp"
        class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        <div class="bg-white text-sm font-light text-gray-500 rounded-lg p-8 max-w-md text-center shadow-xl">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">🎭 Output Display</h2>
          <p class="mb-4">
            This is the screen to display emoji reactions from your audience.
          </p>
          <p class="mb-6">
            Click on an emoji below to see the animation effect!
          </p>

          <!-- Demo emoji buttons -->
          <div class="flex justify-center gap-4 mb-6">
            <button
              v-for="emoji in ['❤️', '🔥', '👏']"
              :key="emoji"
              class="text-2xl bg-gray-200 hover:bg-gray-300 rounded-lg h-12 w-12 transition-colors"
              @click="triggerDemoReaction(emoji)"
            >
              {{ emoji }}
            </button>
          </div>

          <div class="mb-4">
            Use this screen as overlay in:
          </div>
          <div class="flex justify-center space-x-3">
            <a
              href="https://stagetimer.io/docs/output-links/"
              target="_blank"
              rel="noopener"
              class="underline hover:text-black"
            >
              Stagetimer
            </a>
            <a
              href="https://stagetimer.io/docs/integration-with-obs-studio/"
              target="_blank"
              rel="noopener"
              class="underline hover:text-black"
            >
              vMix
            </a>
            <a
              href="https://stagetimer.io/docs/integration-with-vmix/"
              target="_blank"
              rel="noopener"
              class="underline hover:text-black"
            >
              vMix
            </a>
          </div>

          <button
            class="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            @click="hideHelp"
          >
            Got it!
          </button>
        </div>
      </div>
    </Transition>

    <!-- Emoji Wall -->
    <EmojiWall :emotes="reactions" />

    <!-- Connection Status (subtle indicator) -->
    <div
      v-if="!connected && !loading"
      class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm opacity-80"
    >
      Disconnected
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRealtimeReactions } from '../composables/useRealtimeReactions'
import { useRoomApi } from '../composables/useRoomApi'
import EmojiWall from '../components/EmojiWall.vue'

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
})

// Room data and API
const { fetchRoom } = useRoomApi()
const roomData = ref(null)

// Realtime reactions
const { reactions, loading, error, connected } = useRealtimeReactions(props.roomId)

// Computed property for background style
const backgroundStyle = computed(() => {
  const backgroundOutput = roomData.value?.settings?.backgroundOutput

  if (backgroundOutput) {
    // Check if it's a URL or a color
    if (backgroundOutput.startsWith('http') || backgroundOutput.startsWith('/')) {
      // It's a URL - use as background image
      return {
        backgroundImage: `url(${backgroundOutput})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    } else {
      // It's a color - use as background color
      return {
        backgroundColor: backgroundOutput,
      }
    }
  }

  // Default to transparent
  return {
    backgroundColor: 'transparent',
  }
})

// Mouse wiggle help system
const showHelp = ref(false)
let helpHasBeenShown = false

// Demo reaction counter for help system
let demoCounter = 0

function handleMouseMove () {
  // Only show help once
  if (helpHasBeenShown) return

  showHelp.value = true
  helpHasBeenShown = true

  // Remove the event listener permanently
  document.removeEventListener('mousemove', handleMouseMove)
}

function hideHelp () {
  showHelp.value = false
  // No need to re-enable listener - it's permanently removed
}

function triggerDemoReaction (emoji) {
  // Add a demo reaction to the wall
  const demoReaction = {
    id: `demo-${demoCounter++}`,
    key: emoji,
    emoji: emoji,
    x: (Math.random() * 90) + 5,
    timestamp: new Date(),
    created: new Date(),
  }

  reactions.value.push(demoReaction)

  // Remove demo reaction after animation
  setTimeout(() => {
    const index = reactions.value.findIndex((r) => r.id === demoReaction.id)
    if (index > -1) {
      reactions.value.splice(index, 1)
    }
  }, 3000)
}

// Mouse event listeners and room data fetching
onMounted(async () => {
  document.addEventListener('mousemove', handleMouseMove)

  // Fetch room data for background settings
  try {
    roomData.value = await fetchRoom(props.roomId)
  } catch (err) {
    console.error('Failed to fetch room data:', err)
    // Continue anyway - background will just be transparent
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
.help-fade-enter-active,
.help-fade-leave-active {
  transition: opacity 0.3s ease;
}

.help-fade-enter-from,
.help-fade-leave-to {
  opacity: 0;
}
</style>
