
# 🧪 VERBLOC Progression System - Testing Guide

## 🎯 Quick Test Scenarios

### **Scenario 1: First-Time User Experience**
**Goal:** Verify new user starts at Level 1 with 0 XP

**Steps:**
1. Sign up with a new account
2. Navigate to Profile tab
3. **Expected:**
   - Level: 1
   - XP: 0
   - XP to next level: 400
   - Unlocks: 0 cosmetics, 0 titles, 0 badges, 0 achievements

---

### **Scenario 2: Solo Game XP Award**
**Goal:** Verify XP is awarded after completing a solo game

**Steps:**
1. Sign in to the app
2. Tap "Play Solo" on Home screen
3. Select any board (e.g., "Easy - Score Target")
4. Play the game and complete it (win or lose)
5. **Expected:**
   - Game completion modal appears
   - Modal shows "+X XP" (e.g., "+120 XP")
   - If leveled up, shows "🎉 LEVEL UP! Now Level X!"
6. Navigate to Profile tab
7. **Expected:**
   - XP has increased
   - Level may have increased (if threshold crossed)
   - XP progress bar updated

**Console Logs to Check:**
```
[Progression] XP earned: X from source: solo
[Progression] XP awarded: { newXp, newLevel, leveledUp, ... }
```

---

### **Scenario 3: Multiplayer XP Bonus**
**Goal:** Verify multiplayer games award 1.2x XP

**Steps:**
1. Start a multiplayer game (random or private)
2. Complete the game
3. **Expected:**
   - XP earned is ~20% higher than equivalent solo game
   - Console log shows: `[Progression] XP earned: X from source: multiplayer`

**Example:**
- Solo game: 600 score, 12 words → ~260 XP
- Multiplayer game: 600 score, 12 words → ~312 XP (1.2x)

---

### **Scenario 4: Daily Challenge XP Bonus**
**Goal:** Verify daily challenges award 1.5x XP

**Steps:**
1. Navigate to Daily Challenge screen
2. Tap "Start Challenge"
3. Complete the challenge
4. **Expected:**
   - XP earned is ~50% higher than equivalent solo game
   - Console log shows: `[Progression] XP earned: X from source: dailyChallenge`

**Example:**
- Solo game: 600 score, 12 words → ~260 XP
- Daily Challenge: 600 score, 12 words → ~390 XP (1.5x)

---

### **Scenario 5: Level Up Celebration**
**Goal:** Verify level-up notification appears

**Steps:**
1. Check current XP in Profile (e.g., 350 XP, Level 1)
2. Play a game to earn enough XP to reach 400 XP (Level 2 threshold)
3. **Expected:**
   - Game completion modal shows:
     - "+X XP"
     - "🎉 LEVEL UP! Now Level 2!"
   - Profile screen updates to Level 2

**Level Thresholds:**
- Level 1 → 2: 400 XP
- Level 2 → 3: 900 XP
- Level 3 → 4: 1,600 XP
- Level 4 → 5: 2,500 XP

---

### **Scenario 6: Profile Progression Display**
**Goal:** Verify Profile screen displays progression correctly

**Steps:**
1. Navigate to Profile tab
2. **Expected:**
   - **Progression Section:**
     - Level card with gradient background
     - Star icon badge
     - "Level X" title
     - "Y XP" subtitle
     - XP progress bar (visual indicator)
     - "Z XP to next level" text
   - **Unlocks Grid:**
     - Cosmetics count (e.g., "2")
     - Titles count (e.g., "1")
     - Badges count (e.g., "0")
     - Achievements count (e.g., "0")

**Console Logs to Check:**
```
[Profile] Fetching player progression...
[Profile] Player progression loaded: { level, xp, xpToNextLevel, ... }
```

---

### **Scenario 7: Home Screen Player Info**
**Goal:** Verify Home screen displays player level and XP

**Steps:**
1. Navigate to Home tab
2. **Expected:**
   - Player info card shows:
     - Player name
     - Level badge (e.g., "Level 5")
     - Streak badge (e.g., "3 day streak")
     - XP progress bar
     - "X / Y XP" text

**Console Logs to Check:**
```
[Home] Loading player stats...
[Home] Player stats loaded: { level, experiencePoints, ... }
```

---

### **Scenario 8: Special Event XP Bonus**
**Goal:** Verify special events award 1.3x XP

**Steps:**
1. Navigate to Special Events screen
2. Select an active event
3. Tap "Start Event"
4. Complete the event
5. **Expected:**
   - XP earned is ~30% higher than equivalent solo game
   - Console log shows: `[Progression] XP earned: X from source: specialEvent`

**Example:**
- Solo game: 600 score, 12 words → ~260 XP
- Special Event: 600 score, 12 words → ~338 XP (1.3x)

---

## 🔍 Console Log Monitoring

### **Key Logs to Watch:**

#### **XP Calculation:**
```
[Progression] Calculating XP: { source, score, wordsFormed, efficiency, isWon, ... }
[Progression] XP calculated: X
```

#### **XP Award:**
```
[Progression] XP earned: X from source: solo
[Progression] XP awarded: { newXp, newLevel, leveledUp, newUnlocks, xpToNextLevel }
```

#### **Level Up:**
```
[Progression] LEVEL UP! New level: X
```

#### **Profile Load:**
```
[Profile] Fetching player progression...
[Profile] Player progression loaded: { level, xp, xpToNextLevel, unlockedCosmetics, ... }
```

---

## 🐛 Common Issues & Solutions

### **Issue: XP not updating**
**Symptoms:** Game completes but XP doesn't increase

**Debug Steps:**
1. Check console for error messages
2. Verify network request to `/api/player/progress/award-xp`
3. Check backend logs for errors
4. Ensure user is authenticated (Bearer token present)

**Solution:**
- Verify `authenticatedPost` is being called
- Check backend endpoint is responding with 200 status
- Ensure XP calculation is not returning 0

---

### **Issue: Level not updating**
**Symptoms:** XP increases but level stays the same

**Debug Steps:**
1. Check current XP value
2. Calculate expected level: `level = floor(sqrt(xp / 100))`
3. Verify backend is returning correct `newLevel`

**Solution:**
- Ensure backend level calculation matches formula
- Check if XP threshold has been crossed
- Verify frontend is updating state with `newLevel`

---

### **Issue: Profile not loading progression**
**Symptoms:** Profile shows loading spinner indefinitely

**Debug Steps:**
1. Check console for error messages
2. Verify network request to `/api/player/progress`
3. Check backend logs for errors
4. Ensure user is authenticated

**Solution:**
- Verify `authenticatedGet` is being called
- Check backend endpoint is responding
- Ensure backend has progression data for user

---

## 📊 Expected XP Values

### **Minimum XP per Game:**
- **Any game:** 10 XP (minimum participation reward)

### **Typical XP Ranges:**
- **Low score game (200-300):** 50-100 XP
- **Medium score game (400-600):** 150-250 XP
- **High score game (700-1000):** 300-500 XP
- **Exceptional game (1000+):** 500+ XP

### **Multipliers:**
- **Solo:** 1.0x
- **Multiplayer:** 1.2x
- **Daily Challenge:** 1.5x
- **Special Event:** 1.3x

---

## ✅ Test Checklist

Use this checklist to verify all progression features:

- [ ] New user starts at Level 1 with 0 XP
- [ ] Solo game awards XP on completion
- [ ] Multiplayer game awards 1.2x XP
- [ ] Daily Challenge awards 1.5x XP
- [ ] Special Event awards 1.3x XP
- [ ] Level-up notification appears when threshold crossed
- [ ] Profile displays current level and XP
- [ ] Profile shows XP progress bar
- [ ] Profile displays unlocks counts
- [ ] Home screen shows player level badge
- [ ] Home screen shows XP progress bar
- [ ] Game completion modal shows XP earned
- [ ] Game completion modal shows level-up message
- [ ] XP calculation includes all bonuses (score, words, efficiency, win)
- [ ] Progression persists across app restarts
- [ ] Progression is shared across all game modes

---

## 🎮 Sample Test User

**Recommended Test Flow:**
1. Create new account: `testuser@example.com`
2. Play 3 solo games (should reach ~Level 2)
3. Play 2 multiplayer games (should reach ~Level 3)
4. Complete 1 daily challenge (should reach ~Level 4)
5. Verify all progression data in Profile

**Expected Progression:**
- After 3 solo games: ~600 XP, Level 2
- After 2 multiplayer games: ~1,200 XP, Level 3
- After 1 daily challenge: ~1,800 XP, Level 4

---

## 📞 Need Help?

If you encounter issues during testing:
1. Check console logs for detailed error messages
2. Verify network requests in browser DevTools
3. Check backend logs for server-side errors
4. Ensure backend URL is configured in `app.json`

**Happy testing!** 🚀✨
