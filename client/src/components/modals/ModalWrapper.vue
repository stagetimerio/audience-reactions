<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="open"
        ref="maskRef"
        v-bind="$attrs"
        class="modal-mask fixed z-[100] inset-0 bg-black/60 backdrop-blur !m-0"
        @mousedown="onOutsideClick"
      >
        <div
          class="flex p-8 min-h-screen"
          :class="{
            'items-start': alignV === 'top',
            'items-center': alignV === 'center',
            'items-end': alignV === 'bottom',
            'justify-start': alignH === 'left',
            'justify-center': alignH === 'center',
            'justify-end': alignH === 'bottom',
          }"
        >
          <section
            ref="contentRef"
            class="modal"
            :class="modalClass"
            :data-label="dataLabel"
          >
            <slot />
          </section>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const maskRef = ref()
const contentRef = ref()

const emit = defineEmits(['update:open', 'show', 'hide'])
const props = defineProps({
  open: Boolean,
  closable: Boolean,
  ignoreOutsideClick: Boolean,
  modalClass: { type: [String, Array, Object], default: 'max-w-2xl' },
  alignV: {
    type: String,
    default: 'center',
    validator: (val) => ['top', 'center', 'bottom'].includes(val),
  },
  alignH: {
    type: String,
    default: 'center',
    validator: (val) => ['left', 'center', 'right'].includes(val),
  },
  dataLabel: { type: String, default: undefined },
})

watch(
  () => props.open,
  (newVal) => emit(newVal ? 'show' : 'hide'),
)

function onOutsideClick (event) {
  if (contentRef.value?.contains(event.target)) return
  if (props.closable && !props.ignoreOutsideClick) {
    emit('update:open', false)
  }
}

// Intentional tight coupling: callable from parent
// eslint-disable-next-line no-unused-vars
function scrollToBottom () {
  const el = maskRef.value
  if (el) el.scrollTop = el.scrollHeight - el.clientHeight
}
</script>

<style scoped>
.modal-mask {
  @apply overflow-auto;
  transition: opacity 0.3s ease;
  z-index: 101;
}
.modal {
  @apply w-full;
  transition: transform 0.3s ease;
}
.modal-enter-from.modal-mask,
.modal-leave-to.modal-mask{
  @apply opacity-0;
}
.modal-enter-from .modal,
.modal-leave-to .modal{
  /* Note: deactivated because Safari has a visual glitch with transforms when content overflows */
  transform: scale(0.96);
}
</style>
