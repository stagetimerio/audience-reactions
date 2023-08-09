import { defineStore } from 'pinia'

export const useMetrics = defineStore('metrics', {
  state: () => ({
    subscribers: 0,
  }),
  actions: {
    set (payload) {
      this.subscribers = payload?.subscribers || 0
    },
  },
})
