<template>
  <Modal
    :open="props.open"
    title="Download QR Code"
    modal-class="max-w-prose"
    body-class="prose"
    closable
    hide-footer
    @update:open="emit('update:open', $event)"
  >
    <div class="max-w-[260px] mx-auto">
      <QrcodeVue
        ref="qrcanvas"
        class="!w-full !h-auto rounded"
        :value="props.url"
        :size="600"
        :margin="3"
        render-as="canvas"
        level="L"
        :style="{ width: '100%', height: '100%' }"
      />
    </div>

    <div class="text-center">
      <button class="rounded border hover:bg-gray-200 h-9 w-2/5" @click="download">
        <FaIcon :icon="faDownload" /> Download
      </button>
    </div>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'
import QrcodeVue from 'qrcode.vue'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'

const qrcanvas = ref()
const emit = defineEmits(['update:open'])
const props = defineProps({
  open: Boolean,
  url: { type: String, default: '' },
  filename: { type: String, default: 'audience-reacts-qr-code' },
})

function download () {
  const canvas = qrcanvas.value.$el
  const link = document.createElement('a')
  link.download = `${props.filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>
