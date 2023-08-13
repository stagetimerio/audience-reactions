<template>
  <ModalWrapper
    :modal-class="['bg-white rounded shadow-lg', props.modalClass]"
    :open="props.open"
    :closable="props.closable && !props.busy"
    :align-v="props.alignV"
    :align-h="props.alignH"
    @show="$emit('show')"
    @hide="$emit('hide')"
    @update:open="$emit('update:open', $event)"
  >
    <header
      v-if="$slots.header || props.closable"
      class="flex items-center justify-between pl-6 pt-4 pr-4"
    >
      <h2 class="text-xl font-semibold">
        {{ props.title }}
      </h2>
      <button
        v-if="props.closable"
        class="btn-beta btn-ghost p-0 w-9 h-9 leading-9"
        :class="{ 'pointer-events-none': props.busy }"
        :disabled="props.busy"
        @click="$emit('update:open', false)"
      >
        <FaIcon :icon="faTimes" fixed-width />
      </button>
    </header>

    <div
      class="p-6"
      :class="props.bodyClass"
    >
      <slot />
    </div>

    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
    <footer
      v-else-if="!props.hideFooter"
      class="flex justify-center gap-3 px-6 pb-4"
    >
      <button
        class="rounded border hover:bg-gray-200 h-9 w-2/5"
        :class="[props.cancelClass, { 'pointer-events-none': props.busy }]"
        :disabled="props.busy"
        data-label="cancel-modal-button"
        @click="$emit('update:open', false)"
      >
        <span>{{ props.cancelLabel }}</span>
      </button>
      <button
        v-if="props.confirmable"
        class="rounded border hover:bg-gray-200 h-9 w-2/5"
        :class="[props.confirmClass, { 'pointer-events-none': props.busy }]"
        :disabled="props.busy"
        data-label="confirm-modal-button"
        @click="onConfirm"
      >
        <Spinner
          v-if="props.busy"
          size="sm"
          color="teal"
          light
          class="inline-block align-middle mr-2"
        />
        <span>{{ props.confirmLabel }}</span>
      </button>
    </footer>
  </ModalWrapper>
</template>

<script setup>
import ModalWrapper from './ModalWrapper.vue'
import Spinner from '../Spinner.vue'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const emit = defineEmits(['update:open', 'confirm', 'show', 'hide'])
const props = defineProps({
  title: { type: String, default: '' },
  modalClass: { type: [String, Array, Object], default: '' },
  bodyClass: { type: [String, Array, Object], default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  confirmClass: { type: String, default: '' },
  cancelLabel: { type: String, default: 'Cancel' },
  cancelClass: { type: String, default: '' },
  open: Boolean,
  closable: Boolean,
  confirmable: Boolean,
  hideFooter: Boolean,
  busy: Boolean,
  alignV: {
    type: String,
    default: 'center',
    validator: val => ['top', 'center', 'bottom'].includes(val),
  },
  alignH: {
    type: String,
    default: 'center',
    validator: val => ['left', 'center', 'right'].includes(val),
  },
})

function onConfirm () {
  let close = true
  emit('confirm', {
    preventDefault: () => (close = false),
  })
  if (close) emit('update:open', false)
}
</script>
