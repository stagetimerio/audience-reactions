import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK once
try {
  initializeApp()
} catch (error) {
  // App already initialized, continue with existing instance
}

// Export configured Firestore instance
export const db = getFirestore()
