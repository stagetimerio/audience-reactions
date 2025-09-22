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
# Run from project root - covers both root and client
npx eslint .

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
4. **Analytics Processing**: Scheduled function processes reactions every minute → creates analytics batches → deletes processed reactions
5. **Data Cleanup**: Daily cleanup removes old analytics (30 days) and inactive rooms (30 days)

### Key Files

#### Frontend
- `client/src/App.vue`: Main app entry with router-view
- `client/src/views/Index.vue`: Landing page with project overview
- `client/src/views/Input.vue`: ✅ Mobile-first audience reaction interface
- `client/src/views/NotFound.vue`: 404 error page
- `client/src/router/index.js`: Vue Router configuration
- `client/src/composables/useSpamProtection.js`: ✅ Spam protection with localStorage persistence
- `client/src/composables/useRoomApi.js`: ✅ HTTP API integration
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
- `POST /rooms` - Create new room (supports optional backgroundImage URL)
- `GET /rooms/{roomId}` - Get room info with emojis and settings
- `POST /rooms/{roomId}/react` - Submit reaction (with 600ms backend rate limiting)
- `GET /rooms/{roomId}/analytics` - Get analytics data

### URL Structure
- `/` - Landing page
- `/room/{roomId}/input` - ✅ Mobile audience reaction interface
- `/room/{roomId}/output` - 🔄 Animated emoji display (planned)
- `/room/{roomId}/dashboard` - 🔄 Analytics and room management (planned)

### Environment Setup
- Environment variables: `client/.env` with `PUBLIC_API_BASE_URL=https://api-vh67faopca-uc.a.run.app`
- Firebase project configuration in `functions/src/firebase-setup.ts`
- Production API: `https://api-vh67faopca-uc.a.run.app`

### Features Implemented ✅
- **Input Screen**: Mobile-first reaction interface with spam protection
- **Spam Protection**: 10 clicks in 10 seconds → 5-second cooldown (persists through reloads)
- **Visual Feedback**: Loading/success states for buttons, progress bar for cooldown
- **Background Images**: Optional room background images (cover size)
- **Mobile Optimization**: Touch-friendly buttons, no zoom, large targets (96px height)
- **Error Handling**: Graceful fallbacks for missing rooms

### Code Style
- ESLint configured for single quotes, no semicolons, 2-space indentation, space inside curly braces
- Vue 3 Composition API with `<script setup>` syntax (frontend)
- TypeScript with strict types and utility type patterns (backend)
- Express v5 with native async function handling
- Pinia stores for state management
- FontAwesome icons via `<FaIcon>` component

### Database Schema
- `/rooms/{roomId}`: Room configuration with name, emojis, optional backgroundImage
- `/rooms/{roomId}/reactions/{reactionId}`: Real-time reaction stream (temporary)
- `/rooms/{roomId}/analytics/{isoTimestamp}`: Time-windowed analytics batches

### Room Data Structure
```typescript
interface Room {
  id: string
  name: string
  settings: {
    emojis: Array<{ emoji: string, label?: string }>
    backgroundImage?: string // Optional full URL
  }
  createdAt: Date
  updatedAt: Date
}
```

### Deployment
- Firebase Functions deployed to `us-central1`
- Firestore security rules allow public read, functions-only write
- Scheduled functions: analytics (every minute), cleanup (daily 2 AM)