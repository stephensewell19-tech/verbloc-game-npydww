
# VERBLOC Pre-Launch Testing Checklist

## 🎯 Purpose
This checklist ensures VERBLOC is fully functional, stable, and ready for public release on both iOS and Android app stores.

---

## 📱 Device Testing Matrix

### iOS Devices (Minimum)
- [ ] iPhone SE (2022) - Small screen, iOS 16+
- [ ] iPhone 14 - Standard size, iOS 17+
- [ ] iPhone 15 Pro Max - Large screen, iOS 17+
- [ ] iPad (10th gen) - Tablet support

### Android Devices (Minimum)
- [ ] Small phone (5.5" or less, Android 10+)
- [ ] Standard phone (6.0-6.5", Android 12+)
- [ ] Large phone (6.7"+, Android 13+)
- [ ] Tablet (optional but recommended)

---

## 🚀 First Launch Experience

### Onboarding Flow
- [ ] App launches without crash
- [ ] Splash screen displays correctly
- [ ] Onboarding starts automatically (first launch)
- [ ] All 5 onboarding steps display correctly
- [ ] Icons and animations work smoothly
- [ ] "Skip" button works
- [ ] "Next" button advances steps
- [ ] "Let's Play!" button completes onboarding
- [ ] Onboarding doesn't show again on second launch
- [ ] User is redirected to auth screen after onboarding

### Authentication
- [ ] Auth screen displays correctly
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google Sign-In works (iOS & Android)
- [ ] Apple Sign-In works (iOS only)
- [ ] Error messages display for invalid credentials
- [ ] Success message shows after sign up
- [ ] User is redirected to home screen after auth
- [ ] Session persists after app restart

---

## 🏠 Home Screen

### UI Elements
- [ ] App logo displays correctly
- [ ] Player name/email shows correctly
- [ ] Level and XP display correctly
- [ ] XP progress bar animates smoothly
- [ ] Daily streak shows correct value
- [ ] Daily Challenge card displays
- [ ] Special Events card displays
- [ ] Play Solo button works
- [ ] Multiplayer button works
- [ ] Difficulty tiers section displays
- [ ] Quick tip card displays
- [ ] All icons render correctly (no "?")

### Data Loading
- [ ] Player stats load within 3 seconds
- [ ] Loading indicators show during fetch
- [ ] Error handling works if API fails
- [ ] Retry logic works for failed requests
- [ ] Offline mode shows appropriate message

---

## 🎮 Solo Gameplay

### Board Selection
- [ ] Board select screen loads
- [ ] Difficulty filter works (Easy/Medium/Hard/Special)
- [ ] Boards display with correct metadata
- [ ] Random board button works
- [ ] Tapping board starts game
- [ ] "No boards available" message shows if empty
- [ ] "Seed Production Boards" guidance works

### Game Screen
- [ ] Game board renders correctly
- [ ] Tiles are tappable and responsive
- [ ] Selected tiles highlight correctly
- [ ] Word formation works (adjacent tiles)
- [ ] Submit button enables when word is valid
- [ ] Clear button deselects tiles
- [ ] Score updates correctly
- [ ] Move counter increments
- [ ] Win condition displays correctly
- [ ] Word mechanics apply (palindromes, rare letters, etc.)
- [ ] Game completion modal shows
- [ ] XP earned displays correctly
- [ ] "Play Again" button works
- [ ] "Back to Home" button works

### Word Validation
- [ ] Valid words are accepted
- [ ] Invalid words show error message
- [ ] Common words recognized (BOX, CAT, DOG, etc.)
- [ ] Rare words recognized
- [ ] Case-insensitive validation works
- [ ] Minimum word length enforced (3+ letters)

---

## 👥 Multiplayer

### Matchmaking
- [ ] Matchmaking screen loads
- [ ] Random matchmaking works
- [ ] Private lobby creation works
- [ ] Invite code generation works
- [ ] Invite code sharing works
- [ ] Join by code works
- [ ] Board selection works
- [ ] Matchmaking timeout handled gracefully

### Multiplayer Game
- [ ] Game loads with correct opponent info
- [ ] Turn indicator shows correctly
- [ ] "Your Turn" / "Opponent's Turn" displays
- [ ] Turn timer counts down
- [ ] Word submission works on your turn
- [ ] Turn submission disabled on opponent's turn
- [ ] Emoji reactions work
- [ ] Taunt messages work
- [ ] Game updates when opponent plays
- [ ] Win/loss detection works
- [ ] Game completion modal shows
- [ ] XP earned displays correctly

### Notifications
- [ ] Push notification permission requested
- [ ] Notifications received when opponent plays
- [ ] Tapping notification opens game
- [ ] Notification badge updates correctly

---

## 📅 Daily Challenges

### Daily Challenge Screen
- [ ] Current challenge displays
- [ ] Challenge details show correctly
- [ ] Leaderboard loads
- [ ] Streak counter displays
- [ ] "Start Challenge" button works
- [ ] Challenge game plays correctly
- [ ] Completion tracked correctly
- [ ] Leaderboard updates after completion
- [ ] Streak increments on consecutive days

---

## ⭐ Special Events

### Special Events List
- [ ] Current events display
- [ ] Event cards show correct info
- [ ] Event images load
- [ ] Tapping event opens detail screen
- [ ] "No events" message shows if empty

### Event Detail Screen
- [ ] Event details display correctly
- [ ] Leaderboard loads
- [ ] "Start Event" button works
- [ ] Event game plays correctly
- [ ] Completion tracked correctly
- [ ] Rewards display correctly

---

## 📊 Progression System

### XP and Leveling
- [ ] XP earned after each game
- [ ] XP calculation correct (score, words, efficiency)
- [ ] Level-up animation triggers
- [ ] Level-up rewards display
- [ ] XP progress bar updates smoothly
- [ ] Level displayed correctly across app

### Achievements
- [ ] Achievements tracked correctly
- [ ] Achievement notifications show
- [ ] Achievement list displays in profile
- [ ] Unlocked achievements marked correctly

---

## 👤 Profile Screen

### Profile Display
- [ ] User name/email displays
- [ ] Avatar displays
- [ ] Subscription status shows correctly
- [ ] Level and XP display
- [ ] Stats grid displays correctly
- [ ] All stat values are accurate
- [ ] Progression section displays
- [ ] Unlocks summary shows correct counts

### Actions
- [ ] "Upgrade to Premium" button works (free users)
- [ ] "Manage Subscription" button works (premium users)
- [ ] Leaderboard button works
- [ ] Achievements button works
- [ ] Settings button works
- [ ] "Seed Production Boards" button works
- [ ] Privacy Policy link works
- [ ] Terms of Service link works
- [ ] Sign Out button works
- [ ] Sign out confirmation modal shows
- [ ] Sign out completes successfully

---

## 💳 Monetization

### Subscription Screen
- [ ] Premium features list displays
- [ ] Free features list displays
- [ ] Pricing cards display correctly
- [ ] Monthly price shows: $4.99
- [ ] Yearly price shows: $19.99
- [ ] "Subscribe Now" button works
- [ ] Superwall paywall displays
- [ ] Subscription purchase flow works (test mode)
- [ ] Subscription status updates after purchase
- [ ] Restore purchases works
- [ ] Subscription cancellation works

### Premium Features
- [ ] Unlimited matches unlocked for premium users
- [ ] Private lobbies accessible for premium users
- [ ] Exclusive themes available for premium users
- [ ] Puzzle packs accessible for premium users
- [ ] Free users see appropriate limits

---

## 📄 Legal Compliance

### Privacy Policy
- [ ] Privacy Policy screen loads
- [ ] All sections display correctly
- [ ] Text is readable and formatted
- [ ] Scrolling works smoothly
- [ ] Back button works

### Terms of Service
- [ ] Terms of Service screen loads
- [ ] All sections display correctly
- [ ] Text is readable and formatted
- [ ] Scrolling works smoothly
- [ ] Back button works

---

## 🔧 Technical Performance

### App Performance
- [ ] App launches in under 3 seconds
- [ ] No memory leaks during 30-minute session
- [ ] Animations run at 60fps
- [ ] No frame drops during gameplay
- [ ] Smooth scrolling on all screens
- [ ] Responsive touch interactions
- [ ] No UI freezing or stuttering

### Network Handling
- [ ] API requests complete within 5 seconds
- [ ] Loading indicators show during requests
- [ ] Error messages display on failure
- [ ] Retry logic works for failed requests
- [ ] Offline mode works for solo play
- [ ] Network reconnection handled gracefully
- [ ] Timeout errors handled properly

### Error Handling
- [ ] No unhandled exceptions
- [ ] All errors show user-friendly messages
- [ ] Error modals display correctly
- [ ] Error recovery works (retry, go back, etc.)
- [ ] Console logs are informative (for debugging)
- [ ] No sensitive data in error messages

---

## 🌐 Platform-Specific

### iOS Specific
- [ ] Native tabs work correctly
- [ ] SF Symbols display correctly
- [ ] Haptic feedback works
- [ ] Safe area insets respected
- [ ] Dark mode works correctly
- [ ] iPad layout adapts properly
- [ ] Keyboard dismissal works
- [ ] Pull-to-refresh works (where applicable)

### Android Specific
- [ ] Material icons display correctly (no "?")
- [ ] Back button navigation works
- [ ] Edge-to-edge display works
- [ ] Dark mode works correctly
- [ ] Keyboard dismissal works
- [ ] Pull-to-refresh works (where applicable)
- [ ] Tablet layout adapts properly (if supported)

---

## 🔒 Security & Privacy

### Data Protection
- [ ] User passwords not stored in plain text
- [ ] Auth tokens stored securely
- [ ] No sensitive data in logs
- [ ] HTTPS used for all API calls
- [ ] No data leaks in error messages

### Permissions
- [ ] Only necessary permissions requested
- [ ] Permission rationale shown before request
- [ ] App works if permissions denied (where possible)
- [ ] No tracking without consent

---

## 🐛 Edge Cases & Stress Testing

### Edge Cases
- [ ] Works with slow network (3G simulation)
- [ ] Works with no network (offline mode)
- [ ] Handles server errors (500, 503)
- [ ] Handles invalid API responses
- [ ] Works with very long usernames
- [ ] Works with special characters in input
- [ ] Handles rapid button tapping
- [ ] Handles app backgrounding mid-game
- [ ] Handles phone calls during gameplay
- [ ] Handles low battery mode
- [ ] Handles low storage space

### Stress Testing
- [ ] Play 10 games in a row without crash
- [ ] Switch between screens rapidly
- [ ] Open and close app 20 times
- [ ] Leave app open for 1 hour
- [ ] Play with multiple accounts
- [ ] Test with 100+ boards loaded

---

## 📸 Store Assets Verification

### Screenshots
- [ ] 5-8 screenshots prepared for iOS
- [ ] 5-8 screenshots prepared for Android
- [ ] Screenshots show key features
- [ ] Screenshots are high quality
- [ ] No placeholder content in screenshots
- [ ] Text is readable in screenshots

### App Icon
- [ ] App icon is production-ready (not placeholder)
- [ ] Icon looks good at all sizes
- [ ] Icon works on light and dark backgrounds
- [ ] Icon is recognizable and unique

### Store Listings
- [ ] App name is correct
- [ ] Description is compelling
- [ ] Keywords are relevant
- [ ] Support URL is set
- [ ] Privacy policy URL is set
- [ ] Age rating is correct (13+)

---

## ✅ Final Verification

### Pre-Submission
- [ ] All critical bugs fixed
- [ ] All placeholder content replaced
- [ ] Superwall API keys configured
- [ ] In-app purchases set up
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] App icon finalized
- [ ] Store listings complete
- [ ] Test accounts prepared
- [ ] Support email monitored

### Build Verification
- [ ] Production build completes successfully
- [ ] Build size is reasonable (<100MB)
- [ ] No debug code in production
- [ ] No console.logs in production (or minimal)
- [ ] Version number is correct (1.0.0)
- [ ] Build number incremented

---

## 🎉 Ready for Submission!

Once all items are checked:
1. Create production builds via EAS
2. Submit to App Store Connect (iOS)
3. Submit to Google Play Console (Android)
4. Monitor review status
5. Respond to reviewer questions promptly
6. Celebrate when approved! 🎊

---

**Testing completed by:** _______________  
**Date:** _______________  
**Platform:** iOS / Android  
**Build version:** _______________  
**Notes:**

---

**Remember:** Thorough testing now prevents rejections and bad reviews later!
