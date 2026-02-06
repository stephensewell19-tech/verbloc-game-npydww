
# 🔧 VERBLOC Troubleshooting Guide

Common issues and their solutions.

## 🔐 Authentication Issues

### "Authentication token not found"

**Symptoms**: Can't access protected features, redirected to sign in

**Solutions**:
1. **Sign out and sign back in**
   - Go to Profile → Sign Out
   - Sign in again with your credentials
   
2. **Clear app data** (if issue persists)
   - **Web**: Clear browser cache and localStorage
   - **iOS**: Delete app and reinstall
   - **Android**: Clear app data in settings

3. **Check backend URL**
   - Verify `app.json` has correct `backendUrl`
   - Should be: `https://4f3u7ax6jwateez5p5mamqzec794hew7.app.specular.dev`

### OAuth popup blocked (Web)

**Symptoms**: OAuth button does nothing, no popup appears

**Solutions**:
1. **Allow popups** in browser settings
2. **Disable popup blockers** for the app domain
3. **Try incognito/private mode** to test without extensions

### Session expires immediately

**Symptoms**: Signed out right after signing in

**Solutions**:
1. **Check token storage**
   - Web: Open DevTools → Application → Local Storage
   - Look for `verbloc_bearer_token`
   
2. **Check backend session**
   - Backend may have short session timeout
   - Contact backend admin to increase timeout

3. **Auto-refresh is working**
   - App refreshes session every 5 minutes
   - Check console for `[Auth] Auto-refreshing user session...`

## 🎮 Game Issues

### "No boards available"

**Symptoms**: Board selection screen is empty

**Solutions**:
1. **Seed the boards** (MOST COMMON)
   - Go to Profile tab
   - Tap "Seed Production Boards (70+)"
   - Wait for success message
   - Go back to board selection

2. **Check API response**
   - Open browser console
   - Look for `[BoardSelect] Boards loaded: X boards`
   - If X = 0, boards table is empty

3. **Verify backend is running**
   - Check backend URL is accessible
   - Try opening in browser: `https://4f3u7ax6jwateez5p5mamqzec794hew7.app.specular.dev/api/boards`

### Game doesn't start

**Symptoms**: Tapping "Play" does nothing or shows error

**Solutions**:
1. **Check console logs**
   - Look for `[Game] Starting new game...`
   - Check for error messages

2. **Verify board is selected**
   - Make sure a board is highlighted
   - Try selecting a different board

3. **Check backend game creation**
   - Look for `[API] Calling: .../api/game/solo/start`
   - Check response for `gameId`

### Moves not registering

**Symptoms**: Submitting word does nothing, score doesn't update

**Solutions**:
1. **Check word validity**
   - Word must be at least 3 letters
   - Word must be in dictionary
   - Try a common word like "CAT" or "DOG"

2. **Check selected tiles**
   - Tiles must be adjacent (horizontal, vertical, or diagonal)
   - Tiles must not be locked

3. **Check console for errors**
   - Look for `[Game] Submitting word: ...`
   - Check for validation errors

### Game completion doesn't work

**Symptoms**: Game doesn't end when win condition met

**Solutions**:
1. **Check win condition**
   - Score Target: Reach target score
   - Vault Break: Unlock all vault tiles
   - Hidden Phrase: Reveal all phrase tiles
   - Territory Control: Control 60%+ of board

2. **Check turn limit**
   - Solo games have turn limits
   - Game ends when turns reach 0

3. **Check console logs**
   - Look for `[Game] Win condition check result: ...`
   - Should show Win, Loss, or InProgress

## 👥 Multiplayer Issues

### Can't find match

**Symptoms**: Random matchmaking takes forever

**Solutions**:
1. **No other players online**
   - Try creating a private lobby instead
   - Invite a friend to test

2. **Check matchmaking settings**
   - Try different board
   - Try different player count (2 vs 3 vs 4)

3. **Backend matchmaking queue**
   - May need to wait for another player
   - Check console for matchmaking status

### Invite code doesn't work

**Symptoms**: "Invalid invite code" error

**Solutions**:
1. **Check code format**
   - Should be 6-8 characters
   - All uppercase
   - No spaces

2. **Code may have expired**
   - Private lobbies may have timeout
   - Create new lobby and get new code

3. **Game may have started**
   - Once game starts, code is invalid
   - Cannot join mid-game

### Turn status not updating

**Symptoms**: "Not your turn" but it should be

**Solutions**:
1. **Refresh game state**
   - Pull down to refresh (if supported)
   - Navigate away and back

2. **Check polling**
   - App polls every 2-5 seconds
   - Wait a few seconds for update

3. **Check console logs**
   - Look for `[MultiplayerGame] Loading game: ...`
   - Check `isMyTurn` status

## 📊 Stats & Progression Issues

### Stats not loading

**Symptoms**: Profile shows loading forever or error

**Solutions**:
1. **Initialize stats** (MOST COMMON)
   - Stats auto-initialize on first load
   - Check console for `[Home] Attempting to initialize player stats...`

2. **Manual initialization**
   - Backend endpoint: `POST /api/player/stats/initialize`
   - App should call this automatically

3. **Check user ID**
   - Make sure you're signed in
   - Check console for user info

### XP not awarded

**Symptoms**: Completed game but no XP gained

**Solutions**:
1. **Check game completion**
   - Make sure game actually completed
   - Check console for `[Progression] XP earned: ...`

2. **Check backend response**
   - Look for `[Progression] XP awarded: ...`
   - Should show XP amount and level info

3. **Refresh stats**
   - Navigate away from Profile and back
   - Stats should reload

### Level not updating

**Symptoms**: XP increases but level stays the same

**Solutions**:
1. **Check XP threshold**
   - Level formula: `level = floor(sqrt(xp / 100))`
   - Need significant XP to level up
   - Example: Level 1→2 needs 100 XP, Level 2→3 needs 300 XP

2. **Check level-up notification**
   - Should show in game completion modal
   - Look for `[Progression] LEVEL UP! New level: X`

3. **Refresh profile**
   - Navigate away and back
   - Level should update

## 🏆 Daily Challenge Issues

### Challenge not loading

**Symptoms**: "Challenge Unavailable" message

**Solutions**:
1. **Check backend**
   - Daily challenges may not be seeded
   - Contact backend admin

2. **Check date/time**
   - Challenge may have expired
   - New challenge generates at midnight UTC

3. **Retry loading**
   - Tap "Retry" button
   - Check console for error details

### Can't start challenge

**Symptoms**: "No attempts left" or "Already completed"

**Solutions**:
1. **Check attempts**
   - Daily challenges have limited attempts (usually 3)
   - Resets daily at midnight UTC

2. **Already completed**
   - Can only complete once per day
   - Wait for tomorrow's challenge

3. **Check challenge status**
   - Look for `isCompleted` and `attemptsUsed` in console

## ⭐ Special Events Issues

### No events available

**Symptoms**: "No Active Events" message

**Solutions**:
1. **Events not seeded**
   - Backend may not have events configured
   - Contact backend admin

2. **Events expired**
   - Special events are time-limited
   - Check back later for new events

3. **Check backend endpoint**
   - Try: `GET /api/special-events/current`
   - Should return active events

## 🔔 Notification Issues

### Not receiving notifications

**Symptoms**: No push notifications for turns

**Solutions**:
1. **Check permissions**
   - iOS: Settings → VERBLOC → Notifications → Allow
   - Android: Settings → Apps → VERBLOC → Notifications → Allow

2. **Check token registration**
   - Look for `[Notifications] Token registered: ...` in console
   - Token should be sent to backend

3. **Check notification settings**
   - Backend may have notifications disabled
   - Contact backend admin

## 🌐 Network Issues

### "Backend URL not configured"

**Symptoms**: App shows error about missing backend URL

**Solutions**:
1. **Check app.json**
   - Open `app.json`
   - Verify `extra.backendUrl` is set
   - Should be: `https://4f3u7ax6jwateez5p5mamqzec794hew7.app.specular.dev`

2. **Rebuild app**
   - Changes to `app.json` require rebuild
   - Run: `npm start` or `expo start`

### "Failed to fetch" errors

**Symptoms**: All API calls fail with network error

**Solutions**:
1. **Check internet connection**
   - Make sure device is online
   - Try opening a website in browser

2. **Check backend status**
   - Try opening backend URL in browser
   - Should show API documentation or response

3. **Check CORS** (Web only)
   - Backend must allow requests from your domain
   - Contact backend admin if CORS errors

### Slow API responses

**Symptoms**: App is slow, loading takes forever

**Solutions**:
1. **Check network speed**
   - Slow internet connection
   - Try on different network

2. **Backend performance**
   - Backend may be slow or overloaded
   - Contact backend admin

3. **Check console timing**
   - Look for API call duration in logs
   - Should be < 1 second for most calls

## 🐛 General Issues

### App crashes

**Symptoms**: App closes unexpectedly

**Solutions**:
1. **Check console for errors**
   - Look for red error messages
   - Note the error message and stack trace

2. **Clear app data**
   - Web: Clear cache and reload
   - Native: Reinstall app

3. **Report bug**
   - Include error message
   - Include steps to reproduce
   - Include device/browser info

### UI not updating

**Symptoms**: Changes don't reflect in UI

**Solutions**:
1. **Force refresh**
   - Navigate away and back
   - Pull down to refresh (if supported)

2. **Check state updates**
   - Look for state update logs in console
   - Should see `[Component] State updated: ...`

3. **Reload app**
   - Close and reopen app
   - Should reload all data

### Buttons not working

**Symptoms**: Tapping buttons does nothing

**Solutions**:
1. **Check if disabled**
   - Buttons may be disabled during loading
   - Wait for loading to complete

2. **Check console for errors**
   - Look for error when tapping button
   - May show validation error

3. **Try different button**
   - If one button doesn't work, try another
   - May be specific to that feature

## 📱 Platform-Specific Issues

### Web: OAuth not working

**Solutions**:
- Allow popups
- Disable popup blockers
- Try incognito mode
- Check browser console for errors

### iOS: Deep linking not working

**Solutions**:
- Check URL scheme in `app.json`: `verbloc://`
- Reinstall app
- Check iOS settings for app associations

### Android: SecureStore errors

**Solutions**:
- Check device has secure storage
- Try clearing app data
- Reinstall app

## 🆘 Still Having Issues?

If none of these solutions work:

1. **Check console logs**
   - All API calls are logged
   - Look for error messages
   - Note the exact error

2. **Check backend logs**
   - Contact backend admin
   - Provide request details from console

3. **Report bug**
   - Include error message
   - Include steps to reproduce
   - Include device/browser info
   - Include console logs

4. **Contact support**
   - Provide all troubleshooting steps tried
   - Provide screenshots if possible

---

## 📞 Support Contacts

- **Backend Issues**: Contact backend admin
- **Frontend Issues**: Contact frontend developer
- **General Questions**: Check documentation first

---

**Last Updated**: 2025-01-06
