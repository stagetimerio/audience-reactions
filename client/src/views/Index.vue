<template>
  <div
    class="fixed size-fix"
    :class="background"
  >
    <SiteHeader class="absolute z-20 left-0 top-0 right-0 h-20" />
    <div class="absolute z-10 inset-0">
      <EmojiWall
        class="absolute z-0 inset-0"
        :emotes="emotes.all"
      />
      <EmojiButtons
        v-if="showButtons"
        class="absolute z-20 inset-x-8 inset-y-20 md:inset-1/4"
        @trigger-emote="key => emotes.add(key)"
      />
    </div>
    <SiteFooter
      v-model:show-buttons="showButtons"
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
import backgrounds from '../utils/backgrounds.js'
import { getParam, setParam } from '../utils/browserAddressParams.js'
import { ref, watch } from 'vue'

const getBg = () => backgrounds.keyToValue(getParam('background')) || backgrounds.OCEANIC
const setBg = (val) => setParam('background', backgrounds.valueToKey(val))

const emotes = useEmotes()
const metrics = useMetrics()

const background = ref(getBg())
const showButtons = ref(true)

watch(
  () => background.value,
  (newBg) => setBg(newBg),
)
</script>

<style scoped>
.size-fix {
  width: 100vw;
  min-height: 100vh;
  /* mobile viewport bug fix */
  min-height: -webkit-fill-available;
}
</style>
