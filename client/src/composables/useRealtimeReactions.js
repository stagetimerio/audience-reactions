import { ref, onUnmounted } from 'vue'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../services/firebase.js'

export function useRealtimeReactions (roomId) {
  const reactions = ref([])
  const loading = ref(true)
  const error = ref(null)
  const connected = ref(false)

  let unsubscribe = null
  let reactionCounter = 0
  const MAX_IN_FLIGHT = 50 // Performance limit
  const FLIGHT_MS = 2500 // The EmojiWall rise takes 2 s
  const MAX_AGE_MS = 5000
  const SPREAD_MS = 40 // A burst launches one emoji per 40 ms on average
  const MAX_SPREAD_MS = 2000
  let newest = null

  // Create emoji objects for the EmojiWall component
  function createReactionEmote (reactionDoc) {
    const data = reactionDoc.data()
    return {
      id: `reaction-${reactionCounter++}`,
      key: data.emoji, // Use emoji directly as key for EmojiWall
      emoji: data.emoji,
      x: (Math.random() * 90) + 5, // Random horizontal position
      timestamp: data.timestamp,
      created: new Date(),
    }
  }

  // A full screen drops new emojis. Removing one in flight makes it vanish mid-air.
  function launch (reactionDoc) {
    if (reactions.value.length >= MAX_IN_FLIGHT) return
    const emote = createReactionEmote(reactionDoc)
    reactions.value.push(emote)
    setTimeout(() => {
      reactions.value = reactions.value.filter((reaction) => reaction.id !== emote.id)
    }, FLIGHT_MS)
  }

  // Start listening to reactions
  function startListening () {
    if (!roomId) return

    try {
      const reactionsRef = collection(db, 'rooms', roomId, 'reactions')
      const q = query(reactionsRef, orderBy('timestamp', 'desc'), limit(100))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          loading.value = false
          connected.value = true
          error.value = null

          const added = snapshot.docChanges().filter((change) => change.type === 'added')
          const times = added.map((change) => change.doc.data().timestamp?.toMillis?.() ?? 0)

          // Server timestamps only: the output machine's clock can be off by seconds
          if (newest === null) {
            if (!snapshot.metadata.fromCache) newest = Math.max(0, ...times)
            return
          }
          newest = Math.max(newest, ...times)

          const fresh = added.filter((_, i) => times[i] >= newest - MAX_AGE_MS)
          const spread = Math.max(120, Math.min(fresh.length * SPREAD_MS, MAX_SPREAD_MS))
          fresh.forEach((change) => setTimeout(() => launch(change.doc), Math.random() * spread))
        },
        (err) => {
          console.error('Reactions subscription error:', err)
          loading.value = false
          connected.value = false
          error.value = err.message
        },
      )
    } catch (err) {
      console.error('Failed to start reactions listener:', err)
      loading.value = false
      error.value = err.message
    }
  }

  // Clean up subscription
  function stopListening () {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stopListening()
  })

  // Start listening immediately
  startListening()

  return {
    reactions,
    loading,
    error,
    connected,
    startListening,
    stopListening,
  }
}
