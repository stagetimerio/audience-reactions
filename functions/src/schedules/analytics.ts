import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp, DocumentReference } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { Reaction } from '../types'

/**
 * Core analytics batching logic - optimized version
 * Processes all reactions up to the current time, grouped by roomId to avoid scanning all rooms
 */
async function processBatch() {
  try {
    const now = new Date()

    logger.info('Running analytics batching up to: ' + now.toISOString())

    // Get all unprocessed reactions across all rooms in a single query
    const reactionsQuery = db.collectionGroup('reactions')
      .where('timestamp', '<', Timestamp.fromDate(now))

    const allReactions = await reactionsQuery.get()

    if (allReactions.empty) {
      logger.info('No reactions to process')
      return
    }

    // Group reactions by roomId for batch processing
    const roomGroups: Record<string, Partial<Reaction>[]> = {}
    const reactionsToDelete: DocumentReference[] = []

    for (const reactionDoc of allReactions.docs) {
      const reaction = reactionDoc.data()
      const roomId = reaction.roomId as string | undefined

      if (!roomId) {
        logger.warn(`Reaction ${reactionDoc.id} missing roomId, skipping`)
        continue
      }

      if (!roomGroups[roomId]) {
        roomGroups[roomId] = []
      }

      roomGroups[roomId].push(reaction as Partial<Reaction>)
      reactionsToDelete.push(reactionDoc.ref)
    }

    logger.info(`Processing ${Object.keys(roomGroups).length} rooms with ${allReactions.size} total reactions`)

    // Process each room's reactions
    const isoEndTime = now.toISOString()
    const batch = db.batch()

    for (const [roomId, reactions] of Object.entries(roomGroups)) {
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

        // Create analytics batch document
        const analyticsRef = db
          .collection('rooms')
          .doc(roomId)
          .collection('analytics')
          .doc(isoEndTime)

        batch.set(analyticsRef, {
          endTime: Timestamp.fromDate(now),
          counts,
          total,
        })

        logger.info(`Queued analytics for room ${roomId}: ${total} reactions`)
      } catch (error) {
        logger.error(`Error processing analytics for room ${roomId}:`, error)
      }
    }

    // Delete all processed reactions
    for (const reactionRef of reactionsToDelete) {
      batch.delete(reactionRef)
    }

    // Commit all changes in a single batch
    await batch.commit()

    logger.info(`Analytics batching completed: processed ${allReactions.size} reactions ` +
      `from ${Object.keys(roomGroups).length} rooms`)
  } catch (error) {
    logger.error('Error in analytics batching:', error)
    throw error // Re-throw to mark function as failed
  }
}

/**
 * Scheduled function that runs every 30 seconds and executes batching twice
 * First execution immediately, second after 30-second delay
 */
export const batchAnalytics = onSchedule(
  {
    schedule: 'every minute',
    timeZone: 'Europe/Berlin',
    maxInstances: 1,
  },
  async () => {
    // First batch execution
    await processBatch()

    // Wait 30 seconds, then execute again
    await new Promise((resolve) => setTimeout(resolve, 30000))
    await processBatch()
  }
)

