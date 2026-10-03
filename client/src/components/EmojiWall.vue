<template>
  <div class="flex">
    <TransitionGroup :name="fullOpacity ? 'emojifo' : playful ? 'emoji-playful' : 'emoji'">
      <div
        v-for="emote in props.emotes"
        :key="emote.id"
        class="absolute text-5xl sm:text-6xl 2xl:text-8xl opacity-0"
        :class="{ '!opacity-100 -translate-y-full': fullOpacity }"
        :style="{ left: emote.x + '%', '--rotate': playful ? `${tilt(emote.id)}deg` : '0deg' }"
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
  playful: Boolean,
})

/** ±25°, the same for an id on every render. TransitionGroup re-renders all emojis on each new one. */
function tilt (id) {
  let hash = 2166136261
  for (const c of String(id)) hash = Math.imul(hash ^ c.codePointAt(0), 16777619)
  // Sequential ids differ only in the last character. This mix spreads that change to all bits.
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b)
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35)
  hash ^= hash >>> 16
  return ((hash >>> 0) / 4294967296) * 50 - 25
}
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
.emoji-playful-enter-active {
  transition: transform 2s ease-out, opacity 1.2s ease-out 0.8s;
}
.emoji-playful-enter-from {
  transform: translate(-50%, 100vh) rotate(var(--rotate)) scale(0.5);
  opacity: 100;
}
.emoji-playful-enter-to {
  transform: translate(-50%, 0) rotate(var(--rotate)) scale(1);
  opacity: 0;
}
.emojifo-enter-from {
  transform: translate(-50%, 100vh);
}
.emojifo-enter-to {
  transform: translate(-50%, -100%);
}
</style>
