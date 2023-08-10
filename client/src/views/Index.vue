<template>
  <div
    class="fixed size-fix"
    :class="background"
  >
    <SiteHeader
      class="absolute z-20 left-0 top-0 right-0 h-20"
      :hide-buttons="hideButtons"
    />
    <div class="absolute z-10 inset-0">
      <EmojiWall
        class="absolute z-0 inset-0"
        :emotes="emotes.all"
      />
      <transition
        name="fade"
        class="absolute z-20 inset-x-8 inset-y-20 md:inset-1/4"
      >
        <EmojiButtons
          v-if="!hideButtons"
          @trigger-emote="key => emotes.add(key)"
        />
      </transition>
    </div>
    <SiteFooter
      v-model:hide-buttons="hideButtons"
      v-model:background="background"
      :user-count="metrics.subscribers"
      class="absolute z-20 left-0 bottom-0 right-0 h-12"
    />
  </div>
</template>

<script setup>
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import EmojiWall from '../components/EmojiWall.vue'
import EmojiButtons from '../components/EmojiButtons.vue'
import { useEmotes } from '../store/emotes.js'
import { useMetrics } from '../store/metrics.js'
import { params } from '../utils/browserAddressParams.js'
import { ref, watch } from 'vue'

const emotes = useEmotes()
const metrics = useMetrics()

const background = ref(params.background)
const hideButtons = ref(params.hideButtons)

watch(
  () => background.value,
  (val) => params.background = val,
)

watch(
  () => hideButtons.value,
  (val) => params.hideButtons = val,
)
</script>

<style scoped>
.size-fix {
  width: 100vw;
  min-height: 100vh;
  /* mobile viewport bug fix */
  min-height: -webkit-fill-available;
  /* Avoid iPhone double-tap zoom */
  touch-action: manipulation;
}
</style>
