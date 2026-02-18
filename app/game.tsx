
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
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
import Animated from 'react-native-reanimated';
import { safeFadeIn, safeFadeOut, safeBounceIn, safeZoomIn } from '@/utils/safeAnimations';
import WordMechanicsInfo from '@/components/WordMechanicsInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import GameBoard from '@/components/GameBoard';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import GameCompletionModal from '@/components/GameCompletionModal';
import * as Haptics from 'expo-haptics';
import { setLastPlayedMode } from '@/utils/onboarding';
import { addBreadcrumb, updateGameState, logError } from '@/utils/errorLogger';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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

  useEffect(() => {
    console.log('[Game] GameScreen mounted');
    addBreadcrumb('navigation', 'GameScreen mounted', { gameMode, puzzleMode, gridSize });
    updateGameState({
      screen: 'game',
      mode: gameMode,
      round: 0,
      score: 0,
      turnsLeft: turnLimit,
      selectedTiles: 0,
      lastAction: 'mount',
    });
    
    mountedRef.current = true;
    
    return () => {
      console.log('[Game] GameScreen unmounting');
      addBreadcrumb('navigation', 'GameScreen unmounting', {});
      mountedRef.current = false;
      
      // CRITICAL: Clear any active timers to prevent state updates after unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        addBreadcrumb('timer', 'Timer cleared on unmount', {});
      }
    };
  }, []);

  const startNewGame = useCallback(async () => {
    addBreadcrumb('action', 'startNewGame called', { gridSize, puzzleMode, turnLimit, gameMode });
    console.log('[Game] Starting new game with gridSize:', gridSize, 'puzzleMode:', puzzleMode, 'turnLimit:', turnLimit);
    
    // CRITICAL: Validate inputs to prevent crashes from invalid data
    const safeGridSize = (gridSize && gridSize >= 3 && gridSize <= 15) ? gridSize : 7;
    const safeTurnLimit = (turnLimit && turnLimit >= 1) ? turnLimit : 20;
    
    if (gridSize !== safeGridSize) {
      console.error('[Game] Invalid gridSize:', gridSize, '- using default', safeGridSize);
      addBreadcrumb('error', 'Invalid gridSize corrected', { original: gridSize, corrected: safeGridSize });
    }
    
    if (turnLimit !== safeTurnLimit) {
      console.error('[Game] Invalid turnLimit:', turnLimit, '- using default', safeTurnLimit);
      addBreadcrumb('error', 'Invalid turnLimit corrected', { original: turnLimit, corrected: safeTurnLimit });
    }
    
    try {
      if (!mountedRef.current) {
        console.warn('[Game] Component unmounted, aborting startNewGame');
        addBreadcrumb('error', 'startNewGame called on unmounted component', {});
        return;
      }
      
      setLoading(true);
      setError(null);
      
      addBreadcrumb('state', 'Generating initial board', { gridSize: safeGridSize });
      const initialBoard = generateInitialBoard(safeGridSize);
      
      // CRITICAL: Validate board generation
      if (!initialBoard || !initialBoard.tiles || !Array.isArray(initialBoard.tiles)) {
        const errorMsg = 'Failed to generate game board';
        console.error('[Game]', errorMsg);
        logError(new Error(errorMsg), { gridSize: safeGridSize, puzzleMode, gameMode });
        throw new Error(errorMsg);
      }
      
      const totalTiles = initialBoard.tiles.flat().length;
      if (totalTiles === 0) {
        const errorMsg = 'Generated board is empty';
        console.error('[Game]', errorMsg);
        logError(new Error(errorMsg), { gridSize: safeGridSize, totalTiles });
        throw new Error(errorMsg);
      }
      
      // CRITICAL: Validate each tile to prevent null/undefined crashes
      const invalidTiles = initialBoard.tiles.flat().filter(t => !t || !t.letter);
      if (invalidTiles.length > 0) {
        const errorMsg = `Board has ${invalidTiles.length} invalid tiles`;
        console.error('[Game]', errorMsg);
        logError(new Error(errorMsg), { invalidCount: invalidTiles.length, totalTiles });
        throw new Error(errorMsg);
      }
      
      console.log('[Game] Board generated successfully with', totalTiles, 'tiles');
      addBreadcrumb('state', 'Board generated successfully', { totalTiles });
      
      if (!mountedRef.current) {
        console.warn('[Game] Component unmounted during board generation');
        return;
      }
      
      setBoard(initialBoard);
      setScore(0);
      setMovesMade(0);
      setWordsFormed(0);
      setTurnsLeft(safeTurnLimit);
      setGameStatus('playing');
      setLastWordEffect(null);
      setCurrentEffects([]);
      setEfficiency(0);
      setError(null);
      setShowCompletionModal(false);
      setComboCount(0);
      setLastWordScore(null);
      
      updateGameState({
        screen: 'game',
        mode: gameMode,
        round: 1,
        score: 0,
        turnsLeft: safeTurnLimit,
        selectedTiles: 0,
        lastAction: 'newGame',
      });
      
      if (gameMode === 'solo') {
        try {
          addBreadcrumb('network', 'Creating backend game session', {});
          const response = await authenticatedPost('/api/game/solo/start', {});
          console.log('[Game] Solo game session created on backend:', response.gameId);
          addBreadcrumb('network', 'Backend game session created', { gameId: response.gameId });
        } catch (err: any) {
          console.error('[Game] Failed to create backend game session:', err);
          addBreadcrumb('error', 'Backend game session creation failed', { error: err.message });
          // Don't throw - allow offline play
        }
      }
      
      console.log('[Game] New game started successfully - Solo mode with', safeTurnLimit, 'turns');
      addBreadcrumb('state', 'New game started successfully', { turnLimit: safeTurnLimit });
    } catch (err: any) {
      console.error('[Game] Error starting game:', err);
      logError(err, { gridSize: safeGridSize, puzzleMode, turnLimit: safeTurnLimit, gameMode });
      
      if (mountedRef.current) {
        setError(err.message || 'Failed to start game. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [gridSize, puzzleMode, turnLimit, gameMode]);

  const loadExistingGame = useCallback(async (id: string) => {
    console.log('[Game] Loading existing game:', id);
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('[Game] Invalid gameId provided:', id);
      if (mountedRef.current) {
        setError('Invalid game ID. Starting new game instead.');
        startNewGame();
      }
      return;
    }
    
    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }
      
      const response = await authenticatedGet(`/api/game/${id}`);
      
      if (!response || !response.boardState) {
        console.error('[Game] Invalid game data received:', response);
        throw new Error('Invalid game data received from server');
      }
      
      const gameData = response;
      
      if (!gameData.boardState.tiles || !Array.isArray(gameData.boardState.tiles)) {
        console.error('[Game] Invalid board state:', gameData.boardState);
        throw new Error('Invalid board state');
      }
      
      if (mountedRef.current) {
        setBoard(gameData.boardState);
        setScore(gameData.currentScore || 0);
        setMovesMade(gameData.moveHistory?.length || 0);
        setWordsFormed(gameData.moveHistory?.length || 0);
        setGameStatus(gameData.status === 'completed' ? 'won' : 'playing');
      }
      
      console.log('[Game] Game loaded successfully');
    } catch (err: any) {
      console.error('[Game] Error loading game:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load game. Starting new game instead.');
        setTimeout(() => {
          if (mountedRef.current) {
            startNewGame();
          }
        }, 1000);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [startNewGame]);

  useEffect(() => {
    if (initializedRef.current) {
      console.log('[Game] Already initialized, skipping duplicate init');
      return;
    }
    
    console.log('[Game] GameScreen initializing with params:', params);
    initializedRef.current = true;
    
    if (!gameMode || (gameMode !== 'solo' && gameMode !== 'multiplayer')) {
      console.error('[Game] Invalid gameMode:', gameMode, '- defaulting to solo');
    }
    
    if (!gridSize || gridSize < 3 || gridSize > 15) {
      console.error('[Game] Invalid gridSize:', gridSize, '- will use default');
    }
    
    if (!turnLimit || turnLimit < 1) {
      console.error('[Game] Invalid turnLimit:', turnLimit, '- will use default');
    }
    
    try {
      setLastPlayedMode(gameMode);
    } catch (modeError) {
      console.error('[Game] Failed to save last played mode:', modeError);
    }
    
    if (gameId) {
      loadExistingGame(gameId);
    } else {
      startNewGame();
    }
  }, [gameId, gameMode, gridSize, loadExistingGame, params, startNewGame, turnLimit]);

  function handleTilePress(row: number, col: number) {
    addBreadcrumb('action', 'Tile pressed', { row, col, selectedCount: selectedPositions.length });
    console.log('[Game] Tile pressed:', row, col);
    
    // CRITICAL: Validate board state before any operations
    if (!board || !board.tiles || !Array.isArray(board.tiles)) {
      console.error('[Game] Cannot press tile - board not initialized');
      logError(new Error('Board not initialized on tile press'), { row, col });
      setError('Game board not ready. Please restart the game.');
      return;
    }
    
    if (gameStatus !== 'playing') {
      console.log('[Game] Cannot press tile - game not in playing state:', gameStatus);
      addBreadcrumb('action', 'Tile press rejected - game not playing', { gameStatus });
      return;
    }
    
    // CRITICAL: Bounds checking to prevent array out-of-bounds crashes
    if (row < 0 || row >= board.tiles.length || col < 0 || !board.tiles[0] || col >= board.tiles[0].length) {
      console.error('[Game] Invalid tile position:', row, col, 'board size:', board.tiles.length);
      logError(new Error('Tile position out of bounds'), { row, col, boardSize: board.tiles.length });
      return;
    }
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (hapticErr) {
      console.error('[Game] Haptic feedback failed:', hapticErr);
      addBreadcrumb('error', 'Haptic feedback failed', { error: String(hapticErr) });
    }
    
    const position = { row, col };
    const tile = board.tiles[row][col];
    
    // CRITICAL: Validate tile exists and has required properties
    if (!tile || !tile.letter) {
      console.error('[Game] Tile not found or invalid at position:', row, col);
      logError(new Error('Invalid tile at position'), { row, col, tile });
      return;
    }
    
    if (tile.isLocked) {
      console.log('[Game] Cannot select locked tile');
      addBreadcrumb('action', 'Locked tile press rejected', { row, col });
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (hapticErr) {
        console.error('[Game] Haptic feedback failed:', hapticErr);
      }
      return;
    }
    
    const existingIndex = selectedPositions.findIndex(
      p => p && p.row === row && p.col === col
    );
    
    if (existingIndex !== -1) {
      if (existingIndex === selectedPositions.length - 1) {
        console.log('Deselecting last tile');
        addBreadcrumb('action', 'Tile deselected', { row, col });
        const newPositions = selectedPositions.slice(0, -1);
        setSelectedPositions(newPositions);
        
        // CRITICAL: Validate positions before accessing tiles
        const newWord = newPositions
          .filter(p => p && p.row >= 0 && p.row < board.tiles.length && p.col >= 0 && p.col < board.tiles[0].length)
          .map(p => board.tiles[p.row][p.col]?.letter || '')
          .join('');
        setCurrentWord(newWord);
        
        updateGameState({
          selectedTiles: newPositions.length,
          lastAction: 'deselect',
        });
      }
      return;
    }
    
    if (selectedPositions.length > 0) {
      const lastPos = selectedPositions[selectedPositions.length - 1];
      
      // CRITICAL: Validate lastPos exists
      if (!lastPos) {
        console.error('[Game] Last position is invalid');
        logError(new Error('Invalid last position'), { selectedPositions });
        setSelectedPositions([]);
        return;
      }
      
      const rowDiff = Math.abs(lastPos.row - row);
      const colDiff = Math.abs(lastPos.col - col);
      const isAdjacent = (rowDiff === 0 && colDiff === 1) ||
                         (rowDiff === 1 && colDiff === 0) ||
                         (rowDiff === 1 && colDiff === 1);
      
      if (!isAdjacent) {
        console.log('Tile not adjacent to last selected tile');
        addBreadcrumb('action', 'Non-adjacent tile rejected', { row, col, lastPos });
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        return;
      }
    }
    
    const newPositions = [...selectedPositions, position];
    setSelectedPositions(newPositions);
    
    // CRITICAL: Validate all positions before building word
    const newWord = newPositions
      .filter(p => p && p.row >= 0 && p.row < board.tiles.length && p.col >= 0 && p.col < board.tiles[0].length)
      .map(p => board.tiles[p.row][p.col]?.letter || '')
      .join('');
    setCurrentWord(newWord);
    console.log('Current word:', newWord);
    addBreadcrumb('state', 'Word updated', { word: newWord, length: newWord.length });
    
    updateGameState({
      selectedTiles: newPositions.length,
      lastAction: 'select',
    });
    
    try {
      if (newWord.length === 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (newWord.length >= 6) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (hapticErr) {
      console.error('[Game] Haptic feedback failed:', hapticErr);
    }
  }

  async function handleSubmitWord() {
    addBreadcrumb('action', 'Submit word requested', { word: currentWord, selectedCount: selectedPositions.length });
    console.log('[Game] Submit word requested:', currentWord);
    
    // CRITICAL: Comprehensive validation before submission
    if (!board || !board.tiles || !Array.isArray(board.tiles)) {
      console.error('[Game] Cannot submit word - board not initialized');
      logError(new Error('Board not initialized on submit'), { currentWord });
      setError('Game board not ready. Please restart the game.');
      return;
    }
    
    if (!selectedPositions || !Array.isArray(selectedPositions) || selectedPositions.length < 3) {
      console.log('[Game] Cannot submit: insufficient tiles selected');
      addBreadcrumb('action', 'Submit rejected - insufficient tiles', { count: selectedPositions?.length || 0 });
      setError('Select at least 3 tiles to form a word');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (hapticErr) {
        console.error('[Game] Haptic feedback failed:', hapticErr);
      }
      return;
    }
    
    if (!currentWord || typeof currentWord !== 'string' || currentWord.trim() === '') {
      console.error('[Game] Cannot submit: invalid word');
      logError(new Error('Invalid word on submit'), { currentWord, selectedPositions });
      setError('Invalid word');
      return;
    }
    
    // CRITICAL: Debounce to prevent double-tap crashes
    if (submitting) {
      console.log('[Game] Already submitting word, ignoring duplicate request');
      addBreadcrumb('action', 'Duplicate submit rejected', { word: currentWord });
      return;
    }
    
    console.log('[Game] Submitting word:', currentWord, 'Turns left:', turnsLeft);
    addBreadcrumb('action', 'Submitting word', { word: currentWord, turnsLeft, score });
    setSubmitting(true);
    setError(null);
    
    try {
      // CRITICAL: Validate word before processing
      const isValid = isValidWord(currentWord);
      if (!isValid) {
        console.log('Invalid word:', currentWord);
        addBreadcrumb('action', 'Invalid word rejected', { word: currentWord });
        setError(`"${currentWord}" is not a valid word`);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        setSubmitting(false);
        return;
      }
      
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (hapticErr) {
        console.error('[Game] Haptic feedback failed:', hapticErr);
      }
      
      // CRITICAL: Wrap score calculation in try-catch
      let wordScore = 0;
      try {
        wordScore = calculateScore(currentWord, selectedPositions, board);
        console.log('Word score:', wordScore);
        addBreadcrumb('state', 'Word score calculated', { word: currentWord, score: wordScore });
      } catch (scoreErr: any) {
        console.error('[Game] Score calculation failed:', scoreErr);
        logError(scoreErr, { word: currentWord, selectedPositions });
        throw new Error('Failed to calculate score');
      }
      
      // CRITICAL: Safe timer for score popup (clear on unmount)
      setLastWordScore(wordScore);
      setShowScorePop(true);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setShowScorePop(false);
        }
      }, 2000);
      
      // CRITICAL: Wrap word effect application in try-catch
      let updatedBoard: BoardState;
      let effects: any[] = [];
      try {
        const result = applyWordEffect(
          board,
          selectedPositions,
          puzzleMode,
          'player1',
          currentWord,
          lastWordEffect
        );
        updatedBoard = result.board;
        effects = result.effects;
        console.log('Word effects applied:', effects.length, 'effects');
        addBreadcrumb('state', 'Word effects applied', { effectCount: effects.length });
      } catch (effectErr: any) {
        console.error('[Game] Word effect application failed:', effectErr);
        logError(effectErr, { word: currentWord, puzzleMode });
        // Fallback: use original board if effect fails
        updatedBoard = board;
        effects = [];
      }
      
      const newComboCount = comboCount + 1;
      setComboCount(newComboCount);
      
      if (newComboCount >= 3) {
        setShowCombo(true);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setShowCombo(false);
          }
        }, 2000);
      }
      
      if (effects.length > 0) {
        setCurrentEffects(effects);
        setShowEffects(true);
        setLastWordEffect(effects[0]);
        
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setShowEffects(false);
          }
        }, 3000);
      }
      
      const newScore = score + wordScore;
      const newMovesMade = movesMade + 1;
      const newWordsFormed = wordsFormed + 1;
      const newTurnsLeft = gameMode === 'solo' ? turnsLeft - 1 : turnsLeft;
      const newEfficiency = newScore / newMovesMade;
      
      // CRITICAL: Only update state if component is still mounted
      if (!mountedRef.current) {
        console.warn('[Game] Component unmounted during word submission');
        addBreadcrumb('error', 'State update skipped - component unmounted', {});
        return;
      }
      
      setBoard(updatedBoard);
      setScore(newScore);
      setMovesMade(newMovesMade);
      setWordsFormed(newWordsFormed);
      setTurnsLeft(newTurnsLeft);
      setEfficiency(newEfficiency);
      setSelectedPositions([]);
      setCurrentWord('');
      
      console.log('Game state updated - Score:', newScore, 'Moves:', newMovesMade, 'Turns left:', newTurnsLeft, 'Efficiency:', newEfficiency.toFixed(2));
      addBreadcrumb('state', 'Game state updated after word', { score: newScore, moves: newMovesMade, turnsLeft: newTurnsLeft });
      
      updateGameState({
        round: newMovesMade,
        score: newScore,
        turnsLeft: newTurnsLeft,
        selectedTiles: 0,
        lastAction: 'submitWord',
      });
      
      // CRITICAL: Wrap win condition check in try-catch
      let outcome;
      try {
        outcome = checkWinCondition(
          updatedBoard,
          puzzleMode,
          winCondition,
          newScore,
          newMovesMade,
          gameMode,
          newTurnsLeft
        );
        console.log('Win condition check result:', outcome);
        addBreadcrumb('state', 'Win condition checked', { outcome });
      } catch (winErr: any) {
        console.error('[Game] Win condition check failed:', winErr);
        logError(winErr, { puzzleMode, score: newScore, moves: newMovesMade });
        // Fallback: assume game continues
        outcome = GameOutcome.Playing;
      }
      
      if (outcome === GameOutcome.Win) {
        console.log('Player won!');
        addBreadcrumb('state', 'Game won', { finalScore: newScore });
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        await completeGame('won', newScore);
      } else if (outcome === GameOutcome.Loss) {
        console.log('Player lost!');
        addBreadcrumb('state', 'Game lost', { finalScore: newScore });
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (hapticErr) {
          console.error('[Game] Haptic feedback failed:', hapticErr);
        }
        await completeGame('lost', newScore);
      }
      
    } catch (err: any) {
      console.error('Error submitting word:', err);
      logError(err, { word: currentWord, selectedPositions, gameState: { score, turnsLeft, movesMade } });
      setError('Failed to submit word');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (hapticErr) {
        console.error('[Game] Haptic feedback failed:', hapticErr);
      }
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
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
    
    try {
      const xpResult = await authenticatedPost('/api/player/progress/award-xp', {
        xp: xpEarned,
        source,
        gameId,
      });
      
      console.log('[Progression] XP awarded:', xpResult);
      
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
    initializedRef.current = false;
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
      const letterText = remaining > 1 ? 'letters' : 'letter';
      return `Need ${remaining} more ${letterText}`;
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

        <WinConditionDisplay
          puzzleMode={puzzleMode}
          current={progress.current}
          target={progress.target}
          percentage={progress.percentage}
          description={winCondition.description}
          turnsLeft={gameMode === 'solo' ? turnsLeft : undefined}
        />

        {showScorePop && lastWordScore !== null && (
          <Animated.View entering={safeBounceIn()} exiting={safeFadeOut()} style={styles.scorePopup}>
            <Text style={styles.scorePopupText}>+{lastWordScore}</Text>
            <Text style={styles.scorePopupLabel}>points!</Text>
          </Animated.View>
        )}

        {showCombo && (
          <Animated.View entering={safeZoomIn()} exiting={safeFadeOut()} style={styles.comboContainer}>
            <Text style={styles.comboText}>{comboCount}x COMBO!</Text>
            <Text style={styles.comboSubtext}>You&apos;re on fire! 🔥</Text>
          </Animated.View>
        )}

        {showEffects && currentEffects.length > 0 && (
          <Animated.View entering={safeFadeIn()} exiting={safeFadeOut()} style={styles.effectsContainer}>
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

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>{instructionsText}</Text>
        </View>

        {currentWord && (
          <View style={styles.currentWordContainer}>
            <Text style={styles.currentWordLabel}>Current Word:</Text>
            <Text style={styles.currentWord}>{currentWord}</Text>
            <Text style={styles.wordLength}>{currentWord.length} letters</Text>
          </View>
        )}

        <GameBoard
          tiles={board.tiles}
          selectedPositions={selectedPositions}
          onTilePress={handleTilePress}
          disabled={gameStatus !== 'playing' || submitting}
        />

        {error && (
          <Animated.View entering={safeFadeIn()} exiting={safeFadeOut()} style={styles.errorBanner}>
            <IconSymbol
              ios_icon_name="exclamationmark.circle"
              android_material_icon_name="error"
              size={20}
              color={colors.error}
            />
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        )}

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
