
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handlePlaySolo = () => {
    console.log('User tapped Play Solo button');
    router.push('/game');
  };

  const handleMultiplayer = () => {
    console.log('User tapped Multiplayer button');
    // TODO: Backend Integration - GET /api/game/multiplayer/active to check for active games
    // TODO: Backend Integration - POST /api/game/multiplayer/create to create new game
  };

  const handleDailyChallenge = () => {
    console.log('User tapped Daily Challenge button');
    // TODO: Backend Integration - GET /api/daily-challenge/today to get today's challenge
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>VERBLOC</Text>
          <Text style={styles.tagline}>Form words. Change the board. Win.</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuButton, styles.primaryButton]}
            onPress={handlePlaySolo}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <IconSymbol
                ios_icon_name="play.fill"
                android_material_icon_name="play-arrow"
                size={32}
                color={colors.text}
              />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Play Solo</Text>
                <Text style={styles.buttonSubtitle}>Practice and improve your skills</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.secondaryButton]}
            onPress={handleMultiplayer}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="group"
                size={32}
                color={colors.text}
              />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Multiplayer</Text>
                <Text style={styles.buttonSubtitle}>Challenge friends or random players</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.accentButton]}
            onPress={handleDailyChallenge}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color={colors.text}
              />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Daily Challenge</Text>
                <Text style={styles.buttonSubtitle}>Compete on the leaderboard</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Form words from adjacent tiles to score points and transform the board
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 16,
  },
  menuButton: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  accentButton: {
    backgroundColor: colors.accent,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
