import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { firebaseConfig as baseConfig } from '../config/firebase.js'

// Firebase configuration with API key from environment
const firebaseConfig = {
  ...baseConfig,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
const db = getFirestore(app)

// Connect to emulator if explicitly enabled
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log('[firebase.js] Connected to Firestore emulator on localhost:8080')
  } catch (error) {
    console.log('[firebase.js] Firestore emulator connection failed:', error.message)
  }
} else {
  console.log('[firebase.js] Using production Firestore:', firebaseConfig.projectId)
}

export { db }
