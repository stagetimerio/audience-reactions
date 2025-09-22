import { onSchedule } from 'firebase-functions/v2/scheduler'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'

/**
 * Scheduled function that runs every minute to batch analytics
 * Processes reactions from the last minute window and creates analytics batch
 */
export const batchAnalytics = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'Europe/Berlin',
    maxInstances: 1,
  },
  async () => {
    try {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60000)

      logger.info('Running analytics batching for window: ' +
        `${oneMinuteAgo.toISOString()} to ${now.toISOString()}`)

      // Get all rooms to process
      const roomsSnapshot = await db.collection('rooms').get()

      for (const roomDoc of roomsSnapshot.docs) {
        const roomId = roomDoc.id

        try {
          // Get reactions from the last minute
          const reactionsRef = db
            .collection('rooms')
            .doc(roomId)
            .collection('reactions')

          const recentReactions = await reactionsRef
            .where('timestamp', '>=', Timestamp.fromDate(oneMinuteAgo))
            .where('timestamp', '<', Timestamp.fromDate(now))
            .get()

          if (recentReactions.empty) {
            continue // No reactions in this window for this room
          }

          // Count reactions by emoji type
          const counts: Record<string, number> = {}
          let total = 0

          for (const reactionDoc of recentReactions.docs) {
            const reaction = reactionDoc.data()
            const emoji = reaction.emoji

            counts[emoji] = (counts[emoji] || 0) + 1
            total++
          }

          // Create analytics batch document with ISO date as ID for better sorting
          const isoEndTime = now.toISOString()
          const analyticsRef = db
            .collection('rooms')
            .doc(roomId)
            .collection('analytics')
            .doc(isoEndTime)

          await analyticsRef.set({
            startTime: Timestamp.fromDate(oneMinuteAgo),
            endTime: Timestamp.fromDate(now),
            counts,
            total,
            createdAt: FieldValue.serverTimestamp(),
          })

          // Delete processed reactions to prevent accumulation
          const batch = db.batch()
          for (const reactionDoc of recentReactions.docs) {
            batch.delete(reactionDoc.ref)
          }
          await batch.commit()

          logger.info(`Processed ${total} reactions for room ${roomId}, ` +
            `deleted ${recentReactions.size} reaction documents`)
        } catch (error) {
          logger.error(`Error processing analytics for room ${roomId}:`, error)
        }
      }

      logger.info('Analytics batching completed successfully')
    } catch (error) {
      logger.error('Error in analytics batching:', error)
      throw error // Re-throw to mark function as failed
    }
  }
)

