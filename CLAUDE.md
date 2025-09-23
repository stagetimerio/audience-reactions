# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Audience Reacts** is a real-time emoji reaction application that allows audiences to send emoji reactions to a shared display. Built with Vue 3 + Vite frontend and Firebase Functions backend with Firestore for real-time data synchronization.

## Commands

### Frontend Development
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Firebase Functions Development
```bash
cd functions
npm run dev      # Start local Firebase emulator
npm run build    # Build functions for deployment
npm run deploy   # Deploy to Firebase
```

### Linting & Type Checking
```bash
# ESLint (client - modern flat config)
cd client && npx eslint

# TypeScript compilation check (functions)
cd functions && npm run build
```

## Architecture

### Key Technologies
- **Frontend**: Vue 3 with Composition API (`<script setup>`)
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS
- **Backend**: Firebase Functions v2 with TypeScript
- **Database**: Firestore with real-time subscriptions
- **Real-time**: Firestore real-time listeners
- **Build Tool**: Vite (frontend), TypeScript compiler (backend)

### Application Flow
1. **Room Management**: Each session uses a unique `roomId` that creates an isolated reaction room
2. **Reaction Submission**: Users click emoji buttons → HTTP POST to Firebase Functions → stored in Firestore
3. **Real-time Display**: Frontend subscribes to Firestore `/rooms/{roomId}/reactions` → displays animated emojis on screen
4. **Analytics Processing**: Scheduled function processes reactions every 20 seconds → creates analytics batches → deletes processed reactions
5. **Data Cleanup**: Daily cleanup removes old analytics (30 days) and inactive rooms (30 days)
6. **Live Analytics**: Real-time dashboard displays 30-minute rolling window with 20-second granularity

### Key Files

#### Frontend
- `client/src/App.vue`: Main app entry with router-view
- `client/src/views/Index.vue`: Landing page with project overview
- `client/src/views/Input.vue`: ✅ Mobile-first audience reaction interface
- `client/src/views/Output.vue`: ✅ Real-time emoji display with Firebase subscription
- `client/src/views/NotFound.vue`: 404 error page
- `client/src/router/index.js`: Vue Router configuration
- `client/src/composables/useSpamProtection.js`: ✅ Spam protection with localStorage persistence
- `client/src/composables/useRoomApi.js`: ✅ HTTP API integration
- `client/src/composables/useRealtimeReactions.js`: ✅ Firebase real-time subscription
- `client/src/composables/useRealtimeAnalytics.js`: ✅ Real-time analytics with 30-minute rolling window
- `client/src/services/firebase.js`: ✅ Firebase SDK configuration
- `client/src/config/firebase.js`: ✅ Static Firebase project configuration
- `client/src/components/EmojiWall.vue`: ✅ Animated emoji display component
- `client/src/components/ReactionChart.vue`: ✅ Chart.js stacked area chart for analytics
- `client/src/plugins/fontawesome.js`: FontAwesome icon setup

#### Backend (Firebase Functions)
- `functions/src/endpoints/reactionEndpoints.ts`: HTTP API routes
- `functions/src/controllers/reactionController.ts`: Reaction submission logic
- `functions/src/controllers/roomController.ts`: Room management and analytics
- `functions/src/schedules/analytics.ts`: Scheduled analytics processing
- `functions/src/schedules/cleanup.ts`: Scheduled data cleanup
- `functions/src/types/index.ts`: TypeScript interfaces and types
- `functions/src/utils/converters.ts`: Firestore document converters

### API Endpoints
- `POST /rooms` - Create new room (returns dashboardUrl with signature)
- `GET /rooms/{roomId}` - Get room info with emojis and settings
- `PATCH /rooms/{roomId}?sig={signature}` - Update room settings (requires valid signature)
- `GET /rooms/{roomId}/validate-signature?sig={signature}` - Validate dashboard signature
- `POST /rooms/{roomId}/react` - Submit reaction (with 600ms backend rate limiting)
- `GET /rooms/{roomId}/analytics` - Get analytics data

### URL Structure
- `/` - Landing page
- `/room/{roomId}/input` - ✅ Mobile audience reaction interface
- `/room/{roomId}/output` - ✅ Animated emoji display with real-time Firebase subscription
- `/room/{roomId}?sig={signature}` - ✅ Dashboard for room management (signature-protected)

### Environment Setup
- Environment variables: `client/.env` with `PUBLIC_API_BASE_URL=https://api-vh67faopca-uc.a.run.app`
- Firebase project configuration in `functions/src/firebase-setup.ts`
- Production API: `https://api-vh67faopca-uc.a.run.app`

### Features Implemented ✅
- **Input Screen**: Mobile-first reaction interface with spam protection
- **Output Screen**: Real-time animated emoji display with Firebase subscription
- **Dashboard Screen**: Signature-protected room management with live analytics
- **Live Analytics**: Real-time stacked area chart with 30-minute rolling window
- **Spam Protection**: 10 clicks in 10 seconds → 5-second cooldown (persists through reloads)
- **Visual Feedback**: Loading/success states for buttons, progress bar for cooldown
- **Background Images**: Optional room background images (cover size for input screens)
- **Mobile Optimization**: Touch-friendly buttons, no zoom, large targets (96px height)
- **Error Handling**: Graceful fallbacks for missing rooms
- **Real-time Display**: Firebase subscription with 50-emoji performance limit
- **Mouse Help System**: One-time overlay with demo emojis and OBS/vMix integration guide
- **Transparent Background**: Perfect for streaming overlays and projector displays
- **Analytics Dashboard**: Chart.js integration with emoji breakdown and total counts
- **High-Frequency Analytics**: 20-second batch intervals for granular data visualization

### Code Style
- **ESLint**: Each subdirectory (`client/`, `functions/`) has independent ESLint configuration
  - `client/`: Modern flat config with @stylistic plugin for Vue 3 + Composition API
  - `functions/`: Traditional ESLint config for TypeScript backend code
- **Frontend**: Single quotes, no semicolons, 2-space indentation, space inside curly braces
- **Vue 3**: Composition API with `<script setup>` syntax
- **TypeScript**: Strict types and utility type patterns (backend)
- **Express v5**: Native async function handling
- **Pinia**: State management
- **FontAwesome**: Icons via `<FaIcon>` component

### Database Schema
- `/rooms/{roomId}`: Room configuration with name, emojis, optional background images
- `/rooms/{roomId}/reactions/{reactionId}`: Real-time reaction stream (temporary)
- `/rooms/{roomId}/analytics/{isoTimestamp}`: Time-windowed analytics batches

### Type System

#### Core Application Types (`functions/src/types/index.ts`)
The application uses a two-tier type system to handle the differences between JavaScript/TypeScript Date objects and Firestore Timestamp objects:

1. **Application Types**: Used in business logic with native Date objects
   - `Room`: Room configuration with emojis and background settings
   - `Reaction`: Individual emoji reaction with timestamp
   - `AnalyticsBatch`: Aggregated analytics for a time window

2. **Firestore Types**: What's actually stored in the database
   - `RoomFirestore`, `ReactionFirestore`, `AnalyticsBatchFirestore`
   - These omit system fields (id, createdAt, updatedAt) and replace Date with Timestamp

```typescript
// Application interface
interface Room {
  id: string
  name: string
  settings: {
    emojis: Array<{ emoji: string, label?: string }>
    backgroundInput?: string  // Optional URL/color for input view
    backgroundOutput?: string // Optional URL/color for output view
  }
  createdAt: Date
  updatedAt: Date
}

// Firestore storage type (auto-generated)
type RoomFirestore = ReplaceWithTimestamp<Omit<Room, 'id' | 'createdAt' | 'updatedAt'>>
```

#### Type Converters (`functions/src/utils/converters.ts`)
The converter system automatically handles the transformation between Firestore documents and application types:

1. **Generic `fromSnapshot` function**:
   - Adds system fields (id, createdAt, updatedAt) from document metadata
   - Converts Firestore Timestamps to JavaScript Dates
   - Applies default values if specified
   - Handles nested date fields via configuration

2. **Specialized converters**:
   - `roomFromSnapshot`: Converts Room documents
   - `reactionFromSnapshot`: Converts Reactions (handles timestamp field)
   - `analyticsBatchFromSnapshot`: Converts Analytics (handles startTime, endTime)

```typescript
// Usage example
const roomDoc = await db.collection('rooms').doc(roomId).get()
const room = roomFromSnapshot(roomDoc) // Returns fully typed Room with Dates
```

#### Type Utilities (`functions/src/utils/typeUtils.ts`)
- `ReplaceWithTimestamp<T>`: Recursively replaces Date fields with Firestore Timestamp
- `ReplaceWithString<T>`: Recursively replaces Date fields with ISO strings (for JSON serialization)

This type system ensures:
- Type safety throughout the application
- Automatic handling of Firestore's Timestamp ↔ Date conversions
- Consistent addition of system fields (id, createdAt, updatedAt)
- Clean separation between storage and application concerns

### Deployment
- Firebase Functions deployed to `us-central1`
- Firestore security rules allow public read, functions-only write
- Scheduled functions: analytics (every 20 seconds), cleanup (daily 2 AM)
