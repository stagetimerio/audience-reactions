import { createHmac } from 'crypto'
import { defineString } from 'firebase-functions/params'

// Define the secret parameter
const signatureSalt = defineString('SIGNATURE_SALT')

/**
 * Generates a signature for a room ID
 * Uses HMAC-SHA256 with the SIGNATURE_SALT secret
 */
export function generateSignature(roomId: string): string {
  const hmac = createHmac('sha256', signatureSalt.value())
  hmac.update(roomId)
  return hmac.digest('hex')
}

/**
 * Validates a signature for a room ID
 * Compares the provided signature with a newly generated one
 */
export function validateSignature(roomId: string, signature: string): boolean {
  try {
    const expectedSignature = generateSignature(roomId)
    return signature === expectedSignature
  } catch (error) {
    console.error('Signature validation failed:', error)
    return false
  }
}

/**
 * Generates a dashboard URL with signature for a room
 */
export function generateDashboardUrl(roomId: string, baseUrl?: string): string {
  const signature = generateSignature(roomId)
  const base = baseUrl || process.env.CLIENT_BASE_URL || 'http://localhost:5173'
  return `${base}/room/${roomId}?sig=${signature}`
}
