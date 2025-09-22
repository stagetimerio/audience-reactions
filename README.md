# ❤️ Audience Reacts | by stagetimer.io

## Backend Firebase Functions

### Deployed Functions

#### 1. `submitReaction` (HTTP Endpoint)
**Purpose**: Accepts audience emoji reactions via HTTP POST requests
- **URL**: `https://us-central1-audience-reactions-prod.cloudfunctions.net/submitReaction/api/rooms/{roomId}/react`
- **Method**: POST
- **Body**: `{"emoji": "heart", "userId": "optional-user-id"}`
- **Features**:
  - Validates emoji types against whitelist: `heart`, `fire`, `laugh`, `clap`, `thumbs`, `star`
  - Implements 600ms rate limiting per user
  - Auto-creates rooms with default emoji configuration
  - Returns structured JSON response with reaction ID

**Example Usage**:
```bash
curl -X POST "https://api-vh67faopca-uc.a.run.app/rooms/test-room/react" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "❤️"}'
```

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
**Purpose**: Processes reactions into analytics data every minute
- **Schedule**: Runs every minute (`* * * * *`)
- **Function**:
  - Aggregates reactions from the last minute
  - Creates analytics batches with emoji counts
  - Deletes processed reactions to prevent accumulation
  - Enables real-time analytics without data buildup

#### 3. `cleanupOldData` (Scheduled Function)
**Purpose**: Maintains database hygiene by removing old data
- **Schedule**: Daily at 2 AM Europe/Berlin (`0 2 * * *`)
- **Function**:
  - Removes analytics data older than 30 days
  - Deletes inactive rooms after 7 days of no activity
  - Cleans up orphaned reactions (safety measure)
  - Prevents database from growing indefinitely

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
**Lifecycle**: Created by `batchAnalytics` → Read by Dashboard → Deleted by `cleanupOldData` after 30 days

## Security Rules

- **Read Access**: Public (enables real-time subscriptions)
- **Write Access**: Functions only (prevents direct client manipulation)
- **Rate Limiting**: 600ms cooldown per user in functions
- **Data Validation**: Emoji whitelist enforcement

## Real-time Architecture

1. **Input Flow**: Client POST → `submitReaction` → Firestore `/reactions`
2. **Display Flow**: Output screens subscribe to `/reactions` → Real-time emoji animations
3. **Analytics Flow**: `batchAnalytics` → Process `/reactions` → Create `/analytics` → Delete processed reactions
4. **Dashboard Flow**: Dashboard subscribes to `/analytics` → Live metrics display
