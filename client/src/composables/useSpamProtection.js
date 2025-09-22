import { ref, computed, onMounted, onUnmounted } from 'vue'

const SPAM_THRESHOLD = 10 // clicks
const SPAM_WINDOW = 10000 // 10 seconds in ms
const COOLDOWN_DURATION = 5000 // 5 seconds in ms

export function useSpamProtection (roomId) {
  const clicks = ref([])
  const cooldownUntil = ref(0)
  const buttonStates = ref({}) // emoji -> { lastClick, state }
  const forceUpdate = ref(0) // Used to force reactivity updates

  const storageKey = `spam_protection_${roomId}`

  // Timer to update cooldown display every 100ms
  let updateTimer = null

  // Load persisted state
  onMounted(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.cooldownUntil && Date.now() < data.cooldownUntil) {
          cooldownUntil.value = data.cooldownUntil
          startUpdateTimer() // Start timer if cooldown is active
        }
        if (data.clicks) {
          // Only keep recent clicks
          const now = Date.now()
          clicks.value = data.clicks.filter(time => now - time < SPAM_WINDOW)
        }
      }
    } catch (err) {
      console.warn('Failed to load spam protection state:', err)
    }
  })

  // Cleanup timer on unmount
  onUnmounted(() => {
    stopUpdateTimer()
  })

  // Save state to localStorage
  function saveState () {
    try {
      const data = {
        cooldownUntil: cooldownUntil.value,
        clicks: clicks.value,
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (err) {
      console.warn('Failed to save spam protection state:', err)
    }
  }

  // Start timer for reactive updates
  function startUpdateTimer () {
    if (updateTimer) clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      if (cooldownUntil.value > 0) {
        forceUpdate.value++
      } else if (updateTimer) {
        clearInterval(updateTimer)
        updateTimer = null
      }
    }, 100)
  }

  // Stop timer
  function stopUpdateTimer () {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
  }

  // Computed cooldown remaining time
  const cooldownRemaining = computed(() => {
    // Use forceUpdate to trigger reactivity (consuming it for reactivity)
    // eslint-disable-next-line no-unused-vars
    const _ = forceUpdate.value

    if (!cooldownUntil.value) return 0
    const remaining = cooldownUntil.value - Date.now()
    const timeLeft = Math.max(0, remaining)

    // Clear expired cooldown
    if (timeLeft === 0 && cooldownUntil.value > 0) {
      cooldownUntil.value = 0
      saveState()
      stopUpdateTimer()
    }

    return timeLeft
  })

  // Can user submit reactions?
  const canSubmit = computed(() => {
    return cooldownRemaining.value === 0
  })

  // Progress percentage for cooldown (100% = just started, 0% = finished)
  const cooldownProgress = computed(() => {
    const remaining = cooldownRemaining.value
    if (remaining === 0) return 0
    const total = COOLDOWN_DURATION
    return Math.round((remaining / total) * 100)
  })

  // Record a click and check for spam
  function recordClick () {
    const now = Date.now()

    // Clean old clicks
    clicks.value = clicks.value.filter(time => now - time < SPAM_WINDOW)

    // Add new click
    clicks.value.push(now)

    // Check for spam
    if (clicks.value.length >= SPAM_THRESHOLD) {
      cooldownUntil.value = now + COOLDOWN_DURATION
      clicks.value = [] // Clear clicks after triggering cooldown
      startUpdateTimer() // Start the countdown timer
    }

    saveState()
  }

  // Get button visual state for feedback
  function getButtonState (emoji) {
    const state = buttonStates.value[emoji]
    const now = Date.now()

    // Clear old states
    if (state && now - state.lastClick > 3000) {
      delete buttonStates.value[emoji]
    }

    const currentState = buttonStates.value[emoji]

    if (cooldownRemaining.value > 0) {
      return {
        class: 'border-yellow-400 bg-yellow-50 opacity-75 cursor-not-allowed',
        disabled: true,
        loading: false,
        success: false,
      }
    }

    if (currentState) {
      const timeSinceClick = now - currentState.lastClick

      if (currentState.state === 'loading') {
        return {
          class: 'border-blue-400 bg-blue-50',
          disabled: false,
          loading: true,
          success: false,
        }
      }

      if (currentState.state === 'success' && timeSinceClick < 1000) {
        return {
          class: 'border-green-400 bg-green-50',
          disabled: false,
          loading: false,
          success: true,
        }
      }
    }

    return {
      class: '',
      disabled: false,
      loading: false,
      success: false,
    }
  }

  // Set button to loading state
  function setButtonLoading (emoji) {
    buttonStates.value[emoji] = {
      lastClick: Date.now(),
      state: 'loading',
    }
  }

  // Set button to success state
  function setButtonSuccess (emoji) {
    if (buttonStates.value[emoji]) {
      buttonStates.value[emoji].state = 'success'
    }
  }

  // Clear button state
  function clearButtonState (emoji) {
    delete buttonStates.value[emoji]
  }

  return {
    canSubmit,
    cooldownRemaining,
    cooldownProgress,
    recordClick,
    getButtonState,
    setButtonLoading,
    setButtonSuccess,
    clearButtonState,
  }
}
