import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp, DocumentReference } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { Reaction } from '../types'

/**
 * Rounds a timestamp UP to the next 30-second boundary
 * Examples: 10:04:23 → 10:04:30, 10:04:45 → 10:05:00
 */
function getWindowEndTime(timestamp: Date): Date {
  const ms = timestamp.getTime()
  const windowSizeMs = 30 * 1000 // 30 seconds in milliseconds
  const windowEndMs = Math.ceil(ms / windowSizeMs) * windowSizeMs
  return new Date(windowEndMs)
}

/**
 * Core analytics batching logic - idempotent version
 * Processes ALL unprocessed reactions, grouping into 30-second fixed windows
 */
async function processBatch() {
  try {
    logger.info('Running analytics batching for all unprocessed reactions')

    // Get ALL unprocessed reactions across all rooms
    const reactionsQuery = db.collectionGroup('reactions')
    const allReactions = await reactionsQuery.get()

    if (allReactions.empty) {
      logger.info('No reactions to process')
      return
    }

    // Group reactions by roomId and then by 30-second time window
    const roomWindowGroups: Record<string, Record<string, Partial<Reaction>[]>> = {}
    const reactionsToDelete: DocumentReference[] = []

    for (const reactionDoc of allReactions.docs) {
      const reaction = reactionDoc.data()
      const roomId = reaction.roomId as string | undefined
      const timestamp = reaction.timestamp as Timestamp | undefined

      if (!roomId) {
        logger.warn(`Reaction ${reactionDoc.id} missing roomId, skipping`)
        continue
      }

      if (!timestamp) {
        logger.warn(`Reaction ${reactionDoc.id} missing timestamp, skipping`)
        continue
      }

      // Calculate the 30-second window this reaction belongs to
      const windowEndTime = getWindowEndTime(timestamp.toDate())
      const windowKey = windowEndTime.toISOString()

      // Initialize nested structure if needed
      if (!roomWindowGroups[roomId]) {
        roomWindowGroups[roomId] = {}
      }
      if (!roomWindowGroups[roomId][windowKey]) {
        roomWindowGroups[roomId][windowKey] = []
      }

      roomWindowGroups[roomId][windowKey].push(reaction as Partial<Reaction>)
      reactionsToDelete.push(reactionDoc.ref)
    }

    const totalRooms = Object.keys(roomWindowGroups).length
    let totalWindows = 0
    for (const windows of Object.values(roomWindowGroups)) {
      totalWindows += Object.keys(windows).length
    }

    logger.info(`Processing ${totalRooms} rooms with ${totalWindows} time windows ` +
      `and ${allReactions.size} total reactions`)

    // Create analytics batches for each room/window combination
    const batch = db.batch()

    for (const [roomId, windows] of Object.entries(roomWindowGroups)) {
      for (const [windowKey, reactions] of Object.entries(windows)) {
        try {
          // Count reactions by emoji type
          const counts: Record<string, number> = {}
          let total = 0

          for (const reaction of reactions) {
            const emoji = reaction.emoji
            if (emoji) {
              counts[emoji] = (counts[emoji] || 0) + 1
              total++
            }
          }

          // Create analytics batch document using window end time as ID
          const windowEndTime = new Date(windowKey)
          const analyticsRef = db
            .collection('rooms')
            .doc(roomId)
            .collection('analytics')
            .doc(windowKey)

          batch.set(analyticsRef, {
            endTime: Timestamp.fromDate(windowEndTime),
            counts,
            total,
          }, { merge: true }) // Use merge in case we reprocess the same window

          logger.info(`Queued analytics for room ${roomId} window ${windowKey}: ${total} reactions`)
        } catch (error) {
          logger.error(`Error processing analytics for room ${roomId} window ${windowKey}:`, error)
        }
      }
    }

    // Delete all processed reactions
    for (const reactionRef of reactionsToDelete) {
      batch.delete(reactionRef)
    }

    // Commit all changes in a single batch
    await batch.commit()

    logger.info(`Analytics batching completed: processed ${allReactions.size} reactions ` +
      `from ${totalRooms} rooms into ${totalWindows} time windows`)
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
 * Processes all unprocessed reactions into 30-second time windows
 * Idempotent - can safely run multiple times without duplicating data
 */
export const batchAnalytics = onSchedule(
  {
    schedule: 'every minute',
    timeZone: 'Europe/Berlin',
    maxInstances: 1,
  },
  async () => {
    await processBatch()
  }
)

