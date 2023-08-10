<template>
  <div class="flex justify-center items-center">
    <transition name="fade">
      <div
        v-if="!props.hideButtons"
        class="text-2xl text-white font-semibold"
      >
        ❤️ Audience Reactions
      </div>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  hideButtons: Boolean,
})
</script>
