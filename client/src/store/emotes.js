import { defineStore } from 'pinia'

export const HEART = 'heart'
export const UP = 'up'
export const PARTY = 'party'
export const LOL = 'lol'
export const SHOCK = 'shock'
export const POOP = 'poop'
export const OHH = 'ohh'
export const CLAP = 'clap'

export const emoteKeys = { HEART, UP, PARTY, LOL, OHH, CLAP }

export const keyEmojiMap = {
  [HEART]: '❤️',
  [UP]: '👍',
  [PARTY]: '🎉',
  [LOL]: '😂',
  [OHH]: '😮',
  [CLAP]: '👏',
}

export const useEmotes = defineStore('emotes', {
  state: () => ({
    emotes: {},
    stats: {},
    increment: 1,
    duration: 5000,
  }),
  getters: {
    all: (state) => Object.values(state.emotes),
  },
  actions: {
    _add (key) {
      const id = this.increment++
      const emote = createEmote(id, key)
      this.emotes[id] = emote
      setTimeout(() => this.remove(id), this.duration)
      this.stats[key] = this.stats[key] + 1 || 1
    },
    add (key) {
      this._add(key)
    },
    remove (id) {
      delete this.emotes[id]
    },
    subscriber (key) {
      setTimeout(() => this._add(key), Math.random() * 600)
    },
  },
})

function createEmote (id, key) {
  return {
    id,
    key,
    x: (Math.random() * 90) + 5,
    created: new Date(),
  }
}
