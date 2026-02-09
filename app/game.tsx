
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Position, BoardState, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import WinConditionDisplay from '@/components/WinConditionDisplay';
import { authenticatedPost, authenticatedGet } from '@/utils/api';
import {
  generateInitialBoard,
  isValidWord,
  calculateScore,
  arePositionsAdjacent,
  applyWordEffect,
  checkWinCondition,
  getPuzzleModeProgress,
} from '@/utils/gameLogic';
import { WordEffect } from '@/utils/wordMechanics';
import Animated, { FadeIn, FadeOut, BounceIn, ZoomIn } from 'react-native-reanimated';
import WordMechanicsInfo from '@/components/WordMechanicsInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import GameBoard from '@/components/GameBoard';
import React, { useState, useEffect, useCallback } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import GameCompletionModal from '@/components/GameCompletionModal';
import * as Haptics from 'expo-haptics';
import { setLastPlayedMode } from '@/utils/onboarding';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [board, setBoard] = useState<BoardState | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [movesMade, setMovesMade] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [wordsFormed, setWordsFormed] = useState(0);
  const [lastWordEffect, setLastWordEffect] = useState<WordEffect | null>(null);
  const [currentEffects, setCurrentEffects] = useState<WordEffect[]>([]);
  const [showEffects, setShowEffects] = useState(false);
  const [showMechanicsInfo, setShowMechanicsInfo] = useState(false);
  const [efficiency, setEfficiency] = useState(0);
  const [lastWordScore, setLastWordScore] = useState<number | null>(null);
  const [showScorePop, setShowScorePop] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | undefined>(undefined);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);
  
  // Game configuration from params
  const gameId = params.gameId as string | undefined;
  const boardId = params.boardId as string | undefined;
  const gameMode = (params.mode as 'solo' | 'multiplayer') || 'solo';
  const puzzleMode = (params.puzzleMode as PuzzleMode) || 'score_target';
  const targetScore = params.targetScore ? parseInt(params.targetScore as string) : 500;
  const gridSize = params.gridSize ? parseInt(params.gridSize as string) : 7;
  const turnLimit = params.turnLimit ? parseInt(params.turnLimit as string) : 20;
  const boardName = params.boardName as string | undefined;
  const difficulty = (params.difficulty as 'Easy' | 'Medium' | 'Hard' | 'Special') || 'Medium';
  
  const winCondition: WinCondition = {
    type: puzzleMode === 'score_target' ? 'score' : puzzleMode,
    target: targetScore,
    description: `Reach ${targetScore} points`,
    targetControlPercentage: puzzleMode === 'territory_control' ? 60 : undefined,
    turnLimit: gameMode === 'solo' ? turnLimit : undefined,
  };

  const loadExistingGame = useCallback(async (id: string) => {
    console.log('Loading existing game:', id);
    try {
      setLoading(true);
      const response = await authenticatedGet(`/api/game/${id}`);
      const gameData = response;
      
      setBoard(gameData.boardState);
      setScore(gameData.currentScore || 0);
      setMovesMade(gameData.moveHistory?.length || 0);
      setWordsFormed(gameData.moveHistory?.length || 0);
      setGameStatus(gameData.status === 'completed' ? 'won' : 'playing');
      
      console.log('Game loaded successfully');
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game. Starting new game instead.');
      startNewGame();
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewGame = useCallback(async () => {
    console.log('Starting new game with gridSize:', gridSize, 'puzzleMode:', puzzleMode, 'turnLimit:', turnLimit);
    try {
      setLoading(true);
      
      const initialBoard = generateInitialBoard(gridSize);
      setBoard(initialBoard);
      setScore(0);
      setMovesMade(0);
      setWordsFormed(0);
      setTurnsLeft(turnLimit);
      setGameStatus('playing');
      setLastWordEffect(null);
      setCurrentEffects([]);
      setEfficiency(0);
      setError(null);
      setShowCompletionModal(false);
      setComboCount(0);
      setLastWordScore(null);
      
      if (gameMode === 'solo') {
        try {
          const response = await authenticatedPost('/api/game/solo/start', {});
          console.log('Solo game session created on backend:', response.gameId);
        } catch (err) {
          console.error('Failed to create backend game session:', err);
        }
      }
      
      console.log('New game started successfully - Solo mode with', turnLimit, 'turns');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  }, [gridSize, puzzleMode, turnLimit, gameMode]);

  useEffect(() => {
    console.log('GameScreen mounted with params:', params);
    
    // Remember the mode the player chose
    setLastPlayedMode(gameMode);
    
    if (gameId) {
      loadExistingGame(gameId);
    } else {
      startNewGame();
    }
  }, [gameId, gameMode, loadExistingGame, startNewGame, params]);

  function handleTilePress(row: number, col: number) {
    if (!board || gameStatus !== 'playing') {
      return;
    }
    
    console.log('Tile pressed:', row, col);
    
    // Haptic feedback on tile selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const position = { row, col };
    const tile = board.tiles[row][col];
    
    if (tile.isLocked) {
      console.log('Cannot select locked tile');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    const existingIndex = selectedPositions.findIndex(
      p => p.row === row && p.col === col
    );
    
    if (existingIndex !== -1) {
      if (existingIndex === selectedPositions.length - 1) {
        console.log('Deselecting last tile');
        const newPositions = selectedPositions.slice(0, -1);
        setSelectedPositions(newPositions);
        setCurrentWord(newPositions.map(p => board.tiles[p.row][p.col].letter).join(''));
      }
      return;
    }
    
    if (selectedPositions.length > 0) {
      const lastPos = selectedPositions[selectedPositions.length - 1];
      const rowDiff = Math.abs(lastPos.row - row);
      const colDiff = Math.abs(lastPos.col - col);
      const isAdjacent = (rowDiff === 0 && colDiff === 1) ||
                         (rowDiff === 1 && colDiff === 0) ||
                         (rowDiff === 1 && colDiff === 1);
      
      if (!isAdjacent) {
        console.log('Tile not adjacent to last selected tile');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
    }
    
    const newPositions = [...selectedPositions, position];
    setSelectedPositions(newPositions);
    
    const newWord = newPositions.map(p => board.tiles[p.row][p.col].letter).join('');
    setCurrentWord(newWord);
    console.log('Current word:', newWord);
    
    // Haptic feedback for word length milestones
    if (newWord.length === 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (newWord.length >= 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  async function handleSubmitWord() {
    if (!board || selectedPositions.length < 3 || !currentWord) {
      console.log('Cannot submit: insufficient tiles selected');
      setError('Select at least 3 tiles to form a word');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    console.log('Submitting word:', currentWord, 'Turns left:', turnsLeft);
    setSubmitting(true);
    setError(null);
    
    try {
      const isValid = isValidWord(currentWord);
      if (!isValid) {
        console.log('Invalid word:', currentWord);
        setError(`"${currentWord}" is not a valid word`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setSubmitting(false);
        return;
      }
      
      // SUCCESS HAPTIC - Valid word!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const wordScore = calculateScore(currentWord, selectedPositions, board);
      console.log('Word score:', wordScore);
      
      // Show score popup with animation
      setLastWordScore(wordScore);
      setShowScorePop(true);
      setTimeout(() => setShowScorePop(false), 2000);
      
      const { board: updatedBoard, effects } = applyWordEffect(
        board,
        selectedPositions,
        puzzleMode,
        'player1',
        currentWord,
        lastWordEffect
      );
      
      console.log('Word effects applied:', effects.length, 'effects');
      
      // Combo tracking for positive reinforcement
      const newComboCount = comboCount + 1;
      setComboCount(newComboCount);
      
      if (newComboCount >= 3) {
        setShowCombo(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => setShowCombo(false), 2000);
      }
      
      if (effects.length > 0) {
        setCurrentEffects(effects);
        setShowEffects(true);
        setLastWordEffect(effects[0]);
        
        // Extra haptic for special effects
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        setTimeout(() => {
          setShowEffects(false);
        }, 3000);
      }
      
      const newScore = score + wordScore;
      const newMovesMade = movesMade + 1;
      const newWordsFormed = wordsFormed + 1;
      const newTurnsLeft = gameMode === 'solo' ? turnsLeft - 1 : turnsLeft;
      const newEfficiency = newScore / newMovesMade;
      
      setBoard(updatedBoard);
      setScore(newScore);
      setMovesMade(newMovesMade);
      setWordsFormed(newWordsFormed);
      setTurnsLeft(newTurnsLeft);
      setEfficiency(newEfficiency);
      setSelectedPositions([]);
      setCurrentWord('');
      
      console.log('Game state updated - Score:', newScore, 'Moves:', newMovesMade, 'Turns left:', newTurnsLeft, 'Efficiency:', newEfficiency.toFixed(2));
      
      const outcome = checkWinCondition(
        updatedBoard,
        puzzleMode,
        winCondition,
        newScore,
        newMovesMade,
        gameMode,
        newTurnsLeft
      );
      
      console.log('Win condition check result:', outcome);
      
      if (outcome === GameOutcome.Win) {
        console.log('Player won!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await completeGame('won', newScore);
      } else if (outcome === GameOutcome.Loss) {
        console.log('Player lost!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await completeGame('lost', newScore);
      }
      
    } catch (err) {
      console.error('Error submitting word:', err);
      setError('Failed to submit word');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function completeGame(status: 'won' | 'lost', finalScore: number) {
    console.log('Completing game with status:', status, 'finalScore:', finalScore);
    setGameStatus(status);
    setShowCompletionModal(true);
    
    const isDailyChallenge = params.dailyChallenge === 'true';
    const challengeId = params.challengeId as string | undefined;
    
    const isSpecialEvent = params.mode === 'specialEvent';
    const eventId = params.eventId as string | undefined;
    
    // Calculate XP earned
    const { calculateXpEarned } = await import('@/utils/gameLogic');
    
    let source: 'solo' | 'multiplayer' | 'dailyChallenge' | 'specialEvent' = 'solo';
    if (isDailyChallenge) {
      source = 'dailyChallenge';
    } else if (isSpecialEvent) {
      source = 'specialEvent';
    } else if (gameMode === 'multiplayer') {
      source = 'multiplayer';
    }
    
    const xpEarned = calculateXpEarned(
      source,
      finalScore,
      wordsFormed,
      efficiency,
      status === 'won',
      isDailyChallenge,
      isSpecialEvent
    );
    
    console.log('[Progression] XP earned:', xpEarned, 'from source:', source);
    
    // Award XP to player
    try {
      const xpResult = await authenticatedPost('/api/player/progress/award-xp', {
        xp: xpEarned,
        source,
        gameId,
      });
      
      console.log('[Progression] XP awarded:', xpResult);
      
      // Store XP data for modal display
      setXpEarned(xpEarned);
      setLeveledUp(xpResult.leveledUp || false);
      setNewLevel(xpResult.newLevel);
      
      if (xpResult.leveledUp) {
        console.log('[Progression] LEVEL UP! New level:', xpResult.newLevel);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      if (xpResult.newUnlocks && xpResult.newUnlocks.length > 0) {
        console.log('[Progression] New unlocks:', xpResult.newUnlocks);
      }
    } catch (xpErr) {
      console.error('[Progression] Failed to award XP:', xpErr);
    }
    
    if (gameMode === 'solo' && gameId) {
      try {
        await authenticatedPost(`/api/game/${gameId}/complete`, {
          finalScore,
        });
        console.log('Game completion sent to backend');
        
        if (isDailyChallenge && challengeId) {
          console.log('[DailyChallenge] Completing daily challenge:', challengeId);
          const timeTakenSeconds = Math.floor((Date.now() - (params.startTime ? parseInt(params.startTime as string) : Date.now())) / 1000);
          
          try {
            const response = await authenticatedPost(`/api/daily-challenge/${challengeId}/complete`, {
              gameId,
              score: finalScore,
              turnsUsed: turnLimit - turnsLeft,
              wordsFormed,
              efficiency,
              timeTakenSeconds,
              isWon: status === 'won',
            });
            console.log('[DailyChallenge] Challenge completion response:', response);
          } catch (challengeErr) {
            console.error('[DailyChallenge] Failed to complete daily challenge:', challengeErr);
          }
        }
        
        if (isSpecialEvent && eventId) {
          console.log('[SpecialEvent] Completing special event:', eventId);
          const timeTakenSeconds = Math.floor((Date.now() - (params.startTime ? parseInt(params.startTime as string) : Date.now())) / 1000);
          
          try {
            const response = await authenticatedPost(`/api/special-events/${eventId}/complete`, {
              gameId,
              score: finalScore,
              turnsUsed: turnLimit - turnsLeft,
              wordsFormed,
              efficiency,
              timeTakenSeconds,
              isWon: status === 'won',
            });
            console.log('[SpecialEvent] Event completion response:', response);
          } catch (eventErr) {
            console.error('[SpecialEvent] Failed to complete special event:', eventErr);
          }
        }
      } catch (err) {
        console.error('Failed to send game completion to backend:', err);
      }
    }
  }

  function handleClearSelection() {
    console.log('Clearing selection');
    setSelectedPositions([]);
    setCurrentWord('');
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleNewGame() {
    console.log('Starting new game');
    setShowCompletionModal(false);
    setComboCount(0);
    startNewGame();
  }

  function handleBackToHome() {
    console.log('Navigating back to home');
    router.push('/(tabs)/(home)');
  }

  function handleSwitchMode() {
    console.log('Switching mode from', gameMode, 'to', gameMode === 'solo' ? 'multiplayer' : 'solo');
    setShowCompletionModal(false);
    
    if (gameMode === 'solo') {
      router.push('/multiplayer-matchmaking');
    } else {
      router.push('/board-select?mode=Solo');
    }
  }

  function getInstructionsText(): string {
    const wordLength = currentWord.length;
    
    if (wordLength === 0) {
      return 'Select tiles to form a word (min 3 letters)';
    } else if (wordLength < 3) {
      const remaining = 3 - wordLength;
      return `Need ${remaining} more letter${remaining > 1 ? 's' : ''}`;
    } else if (wordLength <= 4) {
      return 'Standard word - minor board effects';
    } else if (wordLength <= 6) {
      return 'Bonus word - trigger special effects!';
    } else {
      return 'Major word - powerful board changes!';
    }
  }

  function getDifficultyColor(): string {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      case 'Special':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  }

  function getDifficultyIcon(): string {
    switch (difficulty) {
      case 'Easy':
        return '🌱';
      case 'Medium':
        return '⚡';
      case 'Hard':
        return '🔥';
      case 'Special':
        return '⭐';
      default:
        return '📊';
    }
  }

  function getPuzzleModeLabel(mode: PuzzleMode): string {
    switch (mode) {
      case 'vault_break':
        return '🔓 Vault Break';
      case 'hidden_phrase':
        return '🔍 Hidden Phrase';
      case 'territory_control':
        return '🗺️ Territory Control';
      case 'score_target':
        return '🎯 Score Target';
      default:
        return '📊 Challenge';
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={48}
            color={colors.error}
          />
          <Text style={styles.errorText}>Failed to load game</Text>
          <TouchableOpacity style={styles.retryButton} onPress={startNewGame}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = getPuzzleModeProgress(board, puzzleMode, winCondition);
  const instructionsText = getInstructionsText();
  const difficultyColor = getDifficultyColor();
  const difficultyIcon = getDifficultyIcon();
  const puzzleModeLabel = getPuzzleModeLabel(puzzleMode);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'VERBLOC',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackToHome} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowMechanicsInfo(true)} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {boardName && (
          <View style={[styles.boardHeader, { borderLeftColor: difficultyColor }]}>
            <View style={styles.boardHeaderContent}>
              <View style={styles.boardHeaderTitleSection}>
                <Text style={styles.boardHeaderName}>{boardName}</Text>
                <Text style={styles.boardHeaderSubtitle}>{puzzleModeLabel}</Text>
              </View>
              <View style={[styles.boardHeaderDifficulty, { backgroundColor: difficultyColor }]}>
                <Text style={styles.boardHeaderDifficultyIcon}>{difficultyIcon}</Text>
                <Text style={styles.boardHeaderDifficultyText}>{difficulty}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Score and Progress */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Words</Text>
            <Text style={styles.statValue}>{wordsFormed}</Text>
          </View>
          
          {gameMode === 'solo' && (
            <View style={[styles.statBox, turnsLeft <= 3 && styles.statBoxUrgent]}>
              <Text style={styles.statLabel}>Turns Left</Text>
              <Text style={[styles.statValue, turnsLeft <= 3 && styles.statValueUrgent]}>
                {turnsLeft}
              </Text>
            </View>
          )}
          
          {gameMode === 'multiplayer' && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Moves</Text>
              <Text style={styles.statValue}>{movesMade}</Text>
            </View>
          )}
        </View>

        {/* Win Condition Display with Progress Meter */}
        <WinConditionDisplay
          puzzleMode={puzzleMode}
          current={progress.current}
          target={progress.target}
          percentage={progress.percentage}
          description={winCondition.description}
          turnsLeft={gameMode === 'solo' ? turnsLeft : undefined}
        />

        {/* Score Popup Animation */}
        {showScorePop && lastWordScore !== null && (
          <Animated.View entering={BounceIn} exiting={FadeOut} style={styles.scorePopup}>
            <Text style={styles.scorePopupText}>+{lastWordScore}</Text>
            <Text style={styles.scorePopupLabel}>points!</Text>
          </Animated.View>
        )}

        {/* Combo Indicator */}
        {showCombo && (
          <Animated.View entering={ZoomIn} exiting={FadeOut} style={styles.comboContainer}>
            <Text style={styles.comboText}>{comboCount}x COMBO!</Text>
            <Text style={styles.comboSubtext}>You&apos;re on fire! 🔥</Text>
          </Animated.View>
        )}

        {/* Word Effects Display */}
        {showEffects && currentEffects.length > 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.effectsContainer}>
            <Text style={styles.effectsTitle}>Word Effects Triggered!</Text>
            {currentEffects.map((effect, index) => (
              <View key={index} style={styles.effectItem}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.effectText}>{effect.description}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>{instructionsText}</Text>
        </View>

        {/* Current Word Display */}
        {currentWord && (
          <View style={styles.currentWordContainer}>
            <Text style={styles.currentWordLabel}>Current Word:</Text>
            <Text style={styles.currentWord}>{currentWord}</Text>
            <Text style={styles.wordLength}>{currentWord.length} letters</Text>
          </View>
        )}

        {/* Game Board */}
        <GameBoard
          tiles={board.tiles}
          selectedPositions={selectedPositions}
          onTilePress={handleTilePress}
          disabled={gameStatus !== 'playing' || submitting}
        />

        {/* Error Message */}
        {error && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorBanner}>
            <IconSymbol
              ios_icon_name="exclamationmark.circle"
              android_material_icon_name="error"
              size={20}
              color={colors.error}
            />
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearSelection}
            disabled={selectedPositions.length === 0 || submitting}
          >
            <IconSymbol
              ios_icon_name="xmark.circle"
              android_material_icon_name="clear"
              size={20}
              color={selectedPositions.length === 0 ? colors.textSecondary : colors.text}
            />
            <Text style={[
              styles.actionButtonText,
              selectedPositions.length === 0 && styles.actionButtonTextDisabled
            ]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              (selectedPositions.length < 3 || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitWord}
            disabled={selectedPositions.length < 3 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="checkmark.circle"
                  android_material_icon_name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Submit Word</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Game Completion Modal with End-of-Run Summary */}
      <GameCompletionModal
        visible={showCompletionModal}
        status={gameStatus}
        finalScore={score}
        targetScore={targetScore}
        wordsFormed={wordsFormed}
        efficiency={efficiency}
        turnsUsed={gameMode === 'solo' ? (turnLimit - turnsLeft) : undefined}
        turnLimit={gameMode === 'solo' ? turnLimit : undefined}
        xpEarned={xpEarned}
        leveledUp={leveledUp}
        newLevel={newLevel}
        currentMode={gameMode}
        onPlayAgain={handleNewGame}
        onSwitchMode={handleSwitchMode}
        onBackToHome={handleBackToHome}
      />

      {/* Word Mechanics Info Modal */}
      <WordMechanicsInfo
        visible={showMechanicsInfo}
        onClose={() => setShowMechanicsInfo(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
  },
  statBoxUrgent: {
    backgroundColor: colors.error + '20',
    borderWidth: 2,
    borderColor: colors.error,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statValueUrgent: {
    color: colors.error,
  },
  scorePopup: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  scorePopupText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scorePopupLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  comboContainer: {
    backgroundColor: colors.highlight + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.highlight,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.highlight,
  },
  comboSubtext: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  effectsContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  effectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  effectText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  currentWordContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  currentWordLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currentWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
  },
  wordLength: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: colors.card,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  boardHeader: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  boardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardHeaderTitleSection: {
    flex: 1,
    gap: 4,
  },
  boardHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  boardHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  boardHeaderDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  boardHeaderDifficultyIcon: {
    fontSize: 14,
  },
  boardHeaderDifficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
