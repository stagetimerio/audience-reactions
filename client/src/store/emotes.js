import { defineStore } from 'pinia'
import { publish } from '../services/SocketService.js'

export const HEART = 'heart'
export const UP = 'up'
export const PARTY = 'party'
export const LOL = 'lol'
export const SHOCK = 'shock'
export const POOP = 'poop'

export const emoteKeys = { HEART, UP, PARTY, LOL, SHOCK, POOP }

export const keyEmojiMap = {
  [HEART]: '❤️',
  [UP]: '👍',
  [PARTY]: '🎉',
  [LOL]: '😂',
  [SHOCK]: '😱',
  [POOP]: '💩',
}

export const useEmotes = defineStore('emotes', {
  state: () => ({
    emotes: {},
    increment: 1,
    duration: 5000,
  }),
  getters: {
    all: state => Object.values(state.emotes),
  },
  actions: {
    _add (key) {
      const id = this.increment++
      const emote = createEmote(id, key)
      this.emotes[id] = emote
      setTimeout(() => this.remove(id), this.duration)
    },
    add (key) {
      publish(key)
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
