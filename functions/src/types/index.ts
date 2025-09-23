import { ReplaceWithTimestamp } from '../utils/typeUtils'

// Application interfaces (main types for application logic)
export interface Room {
  id: string
  name: string
  settings: {
    emojis: Array<{
      emoji: string
      label?: string
    }>
    backgroundInput?: string // Optional full URL or solid color for input view
    backgroundOutput?: string // Optional full URL or solid color for output view
  }
  createdAt: Date
  updatedAt: Date
}

export interface Reaction {
  id: string
  emoji: string
  roomId: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsBatch {
  id: string
  endTime: Date
  counts: Record<string, number>
  total: number
  createdAt: Date
  updatedAt: Date
}

// System fields added by converters (id, createdAt, updatedAt)
type RoomSystemFields = 'id' | 'createdAt' | 'updatedAt'
type ReactionSystemFields = 'id' | 'createdAt' | 'updatedAt'
type AnalyticsBatchSystemFields = 'id' | 'createdAt' | 'updatedAt'

// Firestore document types (what's actually stored in DB)
export type RoomFirestore = ReplaceWithTimestamp<Omit<Room, RoomSystemFields>>
export type ReactionFirestore = ReplaceWithTimestamp<Omit<Reaction, ReactionSystemFields>>
export type AnalyticsBatchFirestore = ReplaceWithTimestamp<Omit<AnalyticsBatch, AnalyticsBatchSystemFields>>

// Default room emojis
export const DEFAULT_EMOJIS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '👍', label: 'Like' },
  { emoji: '⭐', label: 'Amazing' },
] as const
