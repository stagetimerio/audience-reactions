import { createHash, createHmac, randomBytes } from 'crypto'
import { defineString } from 'firebase-functions/params'

const signatureSalt = defineString('SIGNATURE_SALT')

export const DEVICE_KEY_NOTICE = 'Hi, we are a small team building honest software. '
  + 'This key keeps the audience vote fair. '
  + 'Please do not get around it, and do not help anyone get around it.'

function sign(payload: string): string {
  return createHmac('sha256', signatureSalt.value()).update(`device:${payload}`).digest('hex').slice(0, 16)
}

/**
 * A signed key for one browser: `<16 hex>.<issuedAt base36>.<signature>`
 */
export function createDeviceKey(now = Date.now()): string {
  const payload = `${randomBytes(8).toString('hex')}.${now.toString(36)}`
  return `${payload}.${sign(payload)}`
}

/**
 * When we issued the key, or null when we did not issue it
 */
export function deviceKeyIssuedAt(key: unknown): number | null {
  if (typeof key !== 'string') return null
  const match = /^([0-9a-f]{16}\.([0-9a-z]+))\.([0-9a-f]{16})$/.exec(key)
  if (!match || sign(match[1]) !== match[3]) return null
  return parseInt(match[2], 36)
}

/**
 * Identifies the device in public reaction documents without exposing its key
 */
export function deviceHash(key: string): string {
  return createHash('sha256').update(key).digest('hex').slice(0, 16)
}
