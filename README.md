
# VERBLOC

**A social word + puzzle game where every word changes the board.**

VERBLOC is a launch-ready, cross-platform mobile game that combines strategic word formation with dynamic puzzle mechanics. Form words to manipulate the game board, compete with friends, and climb the leaderboards.

## 🎮 Game Features

### Core Gameplay
- **Strategic Word Formation**: Select adjacent tiles to form words (minimum 3 letters)
- **Dynamic Board Mechanics**: Every word actively changes the puzzle state
- **Multiple Puzzle Modes**:
  - **Score Target**: Reach a target score within turn limit
  - **Vault Break**: Unlock special vault tiles
  - **Hidden Phrase**: Reveal concealed letters
  - **Territory Control**: Claim board tiles (multiplayer)

### Word Mechanics
Words trigger special effects based on their properties:
- **Length-Based**: Longer words (5-6 letters) trigger bonus effects, 7+ letters trigger major effects
- **Rare Letters** (Q, Z, X, J): Break locked tiles and amplify effects
- **Palindromes**: Reverse board regions
- **Action Verbs**: Rotate board sections
- **Direction Words**: Shift rows or columns
- **Emotion Words**: Change tile ownership
- **All Vowels**: Reveal hidden tiles

### Game Modes
- **Solo Play**: Practice against puzzles with varying difficulty (Easy, Medium, Hard, Special)
- **Multiplayer**: Turn-based battles with friends or random opponents
- **Daily Challenges**: Compete globally on daily puzzles
- **Special Events**: Limited-time events with unique mechanics and rewards

### Progression System
- **XP & Levels**: Earn experience from every game
- **Daily Streaks**: Maintain consecutive days of play for bonuses
- **Achievements**: Unlock rewards for milestones
- **Leaderboards**: Compete for top rankings

### Monetization (Fair & Optional)
- **Free Players**: Full access to core gameplay, limited daily matches
- **Premium Subscription**: Unlimited matches, private lobbies, cosmetic themes
- **No Pay-to-Win**: All gameplay advantages are earned, not purchased

## 🚀 Technical Stack

### Frontend
- **React Native** with **Expo 54**
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **Expo Haptics** for tactile feedback
- **Better Auth** for authentication (email + Google + Apple OAuth)
- **Superwall** for in-app purchases

### Backend
- **Fastify** (Node.js framework)
- **Drizzle ORM** with PostgreSQL
- **Better Auth** for session management
- **RESTful API** architecture

### Cross-Platform Support
- ✅ iOS (iPhone & iPad)
- ✅ Android (phones & tablets)
- ✅ Web (responsive design)

## 📱 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/verbloc.git
   cd verbloc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update `app.json` with your backend URL and API keys
   - Set up Superwall API keys for iOS and Android

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run on your device**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   - Create a PostgreSQL database
   - Update connection string in `backend/.env`

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

## 🎯 App Store Submission

### iOS (App Store)
1. Update `ios.bundleIdentifier` in `app.json`
2. Replace app icon at `assets/images/app-icon-txp.png` (1024x1024px)
3. Configure Superwall iOS API key
4. Build with EAS: `eas build --platform ios`
5. Submit via App Store Connect

### Android (Google Play)
1. Update `android.package` in `app.json`
2. Replace app icon at `assets/images/app-icon-txp.png`
3. Configure Superwall Android API key
4. Build with EAS: `eas build --platform android`
5. Submit via Google Play Console

### Pre-Launch Checklist
- [ ] Replace placeholder app icons
- [ ] Update bundle identifiers
- [ ] Configure Superwall API keys
- [ ] Test on multiple devices (iOS & Android)
- [ ] Verify authentication flows (email, Google, Apple)
- [ ] Test in-app purchases
- [ ] Complete Privacy Policy and Terms of Service
- [ ] Prepare App Store screenshots and descriptions
- [ ] Test offline functionality
- [ ] Verify push notifications

## 🏗️ Project Structure

```
verbloc/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── (home)/          # Home screen
│   │   └── profile.tsx      # Profile screen
│   ├── game.tsx             # Solo game screen
│   ├── multiplayer-game.tsx # Multiplayer game screen
│   ├── board-select.tsx     # Board selection
│   ├── daily-challenge.tsx  # Daily challenge
│   ├── special-events.tsx   # Special events
│   ├── onboarding.tsx       # First-time user flow
│   └── auth.tsx             # Authentication screen
├── components/              # Reusable UI components
│   ├── GameBoard.tsx        # Game board grid
│   ├── GameCompletionModal.tsx
│   ├── DailyChallengeCard.tsx
│   └── ...
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   └── SuperwallContext.tsx # Subscription state
├── utils/                   # Utility functions
│   ├── gameLogic.ts         # Core game mechanics
│   ├── wordMechanics.ts     # Word validation & effects
│   ├── api.ts               # API client
│   └── ...
├── types/                   # TypeScript type definitions
│   └── game.ts
├── styles/                  # Shared styles
│   └── commonStyles.ts
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── db/              # Database schema
│   │   └── lib/             # Backend utilities
│   └── drizzle/             # Database migrations
└── assets/                  # Images, fonts, etc.
```

## 🎨 Design Philosophy

VERBLOC is designed to be:
- **Easy to Learn**: Simple core mechanics with intuitive UI
- **Hard to Master**: Deep strategic gameplay with word effects
- **Fun Even When Losing**: Positive reinforcement and encouraging feedback
- **Highly Replayable**: Multiple modes, daily challenges, and progression
- **Visually Polished**: Smooth animations, haptic feedback, modern UI
- **Fair Monetization**: No pay-to-win, optional premium features

## 📊 Key Metrics

- **Word Dictionary**: 2000+ common English words
- **Puzzle Modes**: 4 unique game modes
- **Difficulty Levels**: 4 tiers (Easy, Medium, Hard, Special)
- **Board Sizes**: 7x7 and 9x9 grids
- **Special Effects**: 10+ word effect types

## 🔐 Privacy & Security

- **Better Auth**: Industry-standard authentication
- **Secure Storage**: Tokens stored in Expo SecureStore
- **GDPR Compliant**: Privacy Policy and Terms of Service included
- **No Tracking**: Minimal data collection, no third-party analytics

## 🐛 Known Issues & Limitations

- Web platform uses popup-based OAuth (not deep linking)
- Push notifications require additional setup for production
- Superwall API keys must be configured for in-app purchases

## 📝 License

Copyright © 2024 VERBLOC. All rights reserved.

## 🤝 Contributing

This is a production-ready app. For bug reports or feature requests, please contact the development team.

## 📧 Support

For support inquiries, please email: support@verbloc.com

---

**Made with 💙 by the VERBLOC team**

*VERBLOC - Form words. Change the board. Win.*
