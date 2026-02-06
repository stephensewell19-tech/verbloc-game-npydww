
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/contexts/SuperwallContext';
import { usePlacement, useUser, SuperwallLoading, SuperwallLoaded } from 'expo-superwall';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, subscriptionStatus } = useSubscription();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const { registerPlacement, state: placementState } = usePlacement({
    onPresent: (info) => {
      console.log('[Subscription] Paywall presented:', info);
    },
    onDismiss: (info, result) => {
      console.log('[Subscription] Paywall dismissed:', info, 'Result:', result);
      if (result === 'purchased' || result === 'restored') {
        console.log('[Subscription] User subscribed!');
        // Refresh subscription status
        router.back();
      }
    },
    onError: (error) => {
      console.error('[Subscription] Paywall error:', error);
    },
  });

  const handleShowPaywall = async () => {
    console.log('[Subscription] User tapped Subscribe button');
    setLoading(true);
    try {
      await registerPlacement({
        placement: 'verbloc_premium',
        feature: () => {
          console.log('[Subscription] User already has premium access');
          router.back();
        },
      });
    } catch (error) {
      console.error('[Subscription] Failed to show paywall:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusText = isPremium ? 'Active' : 'Free';
  const statusColor = isPremium ? colors.success : colors.textSecondary;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'VERBLOC Premium',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <SuperwallLoading>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading subscription info...</Text>
          </View>
        </SuperwallLoading>

        <SuperwallLoaded>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Hero Section */}
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroSection}
            >
              <IconSymbol
                ios_icon_name="crown.fill"
                android_material_icon_name="workspace-premium"
                size={64}
                color="#FFFFFF"
              />
              <Text style={styles.heroTitle}>VERBLOC Premium</Text>
              <Text style={styles.heroSubtitle}>
                Unlock unlimited gameplay and exclusive features
              </Text>
            </LinearGradient>

            {/* Current Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>Current Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusBadgeText}>{statusText}</Text>
                </View>
              </View>
              {user && (
                <Text style={styles.statusEmail}>{user.appUserId}</Text>
              )}
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Premium Features</Text>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="infinity"
                    android_material_icon_name="all-inclusive"
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Unlimited Matches</Text>
                  <Text style={styles.featureDescription}>
                    Play as many games as you want, whenever you want
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="person.2.fill"
                    android_material_icon_name="group"
                    size={28}
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Private Lobbies</Text>
                  <Text style={styles.featureDescription}>
                    Create private multiplayer games with friends
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="paintbrush.fill"
                    android_material_icon_name="palette"
                    size={28}
                    color={colors.highlight}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Exclusive Themes</Text>
                  <Text style={styles.featureDescription}>
                    Access premium board skins and tile styles
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="puzzlepiece.fill"
                    android_material_icon_name="extension"
                    size={28}
                    color={colors.accent}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Puzzle Packs</Text>
                  <Text style={styles.featureDescription}>
                    Unlock additional challenge boards and special events
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="bolt.fill"
                    android_material_icon_name="flash-on"
                    size={28}
                    color={colors.success}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>No Ads</Text>
                  <Text style={styles.featureDescription}>
                    Enjoy uninterrupted gameplay with zero ads
                  </Text>
                </View>
              </View>
            </View>

            {/* Free Features */}
            <View style={styles.freeSection}>
              <Text style={styles.sectionTitle}>Free Features</Text>
              <Text style={styles.freeSectionDescription}>
                All players get access to:
              </Text>

              <View style={styles.freeFeaturesList}>
                <View style={styles.freeFeatureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.freeFeatureText}>Full core gameplay</Text>
                </View>

                <View style={styles.freeFeatureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.freeFeatureText}>Daily Challenges</Text>
                </View>

                <View style={styles.freeFeatureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.freeFeatureText}>Limited daily matches</Text>
                </View>

                <View style={styles.freeFeatureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.freeFeatureText}>Progression system</Text>
                </View>
              </View>
            </View>

            {/* Pricing */}
            {!isPremium && (
              <View style={styles.pricingSection}>
                <Text style={styles.sectionTitle}>Choose Your Plan</Text>

                <View style={styles.pricingCard}>
                  <View style={styles.pricingHeader}>
                    <Text style={styles.pricingTitle}>Monthly</Text>
                    <View style={styles.pricingBadge}>
                      <Text style={styles.pricingBadgeText}>Popular</Text>
                    </View>
                  </View>
                  <Text style={styles.pricingPrice}>$4.99</Text>
                  <Text style={styles.pricingPeriod}>per month</Text>
                </View>

                <View style={styles.pricingCard}>
                  <View style={styles.pricingHeader}>
                    <Text style={styles.pricingTitle}>Yearly</Text>
                    <View style={[styles.pricingBadge, styles.pricingBadgeBest]}>
                      <Text style={styles.pricingBadgeText}>Best Value</Text>
                    </View>
                  </View>
                  <Text style={styles.pricingPrice}>$19.99</Text>
                  <Text style={styles.pricingPeriod}>per year</Text>
                  <Text style={styles.pricingSavings}>Save 67%</Text>
                </View>
              </View>
            )}

            {/* CTA Button */}
            {!isPremium && (
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleShowPaywall}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.subscribeButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol
                        ios_icon_name="crown.fill"
                        android_material_icon_name="workspace-premium"
                        size={24}
                        color="#FFFFFF"
                      />
                      <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isPremium && (
              <View style={styles.premiumActiveCard}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={48}
                  color={colors.success}
                />
                <Text style={styles.premiumActiveTitle}>You&apos;re Premium!</Text>
                <Text style={styles.premiumActiveDescription}>
                  Thank you for supporting VERBLOC. Enjoy unlimited gameplay!
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                • No pay-to-win mechanics
              </Text>
              <Text style={styles.footerText}>
                • Cancel anytime
              </Text>
              <Text style={styles.footerText}>
                • Subscriptions managed through your app store
              </Text>
            </View>
          </ScrollView>
        </SuperwallLoaded>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusEmail: {
    fontSize: 14,
    color: colors.text,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  freeSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  freeSectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  freeFeaturesList: {
    gap: 12,
  },
  freeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  freeFeatureText: {
    fontSize: 16,
    color: colors.text,
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricingBadgeBest: {
    backgroundColor: colors.success,
  },
  pricingBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricingPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pricingSavings: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginTop: 8,
  },
  subscribeButton: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  premiumActiveCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  premiumActiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  premiumActiveDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
