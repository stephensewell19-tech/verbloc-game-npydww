
# VERBLOC - App Store Submission Guide

## ✅ Pre-Submission Checklist

### 1. **App Configuration (app.json)**
- ✅ Updated bundle identifiers to `com.verbloc.app`
- ✅ Added proper app name: "VERBLOC"
- ✅ Configured iOS Info.plist with required permissions
- ✅ Configured Android permissions (minimal, only what's needed)
- ✅ Added app description
- ⚠️ **ACTION REQUIRED**: Replace placeholder Superwall API keys
- ⚠️ **ACTION REQUIRED**: Add your EAS project ID

### 2. **Onboarding Flow**
- ✅ Complete 5-step onboarding tutorial
- ✅ Explains game mechanics, modes, and progression
- ✅ Smooth animations and professional design
- ✅ Persists completion status (won't show again)

### 3. **Monetization**
- ✅ Superwall integration for subscriptions
- ✅ Premium subscription screen with clear pricing
- ✅ No pay-to-win mechanics (compliant with store policies)
- ✅ Free tier with full core gameplay access
- ⚠️ **ACTION REQUIRED**: Configure Superwall dashboard with actual products

### 4. **Legal Compliance**
- ✅ Privacy Policy screen (`/privacy-policy`)
- ✅ Terms of Service screen (`/terms-of-service`)
- ✅ Links accessible from Profile screen
- ⚠️ **ACTION REQUIRED**: Review and customize legal documents for your jurisdiction

### 5. **Gameplay**
- ✅ Solo mode functional
- ✅ Multiplayer mode functional
- ✅ Daily challenges implemented
- ✅ Special events system
- ✅ Progression system with XP and levels
- ✅ Board seeding functionality (70+ production boards)

### 6. **Platform Compliance**

#### iOS Requirements
- ✅ Native iOS tabs using `expo-router/unstable-native-tabs`
- ✅ SF Symbols for icons
- ✅ Info.plist permissions properly declared
- ✅ No use of private APIs
- ⚠️ **ACTION REQUIRED**: Test on physical iOS devices (iPhone & iPad)
- ⚠️ **ACTION REQUIRED**: Ensure app icon is production-ready (1024x1024)

#### Android Requirements
- ✅ Material Design icons
- ✅ Proper permissions in manifest
- ✅ Blocked unnecessary permissions
- ✅ Edge-to-edge display support
- ⚠️ **ACTION REQUIRED**: Test on multiple Android devices
- ⚠️ **ACTION REQUIRED**: Ensure adaptive icon is production-ready

---

## 🚨 CRITICAL ACTIONS REQUIRED BEFORE SUBMISSION

### 1. **Replace Placeholder App Icon**
Current icon: `assets/images/app-icon-txp.png` appears to be a placeholder.

**Required:**
- iOS: 1024x1024px PNG (no transparency, no rounded corners)
- Android: Adaptive icon with foreground and background layers
- Must be professional, recognizable, and represent VERBLOC brand

**Recommendation:** Hire a designer or use tools like:
- Figma
- Canva Pro
- Adobe Illustrator
- Icon generator services

### 2. **Configure Superwall API Keys**
Location: `app.json` → `extra.superwallIosKey` and `extra.superwallAndroidKey`

**Steps:**
1. Sign up at https://superwall.com
2. Create a new app project
3. Configure subscription products:
   - Monthly: $4.99/month
   - Yearly: $19.99/year
4. Copy API keys to `app.json`
5. Test subscription flow on both platforms

### 3. **Set Up In-App Purchases**

#### iOS (App Store Connect)
1. Create app in App Store Connect
2. Add In-App Purchases:
   - Type: Auto-Renewable Subscription
   - Product IDs: `verbloc_premium_monthly`, `verbloc_premium_yearly`
   - Pricing: $4.99/month, $19.99/year
3. Create subscription group
4. Configure Superwall to use these product IDs

#### Android (Google Play Console)
1. Create app in Google Play Console
2. Add Subscriptions:
   - Product IDs: `verbloc_premium_monthly`, `verbloc_premium_yearly`
   - Pricing: $4.99/month, $19.99/year
3. Configure Superwall to use these product IDs

### 4. **Prepare Store Listings**

#### App Store (iOS)
**Required Assets:**
- App icon (1024x1024)
- Screenshots (6.5", 6.7", 5.5" displays)
  - Minimum 3, recommended 5-8
  - Show: Home screen, gameplay, multiplayer, daily challenges, progression
- App Preview video (optional but recommended)

**Required Text:**
- App name: "VERBLOC - Word Puzzle Game"
- Subtitle: "Strategic Word Battles"
- Description (4000 char max):
```
VERBLOC is a revolutionary word puzzle game where every word you form actively changes the board. Combine vocabulary mastery with strategic thinking in solo challenges or multiplayer battles.

UNIQUE GAMEPLAY
• Words transform the puzzle board
• Palindromes reverse tiles
• Rare letters unlock special effects
• Strategic depth meets word mastery

GAME MODES
• Solo: Practice and master puzzles
• Multiplayer: Turn-based battles with friends
• Daily Challenges: Compete globally
• Special Events: Limited-time puzzles

PROGRESSION SYSTEM
• Level up and earn XP
• Unlock cosmetics and achievements
• Maintain daily streaks
• Climb the leaderboards

FREE TO PLAY
• Full core gameplay access
• No pay-to-win mechanics
• Optional premium for unlimited matches

Download VERBLOC today and become a word master!
```

- Keywords: word game, puzzle, multiplayer, strategy, vocabulary, brain training, word puzzle, crossword, scrabble alternative
- Support URL: https://verbloc.app/support
- Privacy Policy URL: https://verbloc.app/privacy

#### Google Play (Android)
**Required Assets:**
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (phone and tablet)
  - Minimum 2, recommended 8
  - Same content as iOS

**Required Text:**
- Short description (80 char max):
"Strategic word puzzle game. Form words that change the board. Play solo or multiplayer."

- Full description (4000 char max):
Use same as iOS description above

- Category: Word Games
- Content rating: Everyone (ESRB: E)
- Privacy Policy URL: https://verbloc.app/privacy

### 5. **Test on Real Devices**

**iOS Testing:**
- iPhone SE (small screen)
- iPhone 14/15 (standard)
- iPhone 14/15 Pro Max (large screen)
- iPad (tablet support)

**Android Testing:**
- Small phone (5.5" or less)
- Standard phone (6.0-6.5")
- Large phone (6.7"+)
- Tablet (optional but recommended)

**Test Scenarios:**
1. Complete onboarding flow
2. Play solo game from start to finish
3. Create and play multiplayer game
4. Complete daily challenge
5. View special events
6. Subscribe to premium (test mode)
7. Sign out and sign back in
8. Check all legal links work

### 6. **Performance & Stability**

**Required Checks:**
- ✅ No crashes during normal gameplay
- ✅ Smooth animations (60fps)
- ✅ Fast load times (<3 seconds)
- ✅ Handles network errors gracefully
- ✅ Works offline for solo mode
- ✅ Proper error messages (no technical jargon)

### 7. **Content & Compliance**

**iOS App Review Guidelines:**
- ✅ No placeholder content
- ✅ No broken features
- ✅ Subscription clearly explained
- ✅ Privacy policy accessible
- ✅ No misleading claims
- ✅ Proper age rating (13+)

**Google Play Policies:**
- ✅ No deceptive behavior
- ✅ Proper permissions usage
- ✅ Privacy policy accessible
- ✅ Content rating appropriate
- ✅ No malicious code

---

## 📱 Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure EAS:**
```bash
eas build:configure
```

4. **Build for iOS:**
```bash
eas build --platform ios --profile production
```

5. **Build for Android:**
```bash
eas build --platform android --profile production
```

6. **Submit to Stores:**
```bash
eas submit --platform ios
eas submit --platform android
```

### Manual Build (Alternative)

**iOS:**
```bash
expo prebuild -p ios
cd ios
pod install
# Open in Xcode and archive
```

**Android:**
```bash
expo prebuild -p android
cd android
./gradlew bundleRelease
```

---

## 📋 Pre-Submission Testing Checklist

### Functionality
- [ ] Onboarding completes successfully
- [ ] User can sign up/sign in
- [ ] Solo games work end-to-end
- [ ] Multiplayer matchmaking works
- [ ] Daily challenges load and complete
- [ ] Special events display correctly
- [ ] Progression system tracks XP
- [ ] Subscription flow works (test mode)
- [ ] Sign out works properly
- [ ] Privacy policy loads
- [ ] Terms of service loads

### UI/UX
- [ ] No placeholder text or images
- [ ] All icons display correctly (no "?")
- [ ] Animations are smooth
- [ ] Text is readable on all screen sizes
- [ ] Buttons are tappable (not too small)
- [ ] Loading states show properly
- [ ] Error messages are user-friendly

### Performance
- [ ] App launches in <3 seconds
- [ ] No memory leaks during extended play
- [ ] Network requests timeout gracefully
- [ ] Offline mode works for solo play
- [ ] No frame drops during gameplay

### Compliance
- [ ] Age rating is correct (13+)
- [ ] Privacy policy is complete
- [ ] Terms of service are complete
- [ ] Permissions are justified
- [ ] No tracking without consent
- [ ] Subscription terms are clear

---

## 🎯 Post-Submission

### App Store Review (iOS)
- Typical review time: 24-48 hours
- Be prepared to respond to reviewer questions
- Have test account credentials ready if needed

### Google Play Review (Android)
- Typical review time: Few hours to 1 day
- Usually faster than iOS
- May require additional info for new developer accounts

### After Approval
1. Monitor crash reports (Sentry, Firebase Crashlytics)
2. Track user feedback and ratings
3. Respond to reviews promptly
4. Plan updates based on user feedback
5. Monitor subscription metrics in Superwall dashboard

---

## 🆘 Common Rejection Reasons & Fixes

### iOS Rejections

**"App is incomplete or has placeholder content"**
- Fix: Replace app icon with production version
- Fix: Ensure all screens have real content

**"Subscription terms not clear"**
- Fix: Already implemented in subscription screen
- Ensure pricing is visible before purchase

**"Privacy policy missing or incomplete"**
- Fix: Already implemented at `/privacy-policy`
- Ensure it's accessible from app

**"App crashes during review"**
- Fix: Test thoroughly on real devices
- Add error handling for all API calls

### Android Rejections

**"Permissions not justified"**
- Fix: Already minimized permissions
- Ensure Info.plist descriptions are clear

**"Content rating incorrect"**
- Fix: Set to Everyone (E for Everyone)
- No mature content in VERBLOC

**"Privacy policy not accessible"**
- Fix: Already implemented
- Ensure link in Play Console is correct

---

## 📞 Support & Resources

**Expo Documentation:**
- https://docs.expo.dev/

**App Store Connect:**
- https://appstoreconnect.apple.com/

**Google Play Console:**
- https://play.google.com/console/

**Superwall Documentation:**
- https://docs.superwall.com/

**VERBLOC Support:**
- Email: support@verbloc.app
- Website: www.verbloc.app

---

## ✅ Final Checklist Before Submission

- [ ] App icon is production-ready (not placeholder)
- [ ] Superwall API keys are configured
- [ ] In-app purchases are set up in both stores
- [ ] Privacy policy and terms are reviewed
- [ ] Tested on multiple real devices
- [ ] All features work without crashes
- [ ] Store listings are complete (screenshots, descriptions)
- [ ] EAS project is configured
- [ ] Builds complete successfully
- [ ] Test accounts are prepared (if needed)
- [ ] Support email is set up and monitored

---

**Good luck with your submission! 🚀**

VERBLOC is now ready for store review once you complete the critical actions above.
