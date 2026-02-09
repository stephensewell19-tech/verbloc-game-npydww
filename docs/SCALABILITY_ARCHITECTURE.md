
# VERBLOC Scalability Architecture

## Overview

VERBLOC is designed with post-launch growth in mind, enabling the addition of new features, boards, puzzle modes, and seasonal events without requiring app store updates. This document outlines the scalability systems implemented.

---

## 🎯 Core Scalability Features

### 1. Remote Configuration System

**Purpose**: Control app behavior and features dynamically from the backend.

**Components**:
- `utils/remoteConfig.ts` - Client-side configuration fetching and caching
- `contexts/RemoteConfigContext.tsx` - React context for app-wide config access
- `app/admin-config.tsx` - Admin UI for viewing current configuration

**Key Capabilities**:
- Feature flags (enable/disable features remotely)
- A/B testing (test different variants with users)
- Game configuration (adjust XP multipliers, turn timers, etc.)
- Automatic caching (1-hour cache duration)
- Fallback to default config if backend unavailable

**Usage Example**:
```typescript
import { useRemoteConfig } from '@/contexts/RemoteConfigContext';

function MyComponent() {
  const { isFeatureEnabled } = useRemoteConfig();
  
  const showRankedMode = isFeatureEnabled('rankedMode');
  
  return showRankedMode ? <RankedModeButton /> : null;
}
```

---

### 2. Feature Flags

**Purpose**: Enable/disable features without app updates.

**Current Flags**:
- `rankedMode` - Competitive ranked gameplay
- `aiOpponentDifficulty` - Expanded AI difficulty levels
- `newWordEffects` - New word effect categories
- `communityChallenges` - Community-driven challenges
- `liveMultiplayer` - Real-time multiplayer matches
- `voiceChat` - Voice communication in multiplayer
- `customBoards` - User-created custom boards
- `tournamentMode` - Tournament competitions

**Advanced Features**:
- **Gradual Rollout**: Set `rolloutPercentage` (0-100) to enable for a subset of users
- **Targeted Rollout**: Specify `targetUserIds` to enable for specific users only
- **Consistent Hashing**: Same user always sees same flag state

**Backend Management**:
```bash
# List all feature flags
GET /api/admin/feature-flags

# Create new feature flag
POST /api/admin/feature-flags
{
  "flagName": "newFeature",
  "isEnabled": false,
  "description": "Description of the feature",
  "rolloutPercentage": 50
}

# Update feature flag
PUT /api/admin/feature-flags/newFeature
{
  "isEnabled": true,
  "rolloutPercentage": 100
}
```

---

### 3. A/B Testing

**Purpose**: Test different variants of features to optimize user experience.

**How It Works**:
1. Create an A/B test with multiple variants (e.g., "control", "variant_a", "variant_b")
2. Users are automatically assigned a variant using consistent hashing
3. Same user always gets the same variant
4. Track metrics per variant to determine winner

**Usage Example**:
```typescript
const { getABTestVariant } = useRemoteConfig();

const buttonColorTest = getABTestVariant('buttonColorTest');

const buttonColor = buttonColorTest === 'variant_a' ? 'blue' : 'green';
```

**Backend Management**:
```bash
# Create A/B test
POST /api/admin/ab-tests
{
  "testName": "buttonColorTest",
  "isEnabled": true,
  "variants": ["control", "variant_a", "variant_b"],
  "description": "Test different button colors"
}

# View assignments
GET /api/admin/ab-test-assignments/buttonColorTest
```

---

### 4. Dynamic Board System

**Purpose**: Add new boards without app updates.

**How It Works**:
- Boards are stored in the `boards` database table
- Frontend fetches boards from `/api/boards` endpoint
- New boards can be added via backend API
- Boards support multiple puzzle modes and difficulty levels

**Adding New Boards**:
```bash
POST /api/boards
{
  "name": "New Board",
  "supportedModes": ["solo", "multiplayer"],
  "gridSize": 7,
  "initialLayout": [...],
  "puzzleMode": "clearVaults",
  "winCondition": {...},
  "difficulty": "medium",
  "tags": ["new", "featured"]
}
```

**Board Selection**:
- `app/board-select.tsx` dynamically loads boards from backend
- Supports filtering by difficulty, puzzle mode, and tags
- Random board selection for variety

---

### 5. Seasonal Events System

**Purpose**: Run time-limited events without app updates.

**How It Works**:
- Events are stored in `special_events` table
- Events have start/end dates and are automatically activated/deactivated
- Events can use existing boards or custom event boards
- Custom rules and rewards per event

**Event Structure**:
```typescript
{
  type: 'seasonal' | 'limited_time' | 'tournament',
  name: 'Holiday Challenge',
  description: 'Special holiday-themed puzzles',
  startDate: '2024-12-20T00:00:00Z',
  endDate: '2024-12-27T23:59:59Z',
  boardId: 'uuid-of-board',
  rules: {
    turnLimit: 20,
    scoreMultiplier: 2.0
  },
  rewards: {
    xp: 500,
    cosmetics: ['holiday_badge']
  }
}
```

**Frontend Integration**:
- `app/special-events.tsx` - Lists active events
- `app/special-event-detail.tsx` - Event details and leaderboard
- `components/SpecialEventsCard.tsx` - Home screen event card

---

### 6. Dynamic Game Configuration

**Purpose**: Adjust game parameters without app updates.

**Configurable Parameters**:
```typescript
{
  minAppVersion: '1.0.0',           // Force update if below this version
  maxTurnTimeSeconds: 300,          // Turn timer for live matches
  dailyChallengeRefreshHour: 0,     // UTC hour for daily challenge reset
  maxActiveGames: 10,               // Max concurrent multiplayer games
  xpMultipliers: {
    solo: 1.0,
    multiplayer: 1.2,
    dailyChallenge: 1.5,
    specialEvent: 1.3
  }
}
```

**Usage**:
```typescript
import { getGameConfigValue } from '@/utils/remoteConfig';

const xpMultiplier = await getGameConfigValue('xpMultipliers.solo', 1.0);
```

---

## 🚀 Future Feature Roadmap

### Phase 1: Post-Launch (Months 1-3)
- **Ranked Mode**: Enable via `rankedMode` feature flag
- **AI Difficulty Expansion**: Enable via `aiOpponentDifficulty` flag
- **New Word Effects**: Enable via `newWordEffects` flag

### Phase 2: Growth (Months 4-6)
- **Community Challenges**: Enable via `communityChallenges` flag
- **Custom Boards**: Enable via `customBoards` flag
- **Tournament Mode**: Enable via `tournamentMode` flag

### Phase 3: Advanced (Months 7+)
- **Voice Chat**: Enable via `voiceChat` flag
- **Cross-Platform Tournaments**
- **User-Generated Content**

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

**Feature Adoption**:
- Track which feature flags are enabled per user
- Monitor feature usage rates
- A/B test conversion rates

**Board Performance**:
- Track completion rates per board
- Monitor difficulty ratings
- Identify popular boards

**Event Success**:
- Track event participation rates
- Monitor event completion rates
- Measure reward redemption

**Recommended Tools**:
- Backend logging for feature flag checks
- Analytics events for feature usage
- A/B test result tracking

---

## 🔧 Developer Workflow

### Adding a New Feature

1. **Implement the feature in the app** (behind a feature flag check)
   ```typescript
   const { isFeatureEnabled } = useRemoteConfig();
   
   if (isFeatureEnabled('myNewFeature')) {
     // Show new feature
   }
   ```

2. **Create the feature flag in the backend**
   ```bash
   POST /api/admin/feature-flags
   {
     "flagName": "myNewFeature",
     "isEnabled": false,
     "rolloutPercentage": 0
   }
   ```

3. **Test with targeted rollout**
   ```bash
   PUT /api/admin/feature-flags/myNewFeature
   {
     "rolloutPercentage": 10,
     "targetUserIds": ["test-user-1", "test-user-2"]
   }
   ```

4. **Gradual rollout**
   ```bash
   # 25% of users
   PUT /api/admin/feature-flags/myNewFeature
   { "rolloutPercentage": 25 }
   
   # 50% of users
   PUT /api/admin/feature-flags/myNewFeature
   { "rolloutPercentage": 50 }
   
   # 100% of users
   PUT /api/admin/feature-flags/myNewFeature
   { "rolloutPercentage": 100, "isEnabled": true }
   ```

### Running an A/B Test

1. **Implement variants in the app**
   ```typescript
   const variant = getABTestVariant('myTest');
   
   if (variant === 'variant_a') {
     // Show variant A
   } else if (variant === 'variant_b') {
     // Show variant B
   } else {
     // Show control
   }
   ```

2. **Create the A/B test**
   ```bash
   POST /api/admin/ab-tests
   {
     "testName": "myTest",
     "isEnabled": true,
     "variants": ["control", "variant_a", "variant_b"]
   }
   ```

3. **Monitor results and pick winner**
   ```bash
   GET /api/admin/ab-test-assignments/myTest
   ```

4. **Roll out winning variant**
   - Update app to use winning variant by default
   - Disable A/B test
   - Remove variant code in next release

---

## 🛡️ Best Practices

### Feature Flags
- ✅ Always provide a default/fallback behavior
- ✅ Use descriptive flag names (e.g., `rankedMode` not `feature1`)
- ✅ Document what each flag controls
- ✅ Clean up old flags after full rollout
- ❌ Don't nest feature flags too deeply
- ❌ Don't use flags for permanent configuration

### A/B Testing
- ✅ Test one variable at a time
- ✅ Run tests for sufficient duration (1-2 weeks minimum)
- ✅ Ensure statistical significance before declaring winner
- ✅ Document test hypothesis and success metrics
- ❌ Don't run too many tests simultaneously
- ❌ Don't change test variants mid-test

### Remote Configuration
- ✅ Cache configuration locally (1-hour cache)
- ✅ Provide sensible defaults
- ✅ Version your configuration schema
- ✅ Test configuration changes in staging first
- ❌ Don't fetch config on every screen render
- ❌ Don't store sensitive data in remote config

---

## 📱 Admin Tools

### Viewing Current Configuration

Navigate to **Profile → Developer Tools → Remote Configuration** to view:
- All active feature flags
- Current A/B tests and assignments
- Game configuration parameters
- Last update timestamp

### Refreshing Configuration

The app automatically refreshes configuration every hour. To force refresh:
1. Open Remote Configuration screen
2. Tap "Refresh Configuration" button

---

## 🎓 Summary

VERBLOC's scalability architecture enables:

✅ **No App Updates Required** for:
- Enabling/disabling features
- Adding new boards
- Running seasonal events
- Adjusting game parameters
- A/B testing new features

✅ **Gradual Rollouts**:
- Test with small user groups
- Gradually increase rollout percentage
- Target specific users for beta testing

✅ **Data-Driven Decisions**:
- A/B test feature variants
- Monitor feature adoption
- Optimize based on metrics

✅ **Future-Proof**:
- Easy to add new features
- Flexible configuration system
- Scalable event system

This architecture ensures VERBLOC can grow and evolve rapidly without the constraints of app store review cycles.
