import { Timestamp } from 'firebase-admin/firestore'

const DAY_MS = 24 * 60 * 60 * 1000

export const ANALYTICS_TTL_MS = 30 * DAY_MS
export const REACTION_TTL_MS = 60 * 60 * 1000

/**
 * Value for the `expiresAt` field. Firestore TTL deletes the doc after this time.
 * TTL does not delete subcollections, so each collection sets its own `expiresAt`.
 */
export function expiresAt(ttlMs: number, fromMs = Date.now()): Timestamp {
  return Timestamp.fromMillis(fromMs + ttlMs)
}
