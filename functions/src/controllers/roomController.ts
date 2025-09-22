import { Request, Response } from 'express'
import { DocumentSnapshot, Query, Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { AnalyticsBatch, DEFAULT_EMOJIS } from '../types'
import { roomFromSnapshot, analyticsBatchFromSnapshot } from '../utils/converters'

/**
 * Create a new room with default settings
 */
export async function createRoom(req: Request, res: Response): Promise<void> {
  const { name, emojis, backgroundInput, backgroundOutput } = req.body

  // Use Firestore auto-generated ID
  const roomRef = db.collection('rooms').doc()
  const roomId = roomRef.id

  interface RoomData {
    name: string
    settings: {
      emojis: typeof DEFAULT_EMOJIS | Array<{ emoji: string; label?: string }>
      backgroundInput?: string
      backgroundOutput?: string
    }
  }

  const roomData: RoomData = {
    name: name || `Room ${roomId}`,
    settings: {
      emojis: emojis || DEFAULT_EMOJIS,
    },
  }

  // Add background fields if provided
  if (backgroundInput && typeof backgroundInput === 'string') {
    roomData.settings.backgroundInput = backgroundInput
  }

  if (backgroundOutput && typeof backgroundOutput === 'string') {
    roomData.settings.backgroundOutput = backgroundOutput
  }

  await roomRef.set(roomData)

  logger.info(`Created new room: ${roomId}`)

  res.status(201).json({
    success: true,
    roomId,
    name: name || `Room ${roomId}`,
    urls: {
      input: `/rooms/${roomId}/input`,
      output: `/rooms/${roomId}/output`,
      dashboard: `/rooms/${roomId}/dashboard`,
    },
  })
}

/**
 * Get analytics data for a room between two timestamps
 */
export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const { roomId } = req.params
  const { startTime, endTime, limit = 100 } = req.query

  // Validate room ID
  if (!roomId) {
    res.status(400).json({ error: 'Room ID is required' })
    return
  }

  // Check if room exists
  const roomRef = db.collection('rooms').doc(roomId)
  const roomDoc = await roomRef.get()

  if (!roomDoc.exists) {
    res.status(404).json({ error: 'Room not found' })
    return
  }

  try {
    // Build analytics query
    let query: Query = roomRef.collection('analytics')

    // Apply time filters if provided
    if (startTime) {
      const startDate = new Date(startTime as string)
      if (!isNaN(startDate.getTime())) {
        query = query.where('endTime', '>=', Timestamp.fromDate(startDate))
      }
    }

    if (endTime) {
      const endDate = new Date(endTime as string)
      if (!isNaN(endDate.getTime())) {
        query = query.where('startTime', '<=', Timestamp.fromDate(endDate))
      }
    }

    // Order by time and apply limit
    query = query.orderBy('endTime', 'desc').limit(Number(limit))

    const analyticsSnapshot = await query.get()

    // Format analytics data using converters
    const analyticsData = analyticsSnapshot.docs.map((doc: DocumentSnapshot) => analyticsBatchFromSnapshot(doc))

    // Calculate summary statistics
    const summary = {
      totalReactions: analyticsData.reduce((sum: number, batch: AnalyticsBatch) => sum + batch.total, 0),
      periodStart: analyticsData.length > 0 ? analyticsData[analyticsData.length - 1].startTime : null,
      periodEnd: analyticsData.length > 0 ? analyticsData[0].endTime : null,
      batchCount: analyticsData.length,
    }

    // Convert room data using converter
    const room = roomFromSnapshot(roomDoc)

    res.json({
      roomId,
      room,
      analytics: analyticsData,
      summary,
    })
  } catch (error) {
    logger.error('Error fetching analytics:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get room information
 */
export async function getRoom(req: Request, res: Response): Promise<void> {
  const { roomId } = req.params

  // Validate room ID
  if (!roomId) {
    res.status(400).json({ error: 'Room ID is required' })
    return
  }

  // Get room document
  const roomRef = db.collection('rooms').doc(roomId)
  const roomDoc = await roomRef.get()

  if (!roomDoc.exists) {
    res.status(404).json({ error: 'Room not found' })
    return
  }

  // Convert room data using converter
  const room = roomFromSnapshot(roomDoc)

  res.json({
    ...room,
    urls: {
      input: `/rooms/${roomId}/input`,
      output: `/rooms/${roomId}/output`,
      dashboard: `/rooms/${roomId}/dashboard`,
    },
  })
}
