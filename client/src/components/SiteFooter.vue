<template>
  <div class="flex items-center gap-2 text-sm px-4">
    <div
      v-if="!hideUi"
      class="rounded bg-black/30 text-white font-semibold shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
    >
      <FaIcon :icon="faUser" />
      <span class="ml-2">{{ props.userCount }}</span>
    </div>
    <button
      v-if="!hideUi"
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="emit('update:hide-buttons', !props.hideButtons)"
    >
      <FaIcon :icon="props.hideButtons ? faEye : faEyeSlash" fixed-width />
      <span class="hidden md:inline ml-2">
        {{ props.hideButtons ? 'Show' : 'Hide' }} Buttons
      </span>
    </button>
    <button
      v-if="!hideUi"
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="changeBackground"
    >
      <span class="flex gap-2 items-center">
        <span
          class="inline-block rounded-full border border-current h-4 w-4"
          :class="props.background"
          :style="props.background === backgrounds.TRANSPARENT ? {
            'background-image': 'url(/fake-transparent.svg)',
            'background-size': '6px',
          } : {}"
        />
        <span class="hidden md:inline">
          Background
        </span>
      </span>
    </button>
    <button
      v-if="!hideUi"
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      @click="shareLink = !shareLink"
    >
      <FaIcon :icon="faLink" fixed-width />
      <span class="hidden md:inline ml-1">
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
      <span class="hidden lg:inline mr-2">A project by</span>
      <img class="inline h-5 md:h-6" src="/stagetimer-logo-light.svg" alt="stagetimer logo">
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
import { faUser, faEye, faEyeSlash, faLink } from '@fortawesome/free-solid-svg-icons'
import backgrounds from '../utils/backgrounds.js'
import copy from 'copy-to-clipboard'
import { ref, computed } from 'vue'

const emit = defineEmits([
  'update:background',
  'update:hide-buttons',
])

const props = defineProps({
  userCount: { type: Number, default: 0 },
  background: { type: String, default: backgrounds.OCEANIC },
  hideButtons: Boolean,
  hideUi: Boolean,
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
