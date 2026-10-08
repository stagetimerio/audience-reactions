const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const STORAGE_KEY = 'device_key'

let deviceKey = null

async function fetchDeviceKey () {
  const response = await fetch(`${API_BASE_URL}/device-keys`, { method: 'POST' })
  if (!response.ok) throw new Error(`Failed to get a device key: ${response.status}`)
  const key = (await response.json()).deviceKey
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch { /* storage blocked: keep the key in memory */ }
  return key
}

/**
 * The key for this browser. Reactions count only when the key is older than 45 seconds.
 */
export function getDeviceKey () {
  if (!deviceKey) {
    let stored = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch { /* storage blocked: keep the key in memory */ }
    deviceKey = stored ? Promise.resolve(stored) : fetchDeviceKey()
    deviceKey.catch(() => {
      deviceKey = null
    })
  }
  return deviceKey
}
