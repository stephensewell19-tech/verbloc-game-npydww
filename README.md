
# VERBLOC

A production-ready, cross-platform word puzzle game built with React Native and Expo.

## 🎮 Game Concept

VERBLOC is a social word + puzzle game where players form words that actively manipulate and change a puzzle board. Words are not just for scoring - every word is a strategic action that alters the game state and affects future moves.

## ✨ Features

### Core Gameplay
- **Interactive Board**: 6x6 grid of letter tiles with special bonus tiles
- **Word Formation**: Select adjacent tiles to form valid words (minimum 3 letters)
- **Dynamic Board**: Tiles refresh with new letters after each word
- **Special Tiles**:
  - 2× tiles double letter value
  - 3× tiles triple letter value
  - ★ wildcard tiles double word score
- **Scoring System**: Points based on letter values, word length, and special tiles

### Game Modes
- **Solo Play**: Practice and improve your skills
- **Multiplayer**: Challenge friends or random players (coming soon)
- **Daily Challenge**: Compete on the leaderboard (coming soon)

### Social Features
- **Player Stats**: Track games played, wins, high scores, and streaks
- **Leaderboards**: Global and weekly rankings (coming soon)
- **Achievements**: Unlock rewards for milestones (coming soon)

### Authentication
- Email/password login
- Google OAuth
- Apple OAuth

## 🏗️ Architecture

### Frontend
- **Framework**: React Native with Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **State Management**: React hooks and context

### Backend
- **Authentication**: Better Auth
- **Database**: PostgreSQL with JSONB for board state
- **API**: RESTful endpoints for game logic, stats, and multiplayer

### Cross-Platform Support
- iOS (native tabs with SF Symbols)
- Android (Material Design icons)
- Web (responsive design)

## 📱 Screens

1. **Home Screen** (`app/(tabs)/(home)/index.tsx`)
   - Main menu with game mode selection
   - Play Solo, Multiplayer, Daily Challenge buttons

2. **Game Screen** (`app/game.tsx`)
   - Interactive game board
   - Word selection and submission
   - Score tracking and move history
   - Instructions modal

3. **Profile Screen** (`app/(tabs)/profile.tsx`)
   - Player stats dashboard
   - Leaderboard access
   - Settings and sign out

4. **Auth Screen** (`app/auth.tsx`)
   - Email/password login
   - Social OAuth (Google, Apple)

## 🎨 Design

### Color Palette
- **Primary**: Vibrant Indigo (#6366F1)
- **Secondary**: Purple (#8B5CF6)
- **Accent**: Pink (#EC4899)
- **Background**: Deep Navy (#0F172A)
- **Success**: Green (#10B981)
- **Highlight**: Gold (#FBBF24)

### Typography
- Clean, modern sans-serif fonts
- Bold headings for impact
- Clear hierarchy for readability

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### Environment Setup

The backend URL is configured in `app.json`:

```json
{
  "extra": {
    "backendUrl": "YOUR_BACKEND_URL"
  }
}
```

## 🎯 Game Rules

1. **Word Formation**
   - Select tiles by tapping them in sequence
   - Tiles must be adjacent (horizontally, vertically, or diagonally)
   - Words must be at least 3 letters long
   - Only valid English words are accepted

2. **Scoring**
   - Each letter has a point value (A=1, Z=10, etc.)
   - Special tiles multiply letter or word scores
   - Longer words earn bonus points (6+ letters: +10, 8+ letters: +20)

3. **Board Mechanics**
   - After submitting a word, used tiles refresh with new letters
   - Special tiles appear randomly (15% chance)
   - Board state changes dynamically based on your moves

## 🔧 Technical Details

### Key Components

- **GameBoard** (`components/GameBoard.tsx`): Interactive tile grid with animations
- **TileComponent**: Individual tile with selection state and special effects
- **Game Logic** (`utils/gameLogic.ts`): Word validation, scoring, board generation

### State Management

- Local state for game board and selection
- Context API for authentication
- Backend sync for multiplayer and stats

### Performance Optimizations

- Reanimated for smooth 60fps animations
- Memoized components to prevent unnecessary re-renders
- Efficient board state updates

## 📊 Backend Integration

The game is fully integrated with a backend API deployed at:
```
https://4f3u7ax6jwateez5p5mamqzec794hew7.app.specular.dev
```

### Integrated Features

✅ **Authentication**
- Email/password sign up and sign in
- Google OAuth (web popup flow)
- Apple OAuth (iOS native + web popup)
- Session persistence with auto-refresh
- Bearer token authentication

✅ **Player Stats**
- Automatic stats initialization on signup
- Real-time stats tracking (games played, wins, high score, streak, etc.)
- Experience points and level progression
- Stats displayed on profile screen

✅ **Solo Game**
- Backend-synced game creation
- Move validation and scoring
- Board state persistence
- Game completion tracking

✅ **Multiplayer** (Basic Integration)
- Create multiplayer games
- Active games tracking
- Invite code generation
- Full gameplay coming soon

✅ **Daily Challenge** (Basic Integration)
- Fetch today's challenge
- Check completion status
- Target score display
- Full gameplay coming soon

### API Endpoints

#### Authentication
- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/sign-up` - Create new account
- `GET /api/auth/session` - Get current session

#### Player Stats
- `GET /api/player/stats` - Get current user's stats
- `POST /api/player/stats/init` - Initialize stats for new user

#### Solo Game
- `POST /api/game/solo/start` - Start a new solo game
- `POST /api/game/solo/:gameId/move` - Submit a move
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/complete` - Mark game as completed

#### Multiplayer
- `POST /api/game/multiplayer/create` - Create a multiplayer game
- `POST /api/game/multiplayer/:gameId/join` - Join a multiplayer game
- `POST /api/game/multiplayer/:gameId/move` - Submit a move in multiplayer
- `GET /api/game/multiplayer/active` - Get user's active multiplayer games

#### Daily Challenge
- `GET /api/daily-challenge/today` - Get today's daily challenge
- `POST /api/daily-challenge/:challengeId/complete` - Submit daily challenge completion
- `GET /api/daily-challenge/leaderboard` - Get today's leaderboard

#### Leaderboard
- `GET /api/leaderboard/global` - Get global leaderboard by experience points
- `GET /api/leaderboard/weekly` - Get weekly leaderboard by wins this week

### Testing the Integration

#### 1. Test Authentication
```bash
# Start the app
npm run web

# Create a test account
Email: test@verbloc.com
Password: TestPassword123!

# Verify:
# ✓ Account created successfully
# ✓ Redirected to home screen
# ✓ Player stats initialized
# ✓ Session persists on reload
```

#### 2. Test Solo Game
```bash
# From home screen, tap "Play Solo"

# Verify:
# ✓ New game created on backend
# ✓ Board state loaded from server
# ✓ Can select tiles and form words
# ✓ Moves submitted to backend
# ✓ Score tracked correctly
# ✓ "New Game" completes current game
```

#### 3. Test Player Stats
```bash
# Navigate to Profile tab

# Verify:
# ✓ Stats loaded from backend
# ✓ Shows games played, wins, high score
# ✓ Shows streak, words formed, level, XP
# ✓ Stats update after completing games
```

#### 4. Test Session Persistence
```bash
# Sign in, then reload the page/app

# Verify:
# ✓ User stays signed in
# ✓ No redirect loop
# ✓ Session auto-refreshes every 5 minutes
```

### Architecture Highlights

**Session Persistence**
- Auth initialization flow prevents redirect loops
- Loading screen shown while checking session
- Auto-refresh every 5 minutes to keep token in sync

**Web Compatibility**
- Custom Modal component (no Alert.alert)
- OAuth popup flow for social authentication
- Proper deep linking for native apps

**Error Handling**
- All API calls wrapped in try-catch
- User-friendly error messages via Modal
- Graceful fallback for offline mode

**Security**
- Bearer tokens in SecureStore (native) / localStorage (web)
- All protected endpoints require authentication
- Proper 401/403 error handling

## 🎮 Future Enhancements

- [ ] Multiplayer matchmaking
- [ ] Real-time multiplayer with WebSockets
- [ ] Daily challenges with leaderboards
- [ ] Achievement system
- [ ] Power-ups and special abilities
- [ ] Tournament mode
- [ ] Social features (friends, chat)
- [ ] Offline mode with sync
- [ ] Accessibility improvements
- [ ] Localization (multiple languages)

## 📄 License

Copyright © 2024 VERBLOC. All rights reserved.

## 🤝 Contributing

This is a production application. For bug reports or feature requests, please contact the development team.

---

Built with ❤️ using React Native and Expo
