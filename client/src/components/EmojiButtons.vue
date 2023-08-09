<template>
  <div class="flex flex-col">
    <div
      class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      <button
        v-for="key in Object.values(emoteKeys)"
        :key="key"
        class="rounded-lg bg-black/30 hover:bg-white shadow-lg text-5xl"
        @click="emit('trigger-emote', key)"
      >
        {{ keyEmojiMap[key] }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { emoteKeys, keyEmojiMap } from '../store/emotes.js'

const emit =  defineEmits(['trigger-emote'])
</script>
