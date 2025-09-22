<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center max-w-md mx-auto p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">❤️ Audience Reacts</h1>
      <p class="text-gray-600 mb-8">
        A real-time emoji reaction system for live events.
      </p>

      <div class="space-y-4">
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold mb-3">For Event Organizers</h2>
          <p class="text-gray-600 mb-4">Create rooms and manage audience reactions</p>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
            Create Dashboard
          </button>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold mb-3">For Audience</h2>
          <p class="text-gray-600 mb-4">Scan QR code or enter room ID to participate</p>
          <button class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
            Join Room
          </button>
        </div>
      </div>

      <footer class="mt-12 text-sm text-gray-500">
        Made by <a href="https://stagetimer.io" class="text-blue-500 hover:text-blue-600 transition-colors">stagetimer.io</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
// Simplified Index page for now - will be replaced with Dashboard functionality later
</script>

<style scoped>
.size-fix {
  width: 100vw;
  min-height: 100vh;
  /* mobile viewport bug fix */
  min-height: -webkit-fill-available;
  /* Avoid iPhone double-tap zoom */
  touch-action: manipulation;
}
</style>
