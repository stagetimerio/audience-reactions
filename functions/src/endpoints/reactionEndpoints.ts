import createExpressApp from '../utils/createExpressApp'
import { handleErrors, validateRoomSignature } from '../utils/middleware'
import * as ReactionController from '../controllers/reactionController'
import * as RoomController from '../controllers/roomController'

const router = createExpressApp()

// Room management endpoints
router.post('/rooms', RoomController.createRoom)
router.get('/rooms/:roomId', RoomController.getRoom)
router.patch('/rooms/:roomId', validateRoomSignature, RoomController.updateRoom)

// Signature validation endpoint
router.get('/rooms/:roomId/validate-signature', RoomController.validateSignature)

// Analytics endpoint
router.get('/rooms/:roomId/analytics', RoomController.getAnalytics)

// Reaction endpoint
router.post('/rooms/:roomId/react', ReactionController.submitReaction)

// Error handling
router.use(handleErrors)

export default router
