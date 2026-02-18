
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/button';
import { authenticatedPost, authenticatedGet } from '@/utils/api';
import GameBoard from '@/components/GameBoard';
import { setLastPlayedMode } from '@/utils/onboarding';
import {
  MultiplayerGame,
  TurnStatus,
  ALLOWED_EMOJIS,
  AllowedEmoji,
  TauntType,
  TAUNT_MESSAGES,
  Position,
  Tile,
} from '@/types/game';
import Animated from 'react-native-reanimated';
import { safeFadeIn, safeFadeOut } from '@/utils/safeAnimations';

export default function MultiplayerGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { gameId } = params as { gameId: string };
  
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [turnStatus, setTurnStatus] = useState<TurnStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showTaunts, setShowTaunts] = useState(false);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameId) {
      setLastPlayedMode('multiplayer');
      
      loadGame();
      loadTurnStatus();
      
      const pollInterval = setInterval(() => {
        loadGame();
        loadTurnStatus();
      }, turnStatus?.isLiveMatch ? 2000 : 5000);

      return () => {
        clearInterval(pollInterval);
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [gameId, turnStatus?.isLiveMatch]);

  useEffect(() => {
    if (turnStatus && turnStatus.isLiveMatch && turnStatus.turnTimeRemaining) {
      setTurnTimeRemaining(turnStatus.turnTimeRemaining);
      
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      
      timerInterval.current = setInterval(() => {
        setTurnTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            if (timerInterval.current) {
              clearInterval(timerInterval.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [turnStatus]);

  const loadGame = async () => {
    try {
      console.log('[MultiplayerGame] Loading game:', gameId);
      const response = await authenticatedGet<MultiplayerGame>(`/api/game/multiplayer/${gameId}`);
      setGame(response);
      setLoading(false);
      
      if (response.status === 'completed') {
        const isDailyChallenge = params.dailyChallenge === 'true';
        const challengeId = params.challengeId as string | undefined;
        
        if (isDailyChallenge && challengeId) {
          console.log('[DailyChallenge] Multiplayer game completed, completing challenge:', challengeId);
          
          const currentPlayer = response.players.find(p => p.isCurrentTurn);
          const playerScore = currentPlayer?.score || 0;
          
          try {
            const completionResponse = await authenticatedPost(`/api/daily-challenge/${challengeId}/complete`, {
              gameId,
              score: playerScore,
              turnsUsed: response.moveHistory.length,
              wordsFormed: response.moveHistory.length,
              efficiency: playerScore / Math.max(response.moveHistory.length, 1),
              timeTakenSeconds: Math.floor((new Date(response.updatedAt).getTime() - new Date(response.createdAt).getTime()) / 1000),
              isWon: response.status === 'completed',
            });
            console.log('[DailyChallenge] Challenge completion response:', completionResponse);
          } catch (challengeErr) {
            console.error('[DailyChallenge] Failed to complete daily challenge:', challengeErr);
          }
        }
      }
    } catch (err: any) {
      console.error('[MultiplayerGame] Failed to load game:', err);
      setError(err.message || 'Failed to load game');
      setLoading(false);
    }
  };

  const loadTurnStatus = async () => {
    try {
      const response = await authenticatedGet<TurnStatus>(`/api/game/multiplayer/${gameId}/turn-status`);
      setTurnStatus(response);
    } catch (err) {
      console.error('[MultiplayerGame] Failed to load turn status:', err);
    }
  };

  const handleTilePress = (row: number, col: number) => {
    console.log('[MultiplayerGame] Tile pressed:', row, col);
    
    if (!game || !game.boardState || !game.boardState.tiles) {
      console.error('[MultiplayerGame] Cannot press tile - game not initialized');
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Game not ready. Please refresh.',
      });
      return;
    }
    
    if (!turnStatus) {
      console.error('[MultiplayerGame] Cannot press tile - turn status not loaded');
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Turn status not loaded. Please refresh.',
      });
      return;
    }
    
    if (!turnStatus.isMyTurn) {
      console.log('[MultiplayerGame] Not player\'s turn');
      setAlertModal({
        visible: true,
        title: 'Not Your Turn',
        message: 'Wait for your turn to make a move',
      });
      return;
    }
    
    if (row < 0 || row >= game.boardState.tiles.length || col < 0 || col >= game.boardState.tiles[0].length) {
      console.error('[MultiplayerGame] Invalid tile position:', row, col);
      return;
    }
    
    const tile = game.boardState.tiles[row][col];
    if (!tile) {
      console.error('[MultiplayerGame] Tile not found at position:', row, col);
      return;
    }

    const position = { row, col };
    const existingIndex = selectedPositions.findIndex(
      (p) => p.row === row && p.col === col
    );

    if (existingIndex >= 0) {
      setSelectedPositions(selectedPositions.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  const handleSubmitWord = async () => {
    console.log('[MultiplayerGame] Submit word requested');
    
    if (!selectedPositions || selectedPositions.length < 3) {
      console.log('[MultiplayerGame] Insufficient tiles selected');
      setAlertModal({
        visible: true,
        title: 'Invalid Word',
        message: 'Words must be at least 3 letters long',
      });
      return;
    }

    if (!game || !game.boardState || !game.boardState.tiles) {
      console.error('[MultiplayerGame] Cannot submit - game not initialized');
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Game not ready. Please refresh.',
      });
      return;
    }
    
    if (!gameId || typeof gameId !== 'string') {
      console.error('[MultiplayerGame] Invalid gameId:', gameId);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Invalid game ID. Please restart.',
      });
      return;
    }
    
    if (submitting) {
      console.log('[MultiplayerGame] Already submitting, ignoring duplicate request');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const word = selectedPositions
        .map((pos) => {
          if (pos.row < 0 || pos.row >= game.boardState.tiles.length ||
              pos.col < 0 || pos.col >= game.boardState.tiles[0].length) {
            console.error('[MultiplayerGame] Invalid position:', pos);
            throw new Error('Invalid tile position');
          }
          
          const tile = game.boardState.tiles[pos.row][pos.col];
          
          if (!tile || !tile.letter) {
            console.error('[MultiplayerGame] Tile missing at position:', pos);
            throw new Error('Invalid tile');
          }
          
          return tile.letter;
        })
        .join('');

      console.log('[MultiplayerGame] Submitting word:', word);

      const response = await authenticatedPost(`/api/game/multiplayer/${gameId}/move`, {
        word,
        positions: selectedPositions,
        newBoardState: game.boardState,
      });

      console.log('[MultiplayerGame] Move submitted:', response);

      setSelectedPositions([]);

      await loadGame();
      await loadTurnStatus();
    } catch (err: any) {
      console.error('[MultiplayerGame] Failed to submit move:', err);
      setError(err.message || 'Failed to submit move');
      setAlertModal({
        visible: true,
        title: 'Error',
        message: err.message || 'Failed to submit move. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReaction = async (emoji: AllowedEmoji) => {
    if (!game || game.moveHistory.length === 0) return;

    try {
      const targetMoveIndex = game.moveHistory.length - 1;
      console.log('[MultiplayerGame] Sending reaction:', emoji);

      await authenticatedPost(`/api/game/multiplayer/${gameId}/react`, {
        targetMoveIndex,
        emoji,
      });

      setShowReactions(false);
      await loadGame();
    } catch (err: any) {
      console.error('[MultiplayerGame] Failed to send reaction:', err);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: err.message || 'Failed to send reaction',
      });
    }
  };

  const handleSendTaunt = async (tauntType: TauntType) => {
    try {
      console.log('[MultiplayerGame] Sending taunt:', tauntType);

      await authenticatedPost(`/api/game/multiplayer/${gameId}/taunt`, {
        tauntType,
      });

      setShowTaunts(false);
      await loadGame();
    } catch (err: any) {
      console.error('[MultiplayerGame] Failed to send taunt:', err);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: err.message || 'Failed to send taunt',
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (!game || !turnStatus) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load game</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWord = selectedPositions
    .map((pos) => game.boardState.tiles[pos.row][pos.col].letter)
    .join('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Multiplayer Game',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView style={styles.content}>
        <View style={[styles.turnBanner, turnStatus.isMyTurn && styles.turnBannerActive]}>
          <View style={styles.turnBannerContent}>
            <IconSymbol
              ios_icon_name={turnStatus.isMyTurn ? 'play.circle.fill' : 'pause.circle.fill'}
              android_material_icon_name={turnStatus.isMyTurn ? 'play-circle' : 'pause-circle'}
              size={24}
              color={turnStatus.isMyTurn ? colors.accent : colors.textSecondary}
            />
            <View style={styles.turnBannerText}>
              <Text style={styles.turnBannerTitle}>
                {turnStatus.isMyTurn ? 'Your Turn' : `${turnStatus.currentPlayerName}'s Turn`}
              </Text>
              {turnStatus.isLiveMatch && turnTimeRemaining !== null && (
                <Text style={[styles.turnTimer, turnTimeRemaining < 30 && styles.turnTimerUrgent]}>
                  {formatTime(turnTimeRemaining)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.playersContainer}>
          {game.players.map((player) => (
            <View
              key={player.userId}
              style={[
                styles.playerCard,
                player.isCurrentTurn && styles.playerCardActive,
              ]}
            >
              <View style={styles.playerInfo}>
                <IconSymbol
                  ios_icon_name="person.circle.fill"
                  android_material_icon_name="account-circle"
                  size={32}
                  color={player.isCurrentTurn ? colors.accent : colors.textSecondary}
                />
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{player.userName}</Text>
                  <Text style={styles.playerScore}>Score: {player.score}</Text>
                </View>
              </View>
              {player.isCurrentTurn && (
                <View style={styles.currentTurnIndicator}>
                  <Text style={styles.currentTurnText}>●</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.boardContainer}>
          <GameBoard
            tiles={game.boardState.tiles}
            selectedPositions={selectedPositions}
            onTilePress={handleTilePress}
            disabled={!turnStatus.isMyTurn || submitting}
          />
        </View>

        {selectedPositions.length > 0 && (
          <Animated.View entering={safeFadeIn()} exiting={safeFadeOut()} style={styles.wordDisplay}>
            <Text style={styles.wordText}>{currentWord}</Text>
            <Text style={styles.wordLength}>{selectedPositions.length} letters</Text>
          </Animated.View>
        )}

        <View style={styles.actionButtons}>
          {turnStatus.isMyTurn && (
            <React.Fragment>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleSubmitWord}
                disabled={selectedPositions.length < 3 || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <React.Fragment>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.actionButtonText}>Submit</Text>
                  </React.Fragment>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={() => setSelectedPositions([])}
                disabled={selectedPositions.length === 0}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.actionButtonText, styles.clearButtonText]}>Clear</Text>
              </TouchableOpacity>
            </React.Fragment>
          )}
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => setShowReactions(true)}
          >
            <IconSymbol
              ios_icon_name="face.smiling"
              android_material_icon_name="sentiment-satisfied"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.socialButtonText}>React</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => setShowTaunts(true)}
          >
            <IconSymbol
              ios_icon_name="message.fill"
              android_material_icon_name="message"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.socialButtonText}>Taunt</Text>
          </TouchableOpacity>
        </View>

        {game.reactions.length > 0 && (
          <View style={styles.recentActivity}>
            <Text style={styles.recentActivityTitle}>Recent Reactions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {game.reactions.slice(-5).map((reaction) => (
                <View key={reaction.id} style={styles.reactionItem}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionUser}>{reaction.userName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {game.taunts.length > 0 && (
          <View style={styles.recentActivity}>
            <Text style={styles.recentActivityTitle}>Recent Taunts</Text>
            {game.taunts.slice(-3).map((taunt) => (
              <View key={taunt.id} style={styles.tauntItem}>
                <Text style={styles.tauntUser}>{taunt.userName}:</Text>
                <Text style={styles.tauntMessage}>{taunt.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showReactions}
        title="Send Reaction"
        message="Choose an emoji reaction"
        onClose={() => setShowReactions(false)}
      >
        <View style={styles.emojiGrid}>
          {ALLOWED_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => handleSendReaction(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={showTaunts}
        title="Send Taunt"
        message="Choose a friendly taunt"
        onClose={() => setShowTaunts(false)}
      >
        <View style={styles.tauntList}>
          {(Object.keys(TAUNT_MESSAGES) as TauntType[]).map((tauntType) => (
            <TouchableOpacity
              key={tauntType}
              style={styles.tauntButton}
              onPress={() => handleSendTaunt(tauntType)}
            >
              <Text style={styles.tauntButtonText}>{TAUNT_MESSAGES[tauntType]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={!!error}
        title="Error"
        message={error}
        onClose={() => setError('')}
        type="error"
      />

      <Modal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal({ visible: false, title: '', message: '' })}
        type="info"
      />
    </SafeAreaView>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  turnBanner: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  turnBannerActive: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.accent,
  },
  turnBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  turnBannerText: {
    flex: 1,
  },
  turnBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  turnTimer: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 4,
  },
  turnTimerUrgent: {
    color: colors.error,
  },
  playersContainer: {
    padding: 16,
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerDetails: {
    gap: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  playerScore: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentTurnIndicator: {
    width: 12,
    height: 12,
  },
  currentTurnText: {
    fontSize: 20,
    color: colors.accent,
  },
  boardContainer: {
    padding: 16,
  },
  wordDisplay: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  wordLength: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  clearButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  clearButtonText: {
    color: colors.text,
  },
  socialButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recentActivity: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recentActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  reactionItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionUser: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tauntItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  tauntUser: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tauntMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  emojiButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  emojiText: {
    fontSize: 32,
  },
  tauntList: {
    padding: 16,
    gap: 12,
  },
  tauntButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  tauntButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
