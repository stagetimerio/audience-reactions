import { ReplaceWithTimestamp } from '../utils/typeUtils'

// Application interfaces (main types for application logic)
export interface Room {
  id: string
  name: string
  createdAt: Date
  lastActivity: Date
  settings: {
    emojis: Array<{
      emoji: string
      label?: string
    }>
  }
}

export interface Reaction {
  id: string
  emoji: string
  timestamp: Date
}

export interface AnalyticsBatch {
  id: string
  startTime: Date
  endTime: Date
  counts: Record<string, number>
  total: number
  createdAt: Date
}

// System fields added by converters
type RoomSystemFields = 'id'
type ReactionSystemFields = 'id'
type AnalyticsBatchSystemFields = 'id'

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
