/**
 * Firebase Functions for Audience Reactions App
 *
 * Export all function modules for deployment
 */

import { setGlobalOptions } from 'firebase-functions'
import { onRequest } from 'firebase-functions/v2/https'
import reactionEndpoints from './endpoints/reactionEndpoints'

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 })

// Export HTTP endpoints
export const api = onRequest(
  {
    maxInstances: 10,
    cors: true,
  },
  reactionEndpoints
)

// Export analytics functions
export { batchAnalytics } from './schedules/analytics'

// Export cleanup functions
export { cleanupOldData } from './schedules/cleanup'
