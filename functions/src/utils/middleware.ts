import { Request, Response, NextFunction } from 'express'
import * as logger from 'firebase-functions/logger'
import { validateSignature } from './signature'

/**
 * Error handling middleware
 * Express v5 automatically handles async functions and Promise rejections
 */
export function handleErrors(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Express route error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    body: req.body,
  })

  if (res.headersSent) return next(error)

  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  })
}

/**
 * Middleware to validate room dashboard signatures
 * Expects signature in query parameter 'sig'
 */
export function validateRoomSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const { roomId } = req.params
    const signature = req.query.sig as string

    if (!roomId) {
      res.status(400).json({
        error: 'Room ID is required',
      })
      return
    }

    if (!signature) {
      res.status(401).json({
        error: 'Signature is required',
        message: 'Dashboard access requires a valid signature',
      })
      return
    }

    const isValid = validateSignature(roomId, signature)

    if (!isValid) {
      res.status(403).json({
        error: 'Invalid signature',
        message: 'The provided signature is not valid for this room',
      })
      return
    }

    // Signature is valid, proceed to the next middleware/route
    next()
  } catch (error) {
    logger.error('Signature validation middleware error:', error)
    res.status(500).json({
      error: 'Signature validation failed',
      message: 'Unable to validate signature',
    })
  }
}
