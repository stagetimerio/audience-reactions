```
                      _   _
  _ __ ___  __ _  ___| |_(_) ___  _ __  ___
 | '__/ _ \/ _` |/ __| __| |/ _ \| '_ \/ __|
 | | |  __/ (_| | (__| |_| | (_) | | | \__ \
 |_|  \___|\__,_|\___|\__|_|\___/|_| |_|___/

```

# ❤️ Audience Reacts | by stagetimer.io

A real-time emoji reaction system designed for large-scale live events (50k+ concurrent users). Audiences submit reactions via mobile devices, displayed on shared screens with real-time analytics.

## 🚀 Current Status

### ✅ Completed Features
- **Input Screen**: Mobile-first audience reaction interface (`/room/{roomId}/input`)
- **Output Screen**: Real-time animated emoji display (`/room/{roomId}/output`)
- **Dashboard Screen**: Secure room management interface (`/room/{roomId}?sig={signature}`)
- **Spam Protection**: Intelligent cooldown system (10 clicks/10s → 5s cooldown)
- **Visual Feedback**: Loading states, success animations, progress bars
- **Background Images**: Optional custom room backgrounds (separate for input/output)
- **Mobile Optimized**: Touch-friendly, large buttons, no zoom issues
- **Firebase Backend**: Production-ready API with analytics processing
- **Real-time Display**: Firebase subscription with performance optimization
- **Mouse Help System**: One-time overlay with OBS/vMix integration guide
- **Transparent Background**: Perfect for streaming overlays
- **Signature Authentication**: HMAC-SHA256 secured dashboard access
- **Room Management**: Update name, emojis (2-6), backgrounds via dashboard
- **QR Code Generation**: Easy sharing with built-in QR codes
- **Live Analytics**: Real-time stacked area chart with 30-minute rolling window ✅
- **Analytics Dashboard**: Chart.js integration with emoji breakdown and totals ✅
- **High-Frequency Data**: 20-second analytics batches for granular insights ✅

### 🔄 Next Phase
- **Advanced Analytics**: Historical data comparison and export functionality

## Backend Firebase Functions

### Deployed Functions

### Current API Endpoints

#### Room Management
- **Create Room**: `POST /rooms`
  ```bash
  curl -X POST "https://api-vh67faopca-uc.a.run.app/rooms" \
    -H "Content-Type: application/json" \
    -d '{"name": "My Event", "emojis": [{"emoji": "❤️"}, {"emoji": "🔥"}, {"emoji": "👏"}]}'
  ```
  Returns `dashboardUrl` with signature for admin access.

- **Get Room**: `GET /rooms/{roomId}` - Returns room config with emojis and settings

- **Update Room**: `PATCH /rooms/{roomId}?sig={signature}`
  ```bash
  curl -X PATCH "https://api-vh67faopca-uc.a.run.app/rooms/{roomId}?sig={signature}" \
    -H "Content-Type: application/json" \
    -d '{"name": "Updated Name", "settings": {"emojis": [{"emoji": "😊"}, {"emoji": "😍"}]}}'
  ```

- **Validate Signature**: `GET /rooms/{roomId}/validate-signature?sig={signature}` - Validates dashboard access

#### Reaction Submission
- **Submit Reaction**: `POST /rooms/{roomId}/react`
  ```bash
  curl -X POST "https://api-vh67faopca-uc.a.run.app/rooms/{roomId}/react" \
    -H "Content-Type: application/json" \
    -d '{"emoji": "❤️"}'
  ```
- **Features**: 600ms backend rate limiting, emoji validation, auto room creation

**Response**:
```json
{
  "success": true,
  "reactionId": "abc123",
  "emoji": "❤️",
  "roomId": "test-room"
}
```

#### 2. `batchAnalytics` (Scheduled Function)
**Purpose**: Processes reactions into analytics data every 20 seconds
- **Schedule**: Runs every minute with 3 executions (0s, 20s, 40s)
- **Function**:
  - Aggregates reactions from the last 20 seconds
  - Creates analytics batches with emoji counts
  - Deletes processed reactions to prevent accumulation
  - Enables high-frequency real-time analytics without data buildup

#### Data expiry (Firestore TTL)
Rooms, analytics and reactions have an `expiresAt` field. Firestore TTL deletes a doc after that
time. The policies are in `firestore.indexes.json`. TTL does not delete subcollections, so each
collection has its own `expiresAt` (`functions/src/utils/expiry.ts`):
- Rooms: **never expire.** `expiresAt: null`, and there is no TTL policy for rooms.
  `batchAnalytics` sets `lastUsedAt` on the room when it processes its reactions
- Analytics: 30 days after the window end
- Reactions: 1 hour (a safety net — `batchAnalytics` deletes them first)

#### 4. `processAnalyticsRange` (Manual Function)
**Purpose**: Backup function for manual analytics processing
- **Schedule**: Disabled by default (`0 0 * * *`)
- **Function**: Can be manually triggered for specific date ranges or backfilling

## Database Collections

### `/rooms/{roomId}`
**Purpose**: Room configuration and metadata
```typescript
{
  name: string              // Display name
  createdAt: Timestamp      // Room creation time
  lastActivity: Timestamp   // Last reaction received
  settings: {
    emojis: Array<{
      emoji: string         // '❤️', '🔥', etc.
      label?: string        // Optional display label
    }>
  }
}
```

### `/rooms/{roomId}/reactions/{reactionId}`
**Purpose**: Real-time reaction stream for live display
```typescript
{
  emoji: string             // Emoji character (e.g., '❤️')
  timestamp: Timestamp      // When reaction was sent
}
```
**Lifecycle**: Created by `submitReaction` → Read by Output screens → Deleted by `batchAnalytics`

### `/rooms/{roomId}/analytics/{batchId}`
**Purpose**: Time-windowed analytics for dashboard metrics
```typescript
{
  startTime: Timestamp      // Window start time
  endTime: Timestamp        // Window end time
  counts: Record<string, number>  // Emoji counts: {"❤️": 15, "🔥": 8}
  total: number             // Total reactions in window
  createdAt: Timestamp      // Batch creation time
}
```
**Lifecycle**: Created by `batchAnalytics` → Read by Dashboard → Deleted by Firestore TTL (`expiresAt`) after 30 days

## Security Rules

- **Read Access**: Public (enables real-time subscriptions)
- **Write Access**: Functions only (prevents direct client manipulation)
- **Rate Limiting**: 600ms cooldown per user in functions
- **Data Validation**: Emoji whitelist enforcement

## Real-time Architecture

1. **Input Flow**: Client POST → `submitReaction` → Firestore `/reactions`
2. **Display Flow**: Output screens subscribe to `/reactions` → Real-time emoji animations (with 0-120ms random delay)
3. **Analytics Flow**: `batchAnalytics` → Process `/reactions` → Create `/analytics` → Delete processed reactions
4. **Dashboard Flow**: Dashboard subscribes to `/analytics` → Live metrics display

## Frontend Architecture

### Key Components
- **Firebase SDK v12**: Real-time Firestore subscriptions
- **Vue 3 + Composition API**: Modern reactive framework
- **EmojiWall Component**: Reusable animated emoji display
- **Performance Optimization**: 50-emoji limit with FIFO cleanup
- **Old Reaction Filtering**: Ignores snapshots older than 5 seconds
- **Natural Timing**: Random delays prevent synchronized emoji bursts

### URL Structure
- **Input**: `/room/{roomId}/input` - Mobile audience interface
- **Output**: `/room/{roomId}/output` - Display screen for projectors/streaming
- **Dashboard**: `/room/{roomId}/dashboard` - Management interface (planned)

### Environment Configuration
- **Production**: Uses live Firebase (`audience-reactions-prod`)
- **Development**: Optional emulator mode (`VITE_USE_FIREBASE_EMULATOR=true`)
- **Overlay Ready**: Transparent background for OBS/vMix integration
