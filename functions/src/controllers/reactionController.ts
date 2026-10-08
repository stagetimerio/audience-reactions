import { Request, Response } from 'express'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { db } from '../firebase-setup'
import { roomFromSnapshot } from '../utils/converters'
import { expiresAt, REACTION_TTL_MS } from '../utils/expiry'
import { createDeviceKey, deviceHash, deviceKeyIssuedAt, DEVICE_KEY_NOTICE } from '../utils/deviceKey'

/**
 * Issue a device key. The input page sends it with each reaction.
 */
export function issueDeviceKey(req: Request, res: Response): void {
  res.status(201).json({ deviceKey: createDeviceKey(), notice: DEVICE_KEY_NOTICE })
}

/**
 * Submit a reaction to a room
 */
export async function submitReaction(req: Request<{ roomId: string }>, res: Response): Promise<void> {
  const { roomId } = req.params
  const { emoji, deviceId } = req.body

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

  const roomDoc = await db.collection('rooms').doc(roomId).get()
  if (!roomDoc.exists) {
    res.status(404).json({ error: 'Room not found' })
    return
  }
  const room = roomFromSnapshot(roomDoc)

  // Validate emoji against room's configured emojis
  const allowedEmojis = room.settings.emojis.map((e) => e.emoji)
  if (!allowedEmojis.includes(emoji)) {
    res.status(400).json({
      error: 'Invalid emoji. Must be one of the configured emojis for this room.',
      allowedEmojis,
    })
    return
  }

  const reactionRef = db
    .collection('rooms')
    .doc(roomId)
    .collection('reactions')
    .doc()

  // Scripts that do not run our input page get the same response, so they cannot tell they are ignored.
  const keyIssuedAt = deviceKeyIssuedAt(deviceId)
  if (keyIssuedAt !== null) {
    // Reactions are public. Store a hash, so nobody can copy the key of a real device.
    await reactionRef.set({
      emoji,
      roomId,
      deviceHash: deviceHash(deviceId),
      keyIssuedAt: Timestamp.fromMillis(keyIssuedAt),
      timestamp: FieldValue.serverTimestamp(),
      expiresAt: expiresAt(REACTION_TTL_MS),
    })
    logger.info(`Reaction added: ${emoji} in room ${roomId}`)
  } else {
    logger.warn(`Reaction dropped, no valid device key: ${emoji} in room ${roomId}`, {
      userAgent: req.get('User-Agent'),
    })
  }

  res.status(201).json({
    success: true,
    reactionId: reactionRef.id,
    emoji,
    roomId,
  })
}
