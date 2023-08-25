<template>
  <div class="flex flex-col gap-3">
    <div
      class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      <button
        v-for="key in Object.values(emoteKeys)"
        :key="key"
        class="rounded-lg shadow-lg text-5xl"
        :class="{
          'bg-black': props.fullOpacity,
          'bg-black/30': !props.fullOpacity,
          'hover:bg-white': !cooldown,
        }"
        :disabled="cooldown"
        @click="onClick(key)"
      >
        {{ keyEmojiMap[key] }}
      </button>
    </div>
    <div
      v-if="cooldown"
      class="absolute z-20 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/30 rounded-lg p-4 backdrop-blur"
    >
      <div class="animate-spin w-8 h-8 leading-8 text-center text-3xl">
        ⏳
      </div>
    </div>
  </div>
</template>

<script setup>
import { emoteKeys, keyEmojiMap } from '../store/emotes.js'
import { ref } from 'vue'

const cooldown = ref(false)
const emit =  defineEmits(['trigger-emote'])
const props = defineProps({
  fullOpacity: Boolean,
})

function onClick (key) {
  emit('trigger-emote', key)
  startCooldown()
}

function startCooldown () {
  cooldown.value = true
  setTimeout(() => (cooldown.value = false), 600)
}
</script>
