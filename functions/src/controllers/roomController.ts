import { Request, Response } from 'express'
import { DocumentSnapshot, Query, Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { merge } from 'lodash'
import { db } from '../firebase-setup'
import { AnalyticsBatch, DEFAULT_EMOJIS } from '../types'
import { roomFromSnapshot, analyticsBatchFromSnapshot } from '../utils/converters'
import { generateDashboardUrl, validateSignature as validateSig } from '../utils/signature'

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

  // Generate dashboard URL with signature
  const dashboardUrl = generateDashboardUrl(roomId)

  res.status(201).json({
    success: true,
    id: roomId,
    name: roomData.name,
    settings: roomData.settings,
    createdAt: new Date().toISOString(),
    dashboardUrl,
  })
}

/**
 * Get analytics data for a room between two timestamps
 */
export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const { roomId } = req.params
  const { from, to } = req.query

  // Validate room ID
  if (!roomId) {
    res.status(400).json({ error: 'Room ID is required' })
    return
  }

  // Enforce required query parameters
  if (!from || !to) {
    res.status(400).json({
      error: 'Both "from" and "to" query parameters are required',
      message: 'Please provide ISO string timestamps for both from and to parameters'
    })
    return
  }

  // Validate ISO string format
  const fromDate = new Date(from as string)
  const toDate = new Date(to as string)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    res.status(400).json({
      error: 'Invalid date format',
      message: 'Both "from" and "to" must be valid ISO string timestamps'
    })
    return
  }

  if (fromDate >= toDate) {
    res.status(400).json({
      error: 'Invalid time range',
      message: '"from" must be earlier than "to"'
    })
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
    const BATCH_INTERVAL_MS = 20 * 1000 // 20 seconds in milliseconds

    // Add 20-second buffer to the beginning and end to ensure complete coverage
    const queryFromDate = new Date(fromDate.getTime() - BATCH_INTERVAL_MS)
    const queryToDate = new Date(toDate.getTime() + BATCH_INTERVAL_MS)

    // Build analytics query
    // Since analyticsBatches only have endTime, we query for endTime >= queryFrom and endTime <= queryTo
    // This ensures we get all batches that might overlap with our time window
    const query: Query = roomRef.collection('analytics')
      .where('endTime', '>=', Timestamp.fromDate(queryFromDate))
      .where('endTime', '<=', Timestamp.fromDate(queryToDate))
      .orderBy('endTime', 'asc')

    const analyticsSnapshot = await query.get()

    // Format analytics data using converters
    const analyticsData = analyticsSnapshot.docs.map((doc: DocumentSnapshot) => analyticsBatchFromSnapshot(doc))

    // Calculate summary statistics
    const summary = {
      totalReactions: analyticsData.reduce((sum: number, batch: AnalyticsBatch) => sum + batch.total, 0),
      periodStart: fromDate,
      periodEnd: toDate,
      batchCount: analyticsData.length,
      queryPeriodStart: queryFromDate,
      queryPeriodEnd: queryToDate,
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

/**
 * Validate a signature for a room
 */
export function validateSignature(req: Request, res: Response): void {
  const { roomId } = req.params
  const signature = req.query.sig as string

  if (!roomId) {
    res.status(400).json({ error: 'Room ID is required' })
    return
  }

  if (!signature) {
    res.status(400).json({ error: 'Signature is required' })
    return
  }

  try {
    const isValid = validateSig(roomId, signature)
    res.json({ valid: isValid })
  } catch (error) {
    logger.error('Signature validation error:', error)
    res.status(500).json({
      error: 'Signature validation failed',
      message: 'Unable to validate signature',
    })
  }
}

/**
 * Update room settings (requires valid signature)
 */
export async function updateRoom(req: Request, res: Response): Promise<void> {
  const { roomId } = req.params
  const { name, settings } = req.body

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

  try {
    const currentRoom = roomFromSnapshot(roomDoc)

    // Validate emoji count if provided
    if (settings?.emojis && Array.isArray(settings.emojis)) {
      if (settings.emojis.length < 2 || settings.emojis.length > 6) {
        res.status(400).json({
          error: 'Invalid emoji count',
          message: 'Room must have between 2 and 6 emojis',
        })
        return
      }
      // Normalize emoji format
      settings.emojis = settings.emojis.map((emoji: any) =>
        typeof emoji === 'string'
          ? { emoji }
          : { emoji: emoji.emoji || emoji, ...(emoji.label && { label: emoji.label }) }
      )
    }

    // Clean up null/undefined backgrounds
    if (settings) {
      if (settings.backgroundInput === null || settings.backgroundInput === '') {
        delete settings.backgroundInput
      }
      if (settings.backgroundOutput === null || settings.backgroundOutput === '') {
        delete settings.backgroundOutput
      }
    }

    // Merge updates with existing data
    const updateData = merge(
      {},
      { name: currentRoom.name, settings: currentRoom.settings },
      { ...(name && { name }), ...(settings && { settings }) }
    )

    // Check if there are actual changes
    if (JSON.stringify(updateData) === JSON.stringify({ name: currentRoom.name, settings: currentRoom.settings })) {
      res.status(400).json({ error: 'No changes detected' })
      return
    }

    // Perform update
    await roomRef.update(updateData)

    // Get updated room data
    const updatedRoomDoc = await roomRef.get()
    const updatedRoom = roomFromSnapshot(updatedRoomDoc)

    logger.info(`Updated room: ${roomId}`)

    res.json({
      success: true,
      room: updatedRoom,
    })
  } catch (error) {
    logger.error('Room update error:', error)
    res.status(500).json({
      error: 'Failed to update room',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
