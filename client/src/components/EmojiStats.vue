<template>
  <div class="flex justify-center gap-2 backdrop-blur">
    <div
      v-for="key in Object.values(emoteKeys)"
      :key="key"
      class="rounded bg-white shadow-lg h-8 leading-8 px-3 space-x-2 whitespace-nowrap tabular-nums"
    >
      <span>{{ keyEmojiMap[key] }}</span>
      <span>{{ props.stats[key] || 0 }}</span>
    </div>
    <button
      class="rounded bg-white text-black w-8 h-8"
      @click="emit('close')"
    >
      <FaIcon :icon="faTimes" fixed-width />
    </button>
  </div>
</template>

<script setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { emoteKeys, keyEmojiMap } from '../store/emotes.js'

const emit = defineEmits(['close'])
const props = defineProps({
  stats: { type: Object, default: () => ({}) },
})
</script>
