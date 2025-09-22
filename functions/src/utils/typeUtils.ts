import { Timestamp } from 'firebase-admin/firestore'

/**
 * Type utility to replace Date fields with Firestore Timestamp
 */
export type ReplaceWithTimestamp<T> = {
  [K in keyof T]: T[K] extends Date | null
    ? Timestamp | (T[K] extends Date ? never : null)
    : T[K] extends Date
      ? Timestamp
      : T[K]
}

/**
 * Type utility to replace Date fields with ISO strings
 */
export type ReplaceWithString<T> = {
  [K in keyof T]: T[K] extends Date | null
    ? string | (T[K] extends Date ? never : null)
    : T[K] extends Date
      ? string
      : T[K]
}
