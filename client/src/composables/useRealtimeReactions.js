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
  const maxReactions = 50 // Performance limit

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

  // Remove oldest reactions when limit is exceeded
  function maintainReactionLimit () {
    if (reactions.value.length > maxReactions) {
      const excess = reactions.value.length - maxReactions
      reactions.value.splice(0, excess)
    }
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

          const now = Date.now()

          // Process new reactions (only additions, not full reset)
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data()
              const reactionTime = data.timestamp?.toDate?.()?.getTime() || data.timestamp?.getTime() || 0

              // Ignore reactions older than 5 seconds
              if (now - reactionTime > 5000) {
                console.log('[reactions] Ignoring old reaction:', now - reactionTime, 'ms old')
                return
              }

              // Add random delay (0-120ms) for natural timing
              const delay = Math.random() * 120
              setTimeout(() => {
                const emote = createReactionEmote(change.doc)
                reactions.value.push(emote)
                maintainReactionLimit()
              }, delay)
            }
          })
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
