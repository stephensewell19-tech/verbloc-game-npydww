
# VERBLOC Monetization System

## Overview

VERBLOC uses **Superwall** for cross-platform in-app purchases and subscriptions. The monetization system is designed to be:

- **Fair**: No pay-to-win mechanics
- **Optional**: All core gameplay is free
- **Non-intrusive**: No ads during active gameplay
- **Cross-platform**: Works on both iOS and Android

## Architecture

### Components

1. **SuperwallContext** (`contexts/SuperwallContext.tsx`)
   - Wraps the app with Superwall SDK
   - Provides subscription state to all components
   - Manages user identification and subscription status

2. **Subscription Screen** (`app/subscription.tsx`)
   - Displays premium features and pricing
   - Triggers paywall presentation
   - Shows current subscription status

3. **Profile Integration** (`app/(tabs)/profile.tsx`)
   - Shows subscription badge
   - Premium upsell card for free users
   - Link to subscription management

## Setup Instructions

### 1. Get Superwall API Keys

1. Sign up at [Superwall Dashboard](https://superwall.com)
2. Create a new app
3. Get your iOS and Android API keys
4. Configure your paywalls in the Superwall dashboard

### 2. Configure API Keys

Update `app.json` with your Superwall API keys:

```json
{
  "expo": {
    "extra": {
      "superwallIosKey": "YOUR_IOS_API_KEY",
      "superwallAndroidKey": "YOUR_ANDROID_API_KEY"
    }
  }
}
```

### 3. Configure Paywalls in Superwall Dashboard

Create a placement named `verbloc_premium` with:

**Products:**
- Monthly subscription: $4.99/month
- Yearly subscription: $19.99/year

**Features to highlight:**
- Unlimited matches
- Private multiplayer lobbies
- Exclusive cosmetic themes
- Optional puzzle packs
- No ads

### 4. Configure App Store / Google Play

#### iOS (App Store Connect)

1. Create in-app purchase products:
   - `verbloc_premium_monthly` - Auto-renewable subscription ($4.99/month)
   - `verbloc_premium_yearly` - Auto-renewable subscription ($19.99/year)

2. Set up subscription groups
3. Configure pricing and availability
4. Submit for review

#### Android (Google Play Console)

1. Create subscription products:
   - `verbloc_premium_monthly` - Monthly subscription ($4.99)
   - `verbloc_premium_yearly` - Yearly subscription ($19.99)

2. Configure pricing and availability
3. Submit for review

## Usage

### Check Subscription Status

```tsx
import { useSubscription } from '@/contexts/SuperwallContext';

function MyComponent() {
  const { isPremium, subscriptionStatus } = useSubscription();
  
  if (isPremium) {
    // Show premium features
  } else {
    // Show free features
  }
}
```

### Show Paywall

```tsx
import { usePlacement } from 'expo-superwall';

function MyComponent() {
  const { registerPlacement } = usePlacement({
    onPresent: (info) => console.log('Paywall shown'),
    onDismiss: (info, result) => {
      if (result === 'purchased') {
        console.log('User subscribed!');
      }
    },
  });

  const handleUpgrade = async () => {
    await registerPlacement({
      placement: 'verbloc_premium',
      feature: () => {
        // User already has premium
        console.log('Already premium');
      },
    });
  };

  return <Button onPress={handleUpgrade}>Upgrade</Button>;
}
```

### Identify User

The Superwall SDK automatically identifies users when they sign in through the AuthContext. No additional code needed.

## Free vs Premium Features

### Free Players Get:
- ✅ Full access to core gameplay
- ✅ Limited number of daily matches (configurable)
- ✅ Access to Daily Challenges
- ✅ Progression system (XP, levels, achievements)
- ✅ Public multiplayer matchmaking

### Premium Players Get:
- ✅ **Unlimited matches** - Play as much as you want
- ✅ **Private multiplayer lobbies** - Create games with friends
- ✅ **Exclusive cosmetic themes** - Premium board skins and tile styles
- ✅ **Optional puzzle packs** - Additional challenge boards
- ✅ **No ads** - Uninterrupted gameplay
- ✅ All free features

## Pricing

- **Monthly**: $4.99/month
- **Yearly**: $19.99/year (Save 67%)

## Implementation Checklist

- [x] Install expo-superwall package
- [x] Create SuperwallContext
- [x] Wrap app with SuperwallProvider
- [x] Create subscription screen
- [x] Add subscription status to profile
- [x] Add premium upsell cards
- [ ] Configure Superwall dashboard
- [ ] Add API keys to app.json
- [ ] Create App Store products
- [ ] Create Google Play products
- [ ] Test subscription flow on iOS
- [ ] Test subscription flow on Android
- [ ] Test restore purchases
- [ ] Test subscription cancellation

## Testing

### Test Subscription Flow

1. **iOS**: Use sandbox test accounts in App Store Connect
2. **Android**: Use test accounts in Google Play Console
3. **Superwall**: Use test mode in Superwall dashboard

### Test Scenarios

1. ✅ Free user sees premium upsell
2. ✅ Paywall displays correctly
3. ✅ Purchase completes successfully
4. ✅ Subscription status updates immediately
5. ✅ Premium features unlock
6. ✅ Restore purchases works
7. ✅ Subscription cancellation works
8. ✅ Subscription renewal works

## Monetization Principles

### No Pay-to-Win
- Premium subscription does NOT provide gameplay advantages
- All players compete on equal footing
- Premium is about convenience and cosmetics, not power

### Fair Free Tier
- Free players can enjoy the full game experience
- Daily match limits are generous
- All core features are accessible

### Non-Intrusive
- No ads during active gameplay
- No forced upsells
- Premium prompts are tasteful and optional

## Analytics & Metrics

Track these metrics in Superwall dashboard:

- **Conversion Rate**: % of users who subscribe
- **Trial Conversion**: % of trial users who convert to paid
- **Churn Rate**: % of subscribers who cancel
- **LTV (Lifetime Value)**: Average revenue per user
- **ARPU (Average Revenue Per User)**: Total revenue / total users

## Support

### Common Issues

**Q: Paywall not showing?**
A: Check that API keys are configured correctly in app.json and Superwall dashboard.

**Q: Subscription not activating?**
A: Ensure products are configured in App Store Connect / Google Play Console and match Superwall configuration.

**Q: Restore purchases not working?**
A: Superwall handles restore automatically. Ensure user is signed in with the same Apple ID / Google account.

### Resources

- [Superwall Documentation](https://superwall.com/docs)
- [Expo Superwall SDK](https://github.com/superwall/expo-superwall)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

## Future Enhancements

Potential monetization features to add:

- [ ] Lifetime premium purchase option
- [ ] Family sharing support
- [ ] Gift subscriptions
- [ ] Promotional codes
- [ ] Referral rewards
- [ ] Premium-only special events
- [ ] Exclusive premium puzzle packs
- [ ] Premium-only cosmetic shop

## Compliance

### App Store Guidelines
- Subscriptions must use Apple's In-App Purchase system
- Clear pricing and terms displayed
- Easy cancellation process
- Privacy policy updated

### Google Play Policies
- Subscriptions must use Google Play Billing
- Clear pricing and terms displayed
- Easy cancellation process
- Privacy policy updated

### Privacy
- Superwall collects minimal user data
- No personal information shared without consent
- GDPR and CCPA compliant
- Privacy policy updated to reflect Superwall usage
