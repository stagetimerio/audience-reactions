import { Request, Response } from 'express'
import { FieldValue } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { DEFAULT_EMOJIS } from '../types'
import { roomFromSnapshot } from '../utils/converters'

/**
 * Submit a reaction to a room
 */
export async function submitReaction(req: Request, res: Response): Promise<void> {
  const { roomId } = req.params
  const { emoji } = req.body

  // Validate room ID
  if (!roomId) {
    res.status(400).json({ error: 'Room ID is required' })
    return
  }

  // Validate emoji
  if (!emoji || typeof emoji !== 'string') {
    res.status(400).json({ error: 'Emoji is required and must be a string' })
    return
  }

  // Check if room exists, create if it doesn't
  const roomRef = db.collection('rooms').doc(roomId)
  const roomDoc = await roomRef.get()

  let room
  if (!roomDoc.exists) {
    // Create room with default emoji configuration
    await roomRef.set({
      name: `Room ${roomId}`,
      settings: {
        emojis: DEFAULT_EMOJIS,
      },
    })
    logger.info(`Created new room: ${roomId}`)

    // Use default emojis for validation
    room = { settings: { emojis: DEFAULT_EMOJIS } }
  } else {
    // Convert room data for validation
    room = roomFromSnapshot(roomDoc)
  }

  // Validate emoji against room's configured emojis
  const allowedEmojis = room.settings.emojis.map((e) => e.emoji)
  if (!allowedEmojis.includes(emoji)) {
    res.status(400).json({
      error: 'Invalid emoji. Must be one of the configured emojis for this room.',
      allowedEmojis,
    })
    return
  }

  // Add reaction to subcollection
  const reactionRef = db
    .collection('rooms')
    .doc(roomId)
    .collection('reactions')
    .doc()

  await reactionRef.set({
    emoji,
    roomId,
    timestamp: FieldValue.serverTimestamp(),
  })

  logger.info(`Reaction added: ${emoji} in room ${roomId}`)

  res.status(201).json({
    success: true,
    reactionId: reactionRef.id,
    emoji,
    roomId,
  })
}
