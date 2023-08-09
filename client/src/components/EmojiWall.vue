<template>
  <div class="flex">
    <TransitionGroup name="emoji">
      <div
        v-for="emote in emotes"
        :key="emote.id"
        class="absolute text-5xl sm:text-6xl 2xl:text-9xl opacity-0"
        :style="{ left: emote.x + '%' }"
      >
        {{ keyEmojiMap[emote.key] }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { keyEmojiMap } from '../store/emotes.js'

defineProps({
  emotes: { type: Array, default: () => [] },
})
</script>

<style scoped>
.emoji-enter-active {
  transition: transform 2s ease-out, opacity 1.2s ease-out 0.8s;
}
.emoji-enter-from {
  transform: translate(-50%, 100vh);
  opacity: 100;
}
.emoji-enter-to {
  transform: translate(-50%, 0);
  opacity: 0;
}
</style>
