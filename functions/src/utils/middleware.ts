import { Request, Response, NextFunction } from 'express'
import * as logger from 'firebase-functions/logger'

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
