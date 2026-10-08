import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp, FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { Reaction } from '../types'
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

// A device counts up to 5 reactions per window, so at most 45 in a 90-second pitch.
const DEVICE_LIMIT_PER_WINDOW = 5
// A key counts only when it is older than this, so a script that makes a new key for each reaction scores nothing.
const MIN_KEY_AGE_MS = 45 * 1000

/**
 * The reactions that do not count: no device key, a key younger than MIN_KEY_AGE_MS,
 * or over DEVICE_LIMIT_PER_WINDOW. They still show on the output.
 */
function findUncounted(reactionDocs: QueryDocumentSnapshot[]): Set<string> {
  const uncounted = new Set<string>()
  const counts = new Map<string, number>()
  const byTime = reactionDocs
    .filter((doc) => doc.get('timestamp'))
    .sort((a, b) => a.get('timestamp').toMillis() - b.get('timestamp').toMillis())
  for (const doc of byTime) {
    const timestamp: Timestamp = doc.get('timestamp')
    const keyIssuedAt: Timestamp | undefined = doc.get('keyIssuedAt')
    if (!keyIssuedAt || !doc.get('deviceHash') || timestamp.toMillis() - keyIssuedAt.toMillis() < MIN_KEY_AGE_MS) {
      uncounted.add(doc.ref.path)
      continue
    }
    const key = `${doc.get('roomId')}|${getWindowEndTime(timestamp.toDate()).toISOString()}|${doc.get('deviceHash')}`
    const count = (counts.get(key) || 0) + 1
    counts.set(key, count)
    if (count > DEVICE_LIMIT_PER_WINDOW) uncounted.add(doc.ref.path)
  }
  return uncounted
}

/**
 * Adds the reactions to their 10-second windows and deletes them in one commit,
 * so a failed commit never counts a reaction twice.
 */
async function commitChunk(reactionDocs: QueryDocumentSnapshot[], uncounted: Set<string>): Promise<number> {
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
    if (reaction.emoji && !uncounted.has(reactionDoc.ref.path)) {
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

    const uncounted = findUncounted(allReactions.docs)
    let windowCount = 0
    for (let i = 0; i < allReactions.docs.length; i += CHUNK_SIZE) {
      windowCount += await commitChunk(allReactions.docs.slice(i, i + CHUNK_SIZE), uncounted)
    }

    logger.info(`Analytics batching completed: processed ${allReactions.size} reactions `
      + `into ${windowCount} window writes, ${uncounted.size} not counted`)
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

