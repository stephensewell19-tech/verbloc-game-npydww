
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>VERBLOC Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              VERBLOC collects the following information to provide and improve our services:
            </Text>
            <Text style={styles.bulletPoint}>• Account information (email, name, profile picture)</Text>
            <Text style={styles.bulletPoint}>• Game statistics and progress data</Text>
            <Text style={styles.bulletPoint}>• Device information and identifiers</Text>
            <Text style={styles.bulletPoint}>• Usage data and analytics</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use your information to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide and maintain the game service</Text>
            <Text style={styles.bulletPoint}>• Enable multiplayer features and matchmaking</Text>
            <Text style={styles.bulletPoint}>• Track your progress and achievements</Text>
            <Text style={styles.bulletPoint}>• Send notifications about game events</Text>
            <Text style={styles.bulletPoint}>• Improve game balance and user experience</Text>
            <Text style={styles.bulletPoint}>• Process subscription payments</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information. We may share data with:
            </Text>
            <Text style={styles.bulletPoint}>• Service providers (authentication, payments, analytics)</Text>
            <Text style={styles.bulletPoint}>• Other players (username, game statistics, leaderboard rankings)</Text>
            <Text style={styles.bulletPoint}>• Legal authorities when required by law</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal data</Text>
            <Text style={styles.bulletPoint}>• Request data deletion</Text>
            <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Export your game data</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              VERBLOC is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content. You can manage cookie preferences in your device settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
            <Text style={styles.paragraph}>
              VERBLOC integrates with third-party services:
            </Text>
            <Text style={styles.bulletPoint}>• Google Sign-In (authentication)</Text>
            <Text style={styles.bulletPoint}>• Apple Sign-In (authentication)</Text>
            <Text style={styles.bulletPoint}>• Superwall (subscription management)</Text>
            <Text style={styles.bulletPoint}>• Analytics providers</Text>
            <Text style={styles.paragraph}>
              These services have their own privacy policies which govern their use of your information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your data for as long as your account is active or as needed to provide services. You may request account deletion at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this privacy policy from time to time. We will notify you of significant changes through the app or via email.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about this privacy policy or your data, please contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: privacy@verbloc.app</Text>
            <Text style={styles.bulletPoint}>• Website: www.verbloc.app</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using VERBLOC, you agree to this privacy policy and our Terms of Service.
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
