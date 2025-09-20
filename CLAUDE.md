# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Audience Reacts** is a real-time emoji reaction application that allows audiences to send emoji reactions to a shared display. Built with Vue 3 + Vite frontend and uses Ably for real-time websocket communication.

## Commands

### Development
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Linting
```bash
# Run from project root - covers both root and client
npx eslint .
```

## Architecture

### Key Technologies
- **Frontend**: Vue 3 with Composition API (`<script setup>`)
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS
- **Real-time**: Ably websockets
- **Build Tool**: Vite

### Application Flow
1. **Namespace Creation**: Each session gets a unique `space` parameter that creates an isolated reaction room
2. **Socket Connection**: `SocketService.js` manages Ably connection with auto-reconnection and transaction queuing
3. **Reaction System**: Users click emoji buttons → published via Ably → received by all connected clients → displayed as animated emojis on screen
4. **State Management**: Two main stores:
   - `emotes.js`: Manages emoji display, animations, and statistics
   - `metrics.js`: Tracks subscriber counts

### Key Files
- `client/src/App.vue`: Main app entry, handles socket initialization and namespace management
- `client/src/services/SocketService.js`: Ably websocket abstraction with transaction queue
- `client/src/store/emotes.js`: Emoji state management and animation lifecycle
- `client/src/views/Index.vue`: Main application view
- `client/src/components/EmojiButtons.vue`: User interaction buttons with cooldown
- `client/src/components/EmojiWall.vue`: Animated emoji display

### Environment Setup
- Copy `client/.env.example` to `client/.env`
- Set `PUBLIC_ABLY_API_KEY` for real-time functionality

### Code Style
- ESLint configured for single quotes, no semicolons, 2-space indentation
- Vue 3 Composition API with `<script setup>` syntax
- Pinia stores for state management
- FontAwesome icons via `<FaIcon>` component