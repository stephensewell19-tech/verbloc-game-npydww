
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Position, Move, BoardState, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import {
  generateInitialBoard,
  isValidWord,
  calculateScore,
  arePositionsAdjacent,
  applyWordEffect,
  checkWinCondition,
  getPuzzleModeProgress,
} from '@/utils/gameLogic';
import GameBoard from '@/components/GameBoard';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { authenticatedPost, authenticatedGet } from '@/utils/api';
import { Modal } from '@/components/button';
import WinConditionDisplay from '@/components/WinConditionDisplay';
import GameCompletionModal from '@/components/GameCompletionModal';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const gameMode = (params.mode as 'solo' | 'multiplayer') || 'solo';
  const existingGameId = params.gameId as string | undefined;
  const boardId = params.boardId as string | undefined;

  const [boardState, setBoardState] = useState<BoardState>(generateInitialBoard(6));
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameId, setGameId] = useState<string | null>(existingGameId || null);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  
  // Puzzle mode state
  const [puzzleMode, setPuzzleMode] = useState<PuzzleMode>('score_target');
  const [winCondition, setWinCondition] = useState<WinCondition>({
    type: 'score_target',
    target: 500,
    description: 'Reach the target score',
  });
  const [turnsRemaining, setTurnsRemaining] = useState(20);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Multiplayer specific state
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    console.log('[Game] Game screen mounted with mode:', gameMode, 'boardId:', boardId);
    if (existingGameId) {
      loadExistingGame(existingGameId);
    } else {
      startNewGame();
    }
  }, []);

  const loadExistingGame = async (id: string) => {
    console.log('[Game] Loading existing game:', id);
    try {
      setLoading(true);
      const endpoint = gameMode === 'solo' 
        ? `/api/game/solo/${id}` 
        : `/api/game/multiplayer/${id}`;
      
      const response = await authenticatedGet<{
        gameId: string;
        boardState: BoardState;
        score: number;
        moveHistory: Move[];
        status: string;
        isMyTurn?: boolean;
        opponentName?: string;
        opponentScore?: number;
        puzzleMode?: PuzzleMode;
        winCondition?: WinCondition;
      }>(endpoint);
      
      console.log('[Game] Existing game loaded:', response);
      setGameId(response.gameId);
      setBoardState(response.boardState);
      setCurrentScore(response.score);
      setMoveHistory(response.moveHistory || []);
      setGameStarted(true);
      
      if (response.puzzleMode) {
        setPuzzleMode(response.puzzleMode);
      }
      
      if (response.winCondition) {
        setWinCondition(response.winCondition);
      }
      
      if (gameMode === 'multiplayer') {
        setIsMyTurn(response.isMyTurn || false);
        setOpponentName(response.opponentName || 'Opponent');
        setOpponentScore(response.opponentScore || 0);
      }
    } catch (error: any) {
      console.error('[Game] Failed to load game:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load game',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async () => {
    console.log('[Game] Starting new game with mode:', gameMode, 'boardId:', boardId);
    try {
      setLoading(true);
      const endpoint = gameMode === 'solo' 
        ? '/api/game/solo/start' 
        : '/api/game/multiplayer/create';
      
      const requestBody = boardId ? { boardId } : {};
      
      const response = await authenticatedPost<{
        gameId: string;
        boardState: BoardState;
        status: string;
        inviteCode?: string;
        boardName?: string;
        puzzleMode?: PuzzleMode;
        winCondition?: WinCondition;
      }>(endpoint, requestBody);
      
      console.log('[Game] New game created successfully:', response);
      setGameId(response.gameId);
      setBoardState(response.boardState);
      setCurrentScore(0);
      setMoveHistory([]);
      setSelectedPositions([]);
      setGameStarted(true);
      setGameStatus('playing');
      setTurnsRemaining(20);
      
      if (response.puzzleMode) {
        setPuzzleMode(response.puzzleMode);
      }
      
      if (response.winCondition) {
        setWinCondition(response.winCondition);
      } else {
        setWinCondition({ 
          type: 'score_target', 
          target: 500,
          description: 'Reach the target score'
        });
      }
      
      if (gameMode === 'multiplayer' && response.inviteCode) {
        setSuccessModal({
          visible: true,
          message: `Game created! Share invite code: ${response.inviteCode}`,
        });
      }
    } catch (error: any) {
      console.error('[Game] Failed to start game:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to start game',
      });
      setBoardState(generateInitialBoard(6));
      setGameStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTilePress = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    if (gameMode === 'multiplayer' && !isMyTurn) {
      setErrorModal({
        visible: true,
        message: "It's not your turn yet!",
      });
      return;
    }

    console.log('[Game] Tile pressed:', row, col);
    
    const alreadySelected = selectedPositions.some(
      pos => pos.row === row && pos.col === col
    );

    if (alreadySelected) {
      const lastSelected = selectedPositions[selectedPositions.length - 1];
      if (lastSelected.row === row && lastSelected.col === col) {
        const newPositions = selectedPositions.slice(0, -1);
        setSelectedPositions(newPositions);
      }
      return;
    }

    const newPositions = [...selectedPositions, { row, col }];
    setSelectedPositions(newPositions);
  };

  const handleSubmitWord = async () => {
    console.log('[Game] Submitting word with positions:', selectedPositions);
    
    if (selectedPositions.length < 3) {
      setErrorModal({
        visible: true,
        message: 'Words must be at least 3 letters long.',
      });
      return;
    }

    if (!arePositionsAdjacent(selectedPositions)) {
      setErrorModal({
        visible: true,
        message: 'Letters must be adjacent to each other.',
      });
      return;
    }

    const wordLetters = selectedPositions.map(
      pos => boardState.tiles[pos.row][pos.col].letter
    );
    const word = wordLetters.join('');
    const wordUpper = word.toUpperCase();

    console.log('[Game] Formed word:', wordUpper);

    if (!isValidWord(wordUpper)) {
      setErrorModal({
        visible: true,
        message: `"${wordUpper}" is not a valid word.`,
      });
      return;
    }

    const score = calculateScore(wordUpper, selectedPositions, boardState);
    const newBoardState = applyWordEffect(boardState, selectedPositions, puzzleMode, 'player1');

    if (gameId) {
      try {
        setLoading(true);
        const endpoint = gameMode === 'solo'
          ? `/api/game/solo/${gameId}/move`
          : `/api/game/multiplayer/${gameId}/move`;
        
        const response = await authenticatedPost<{
          valid: boolean;
          score: number;
          newBoardState: BoardState;
          gameStatus: string;
          nextPlayerId?: string;
        }>(endpoint, {
          word: wordUpper,
          positions: selectedPositions,
          newBoardState,
        });

        console.log('[Game] Move submitted:', response);

        if (response.valid) {
          const newScore = currentScore + response.score;
          const move: Move = {
            word: wordUpper,
            positions: selectedPositions,
            score: response.score,
            timestamp: new Date().toISOString(),
          };

          setBoardState(response.newBoardState);
          setCurrentScore(newScore);
          setMoveHistory([...moveHistory, move]);
          setSelectedPositions([]);
          
          const newTurnsRemaining = turnsRemaining - 1;
          setTurnsRemaining(newTurnsRemaining);
          
          // Check win condition based on puzzle mode
          const outcome = checkWinCondition(
            response.newBoardState,
            puzzleMode,
            winCondition,
            newScore,
            moveHistory.length + 1,
            gameMode
          );
          
          if (outcome === GameOutcome.Win) {
            setGameStatus('won');
            setShowCompletionModal(true);
            await completeGame('won', newScore);
          } else if (newTurnsRemaining <= 0) {
            setGameStatus('lost');
            setShowCompletionModal(true);
            await completeGame('lost', newScore);
          }
          
          if (gameMode === 'multiplayer') {
            setIsMyTurn(false);
            setSuccessModal({
              visible: true,
              message: `Great word! It's ${opponentName}'s turn now.`,
            });
          }
        } else {
          setErrorModal({
            visible: true,
            message: 'Move was not valid.',
          });
        }
      } catch (error: any) {
        console.error('[Game] Failed to submit move:', error);
        setErrorModal({
          visible: true,
          message: error.message || 'Failed to submit move',
        });
      } finally {
        setLoading(false);
      }
    } else {
      const newScore = currentScore + score;
      const move: Move = {
        word: wordUpper,
        positions: selectedPositions,
        score,
        timestamp: new Date().toISOString(),
      };

      setBoardState(newBoardState);
      setCurrentScore(newScore);
      setMoveHistory([...moveHistory, move]);
      setSelectedPositions([]);
      
      const newTurnsRemaining = turnsRemaining - 1;
      setTurnsRemaining(newTurnsRemaining);
      
      // Check win condition based on puzzle mode
      const outcome = checkWinCondition(
        newBoardState,
        puzzleMode,
        winCondition,
        newScore,
        moveHistory.length + 1,
        gameMode
      );
      
      if (outcome === GameOutcome.Win) {
        setGameStatus('won');
        setShowCompletionModal(true);
      } else if (newTurnsRemaining <= 0) {
        setGameStatus('lost');
        setShowCompletionModal(true);
      }

      if (!gameStarted) {
        setGameStarted(true);
      }
    }
  };

  const completeGame = async (status: 'won' | 'lost', finalScore: number) => {
    if (!gameId) return;
    
    console.log('[Game] Completing game with status:', status);
    try {
      await authenticatedPost(`/api/game/${gameId}/complete`, {
        finalScore,
        status,
      });
      console.log('[Game] Game completed successfully');
    } catch (error) {
      console.error('[Game] Failed to complete game:', error);
    }
  };

  const handleClearSelection = () => {
    console.log('[Game] Clearing selection');
    setSelectedPositions([]);
  };

  const handleNewGame = async () => {
    console.log('[Game] User requested new game');
    
    if (gameId && gameStarted && gameStatus === 'playing') {
      try {
        await authenticatedPost(`/api/game/${gameId}/complete`, {
          finalScore: currentScore,
          status: 'forfeited',
        });
        console.log('[Game] Previous game forfeited');
      } catch (error) {
        console.error('[Game] Failed to forfeit game:', error);
      }
    }

    setGameStatus('playing');
    setShowCompletionModal(false);
    await startNewGame();
  };

  const handleBackToHome = () => {
    console.log('[Game] User navigating back to home');
    router.back();
  };

  const selectedWord = selectedPositions
    .map(pos => boardState.tiles[pos.row][pos.col].letter)
    .join('');

  const gameModeText = gameMode === 'solo' ? 'Solo Play' : 'Multiplayer';
  const turnsText = String(turnsRemaining);
  
  // Get puzzle mode progress
  const progress = getPuzzleModeProgress(boardState, puzzleMode, winCondition);

  const getInstructionsText = () => {
    const baseInstructions = `1. Tap tiles to select letters
2. Form words by selecting adjacent tiles
3. Words must be at least 3 letters long
4. Special tiles give bonus points

`;

    const puzzleModeInstructions = {
      vault_break: `🔓 VAULT BREAK MODE
Unlock all vault tiles to win!
- Locked tiles (🔒) cannot be used
- Form words adjacent to vaults to unlock them
- All required vaults must be unlocked

`,
      hidden_phrase: `🔍 HIDDEN PHRASE MODE
Reveal the hidden phrase to win!
- Purple tiles (?) hide letters
- Form words using these tiles to reveal them
- Reveal all phrase letters to complete the puzzle

`,
      territory_control: `🗺️ TERRITORY CONTROL MODE
Claim territory to win!
- Orange tiles can be claimed
- Form words to claim tiles for your territory
- Reach ${winCondition.targetControlPercentage || 60}% control to win

`,
      score_target: `🎯 SCORE TARGET MODE
Reach the target score to win!
- 2× doubles letter value
- 3× triples letter value
- ★ doubles word score

`,
    };

    const multiplayerNote = gameMode === 'multiplayer' 
      ? '\nMultiplayer: Take turns with your opponent. The player with the highest score wins!' 
      : '';

    return baseInstructions + (puzzleModeInstructions[puzzleMode] || '') + multiplayerNote;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: gameModeText,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
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
            <TouchableOpacity
              onPress={() => setShowInstructions(true)}
              style={styles.headerButton}
            >
              <IconSymbol
                ios_icon_name="questionmark.circle"
                android_material_icon_name="help"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {gameMode === 'multiplayer' && (
          <View style={[styles.turnIndicator, isMyTurn ? styles.myTurn : styles.opponentTurn]}>
            <IconSymbol
              ios_icon_name={isMyTurn ? 'person.fill' : 'person'}
              android_material_icon_name={isMyTurn ? 'person' : 'person-outline'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.turnText}>
              {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
            </Text>
          </View>
        )}

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{currentScore}</Text>
          </View>
          
          {gameMode === 'multiplayer' && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{opponentName}</Text>
              <Text style={styles.scoreValue}>{opponentScore}</Text>
            </View>
          )}
          
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Turns</Text>
            <Text style={styles.scoreValue}>{turnsText}</Text>
          </View>
        </View>

        <WinConditionDisplay
          puzzleMode={puzzleMode}
          current={progress.current}
          target={progress.target}
          percentage={progress.percentage}
          description={winCondition.description}
        />

        <GameBoard
          tiles={boardState.tiles}
          selectedPositions={selectedPositions}
          onTilePress={handleTilePress}
          disabled={gameStatus !== 'playing' || (gameMode === 'multiplayer' && !isMyTurn)}
        />

        <View style={styles.wordDisplay}>
          {selectedWord ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Text style={styles.wordText}>{selectedWord}</Text>
            </Animated.View>
          ) : (
            <Text style={styles.wordPlaceholder}>Select tiles to form a word</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearSelection}
            disabled={selectedPositions.length === 0 || gameStatus !== 'playing'}
          >
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="clear"
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (selectedPositions.length < 3 || gameStatus !== 'playing' || (gameMode === 'multiplayer' && !isMyTurn)) && styles.buttonDisabled,
            ]}
            onPress={handleSubmitWord}
            disabled={selectedPositions.length < 3 || gameStatus !== 'playing' || (gameMode === 'multiplayer' && !isMyTurn)}
          >
            <IconSymbol
              ios_icon_name="checkmark"
              android_material_icon_name="check"
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {moveHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Words</Text>
            {moveHistory.slice(-5).reverse().map((move, index) => {
              const moveWord = move.word;
              const moveScore = move.score;
              return (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyWord}>{moveWord}</Text>
                  <Text style={styles.historyScore}>+{moveScore}</Text>
                </View>
              );
            })}
          </View>
        )}

        {gameStatus === 'playing' && (
          <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showInstructions}
        title="How to Play"
        message={getInstructionsText()}
        onClose={() => setShowInstructions(false)}
        type="info"
      />

      <Modal
        visible={errorModal.visible}
        title="Oops!"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />

      <Modal
        visible={successModal.visible}
        title="Success!"
        message={successModal.message}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        type="success"
      />

      <GameCompletionModal
        visible={showCompletionModal}
        status={gameStatus}
        finalScore={currentScore}
        targetScore={winCondition.target}
        wordsFormed={moveHistory.length}
        onPlayAgain={handleNewGame}
        onBackToHome={handleBackToHome}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerButton: {
    padding: 8,
  },
  turnIndicator: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myTurn: {
    backgroundColor: colors.success,
  },
  opponentTurn: {
    backgroundColor: colors.textSecondary,
  },
  turnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scoreBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  wordDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 60,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  wordPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
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
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  newGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  historyContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.tile,
  },
  historyWord: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  historyScore: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
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
