import express, { Application } from 'express'
import * as logger from 'firebase-functions/logger'

/**
 * Creates an instance of an Express application with pre-configured middleware
 * for security, CORS and request logging.
 */
export default function createExpressApp(): Application {
  const app = express()

  // Security: Remove header that reveals server type
  app.disable('x-powered-by')

  // Security: Switch to safer parser, disallowing nested params
  app.set('query parser', 'simple')

  // Parse JSON bodies
  app.use(express.json())

  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
      return
    }

    next()
  })

  // Log all requests
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      userAgent: req.get('User-Agent'),
    })
    next()
  })

  return app
}
