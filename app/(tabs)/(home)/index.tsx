
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { Modal } from '@/components/button';

interface ActiveGame {
  gameId: string;
  opponentName: string;
  isMyTurn: boolean;
  lastMoveAt: string;
}

interface DailyChallenge {
  challengeId: string;
  date: string;
  boardState: any;
  targetScore: number;
  userCompleted: boolean;
  userScore?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [infoModal, setInfoModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadActiveGames();
    loadDailyChallenge();
  }, []);

  const loadActiveGames = async () => {
    console.log('[Home] Loading active multiplayer games...');
    try {
      const games = await authenticatedGet<ActiveGame[]>('/api/game/multiplayer/active');
      console.log('[Home] Active games loaded:', games);
      setActiveGames(games);
    } catch (error: any) {
      console.error('[Home] Failed to load active games:', error);
      // Don't show error modal for this - it's not critical
    }
  };

  const loadDailyChallenge = async () => {
    console.log('[Home] Loading daily challenge...');
    try {
      const challenge = await authenticatedGet<DailyChallenge>('/api/daily-challenge/today');
      console.log('[Home] Daily challenge loaded:', challenge);
      setDailyChallenge(challenge);
    } catch (error: any) {
      console.error('[Home] Failed to load daily challenge:', error);
      // Don't show error modal for this - it's not critical
    }
  };

  const handlePlaySolo = () => {
    console.log('[Home] User tapped Play Solo button');
    router.push('/game');
  };

  const handleMultiplayer = async () => {
    console.log('[Home] User tapped Multiplayer button');
    
    // Check if there are active games
    if (activeGames.length > 0) {
      setInfoModal({
        visible: true,
        message: `You have ${activeGames.length} active game(s). Creating multiplayer games is coming soon!`,
      });
      return;
    }

    // Create new multiplayer game
    try {
      setLoading(true);
      const response = await authenticatedPost<{
        gameId: string;
        boardState: any;
        inviteCode: string;
      }>('/api/game/multiplayer/create', {});
      
      console.log('[Home] Multiplayer game created:', response);
      setInfoModal({
        visible: true,
        message: `Game created! Invite code: ${response.inviteCode}\n\nMultiplayer gameplay coming soon!`,
      });
      
      // Reload active games
      await loadActiveGames();
    } catch (error: any) {
      console.error('[Home] Failed to create multiplayer game:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to create multiplayer game',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDailyChallenge = () => {
    console.log('[Home] User tapped Daily Challenge button');
    
    if (!dailyChallenge) {
      setErrorModal({
        visible: true,
        message: 'Daily challenge not available. Please try again later.',
      });
      return;
    }

    if (dailyChallenge.userCompleted) {
      setInfoModal({
        visible: true,
        message: `You've already completed today's challenge!\n\nYour score: ${dailyChallenge.userScore}\nTarget: ${dailyChallenge.targetScore}`,
      });
      return;
    }

    setInfoModal({
      visible: true,
      message: `Daily Challenge\n\nTarget Score: ${dailyChallenge.targetScore}\n\nDaily challenge gameplay coming soon!`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

          {activeGames.length > 0 && (
            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="group"
                size={24}
                color={colors.success}
              />
              <Text style={styles.infoText}>
                You have {activeGames.length} active multiplayer game{activeGames.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {dailyChallenge && !dailyChallenge.userCompleted && (
            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.highlight}
              />
              <Text style={styles.infoText}>
                New daily challenge available! Target: {dailyChallenge.targetScore}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />

      <Modal
        visible={infoModal.visible}
        title="Info"
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, message: '' })}
        type="info"
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
