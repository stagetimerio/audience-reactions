<template>
  <div class="flex flex-col gap-3">
    <div
      class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      <button
        v-for="key in Object.values(emoteKeys)"
        :key="key"
        class="rounded-lg bg-black/30 hover:bg-white shadow-lg text-5xl"
        @click="emit('trigger-emote', key)"
      >
        {{ keyEmojiMap[key] }}
      </button>
    </div>
    <div>
      <a
        class="block mx-auto"
        style="width: 200px;"
        href="https://www.producthunt.com/posts/audience-reacts?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-audience&#0045;reacts"
        target="_blank"
        rel="noopener"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=409696&theme=light"
          alt="Audience&#0032;Reacts - Feel&#0032;the&#0032;room&#0044;&#0032;one&#0032;emoji&#0032;at&#0032;a&#0032;time | Product Hunt"
          width="250"
          height="54"
        >
      </a>
    </div>
  </div>
</template>

<script setup>
import { emoteKeys, keyEmojiMap } from '../store/emotes.js'

const emit =  defineEmits(['trigger-emote'])
</script>
