
# 🧪 VERBLOC Testing Checklist

Use this checklist to systematically test all features of the app.

## 🔐 Authentication

- [ ] **Sign Up with Email**
  - [ ] Enter valid email and password
  - [ ] See success message
  - [ ] Redirected to home screen
  - [ ] Player stats initialized automatically

- [ ] **Sign In with Email**
  - [ ] Enter existing credentials
  - [ ] Successfully logged in
  - [ ] Session persists after app reload

- [ ] **OAuth (Web Only)**
  - [ ] Google OAuth popup opens
  - [ ] Successfully authenticates
  - [ ] Redirected back to app
  - [ ] Session persists

- [ ] **Sign Out**
  - [ ] Tap sign out button
  - [ ] Confirm sign out
  - [ ] Redirected to auth screen
  - [ ] Session cleared

## 🎮 Solo Game Mode

- [ ] **Board Selection**
  - [ ] Navigate to "Play Solo"
  - [ ] See list of boards (after seeding)
  - [ ] Filter by difficulty (Easy, Medium, Hard, Special)
  - [ ] Select a board
  - [ ] Game starts successfully

- [ ] **Gameplay**
  - [ ] Select tiles to form words (min 3 letters)
  - [ ] Submit valid word
  - [ ] Score increases
  - [ ] Board effects trigger
  - [ ] Turn counter decreases
  - [ ] Invalid word shows error

- [ ] **Game Completion**
  - [ ] Win condition met (reach target score)
  - [ ] Completion modal shows
  - [ ] XP awarded
  - [ ] Stats updated
  - [ ] Can play again or return home

- [ ] **Game Loss**
  - [ ] Run out of turns
  - [ ] Loss modal shows
  - [ ] XP still awarded (reduced)
  - [ ] Stats updated

## 👥 Multiplayer Mode

- [ ] **Random Matchmaking**
  - [ ] Select "Random Matchmaking"
  - [ ] Choose board and settings
  - [ ] Match created
  - [ ] Can make moves on your turn
  - [ ] Turn indicator shows correctly

- [ ] **Private Lobby**
  - [ ] Create private lobby
  - [ ] Invite code generated
  - [ ] Share invite code
  - [ ] Wait for players to join
  - [ ] Game starts when ready

- [ ] **Join by Code**
  - [ ] Enter valid invite code
  - [ ] Successfully join game
  - [ ] See other players
  - [ ] Can make moves

- [ ] **Social Features**
  - [ ] Send emoji reaction
  - [ ] Send taunt message
  - [ ] See reactions from other players
  - [ ] See taunts from other players

## 🏆 Daily Challenge

- [ ] **View Challenge**
  - [ ] Navigate to Daily Challenge
  - [ ] See challenge details
  - [ ] See current streak
  - [ ] See leaderboard

- [ ] **Play Challenge**
  - [ ] Choose Solo or Multiplayer
  - [ ] Start challenge
  - [ ] Complete challenge
  - [ ] See completion status
  - [ ] Streak updated

- [ ] **Attempts**
  - [ ] See attempts remaining
  - [ ] Cannot play after attempts exhausted
  - [ ] Resets daily

## ⭐ Special Events

- [ ] **View Events**
  - [ ] Navigate to Special Events
  - [ ] See active events (Daily Featured, Weekly, Limited-Time)
  - [ ] Tap event to see details

- [ ] **Event Details**
  - [ ] See event description
  - [ ] See rules
  - [ ] See rewards
  - [ ] See leaderboard
  - [ ] See time remaining

- [ ] **Play Event**
  - [ ] Start event
  - [ ] Complete event
  - [ ] Rewards awarded
  - [ ] Leaderboard updated

## 📊 Player Stats & Progression

- [ ] **View Stats**
  - [ ] Navigate to Profile
  - [ ] See total games played
  - [ ] See total wins
  - [ ] See highest score
  - [ ] See current streak
  - [ ] See total words formed

- [ ] **Progression**
  - [ ] See current level
  - [ ] See XP progress bar
  - [ ] See XP to next level
  - [ ] Level up after earning enough XP
  - [ ] See level-up notification

- [ ] **Unlocks**
  - [ ] See unlocked cosmetics
  - [ ] See unlocked titles
  - [ ] See unlocked badges
  - [ ] See achievements

## 🎲 Board Management

- [ ] **Seed Boards**
  - [ ] Navigate to Profile
  - [ ] Tap "Seed Production Boards (70+)"
  - [ ] See success message
  - [ ] Boards now available in board selection

- [ ] **Board Filtering**
  - [ ] Filter by difficulty
  - [ ] Filter by mode (Solo/Multiplayer)
  - [ ] See correct boards for each filter
  - [ ] Board count updates

## 🔔 Notifications (If Enabled)

- [ ] **Register Token**
  - [ ] App requests notification permission
  - [ ] Token registered with backend
  - [ ] Can receive notifications

- [ ] **Turn Notifications**
  - [ ] Receive notification when it's your turn
  - [ ] Tap notification to open game
  - [ ] Game loads correctly

## 🏅 Leaderboards

- [ ] **Global Leaderboard**
  - [ ] View global leaderboard
  - [ ] See top players
  - [ ] See your rank

- [ ] **Weekly Leaderboard**
  - [ ] View weekly leaderboard
  - [ ] See top players for the week
  - [ ] See your rank

## 🐛 Error Handling

- [ ] **Network Errors**
  - [ ] Disconnect from internet
  - [ ] See offline modal
  - [ ] Reconnect
  - [ ] App continues working

- [ ] **Invalid Input**
  - [ ] Try invalid word
  - [ ] See error message
  - [ ] Can continue playing

- [ ] **Session Expiry**
  - [ ] Wait for session to expire (or manually clear token)
  - [ ] See authentication error
  - [ ] Redirected to sign in

## 📱 Platform-Specific

### Web
- [ ] OAuth popups work
- [ ] Session persists in localStorage
- [ ] Responsive design works
- [ ] No console errors

### iOS
- [ ] Deep linking works for OAuth
- [ ] SecureStore saves session
- [ ] Push notifications work
- [ ] No crashes

### Android
- [ ] Deep linking works for OAuth
- [ ] SecureStore saves session
- [ ] Push notifications work
- [ ] No crashes

## ✅ Final Checks

- [ ] All API calls logged to console
- [ ] No 401/403 errors
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] App doesn't crash
- [ ] UI is responsive
- [ ] Loading states show correctly
- [ ] Error messages are clear
- [ ] Success messages show
- [ ] Navigation works smoothly

---

## 🚨 Critical Issues to Report

If you encounter any of these, report immediately:

1. **Cannot sign in/sign up** - Authentication broken
2. **No boards available after seeding** - Board seeding failed
3. **Game doesn't start** - Game creation failed
4. **Moves not registering** - Game state update failed
5. **XP not awarded** - Progression system broken
6. **App crashes** - Critical bug

---

## 📝 Notes

- Test on multiple devices/browsers if possible
- Check console logs for detailed error messages
- Take screenshots of any bugs
- Note the exact steps to reproduce issues

**Happy Testing! 🎮**
