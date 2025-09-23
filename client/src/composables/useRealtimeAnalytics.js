import { ref, onMounted, onUnmounted, computed } from 'vue'
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

const ANALYTICS_TIME_WINDOW_MINUTES = 30 // Easily configurable time window
const ANALYTICS_BATCH_INTERVAL_SECONDS = 20 // Analytics are created every 20 seconds

export function useRealtimeAnalytics (roomId) {
  const analytics = ref([])
  const room = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  let unsubscribe = null
  let updateInterval = null

  // Calculate how many data points we need (30 minutes / 20 seconds = 90 points)
  const maxDataPoints = computed(() => Math.ceil((ANALYTICS_TIME_WINDOW_MINUTES * 60) / ANALYTICS_BATCH_INTERVAL_SECONDS))

  // Fetch room data to get emoji configuration
  const fetchRoomData = async () => {
    try {
      const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://api-vh67faopca-uc.a.run.app'
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`)
      if (response.ok) {
        const roomData = await response.json()
        room.value = roomData
        console.log('[Analytics] Room data loaded:', roomData.settings?.emojis)
      }
    } catch (err) {
      console.error('[Analytics] Failed to fetch room data:', err)
    }
  }

  // Subscribe to analytics collection
  const subscribeToAnalytics = async () => {
    console.log(`[Analytics] Starting subscription for room: ${roomId}`)

    if (!roomId) {
      console.error('[Analytics] No room ID provided')
      error.value = 'No room ID provided'
      isLoading.value = false
      return
    }

    await fetchRoomData()

    try {
      // Calculate the timestamp for X minutes ago
      const minutesAgo = new Date()
      minutesAgo.setMinutes(minutesAgo.getMinutes() - ANALYTICS_TIME_WINDOW_MINUTES)
      const startTimestamp = Timestamp.fromDate(minutesAgo)

      console.log(`[Analytics] Querying analytics from ${minutesAgo.toISOString()} (${ANALYTICS_TIME_WINDOW_MINUTES} minutes ago)`)
      console.log(`[Analytics] Max data points expected: ${maxDataPoints.value}`)

      // Query analytics for the last X minutes
      // Use endTime since it's more likely to exist in existing documents
      const analyticsRef = collection(db, 'rooms', roomId, 'analytics')
      const q = query(
        analyticsRef,
        where('endTime', '>=', startTimestamp),
        orderBy('endTime', 'asc'),
        limit(maxDataPoints.value),
      )

      console.log('[Analytics] Setting up Firestore listener...')

      // Set up real-time listener
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log(`[Analytics] Snapshot received with ${snapshot.size} documents`)

          const newAnalytics = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            console.log(`[Analytics] Document ${doc.id}:`, {
              endTime: data.endTime?.toDate(),
              counts: data.counts,
              total: data.total,
            })

            // Calculate startTime as 20 seconds before endTime (batch interval)
            const endTime = data.endTime?.toDate() || new Date()
            const startTime = new Date(endTime.getTime() - (ANALYTICS_BATCH_INTERVAL_SECONDS * 1000))

            newAnalytics.push({
              id: doc.id,
              startTime: startTime,
              endTime: endTime,
              counts: data.counts || {},
              total: data.total || 0,
            })
          })

          // Sort by endTime to ensure correct order
          newAnalytics.sort((a, b) => a.endTime - b.endTime)

          console.log(`[Analytics] Processed ${newAnalytics.length} analytics batches`)
          analytics.value = newAnalytics
          isLoading.value = false
          error.value = null
        },
        (err) => {
          console.error('[Analytics] Subscription error:', err)
          error.value = err.message
          isLoading.value = false
        },
      )
    } catch (err) {
      console.error('[Analytics] Failed to subscribe:', err)
      error.value = err.message
      isLoading.value = false
    }
  }

  // Force chart update trigger
  const chartUpdateTrigger = ref(0)

  // Computed property to get chart data in the format Chart.js expects
  const chartData = computed(() => {
    // Include the trigger to force updates
    // eslint-disable-next-line
    chartUpdateTrigger.value

    console.log(`[Analytics] Computing chart data with ${analytics.value.length} analytics batches`)

    // Create full timeframe with 30-second intervals
    const now = new Date()
    const fullTimeframe = []
    const labels = []

    // Generate all expected time slots for the last 30 minutes
    // Round current time to nearest 20-second boundary for consistent alignment
    const currentSeconds = now.getSeconds()
    const alignedNow = new Date(now.getTime() - ((currentSeconds % 20) * 1000))

    for (let i = maxDataPoints.value - 1; i >= 0; i--) {
      const slotEndTime = new Date(alignedNow.getTime() - (i * ANALYTICS_BATCH_INTERVAL_SECONDS * 1000))
      const slotStartTime = new Date(slotEndTime.getTime() - (ANALYTICS_BATCH_INTERVAL_SECONDS * 1000))

      labels.push(slotStartTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }))

      fullTimeframe.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        counts: {},
        total: 0,
      })
    }

    // Get room emojis for color assignment and filtering
    const roomEmojis = room.value?.settings?.emojis?.map((e) => e.emoji) || []
    console.log('[Analytics] Room emojis:', roomEmojis)

    // Color palette - pre-define one color per room emoji
    const colors = [
      '#eb4e4a', // Red
      '#51A3E6', // Blue
      '#ECCE56', // Yellow
      '#7FC3B2', // Teal
      '#B47BC6', // Purple
      '#F4935B', // Orange
      '#72C785', // Green
      '#E91E63', // Pink
    ]

    // Create emoji-to-color mapping based on room configuration
    const emojiColorMap = new Map()
    roomEmojis.forEach((emoji, index) => {
      emojiColorMap.set(emoji, colors[index % colors.length])
    })

    // Merge actual analytics data into the full timeframe with fuzzy matching
    analytics.value.forEach((batch) => {
      // Find the closest time slot (within 15 seconds tolerance)
      let bestMatchIndex = -1
      let bestMatchDiff = Infinity

      fullTimeframe.forEach((slot, index) => {
        const timeDiff = Math.abs(slot.endTime.getTime() - batch.endTime.getTime())
        if (timeDiff < bestMatchDiff && timeDiff <= 10000) { // 10 second tolerance
          bestMatchDiff = timeDiff
          bestMatchIndex = index
        }
      })

      if (bestMatchIndex >= 0) {
        // Filter out emojis not in room settings
        const filteredCounts = {}
        Object.entries(batch.counts).forEach(([emoji, count]) => {
          if (roomEmojis.includes(emoji)) {
            filteredCounts[emoji] = count
          }
        })

        fullTimeframe[bestMatchIndex].counts = filteredCounts
        fullTimeframe[bestMatchIndex].total = Object.values(filteredCounts).reduce((sum, count) => sum + count, 0)
        console.log(`[Analytics] Matched batch ${batch.id} to slot ${bestMatchIndex} (diff: ${bestMatchDiff}ms)`)
      } else {
        console.log(`[Analytics] No matching slot found for batch ${batch.id}`)
      }
    })

    console.log(`[Analytics] Generated ${fullTimeframe.length} time slots for ${roomEmojis.length} room emojis`)

    // Create datasets only for room emojis
    const datasets = roomEmojis.map((emoji) => {
      const color = emojiColorMap.get(emoji)

      return {
        label: emoji,
        data: fullTimeframe.map((slot) => slot.counts[emoji] || 0),
        fill: true,
        borderColor: color,
        backgroundColor: color + '99', // Add transparency for stacking
        tension: 0.4, // Smooth curves
      }
    })

    console.log('[Analytics] Chart data computed:', {
      labels: labels.length,
      datasets: datasets.length,
      roomEmojis: roomEmojis,
    })

    return {
      labels,
      datasets,
    }
  })

  // Computed property to get summary statistics
  const summaryStats = computed(() => {
    // Get room emojis for consistent ordering (always show these)
    const roomEmojis = room.value?.settings?.emojis?.map((e) => e.emoji) || []

    // Initialize emoji breakdown with room emojis (always show with 0)
    const emojiBreakdown = {}
    roomEmojis.forEach((emoji) => {
      emojiBreakdown[emoji] = 0
    })

    // Calculate totals from actual analytics data if available
    let totalReactions = 0

    if (analytics.value.length > 0) {
      // Sum up counts from all analytics batches
      analytics.value.forEach((batch) => {
        Object.entries(batch.counts).forEach(([emoji, count]) => {
          if (roomEmojis.includes(emoji)) {
            emojiBreakdown[emoji] = (emojiBreakdown[emoji] || 0) + count
            totalReactions += count
          }
        })
      })
    }

    return {
      totalReactions,
      emojiBreakdown,
    }
  })

  onMounted(() => {
    subscribeToAnalytics()

    // Set up interval to force chart updates every 15 seconds
    // This ensures the time window moves forward even without new data
    updateInterval = setInterval(() => {
      console.log('[Analytics] Forcing chart update (interval)')
      chartUpdateTrigger.value++
    }, 15000)
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
    if (updateInterval) {
      clearInterval(updateInterval)
    }
  })

  return {
    analytics,
    chartData,
    summaryStats,
    isLoading,
    error,
    timeWindowMinutes: ANALYTICS_TIME_WINDOW_MINUTES,
    batchIntervalSeconds: ANALYTICS_BATCH_INTERVAL_SECONDS,
  }
}
