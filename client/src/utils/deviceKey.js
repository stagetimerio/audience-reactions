// The server checks the same key. Keep KEY_SALT and checksum() equal in functions/src/utils/deviceKey.ts.
const KEY_SALT = 'Hi, we are a small team building honest software. '
  + 'This key keeps the audience vote fair. '
  + 'Please do not get around it, and do not help anyone get around it.'
const STORAGE_KEY = 'device_key'

function checksum (random) {
  let hash = 2166136261
  for (const c of KEY_SALT + random) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(36)
}

function createDeviceKey () {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const random = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${random}.${checksum(random)}`
}

let deviceKey = null

/**
 * A key for this browser. The server drops reactions without a valid one.
 */
export function getDeviceKey () {
  if (deviceKey) return deviceKey
  try {
    deviceKey = localStorage.getItem(STORAGE_KEY)
  } catch { /* storage blocked: keep the key in memory */ }
  if (!deviceKey) {
    deviceKey = createDeviceKey()
    try {
      localStorage.setItem(STORAGE_KEY, deviceKey)
    } catch { /* storage blocked: keep the key in memory */ }
  }
  return deviceKey
}
