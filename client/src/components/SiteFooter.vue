<template>
  <div class="flex items-center gap-2 text-sm px-4">
    <div class="rounded bg-black/30 text-white font-semibold shadow-lg px-3 h-7 leading-7 whitespace-nowrap">
      <FaIcon :icon="faUser" />
      <span class="ml-2">{{ props.userCount }}</span>
    </div>
    <button
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="emit('update:show-buttons', !props.showButtons)"
    >
      <FaIcon :icon="props.showButtons ? faEyeSlash : faEye" />
      <span class="hidden md:inline ml-2">
        {{ props.showButtons ? 'Hide' : 'Show' }} Buttons
      </span>
    </button>
    <button
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="changeBackground"
    >
      <FaIcon :icon="faRotate" />
      <span class="hidden md:inline ml-2">
        Background: {{ bgName }}
      </span>
    </button>
    <button
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="shareLink = !shareLink"
    >
      <FaIcon :icon="faLink" />
      <span class="hidden md:inline ml-2">
        Share Link
      </span>
    </button>
    <span class="flex-grow" />
    <a
      class="rounded bg-black/30 hover:bg-black/60 text-white shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      href="https://stagetimer.io"
      target="_blank"
      rel="noopener"
    >
      <span class="hidden lg:inline ml-2">A project</span>
      by <img class="inline h-6" src="/stagetimer-logo-light.svg" alt="stagetimer logo">
    </a>
    <transition name="fade">
      <div
        v-if="shareLink"
        class="absolute left-1/2 bottom-12 max-w-[600px] w-10/12 bg-black/30 rounded shadow-lg p-2 -translate-x-1/2"
      >
        <div class="flex gap-2 font-semibold text-white">
          <input
            class="rounded bg-white text-black px-2 py-px flex-grow"
            type="text"
            :value="link"
            readonly
            @click="$event.target.select()"
          >
          <button
            class="rounded bg-white text-black px-2 py-px"
            @click="copyLink"
          >
            {{ justCopied ? '✅ Copied' : 'Copy' }}
          </button>
          <button
            class="rounded bg-white text-black px-2 py-px"
            @click="shareLink = false"
          >
            ×
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { faUser, faEye, faEyeSlash, faRotate, faLink } from '@fortawesome/free-solid-svg-icons'
import backgrounds from '../utils/backgrounds.js'
import copy from 'copy-to-clipboard'
import { ref, computed } from 'vue'

const emit = defineEmits([
  'update:background',
  'update:show-buttons',
])

const props = defineProps({
  userCount: { type: Number, default: 0 },
  background: { type: String, default: backgrounds.OCEANIC },
  showButtons: Boolean,
})

const bgName = computed(() => {
  const key = backgrounds.valueToKey(props.background)
  return key[0] + key.toLowerCase().slice(1)
})

function changeBackground () {
  const i = backgrounds.values.findIndex(val => val === props.background)
  emit('update:background', backgrounds.values[i + 1] || backgrounds.values[0])
}

const shareLink = ref(false)
const link = computed(() => window.location.href)
const justCopied = ref(false)
function copyLink () {
  copy(link.value)
  justCopied.value = true
  setTimeout(() => justCopied.value = false, 3000)
}
</script>
