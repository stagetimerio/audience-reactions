<template>
  <div class="flex">
    <TransitionGroup :name="fullOpacity ? 'emojifo' : 'emoji'">
      <div
        v-for="emote in props.emotes"
        :key="emote.id"
        class="absolute text-5xl sm:text-6xl 2xl:text-8xl opacity-0"
        :class="{ '!opacity-100 -translate-y-full': fullOpacity }"
        :style="{ left: emote.x + '%' }"
      >
        {{ emote.emoji }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const props = defineProps({
  emotes: { type: Array, default: () => [] },
  fullOpacity: Boolean,
})
</script>

<style scoped>
.emoji-enter-active,
.emojifo-enter-active {
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
.emojifo-enter-from {
  transform: translate(-50%, 100vh);
}
.emojifo-enter-to {
  transform: translate(-50%, -100%);
}
</style>
