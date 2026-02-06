
# VERBLOC - Developer Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Physical devices for testing (recommended)

### Initial Setup

1. **Clone and Install:**
```bash
cd verbloc
npm install
```

2. **Configure Environment:**
Edit `app.json` and update:
- `extra.backendUrl` - Your backend API URL (already configured)
- `extra.superwallIosKey` - Your Superwall iOS API key
- `extra.superwallAndroidKey` - Your Superwall Android API key
- `ios.bundleIdentifier` - Your iOS bundle ID (currently: com.verbloc.app)
- `android.package` - Your Android package name (currently: com.verbloc.app)

3. **Start Development Server:**
```bash
npm run dev
```

4. **Run on Device:**
- iOS: Press `i` in terminal or scan QR code with Expo Go
- Android: Press `a` in terminal or scan QR code with Expo Go
- Web: Press `w` in terminal

---

## 📁 Project Structure

```
verbloc/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── (home)/              # Home tab (nested stack)
│   │   │   ├── _layout.tsx      # Home stack layout
│   │   │   ├── index.tsx        # Home screen (Android/Web)
│   │   │   └── index.ios.tsx    # Home screen (iOS)
│   │   ├── _layout.tsx          # Tab layout (Android/Web)
│   │   ├── _layout.ios.tsx      # Tab layout (iOS native tabs)
│   │   ├── profile.tsx          # Profile screen (Android/Web)
│   │   └── profile.ios.tsx      # Profile screen (iOS)
│   ├── _layout.tsx              # Root layout
│   ├── onboarding.tsx           # Onboarding flow
│   ├── auth.tsx                 # Authentication screen
│   ├── game.tsx                 # Solo game screen
│   ├── board-select.tsx         # Board selection
│   ├── multiplayer-game.tsx     # Multiplayer game
│   ├── multiplayer-matchmaking.tsx
│   ├── daily-challenge.tsx      # Daily challenge
│   ├── special-events.tsx       # Special events list
│   ├── special-event-detail.tsx # Event detail
│   ├── subscription.tsx         # Premium subscription
│   ├── privacy-policy.tsx       # Privacy policy
│   ├── terms-of-service.tsx     # Terms of service
│   └── +not-found.tsx           # 404 page
├── components/                   # Reusable components
│   ├── GameBoard.tsx            # Game board component
│   ├── FloatingTabBar.tsx       # Custom tab bar (Android/Web)
│   ├── DailyChallengeCard.tsx   # Daily challenge card
│   ├── SpecialEventsCard.tsx    # Special events card
│   ├── GameCompletionModal.tsx  # Game end modal
│   ├── WinConditionDisplay.tsx  # Win condition UI
│   ├── WordMechanicsInfo.tsx    # Word mechanics info
│   ├── IconSymbol.tsx           # Cross-platform icons
│   ├── Modal.tsx                # Custom modal (button.tsx)
│   └── ...
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── SuperwallContext.tsx     # Subscription state
├── utils/                        # Utility functions
│   ├── api.ts                   # API client
│   ├── gameLogic.ts             # Core game logic
│   ├── wordMechanics.ts         # Word effect mechanics
│   ├── wordDictionary.ts        # Word validation
│   ├── onboarding.ts            # Onboarding persistence
│   ├── notifications.ts         # Push notifications
│   ├── errorHandling.ts         # Error handling
│   └── ...
├── types/                        # TypeScript types
│   └── game.ts                  # Game-related types
├── styles/                       # Styling
│   └── commonStyles.ts          # Shared styles and colors
├── assets/                       # Static assets
│   ├── images/                  # Images
│   └── fonts/                   # Fonts
├── backend/                      # Backend API (separate)
│   └── src/                     # Backend source code
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── eas.json                      # EAS Build configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🎨 Key Technologies

### Frontend
- **React Native 0.81.4** - Mobile framework
- **Expo 54** - Development platform
- **Expo Router 6** - File-based routing
- **TypeScript** - Type safety
- **React Native Reanimated** - Animations
- **Expo Linear Gradient** - Gradients
- **Expo Haptics** - Tactile feedback
- **Expo Notifications** - Push notifications
- **Expo Superwall** - Subscription management
- **Better Auth** - Authentication

### Backend
- **Bun** - Runtime
- **Fastify** - Web framework
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Better Auth** - Authentication

---

## 🔑 Key Concepts

### Platform-Specific Files
VERBLOC uses platform-specific files for optimal UX:
- `.ios.tsx` - iOS-specific implementation
- `.android.tsx` - Android-specific implementation
- `.web.tsx` - Web-specific implementation
- `.tsx` - Fallback for all platforms

**Example:**
- `app/(tabs)/_layout.ios.tsx` - Uses native iOS tabs
- `app/(tabs)/_layout.tsx` - Uses custom FloatingTabBar for Android/Web

### Atomic JSX Pattern
Components follow "atomic JSX" for visual editor compatibility:
- One variable per `<Text>` component
- No logic in JSX (calculate before render)
- No ternaries in JSX (use variables)

**Bad:**
```tsx
<Text>{user.name} - Level {user.level}</Text>
```

**Good:**
```tsx
const userName = user.name;
const userLevel = user.level;
return (
  <>
    <Text>{userName}</Text>
    <Text>{userLevel}</Text>
  </>
);
```

### Authentication Flow
1. User opens app → Onboarding (first time only)
2. Onboarding complete → Auth screen
3. Sign in/up → Home screen
4. Session persists via Better Auth

### Game Flow
1. Home → Board Select → Game → Completion Modal
2. Multiplayer: Home → Matchmaking → Game → Completion Modal
3. Daily Challenge: Home → Daily Challenge → Game → Completion Modal

---

## 🛠️ Common Development Tasks

### Adding a New Screen
1. Create file in `app/` directory
2. Register in `app/_layout.tsx`
3. Add navigation from existing screen

**Example:**
```tsx
// app/settings.tsx
export default function SettingsScreen() {
  return <View><Text>Settings</Text></View>;
}

// app/_layout.tsx
<Stack.Screen name="settings" options={{ headerShown: false }} />

// Navigate from profile
router.push('/settings');
```

### Adding a New API Endpoint
1. Backend: Add route in `backend/src/routes/`
2. Frontend: Call via `utils/api.ts` helpers

**Example:**
```tsx
// Frontend
import { authenticatedGet } from '@/utils/api';

const data = await authenticatedGet('/api/new-endpoint');
```

### Adding a New Component
1. Create in `components/` directory
2. Export and import where needed

**Example:**
```tsx
// components/MyComponent.tsx
export default function MyComponent() {
  return <View><Text>Hello</Text></View>;
}

// app/some-screen.tsx
import MyComponent from '@/components/MyComponent';
```

### Updating Styles
Global styles are in `styles/commonStyles.ts`:
```tsx
export const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  // ...
};
```

---

## 🐛 Debugging

### Frontend Logs
```bash
# View console logs
npm run dev
# Logs appear in terminal
```

### Backend Logs
```bash
cd backend
bun run dev
# Logs appear in terminal
```

### Common Issues

**"No boards available"**
- Solution: Go to Profile → "Seed Production Boards"
- This creates 70+ game boards

**"Authentication failed"**
- Check backend URL in `app.json`
- Ensure backend is running
- Check network connection

**"Subscription not working"**
- Add Superwall API keys to `app.json`
- Configure products in Superwall dashboard
- Test in development mode first

**"Icons showing as '?'"**
- Invalid Material icon name on Android
- Check `components/IconSymbol.tsx`
- Use valid names: "home", "person", "settings"

---

## 🧪 Testing

### Run Tests
```bash
npm run lint
```

### Test on Devices
- iOS: Use Expo Go or build with EAS
- Android: Use Expo Go or build with EAS
- Web: `npm run web`

### Test Checklist
See `PRE_LAUNCH_TESTING.md` for comprehensive checklist

---

## 📦 Building for Production

### Using EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Manual Build
```bash
# iOS
expo prebuild -p ios
cd ios && pod install
# Open in Xcode and archive

# Android
expo prebuild -p android
cd android && ./gradlew bundleRelease
```

---

## 📚 Important Files

### Configuration
- `app.json` - Expo configuration
- `eas.json` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

### Documentation
- `STORE_SUBMISSION_GUIDE.md` - Store submission checklist
- `APP_ICON_REQUIREMENTS.md` - Icon requirements
- `PRE_LAUNCH_TESTING.md` - Testing checklist
- `README.md` - Project overview

---

## 🆘 Getting Help

### Resources
- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/
- Superwall Docs: https://docs.superwall.com/
- Better Auth Docs: https://www.better-auth.com/

### Common Commands
```bash
# Start dev server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Lint code
npm run lint

# Build for production
eas build --platform all --profile production
```

---

## ✅ Next Steps

1. **Configure Superwall:**
   - Sign up at https://superwall.com
   - Create app and products
   - Add API keys to `app.json`

2. **Test Thoroughly:**
   - Follow `PRE_LAUNCH_TESTING.md`
   - Test on real devices
   - Fix any bugs found

3. **Prepare Store Assets:**
   - Create production app icon
   - Take screenshots
   - Write store descriptions

4. **Submit to Stores:**
   - Follow `STORE_SUBMISSION_GUIDE.md`
   - Build with EAS
   - Submit for review

---

**Happy coding! 🚀**

For questions or issues, refer to the documentation files or contact support@verbloc.app
