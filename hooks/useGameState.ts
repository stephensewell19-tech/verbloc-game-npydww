
/**
 * Custom hook for managing game state with optimized updates
 * Prevents unnecessary re-renders and batches state updates
 */

import { useState, useCallback, useMemo } from 'react';
import { BoardState, Position, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import {
  generateInitialBoard,
  isValidWord,
  calculateScore,
  applyWordEffect,
  checkWinCondition,
  getPuzzleModeProgress,
} from '@/utils/gameLogic';
import { WordEffect } from '@/utils/wordMechanics';

interface GameStateConfig {
  gridSize: number;
  puzzleMode: PuzzleMode;
  winCondition: WinCondition;
  turnLimit: number;
  gameMode: 'solo' | 'multiplayer';
}

interface GameStateReturn {
  board: BoardState | null;
  selectedPositions: Position[];
  currentWord: string;
  score: number;
  movesMade: number;
  wordsFormed: number;
  turnsLeft: number;
  efficiency: number;
  gameStatus: 'playing' | 'won' | 'lost';
  lastWordEffect: WordEffect | null;
  currentEffects: WordEffect[];
  
  // Actions
  handleTilePress: (row: number, col: number) => void;
  handleSubmitWord: () => Promise<{ success: boolean; wordScore: number; effects: WordEffect[] }>;
  handleClearSelection: () => void;
  resetGame: () => void;
  
  // Computed values
  progress: { current: number; target: number; percentage: number };
  isValidSelection: boolean;
}

export function useGameState(config: GameStateConfig): GameStateReturn {
  const { gridSize, puzzleMode, winCondition, turnLimit, gameMode } = config;
  
  // Core state
  const [board, setBoard] = useState<BoardState | null>(() => generateInitialBoard(gridSize));
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [movesMade, setMovesMade] = useState(0);
  const [wordsFormed, setWordsFormed] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState(turnLimit);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [lastWordEffect, setLastWordEffect] = useState<WordEffect | null>(null);
  const [currentEffects, setCurrentEffects] = useState<WordEffect[]>([]);
  
  // Computed values (memoized)
  const currentWord = useMemo(() => {
    if (!board || selectedPositions.length === 0) {
      return '';
    }
    return selectedPositions
      .map(pos => board.tiles[pos.row][pos.col].letter)
      .join('');
  }, [board, selectedPositions]);
  
  const efficiency = useMemo(() => {
    return movesMade > 0 ? score / movesMade : 0;
  }, [score, movesMade]);
  
  const progress = useMemo(() => {
    if (!board) {
      return { current: 0, target: 0, percentage: 0 };
    }
    return getPuzzleModeProgress(board, puzzleMode, winCondition);
  }, [board, puzzleMode, winCondition]);
  
  const isValidSelection = useMemo(() => {
    return selectedPositions.length >= 3 && isValidWord(currentWord);
  }, [selectedPositions.length, currentWord]);
  
  // Actions (memoized callbacks)
  const handleTilePress = useCallback((row: number, col: number) => {
    if (!board || gameStatus !== 'playing') {
      return;
    }
    
    const position = { row, col };
    const tile = board.tiles[row][col];
    
    if (tile.isLocked) {
      return;
    }
    
    setSelectedPositions(prev => {
      const existingIndex = prev.findIndex(p => p.row === row && p.col === col);
      
      if (existingIndex !== -1) {
        // Deselect if it's the last tile
        if (existingIndex === prev.length - 1) {
          return prev.slice(0, -1);
        }
        return prev;
      }
      
      // Check adjacency if not first tile
      if (prev.length > 0) {
        const lastPos = prev[prev.length - 1];
        const rowDiff = Math.abs(lastPos.row - row);
        const colDiff = Math.abs(lastPos.col - col);
        const isAdjacent = (rowDiff === 0 && colDiff === 1) ||
                          (rowDiff === 1 && colDiff === 0) ||
                          (rowDiff === 1 && colDiff === 1);
        
        if (!isAdjacent) {
          return prev;
        }
      }
      
      return [...prev, position];
    });
  }, [board, gameStatus]);
  
  const handleSubmitWord = useCallback(async () => {
    if (!board || selectedPositions.length < 3 || !currentWord) {
      return { success: false, wordScore: 0, effects: [] };
    }
    
    const valid = isValidWord(currentWord);
    if (!valid) {
      return { success: false, wordScore: 0, effects: [] };
    }
    
    const wordScore = calculateScore(currentWord, selectedPositions, board);
    const { board: updatedBoard, effects } = applyWordEffect(
      board,
      selectedPositions,
      puzzleMode,
      'player1',
      currentWord,
      lastWordEffect
    );
    
    // Batch state updates
    const newScore = score + wordScore;
    const newMovesMade = movesMade + 1;
    const newWordsFormed = wordsFormed + 1;
    const newTurnsLeft = gameMode === 'solo' ? turnsLeft - 1 : turnsLeft;
    
    setBoard(updatedBoard);
    setScore(newScore);
    setMovesMade(newMovesMade);
    setWordsFormed(newWordsFormed);
    setTurnsLeft(newTurnsLeft);
    setSelectedPositions([]);
    setCurrentEffects(effects);
    
    if (effects.length > 0) {
      setLastWordEffect(effects[0]);
    }
    
    // Check win condition
    const outcome = checkWinCondition(
      updatedBoard,
      puzzleMode,
      winCondition,
      newScore,
      newMovesMade,
      gameMode,
      newTurnsLeft
    );
    
    if (outcome === GameOutcome.Win) {
      setGameStatus('won');
    } else if (outcome === GameOutcome.Loss) {
      setGameStatus('lost');
    }
    
    return { success: true, wordScore, effects };
  }, [
    board,
    selectedPositions,
    currentWord,
    score,
    movesMade,
    wordsFormed,
    turnsLeft,
    puzzleMode,
    winCondition,
    gameMode,
    lastWordEffect,
  ]);
  
  const handleClearSelection = useCallback(() => {
    setSelectedPositions([]);
  }, []);
  
  const resetGame = useCallback(() => {
    setBoard(generateInitialBoard(gridSize));
    setSelectedPositions([]);
    setScore(0);
    setMovesMade(0);
    setWordsFormed(0);
    setTurnsLeft(turnLimit);
    setGameStatus('playing');
    setLastWordEffect(null);
    setCurrentEffects([]);
  }, [gridSize, turnLimit]);
  
  return {
    board,
    selectedPositions,
    currentWord,
    score,
    movesMade,
    wordsFormed,
    turnsLeft,
    efficiency,
    gameStatus,
    lastWordEffect,
    currentEffects,
    handleTilePress,
    handleSubmitWord,
    handleClearSelection,
    resetGame,
    progress,
    isValidSelection,
  };
}
