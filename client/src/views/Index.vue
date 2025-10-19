<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Real-time Emoji Reactions for Your Live Events
          </h1>
          <p class="text-xl text-gray-600 mb-2">
            Free. No signup. Built for large audiences.
          </p>
          <p class="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Hey! I built this tool because running live events shouldn't require expensive hardware or complicated setups.
            Your audience already has phones - let's use them!
          </p>
          <button
            :disabled="creating"
            class="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="createRoom"
          >
            <span v-if="!creating">Create Your Room</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          </button>
        </div>

        <!-- Placeholder for audience image -->
        <figure class="mt-12">
          <img
            src="/assets/placeholder-audience.jpg"
            alt="Large audience using phones to send emoji reactions"
            class="rounded-lg shadow-xl max-w-full mx-auto"
          >
          <figcaption class="text-center text-sm text-gray-600 mt-2">
            Thousands of participants can react simultaneously
          </figcaption>
        </figure>
      </div>
    </header>

    <!-- Use Cases Section -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="space-y-24">

          <!-- For Live Events -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">
                Perfect for Live Events
              </h2>
              <p class="text-lg text-gray-700 mb-6">
                Give your speakers real-time feedback. Set up a confidence monitor showing audience reactions.
                No app downloads needed - just share a link or QR code with your audience.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Works on any phone browser</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Handles large audiences</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Zero setup time</span>
                </li>
              </ul>
            </div>
            <div class="order-1 lg:order-2">
              <figure>
                <img
                  src="/assets/stage-monitor.jpg"
                  alt="A monitor in front of a stage showing emoji reactions"
                  class="rounded-lg shadow-lg"
                >
                <figcaption class="text-center text-sm text-gray-600 mt-2">
                  Confidence monitor with live audience reactions
                </figcaption>
              </figure>
            </div>
          </div>

          <!-- For Livestreams -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <figure>
                <img
                  src="/assets/obs-interface.jpg"
                  alt="OBS Studio interface with Audience Reacts overlay"
                  class="rounded-lg shadow-lg"
                >
                <figcaption class="text-center text-sm text-gray-600 mt-2">
                  Seamless integration with streaming software
                </figcaption>
              </figure>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-4">
                Built for Livestreaming
              </h2>
              <p class="text-lg text-gray-700 mb-6">
                Add emoji reactions as an overlay to your stream. Works with OBS, vMix, or any streaming software
                that supports browser sources. Transparent background included.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Transparent overlay mode</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">OBS/vMix integration</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Real-time display</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- For Presentations -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">
                Engage Your Presentations
              </h2>
              <p class="text-lg text-gray-700 mb-6">
                Whether it's Zoom, Teams, or in-person presentations - get instant feedback from your audience.
                Display reactions on a separate screen or overlay them on your video.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Works with any video platform</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Dual-screen support</span>
                </li>
                <li class="flex items-start">
                  <svg class="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700">Live analytics dashboard</span>
                </li>
              </ul>
            </div>
            <div class="order-1 lg:order-2 space-y-4">
              <figure>
                <img
                  src="/assets/zoom-overlay.jpg"
                  alt="Zoom interface with emoji reactions from Audience Reacts"
                  class="rounded-lg shadow-lg"
                >
                <figcaption class="text-center text-sm text-gray-600 mt-2">
                  Perfect for virtual meetings
                </figcaption>
              </figure>
              <figure>
                <img
                  src="/assets/placeholder-presentation.jpg"
                  alt="Presentation screen with emoji reactions displayed"
                  class="rounded-lg shadow-lg"
                >
                <figcaption class="text-center text-sm text-gray-600 mt-2">
                  Enhance in-person presentations
                </figcaption>
              </figure>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 sm:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Create a room</h3>
            <p class="text-gray-600">One click, no signup</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Share the link</h3>
            <p class="text-gray-600">QR code or URL with your audience</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">See reactions</h3>
            <p class="text-gray-600">Display on screens, streams, or presentations</p>
          </div>
        </div>
        <figure class="mt-12">
          <img
            src="/assets/phone-screen.jpg"
            alt="A phone screen displaying Audience Reacts interface with emojis"
            class="rounded-lg shadow-lg max-w-md mx-auto"
          >
          <figcaption class="text-center text-sm text-gray-600 mt-2">
            Simple interface your audience will love
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Feature Highlights -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
          Key Features
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">

          <!-- Real-time Analytics -->
          <div>
            <h3 class="text-xl font-semibold mb-4">Real-time Analytics</h3>
            <p class="text-gray-700 mb-4">
              See what's resonating with your audience
            </p>
            <figure>
              <img
                src="/assets/placeholder-dashboard-analytics.jpg"
                alt="Dashboard showing live analytics with emoji reaction charts"
                class="rounded-lg shadow-lg"
              >
              <figcaption class="text-center text-sm text-gray-600 mt-2">
                Track engagement in real-time
              </figcaption>
            </figure>
          </div>

          <!-- Customizable -->
          <div>
            <h3 class="text-xl font-semibold mb-4">Customizable</h3>
            <p class="text-gray-700 mb-4">
              Choose your emojis, add backgrounds
            </p>
            <figure>
              <img
                src="/assets/placeholder-dashboard-settings.jpg"
                alt="Dashboard settings panel showing emoji and background customization"
                class="rounded-lg shadow-lg"
              >
              <figcaption class="text-center text-sm text-gray-600 mt-2">
                Make it match your brand
              </figcaption>
            </figure>
          </div>

          <!-- Spam Protection -->
          <div>
            <h3 class="text-xl font-semibold mb-4">Spam Protection</h3>
            <p class="text-gray-700">
              Built-in cooldowns prevent abuse. Smart rate limiting ensures genuine reactions while blocking spam attempts.
            </p>
          </div>

          <!-- Large Scale Ready -->
          <div>
            <h3 class="text-xl font-semibold mb-4">Large Scale Ready</h3>
            <p class="text-gray-700">
              Built to handle thousands of participants. Powered by Firebase infrastructure for reliability at any scale.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- Output Display Example -->
    <section class="py-16 sm:py-24 bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white text-center mb-4">
          Display Reactions Anywhere
        </h2>
        <p class="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          The output screen works on any display - projectors, LED walls, confidence monitors, or streaming overlays.
          Transparent background support makes it perfect for professional productions.
        </p>
        <figure>
          <img
            src="/assets/placeholder-output-display.jpg"
            alt="Large display showing emoji reactions falling across the screen"
            class="rounded-lg shadow-2xl mx-auto"
          >
          <figcaption class="text-center text-sm text-gray-400 mt-2">
            Reactions display beautifully on any screen size
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="border-t border-gray-200 pt-8">
          <p class="text-center text-gray-600 mb-4">
            Built by <a href="https://stagetimer.io" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Stagetimer.io</a> - the trusted countdown timer for events
          </p>
          <div class="flex justify-center space-x-6 text-sm">
            <a href="https://stagetimer.io/imprint/" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-700">
              Imprint
            </a>
            <a href="https://stagetimer.io/terms-of-service/" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-700">
              Terms of Service
            </a>
            <a href="https://stagetimer.io/privacy-policy/" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-700">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomApi } from '@/composables/useRoomApi'

const router = useRouter()
const { createRoom: createRoomApi } = useRoomApi()

const creating = ref(false)

const createRoom = async () => {
  creating.value = true

  try {
    const response = await createRoomApi({
      name: 'My Event',
      settings: {
        emojis: [
          { emoji: '❤️' },
          { emoji: '🔥' },
          { emoji: '👏' },
          { emoji: '⭐' },
          { emoji: '👍' },
          { emoji: '😂' },
        ],
      },
    })

    // Extract roomId and signature from the dashboard URL
    // URL format: https://domain/room/{roomId}?sig={signature}
    const url = new URL(response.dashboardUrl, window.location.origin)
    const pathParts = url.pathname.split('/')
    const roomId = pathParts[pathParts.length - 1]
    const signature = url.searchParams.get('sig')

    // Navigate to the dashboard with signature
    router.push({
      name: 'dashboard',
      params: { roomId },
      query: { sig: signature },
    })
  } catch (error) {
    console.error('Failed to create room:', error)
    alert('Failed to create room. Please try again.')
  } finally {
    creating.value = false
  }
}
</script>
