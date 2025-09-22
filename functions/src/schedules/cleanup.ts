import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'

// Configuration constants
const ANALYTICS_RETENTION_DAYS = 30 // Keep analytics for 30 days
const INACTIVE_ROOM_DAYS = 30 // Remove rooms inactive for 30 days
const BATCH_SIZE = 500 // Process deletions in batches

/**
 * Scheduled function that runs daily to clean up old data
 * Removes old analytics data and inactive rooms
 */
export const cleanupOldData = onSchedule(
  {
    schedule: '0 2 * * *', // Daily at 2 AM
    timeZone: 'Europe/Berlin',
    maxInstances: 1,
  },
  async () => {
    try {
      logger.info('Starting data cleanup process')

      const now = new Date()
      const analyticsRetentionDate = new Date(now.getTime() - (ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000))
      const inactiveRoomDate = new Date(now.getTime() - (INACTIVE_ROOM_DAYS * 24 * 60 * 60 * 1000))

      logger.info(`Analytics retention cutoff: ${analyticsRetentionDate.toISOString()}`)
      logger.info(`Inactive room cutoff: ${inactiveRoomDate.toISOString()}`)

      // Clean up old analytics data
      await cleanupOldAnalytics(analyticsRetentionDate)

      // Clean up inactive rooms
      await cleanupInactiveRooms(inactiveRoomDate)

      // Clean up orphaned reactions (shouldn't exist due to batching, but safety check)
      await cleanupOrphanedReactions()

      logger.info('Data cleanup process completed successfully')
    } catch (error) {
      logger.error('Error in data cleanup:', error)
      throw error // Re-throw to mark function as failed
    }
  }
)

/**
 * Clean up old analytics data across all rooms
 */
async function cleanupOldAnalytics(cutoffDate: Date): Promise<void> {
  logger.info('Cleaning up old analytics data')

  const roomsSnapshot = await db.collection('rooms').get()
  let totalDeleted = 0

  for (const roomDoc of roomsSnapshot.docs) {
    const roomId = roomDoc.id

    try {
      const analyticsRef = db
        .collection('rooms')
        .doc(roomId)
        .collection('analytics')

      // Find old analytics documents
      const oldAnalytics = await analyticsRef
        .where('endTime', '<', Timestamp.fromDate(cutoffDate))
        .limit(BATCH_SIZE)
        .get()

      if (!oldAnalytics.empty) {
        const batch = db.batch()
        for (const doc of oldAnalytics.docs) {
          batch.delete(doc.ref)
        }
        await batch.commit()

        totalDeleted += oldAnalytics.size
        logger.info(`Deleted ${oldAnalytics.size} old analytics documents from room ${roomId}`)

        // If we hit the batch limit, there might be more to delete
        if (oldAnalytics.size === BATCH_SIZE) {
          logger.warn(`Hit batch limit for room ${roomId}, may need multiple runs to clean all data`)
        }
      }
    } catch (error) {
      logger.error(`Error cleaning analytics for room ${roomId}:`, error)
    }
  }

  logger.info(`Total analytics documents deleted: ${totalDeleted}`)
}

/**
 * Clean up rooms that have been inactive for too long
 */
async function cleanupInactiveRooms(cutoffDate: Date): Promise<void> {
  logger.info('Cleaning up inactive rooms')

  const inactiveRooms = await db
    .collection('rooms')
    .where('lastActivity', '<', Timestamp.fromDate(cutoffDate))
    .limit(BATCH_SIZE)
    .get()

  if (inactiveRooms.empty) {
    logger.info('No inactive rooms found')
    return
  }

  for (const roomDoc of inactiveRooms.docs) {
    const roomId = roomDoc.id

    try {
      // Delete all subcollections first
      await deleteSubcollections(roomId)

      // Delete the room document
      await roomDoc.ref.delete()

      logger.info(`Deleted inactive room: ${roomId}`)
    } catch (error) {
      logger.error(`Error deleting room ${roomId}:`, error)
    }
  }

  logger.info(`Deleted ${inactiveRooms.size} inactive rooms`)

  // If we hit the batch limit, log a warning
  if (inactiveRooms.size === BATCH_SIZE) {
    logger.warn('Hit batch limit for inactive rooms, may need multiple runs to clean all data')
  }
}

/**
 * Delete all subcollections for a room
 */
async function deleteSubcollections(roomId: string): Promise<void> {
  const roomRef = db.collection('rooms').doc(roomId)

  // Delete reactions subcollection
  const reactions = await roomRef.collection('reactions').limit(BATCH_SIZE).get()
  if (!reactions.empty) {
    const batch = db.batch()
    for (const doc of reactions.docs) {
      batch.delete(doc.ref)
    }
    await batch.commit()
    logger.info(`Deleted ${reactions.size} reactions from room ${roomId}`)
  }

  // Delete analytics subcollection
  const analytics = await roomRef.collection('analytics').limit(BATCH_SIZE).get()
  if (!analytics.empty) {
    const batch = db.batch()
    for (const doc of analytics.docs) {
      batch.delete(doc.ref)
    }
    await batch.commit()
    logger.info(`Deleted ${analytics.size} analytics from room ${roomId}`)
  }
}

/**
 * Clean up any orphaned reactions that weren't processed by analytics batching
 */
async function cleanupOrphanedReactions(): Promise<void> {
  logger.info('Cleaning up orphaned reactions')

  const roomsSnapshot = await db.collection('rooms').get()
  let totalDeleted = 0

  const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000))

  for (const roomDoc of roomsSnapshot.docs) {
    const roomId = roomDoc.id

    try {
      const reactionsRef = db
        .collection('rooms')
        .doc(roomId)
        .collection('reactions')

      // Find reactions older than 1 hour (should have been processed by now)
      const oldReactions = await reactionsRef
        .where('timestamp', '<', Timestamp.fromDate(oneHourAgo))
        .limit(BATCH_SIZE)
        .get()

      if (!oldReactions.empty) {
        const batch = db.batch()
        for (const doc of oldReactions.docs) {
          batch.delete(doc.ref)
        }
        await batch.commit()

        totalDeleted += oldReactions.size
        logger.warn(`Deleted ${oldReactions.size} orphaned reactions from room ${roomId}`)
      }
    } catch (error) {
      logger.error(`Error cleaning orphaned reactions for room ${roomId}:`, error)
    }
  }

  if (totalDeleted > 0) {
    logger.warn(`Total orphaned reactions deleted: ${totalDeleted}`)
  } else {
    logger.info('No orphaned reactions found')
  }
}
