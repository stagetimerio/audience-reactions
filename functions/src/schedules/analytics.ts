import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp, FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { DEFAULT_MAX_REACTIONS, Reaction } from '../types'
import { expiresAt, ANALYTICS_TTL_MS } from '../utils/expiry'

/**
 * Rounds a timestamp UP to the next 10-second boundary
 * Examples: 10:04:23 → 10:04:30, 10:04:51 → 10:05:00
 */
function getWindowEndTime(timestamp: Date): Date {
  const ms = timestamp.getTime()
  const windowSizeMs = 10 * 1000
  const windowEndMs = Math.ceil(ms / windowSizeMs) * windowSizeMs
  return new Date(windowEndMs)
}

// Firestore rejects a large commit with "Transaction too big". A failed commit deletes nothing, so the backlog grows.
const CHUNK_SIZE = 200

/**
 * The reactions that exceed the room's tilt limit for their device in a 10-second window.
 * A script then scores like one person who taps fast.
 */
async function findOverLimit(reactionDocs: QueryDocumentSnapshot[]): Promise<Set<string>> {
  const roomIds = [...new Set(reactionDocs.map((doc) => doc.get('roomId') as string).filter(Boolean))]
  const rooms = roomIds.length ? await db.getAll(...roomIds.map((id) => db.collection('rooms').doc(id))) : []
  const limits = new Map(rooms.map((room) => [
    room.id,
    room.get('settings.tiltLimit.maxReactions') || DEFAULT_MAX_REACTIONS,
  ]))

  const overLimit = new Set<string>()
  const counts = new Map<string, number>()
  const byTime = reactionDocs
    .filter((doc) => doc.get('deviceId') && doc.get('timestamp'))
    .sort((a, b) => a.get('timestamp').toMillis() - b.get('timestamp').toMillis())
  for (const doc of byTime) {
    const roomId = doc.get('roomId')
    const key = `${roomId}|${getWindowEndTime(doc.get('timestamp').toDate()).toISOString()}|${doc.get('deviceId')}`
    const count = (counts.get(key) || 0) + 1
    counts.set(key, count)
    if (count > (limits.get(roomId) ?? DEFAULT_MAX_REACTIONS)) overLimit.add(doc.ref.path)
  }
  return overLimit
}

/**
 * Adds the reactions to their 10-second windows and deletes them in one commit,
 * so a failed commit never counts a reaction twice.
 */
async function commitChunk(reactionDocs: QueryDocumentSnapshot[], overLimit: Set<string>): Promise<number> {
  const roomWindowCounts: Record<string, Record<string, Record<string, number>>> = {}
  const batch = db.batch()

  for (const reactionDoc of reactionDocs) {
    const reaction = reactionDoc.data() as Partial<Reaction>
    const roomId = reaction.roomId
    const timestamp = reaction.timestamp as Timestamp | undefined

    if (!roomId) {
      logger.warn(`Reaction ${reactionDoc.id} missing roomId, skipping`)
      continue
    }

    if (!timestamp) {
      logger.warn(`Reaction ${reactionDoc.id} missing timestamp, skipping`)
      continue
    }

    const windowKey = getWindowEndTime(timestamp.toDate()).toISOString()
    roomWindowCounts[roomId] ??= {}
    roomWindowCounts[roomId][windowKey] ??= {}
    if (reaction.emoji && !overLimit.has(reactionDoc.ref.path)) {
      const counts = roomWindowCounts[roomId][windowKey]
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1
    }
    batch.delete(reactionDoc.ref)
  }

  let windowCount = 0
  for (const [roomId, windows] of Object.entries(roomWindowCounts)) {
    batch.set(db.collection('rooms').doc(roomId), { lastUsedAt: FieldValue.serverTimestamp() }, { merge: true })

    for (const [windowKey, counts] of Object.entries(windows)) {
      const windowEndTime = new Date(windowKey)
      const analyticsRef = db.collection('rooms').doc(roomId).collection('analytics').doc(windowKey)

      // A window can span two commits. Add to its counts, do not replace them.
      const increments: Record<string, FieldValue> = {}
      let total = 0
      for (const [emoji, count] of Object.entries(counts)) {
        increments[emoji] = FieldValue.increment(count)
        total += count
      }
      batch.set(analyticsRef, {
        endTime: Timestamp.fromDate(windowEndTime),
        counts: increments,
        total: FieldValue.increment(total),
        expiresAt: expiresAt(ANALYTICS_TTL_MS, windowEndTime.getTime()),
      }, { merge: true })
      windowCount++
    }
  }

  await batch.commit()
  return windowCount
}

/**
 * Core analytics batching logic
 * Processes ALL unprocessed reactions, grouping into 10-second fixed windows
 */
async function processBatch() {
  try {
    logger.info('Running analytics batching for all unprocessed reactions')

    // Get ALL unprocessed reactions across all rooms
    const allReactions = await db.collectionGroup('reactions').get()

    if (allReactions.empty) {
      logger.info('No reactions to process')
      return
    }

    const overLimit = await findOverLimit(allReactions.docs)
    let windowCount = 0
    for (let i = 0; i < allReactions.docs.length; i += CHUNK_SIZE) {
      windowCount += await commitChunk(allReactions.docs.slice(i, i + CHUNK_SIZE), overLimit)
    }

    logger.info(`Analytics batching completed: processed ${allReactions.size} reactions `
      + `into ${windowCount} window writes, ${overLimit.size} over the device limit`)
  } catch (error) {
    // Check if error is due to missing index
    const err = error as any
    if (err?.code === 9 || err?.message?.includes('FAILED_PRECONDITION')) {
      logger.error('Missing Firestore index for collection group query. '
        + 'Deploy the index using: firebase deploy --only firestore:indexes', error)
    } else {
      logger.error('Error in analytics batching:', error)
    }
    throw error // Re-throw to mark function as failed
  }
}

/**
 * Scheduled function that runs every minute
 * Processes all unprocessed reactions into 10-second time windows
 */
export const batchAnalytics = onSchedule(
  {
    schedule: 'every minute',
    timeZone: 'Europe/Berlin',
    maxInstances: 1,
    timeoutSeconds: 300,
  },
  async () => {
    await processBatch()
  }
)

