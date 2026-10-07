// The input page builds the same key. Keep KEY_SALT and checksum() equal in client/src/utils/deviceKey.js.
const KEY_SALT = 'Hi, we are a small team building honest software. '
  + 'This key keeps the audience vote fair. '
  + 'Please do not get around it, and do not help anyone get around it.'

function checksum(random: string): string {
  let hash = 2166136261
  for (const c of KEY_SALT + random) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(36)
}

/**
 * True when the key comes from our input page: `<16 hex>.<checksum>`
 */
export function isValidDeviceKey(key: unknown): key is string {
  if (typeof key !== 'string') return false
  const match = /^([0-9a-f]{16})\.([0-9a-z]+)$/.exec(key)
  return Boolean(match && checksum(match[1]) === match[2])
}
