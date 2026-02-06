
# 🚀 VERBLOC - Quick Start Guide

## ⚡ Get Started in 5 Minutes

This guide will help you quickly test the fully integrated VERBLOC app.

---

## 📱 Step 1: Launch the App

```bash
# Start the Expo dev server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## 🔐 Step 2: Create an Account

1. App opens to the **Sign In** screen
2. Tap **"Sign Up"** tab
3. Enter:
   - Email: `player1@verbloc.com`
   - Password: `password123`
4. Tap **"Sign Up"** button
5. **Expected:** Redirected to Home screen

**✅ What just happened:**
- User account created
- Bearer token stored securely
- Player stats initialized (Level 1, 0 XP)
- Redirected to authenticated app

---

## 🎮 Step 3: Play Your First Game

1. On **Home** screen, tap **"Play Solo"** button
2. Select a board (e.g., **"Easy - Score Target"**)
3. Play the game:
   - Tap tiles to select letters
   - Form a word (min 3 letters)
   - Tap **"Submit Word"**
   - Repeat until you win or run out of turns
4. **Expected:** Game completion modal appears

**✅ What to look for:**
- **"+X XP"** displayed (e.g., "+120 XP")
- If you reached Level 2: **"🎉 LEVEL UP! Now Level 2!"**
- Final score, words formed, achievement percentage

---

## 📊 Step 4: Check Your Progression

1. Tap **"Home"** button on completion modal
2. Navigate to **Profile** tab (bottom navigation)
3. **Expected:**
   - **Progression Section:**
     - Level card with gradient background
     - "Level 1" or "Level 2" (if leveled up)
     - XP value (e.g., "120 XP")
     - XP progress bar
     - "XP to next level" text
   - **Unlocks Grid:**
     - Cosmetics: 0
     - Titles: 0
     - Badges: 0
     - Achievements: 0
   - **Your Stats:**
     - Games Played: 1
     - Wins: 1 (if you won)
     - High Score: X
     - Streak: 0
     - Words Formed: X
     - Level: 1 or 2

**✅ What just happened:**
- XP was awarded based on your performance
- Profile fetched progression data from backend
- Stats updated with game results

---

## 🔥 Step 5: Try a Daily Challenge

1. Navigate to **Home** tab
2. Tap **"Daily Challenge"** card
3. Review challenge details:
   - Puzzle mode
   - Target score
   - Attempts remaining
   - Time until reset
4. Tap **"Start Challenge"** button
5. Play the challenge
6. **Expected:**
   - XP earned is **1.5x higher** than solo
   - Streak progress updates

**✅ What to look for:**
- Console log: `[Progression] XP earned: X from source: dailyChallenge`
- Higher XP value in completion modal
- Streak counter increases (if completed)

---

## 🎯 Step 6: Test Multiplayer

1. Navigate to **Home** tab
2. Tap **"Multiplayer"** button
3. Tap **"Random Match"**
4. **Expected:**
   - Matchmaking starts
   - Game created
   - Redirected to multiplayer game screen

**Note:** Since you're the only player, you'll be playing against yourself. To test properly:
1. Create a second account: `player2@verbloc.com`
2. Join the same game from both accounts
3. Take turns making moves

**✅ What to look for:**
- Turn indicator shows whose turn it is
- XP earned is **1.2x higher** than solo
- Active games appear on Home screen

---

## 🏆 Step 7: Check Leaderboards

1. Navigate to **Daily Challenge** screen
2. Scroll to **"Top Players"** section
3. **Expected:**
   - Your name appears in leaderboard
   - Rank, score, and stats displayed

---

## 🎨 Step 8: Explore Special Events

1. Navigate to **Home** tab
2. Tap **"Special Events"** card
3. Select an active event
4. Review event details:
   - Description
   - Rules
   - Rewards
   - Leaderboard
5. Tap **"Start Event"** button
6. Play the event
7. **Expected:**
   - XP earned is **1.3x higher** than solo
   - Event progress tracked

---

## 🔄 Step 9: Test Session Persistence

1. Close the app completely
2. Reopen the app
3. **Expected:**
   - App opens directly to Home screen (no redirect to /auth)
   - User still signed in
   - Profile data still loaded

**✅ What just happened:**
- Bearer token persisted in SecureStore/localStorage
- Auth context checked session on mount
- User remained authenticated

---

## 🚪 Step 10: Test Sign Out

1. Navigate to **Profile** tab
2. Scroll to bottom
3. Tap **"Sign Out"** button
4. **Expected:**
   - Loading spinner appears
   - Redirected to Sign In screen
   - Token cleared from storage

---

## 🎉 Congratulations!

You've successfully tested all major features of VERBLOC:
- ✅ Authentication (sign up, sign in, sign out)
- ✅ Solo games with XP rewards
- ✅ Player progression (XP, levels)
- ✅ Daily challenges with bonus XP
- ✅ Multiplayer games
- ✅ Special events
- ✅ Session persistence

---

## 🐛 Troubleshooting

### **Issue: App stuck on loading screen**
**Solution:** Check console for errors. Ensure backend URL is configured in `app.json`.

### **Issue: "Backend URL not configured" error**
**Solution:** Rebuild the app. The backend URL is set automatically during build.

### **Issue: XP not updating**
**Solution:** Check console logs for `[Progression] XP awarded:` message. Verify network request succeeded.

### **Issue: Sign in fails**
**Solution:** Check console for error message. Verify email/password are correct. Ensure backend is running.

---

## 📚 Next Steps

1. **Read full documentation:**
   - `PROGRESSION_INTEGRATION_COMPLETE.md` - Progression system details
   - `TESTING_GUIDE.md` - Comprehensive testing scenarios
   - `AUTH_SETUP_SUMMARY.md` - Authentication details

2. **Test advanced features:**
   - Achievements unlocking
   - Cosmetic unlocks at specific levels
   - Leaderboard rankings
   - Push notifications

3. **Deploy to production:**
   - Build for iOS: `eas build --platform ios`
   - Build for Android: `eas build --platform android`
   - Submit to App Store / Google Play

---

## 🎮 Sample Test Flow

**Complete Test (15 minutes):**
1. Sign up → 1 min
2. Play 3 solo games → 5 min
3. Complete daily challenge → 3 min
4. Start multiplayer game → 2 min
5. Check profile progression → 1 min
6. Explore special events → 2 min
7. Sign out and sign in → 1 min

**Expected Results:**
- Level 2-3 achieved
- ~600-800 XP earned
- Streak: 1 day
- Games played: 4
- Profile shows all stats

---

## 📞 Need Help?

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify network requests in browser DevTools
3. Check backend logs for server-side errors
4. Refer to `TESTING_GUIDE.md` for troubleshooting

**Happy gaming!** 🎮✨
