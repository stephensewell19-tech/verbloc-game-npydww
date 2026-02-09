
# VERBLOC Launch Checklist

## ✅ Pre-Launch Requirements

### 1. App Configuration
- [ ] Update `app.json` with production backend URL
- [ ] Set proper bundle identifiers:
  - iOS: `com.verbloc.app`
  - Android: `com.verbloc.app`
- [ ] Configure Superwall API keys (iOS & Android)
- [ ] Update EAS project ID in `app.json`
- [ ] Verify app name displays as "VERBLOC" on all platforms

### 2. Visual Assets
- [ ] Replace `assets/images/app-icon-txp.png` with final app icon (1024x1024px)
- [ ] Create iOS adaptive icon (foreground + background)
- [ ] Create Android adaptive icon
- [ ] Prepare App Store screenshots (6.5", 5.5" for iOS)
- [ ] Prepare Google Play screenshots (phone + tablet)
- [ ] Create feature graphic for Google Play (1024x500px)

### 3. Backend Configuration
- [ ] Verify production backend URL is accessible
- [ ] Seed production database with initial boards
- [ ] Test all API endpoints in production
- [ ] Configure Better Auth with production OAuth credentials
- [ ] Set up database backups
- [ ] Configure error logging and monitoring

### 4. Authentication
- [ ] Test email/password signup and login
- [ ] Configure Google OAuth (iOS & Android)
- [ ] Configure Apple Sign In (iOS)
- [ ] Test social auth flows on both platforms
- [ ] Verify session persistence across app restarts
- [ ] Test sign out functionality

### 5. Monetization
- [ ] Create Superwall account and configure paywalls
- [ ] Set up App Store Connect in-app purchases (iOS)
- [ ] Set up Google Play billing (Android)
- [ ] Configure subscription products:
  - Monthly: $4.99
  - Yearly: $19.99
- [ ] Test purchase flows on both platforms
- [ ] Test subscription restoration
- [ ] Verify free vs premium feature gating

### 6. Gameplay Testing
- [ ] Test solo mode on all difficulty levels
- [ ] Verify word validation (test common words like "box", "cat", "dog")
- [ ] Test all puzzle modes:
  - Score Target
  - Vault Break
  - Hidden Phrase
  - Territory Control
- [ ] Test multiplayer matchmaking
- [ ] Test turn-based multiplayer gameplay
- [ ] Verify daily challenge functionality
- [ ] Test special events system
- [ ] Verify XP and level progression
- [ ] Test achievement unlocks

### 7. Cross-Platform Testing
**iOS Devices:**
- [ ] iPhone SE (small screen)
- [ ] iPhone 14/15 (standard)
- [ ] iPhone 14/15 Pro Max (large screen)
- [ ] iPad (tablet layout)

**Android Devices:**
- [ ] Small phone (5" screen)
- [ ] Standard phone (6" screen)
- [ ] Large phone (6.5"+ screen)
- [ ] Tablet (10" screen)

**Web:**
- [ ] Desktop browser (Chrome, Safari, Firefox)
- [ ] Mobile browser (iOS Safari, Android Chrome)
- [ ] Responsive layout at various screen sizes

### 8. Performance & Stability
- [ ] Test on low-end devices (2GB RAM)
- [ ] Verify smooth animations (60fps)
- [ ] Test with poor network conditions
- [ ] Verify offline functionality (cached data)
- [ ] Test app backgrounding and foregrounding
- [ ] Check memory usage (no leaks)
- [ ] Verify battery consumption is reasonable

### 9. User Experience
- [ ] Complete onboarding flow as new user
- [ ] Test haptic feedback on all interactions
- [ ] Verify all animations are smooth
- [ ] Test error messages are user-friendly
- [ ] Verify loading states display correctly
- [ ] Test navigation flows (back buttons, deep links)
- [ ] Verify push notifications (if enabled)

### 10. Legal & Compliance
- [ ] Review and finalize Privacy Policy
- [ ] Review and finalize Terms of Service
- [ ] Ensure GDPR compliance (EU users)
- [ ] Verify COPPA compliance (if targeting under 13)
- [ ] Add required permissions explanations (iOS Info.plist)
- [ ] Verify Android permissions are minimal and justified

### 11. App Store Metadata

**iOS App Store:**
- [ ] App name: "VERBLOC"
- [ ] Subtitle: "Word Puzzle Strategy Game"
- [ ] Description (4000 char max)
- [ ] Keywords (100 char max)
- [ ] Screenshots (6.5", 5.5", 12.9" iPad)
- [ ] App preview video (optional)
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Category: Games > Word
- [ ] Support URL
- [ ] Marketing URL (optional)

**Google Play Store:**
- [ ] App name: "VERBLOC"
- [ ] Short description (80 char max)
- [ ] Full description (4000 char max)
- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic (1024x500px)
- [ ] Promo video (YouTube link, optional)
- [ ] Content rating questionnaire
- [ ] Category: Games > Word
- [ ] Target audience: Everyone
- [ ] Privacy Policy URL

### 12. Build & Submission

**iOS:**
```bash
# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

**Android:**
```bash
# Build for production
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

### 13. Post-Launch Monitoring
- [ ] Set up crash reporting (Sentry, Bugsnag, etc.)
- [ ] Monitor backend API performance
- [ ] Track user acquisition metrics
- [ ] Monitor in-app purchase revenue
- [ ] Watch for user reviews and feedback
- [ ] Prepare for rapid bug fixes if needed

## 🚨 Critical Issues to Verify

### Word Recognition
- ✅ "BOX" is now in dictionary (was missing)
- ✅ Common 3-letter words included
- ✅ 2000+ words in dictionary

### State Management
- ✅ Fixed React state update error in `_layout.tsx`
- ✅ Proper loading states throughout app
- ✅ No memory leaks in game screens

### Authentication
- ✅ Better Auth properly configured
- ✅ Token persistence in SecureStore
- ✅ Session refresh every 5 minutes

### Cross-Platform
- ✅ iOS and Android platform-specific files updated
- ✅ Web OAuth uses popup flow
- ✅ Native OAuth uses deep linking

## 📊 Success Metrics

**Day 1:**
- [ ] 0 crashes reported
- [ ] All critical features working
- [ ] Positive user reviews (4+ stars)

**Week 1:**
- [ ] 1000+ downloads
- [ ] 50%+ retention rate
- [ ] 5%+ conversion to premium

**Month 1:**
- [ ] 10,000+ downloads
- [ ] 30%+ 30-day retention
- [ ] 10%+ conversion to premium

## 🎉 Launch Day Checklist

- [ ] Final build uploaded to stores
- [ ] App approved by Apple
- [ ] App approved by Google
- [ ] Backend scaled for expected traffic
- [ ] Support email monitored
- [ ] Social media accounts ready
- [ ] Press kit prepared (if applicable)
- [ ] Team on standby for issues

---

**VERBLOC is ready for launch! 🚀**

*Form words. Change the board. Win.*
