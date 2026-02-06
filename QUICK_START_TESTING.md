
# VERBLOC Quick Start Testing Guide

## 🚀 First Time Setup (REQUIRED)

### Step 1: Seed the Boards
**This is CRITICAL - the app won't work without boards!**

1. Open the app and sign in
2. Go to **Profile** tab (bottom right)
3. Scroll down and tap **"Seed Production Boards (70+)"**
4. Wait for success message
5. You should see: "Boards Created: 70+" (or similar number)

✅ **You only need to do this ONCE per database**

---

## 🎮 Testing the App

### Home Screen
- Check your player stats (Level, XP, Streak)
- View Daily Challenge card
- View Special Events card
- See active multiplayer games (if any)

### Solo Play
1. Tap **"Play Solo"**
2. Filter by difficulty: Easy, Medium, Hard, Special
3. Select any board or tap "Random Board"
4. Play the game:
   - Tap tiles to select letters
   - Form words
   - Submit word
   - Watch board effects
   - Try to reach target score or complete objective

### Multiplayer
1. Tap **"Multiplayer"**
2. Choose:
   - **Random Match** - Find opponent automatically
   - **Private Lobby** - Create game with invite code
   - **Join by Code** - Enter friend's code
3. Take turns playing
4. Use reactions (emojis) and taunts

### Daily Challenge
1. Tap **Daily Challenge** card on Home
2. View challenge details
3. Start challenge
4. Complete within turn limit
5. Check leaderboard

### Profile
- View your stats (games played, wins, high score, etc.)
- See progression (level, XP, unlocks)
- Check achievements
- Sign out (with confirmation)

---

## ✅ What to Check

### No Errors
- [ ] Home screen loads without crashes
- [ ] Board selection shows boards
- [ ] Games start without errors
- [ ] Profile displays stats
- [ ] Navigation works smoothly

### Functionality
- [ ] Can form and submit words
- [ ] Board effects work (tiles unlock, rotate, etc.)
- [ ] Score updates correctly
- [ ] Win/lose conditions trigger
- [ ] XP is awarded after games
- [ ] Stats update after games

### UI/UX
- [ ] All buttons respond to taps
- [ ] Loading indicators show during API calls
- [ ] Error messages are clear
- [ ] Animations are smooth
- [ ] Text is readable
- [ ] Colors look good

---

## 🐛 If Something Breaks

### Common Issues:

**"No boards available"**
- Solution: Go to Profile → Seed Production Boards

**"Player stats not found"**
- Solution: Should auto-fix on next load, or restart app

**Daily Challenge fails**
- Solution: Make sure boards are seeded first

**App crashes on board select**
- Solution: Check console logs, may need to reseed boards

---

## 📊 Expected Behavior

### After Seeding Boards:
- **Easy**: ~20 boards
- **Medium**: ~20 boards
- **Hard**: ~20 boards
- **Special**: ~10 boards
- **Total**: 70+ boards

### Player Stats Start At:
- Level: 1
- XP: 0
- Games Played: 0
- Wins: 0
- Streak: 0

### XP Gain:
- Solo game: ~50-200 XP (depends on score)
- Multiplayer: ~60-240 XP (20% bonus)
- Daily Challenge: ~75-300 XP (50% bonus)
- Win bonus: +50 XP

---

## 🎯 Test Scenarios

### Scenario 1: New Player Experience
1. Sign in for first time
2. Seed boards
3. Play 1 Easy solo game
4. Check stats updated
5. Check XP gained

### Scenario 2: Difficulty Progression
1. Play Easy board
2. Play Medium board
3. Play Hard board
4. Compare difficulty

### Scenario 3: Daily Challenge
1. View today's challenge
2. Start challenge
3. Complete challenge
4. Check leaderboard position

### Scenario 4: Multiplayer
1. Create private lobby
2. Share invite code
3. Friend joins
4. Play turn-based game
5. Use reactions/taunts

---

## ✨ All Fixed Issues

1. ✅ Empty boards database → Seed endpoint created
2. ✅ Player stats not found → Auto-initialization added
3. ✅ Daily challenge failing → Fixed after boards seeded
4. ✅ Board select crashing → Response format fixed
5. ✅ Missing profile screen → Created for all platforms
6. ✅ Sign out on web → Custom modal added

---

## 🎉 Ready to Test!

The app is fully functional. Just remember to **seed the boards first** and you're good to go!

**Have fun testing VERBLOC!** 🎮✨
