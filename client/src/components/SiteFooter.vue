<template>
  <div class="flex items-center gap-2 text-sm px-4">
    <div
      v-if="!hideUi"
      title="Participants"
      class="rounded bg-black/30 text-white font-semibold shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
    >
      <FaIcon :icon="faUser" />
      <span class="ml-2">{{ props.userCount }}</span>
    </div>
    <button
      v-if="!hideUi"
      title="Hide Buttons"
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
      title="Change Background"
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
      title="Shareable Link"
      class="rounded shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      :class="{
        'bg-white text-black': modalOpen.shareLink,
        'bg-black/30 hover:bg-white text-white hover:text-black': !modalOpen.shareLink,
      }"
      @click="openShareLink"
    >
      <FaIcon :icon="faLink" fixed-width />
      <span class="hidden md:inline ml-1">
        Shareable Link
      </span>
    </button>
    <button
      v-if="!hideUi"
      title="Help"
      class="rounded bg-black/30 hover:bg-white text-white hover:text-black shadow-lg w-7 h-7 leading-7"
      @click="modalOpen.help = !modalOpen.help"
    >
      <FaIcon :icon="faQuestion" fixed-width />
    </button>
    <span class="flex-grow" />
    <a
      title="A project by Stagetimer"
      class="flex items-center gap-1 rounded bg-black/30 hover:bg-black/60 text-white shadow-lg px-3 h-7 leading-7 whitespace-nowrap"
      href="https://stagetimer.io"
      target="_blank"
      rel="noopener"
    >
      <span class="hidden lg:inline">A project by</span>
      <img class="inline h-6" src="/stagetimer-logomark-white.svg" alt="stagetimer logo">
      <strong class="hidden sm:inline">stagetimer.io</strong>
    </a>
    <transition name="fade">
      <div
        v-if="modalOpen.shareLink"
        class="absolute left-1/2 bottom-12 max-w-[800px] w-10/12 bg-black/30 rounded shadow-lg p-2 -translate-x-1/2"
      >
        <div class="flex gap-2 font-semibold text-white">
          <input
            class="rounded bg-white text-black px-2 h-8 flex-grow"
            type="text"
            :value="link"
            readonly
            @click="$event.target.select()"
          >
          <button
            class="rounded bg-white text-black px-2 h-8"
            @click="copyLink"
          >
            {{ justCopied ? '✅ Copied' : 'Copy' }}
          </button>
          <button
            class="rounded bg-white text-black w-8 h-8"
            @click="modalOpen.qrCode = !modalOpen.qrCode"
          >
            <FaIcon :icon="faQrcode" fixed-width />
          </button>
          <button
            class="rounded bg-white text-black w-8 h-8"
            @click="modalOpen.shareLink = false"
          >
            <FaIcon :icon="faTimes" fixed-width />
          </button>
        </div>
      </div>
    </transition>
    <QrCodeModal
      v-model:open="modalOpen.qrCode"
      :url="link"
    />
    <HelpModal
      v-model:open="modalOpen.help"
    />
  </div>
</template>

<script setup>
import HelpModal from './modals/HelpModal.vue'
import QrCodeModal from './modals/QrCodeModal.vue'
import { faUser, faEye, faEyeSlash, faLink, faQuestion, faQrcode, faTimes } from '@fortawesome/free-solid-svg-icons'
import backgrounds from '../utils/backgrounds.js'
import copy from 'copy-to-clipboard'
import { ref, reactive } from 'vue'

const modalOpen = reactive({
  shareLink: false,
  qrCode: false,
  help: false,
})

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


const link = ref(window.location.href)
function openShareLink () {
  link.value = window.location.href
  modalOpen.shareLink = !modalOpen.shareLink
}

const justCopied = ref(false)
function copyLink () {
  copy(link.value)
  justCopied.value = true
  setTimeout(() => justCopied.value = false, 3000)
}
</script>
