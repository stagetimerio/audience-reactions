<template>
  <!-- VERSION: {{ version }} -->
  <Index />
</template>

<script setup>
import Index from './views/Index.vue'
import { init, deinit } from './services/SocketService.js'
import { useEmotes } from './store/emotes.js'
import { useMetrics } from './store/metrics.js'
import createRandomId from './utils/createRandomId.js'
import { onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'
import { name, version, description } from '../../package.json'

const href = window.location.origin + window.location.pathname

useHead ({
  meta: [
    { name: 'version', content: version },
    { name: 'description', content: description },
    { name: 'twitter:title', content: name },
    { name: 'twitter:description', content: description },
    { property: 'og:url', content: href },
    { property: 'og:title', content: name },
    { property: 'og:description', content: description },
  ],
  link: { rel: 'canonical', href: href },
})

const emotes = useEmotes()
const metrics = useMetrics()

onMounted(() => initSocket())

async function initSocket () {
  let namespace = createRandomId()
  const url = new URL(window.location)
  if (url.searchParams.get('space')) {
    namespace = url.searchParams.get('space')
  } else {
    url.searchParams.set('space', namespace)
    window.history.replaceState(null, null, url)
  }
  await init(
    namespace,
    (payload) => emotes.subscriber(payload.data),
    (payload) => metrics.set(payload),
  )
}

onBeforeUnmount(() => deinitSocket())

async function deinitSocket () {
  await deinit()
}
</script>
