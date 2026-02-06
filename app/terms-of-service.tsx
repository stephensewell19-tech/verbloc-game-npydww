
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

export default function TermsOfServiceScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Terms of Service',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>VERBLOC Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using VERBLOC, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Eligibility</Text>
            <Text style={styles.paragraph}>
              You must be at least 13 years old to use VERBLOC. By using the app, you represent that you meet this age requirement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
            <Text style={styles.paragraph}>
              You are responsible for:
            </Text>
            <Text style={styles.bulletPoint}>• Maintaining the security of your account</Text>
            <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
            <Text style={styles.bulletPoint}>• Keeping your contact information up to date</Text>
            <Text style={styles.bulletPoint}>• Notifying us of any unauthorized access</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
            <Text style={styles.paragraph}>
              You agree NOT to:
            </Text>
            <Text style={styles.bulletPoint}>• Cheat, hack, or exploit game mechanics</Text>
            <Text style={styles.bulletPoint}>• Harass, abuse, or threaten other players</Text>
            <Text style={styles.bulletPoint}>• Use offensive usernames or profile content</Text>
            <Text style={styles.bulletPoint}>• Share your account with others</Text>
            <Text style={styles.bulletPoint}>• Reverse engineer or modify the app</Text>
            <Text style={styles.bulletPoint}>• Use bots or automated tools</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Subscriptions and Payments</Text>
            <Text style={styles.paragraph}>
              VERBLOC Premium subscriptions:
            </Text>
            <Text style={styles.bulletPoint}>• Are billed through your app store account</Text>
            <Text style={styles.bulletPoint}>• Auto-renew unless cancelled 24 hours before renewal</Text>
            <Text style={styles.bulletPoint}>• Can be managed in your app store settings</Text>
            <Text style={styles.bulletPoint}>• Are non-refundable except as required by law</Text>
            <Text style={styles.paragraph}>
              Prices are subject to change with notice. Changes apply to new subscriptions and renewals.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              All content, features, and functionality of VERBLOC are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the app without permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. User Content</Text>
            <Text style={styles.paragraph}>
              By submitting content (usernames, profile pictures, etc.), you grant us a worldwide, non-exclusive license to use, display, and distribute that content in connection with the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Game Rules and Fair Play</Text>
            <Text style={styles.paragraph}>
              VERBLOC is designed for fair competition:
            </Text>
            <Text style={styles.bulletPoint}>• No pay-to-win mechanics</Text>
            <Text style={styles.bulletPoint}>• All players have access to core gameplay</Text>
            <Text style={styles.bulletPoint}>• Premium features are cosmetic or convenience-based</Text>
            <Text style={styles.bulletPoint}>• Cheating results in account suspension or ban</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Disclaimers</Text>
            <Text style={styles.paragraph}>
              VERBLOC is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
            </Text>
            <Text style={styles.bulletPoint}>• Uninterrupted or error-free service</Text>
            <Text style={styles.bulletPoint}>• Specific game outcomes or results</Text>
            <Text style={styles.bulletPoint}>• Compatibility with all devices</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of VERBLOC.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Governing Law</Text>
            <Text style={styles.paragraph}>
              These terms are governed by the laws of the jurisdiction where VERBLOC is operated, without regard to conflict of law principles.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions about these terms, contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: support@verbloc.app</Text>
            <Text style={styles.bulletPoint}>• Website: www.verbloc.app</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using VERBLOC, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
