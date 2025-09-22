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
- `client/src/App.vue`: Main app entry, handles room initialization
- `client/src/store/emotes.js`: Emoji state management and animation lifecycle
- `client/src/views/Index.vue`: Main application view
- `client/src/components/EmojiButtons.vue`: User interaction buttons with cooldown
- `client/src/components/EmojiWall.vue`: Animated emoji display

#### Backend (Firebase Functions)
- `functions/src/endpoints/reactionEndpoints.ts`: HTTP API routes
- `functions/src/controllers/reactionController.ts`: Reaction submission logic
- `functions/src/controllers/roomController.ts`: Room management and analytics
- `functions/src/schedules/analytics.ts`: Scheduled analytics processing
- `functions/src/schedules/cleanup.ts`: Scheduled data cleanup
- `functions/src/types/index.ts`: TypeScript interfaces and types
- `functions/src/utils/converters.ts`: Firestore document converters

### API Endpoints
- `POST /rooms` - Create new room
- `GET /rooms/{roomId}` - Get room info
- `POST /rooms/{roomId}/react` - Submit reaction
- `GET /rooms/{roomId}/analytics` - Get analytics data

### Environment Setup
- Copy `client/.env.example` to `client/.env`
- Firebase project configuration in `functions/src/firebase-setup.ts`
- Production API: `https://api-vh67faopca-uc.a.run.app`

### Code Style
- ESLint configured for single quotes, no semicolons, 2-space indentation, space inside curly braces
- Vue 3 Composition API with `<script setup>` syntax (frontend)
- TypeScript with strict types and utility type patterns (backend)
- Express v5 with native async function handling
- Pinia stores for state management
- FontAwesome icons via `<FaIcon>` component

### Database Schema
- `/rooms/{roomId}`: Room configuration and metadata
- `/rooms/{roomId}/reactions/{reactionId}`: Real-time reaction stream (temporary)
- `/rooms/{roomId}/analytics/{isoTimestamp}`: Time-windowed analytics batches

### Deployment
- Firebase Functions deployed to `us-central1`
- Firestore security rules allow public read, functions-only write
- Scheduled functions: analytics (every minute), cleanup (daily 2 AM)