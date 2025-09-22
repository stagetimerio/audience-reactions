<template>
  <!-- VERSION: {{ version }} -->
  <router-view />
</template>

<script setup>
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
</script>
