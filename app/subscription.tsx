
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useMonetization } from '@/contexts/MonetizationContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, showPaywall } = useMonetization();

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
              Premium features coming soon!
            </Text>
          </LinearGradient>

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>{statusText}</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Planned Premium Features</Text>

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

          <View style={styles.comingSoonCard}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonDescription}>
              Premium subscriptions will be available in a future update. Stay tuned!
            </Text>
            
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={() => showPaywall('subscription_screen')}
              accessibilityLabel="Get notified about premium"
              accessibilityHint="Double tap to opt in for premium launch notifications"
            >
              <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
            </TouchableOpacity>
          </View>

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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  comingSoonCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  notifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
