import { DocumentSnapshot } from 'firebase-admin/firestore'
import { Room, RoomFirestore, Reaction, ReactionFirestore, AnalyticsBatch, AnalyticsBatchFirestore } from '../types'

/**
 * Configuration for converting from Firestore snapshot
 */
export interface FromSnapshotConfig {
  dateFields?: string[]
  defaults?: Record<string, unknown>
}

/**
 * Generic converter from Firestore DocumentSnapshot to entity with Dates
 * - Adds id from snapshot
 * - Converts Timestamp fields to Date objects
 * - Applies defaults if provided
 */
export function fromSnapshot<TFirestore, TEntity>(
  snapshot: DocumentSnapshot,
  config: FromSnapshotConfig = {}
): TEntity {
  const data = snapshot.data() as TFirestore | undefined
  if (!data) {
    throw new Error('Snapshot data is undefined')
  }

  const result: Record<string, unknown> = {
    ...config.defaults,
    ...data,
    id: snapshot.id,
  }

  // Convert date fields from Timestamp to Date
  if (config.dateFields) {
    for (const field of config.dateFields) {
      const value = result[field]
      if (value && typeof value === 'object' && 'toDate' in value) {
        result[field] = (value as { toDate(): Date }).toDate()
      } else if (value === null || value === undefined) {
        result[field] = null
      }
    }
  }

  return result as TEntity
}

/**
 * Convert Room document from Firestore
 */
export function roomFromSnapshot(snapshot: DocumentSnapshot): Room {
  return fromSnapshot<RoomFirestore, Room>(snapshot, {
    dateFields: ['createdAt', 'lastActivity'],
  })
}

/**
 * Convert Reaction document from Firestore
 */
export function reactionFromSnapshot(snapshot: DocumentSnapshot): Reaction {
  return fromSnapshot<ReactionFirestore, Reaction>(snapshot, {
    dateFields: ['timestamp'],
  })
}

/**
 * Convert AnalyticsBatch document from Firestore
 */
export function analyticsBatchFromSnapshot(snapshot: DocumentSnapshot): AnalyticsBatch {
  return fromSnapshot<AnalyticsBatchFirestore, AnalyticsBatch>(snapshot, {
    dateFields: ['startTime', 'endTime', 'createdAt'],
  })
}
