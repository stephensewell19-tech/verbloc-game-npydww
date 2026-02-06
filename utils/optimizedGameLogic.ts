
import { useMemo, useCallback } from 'react';
import { Position, BoardState, Tile } from '@/types/game';

/**
 * Optimized game logic utilities with memoization
 */

/**
 * Memoized board state calculation
 */
export function useMemoizedBoardState(
  tiles: Tile[][],
  selectedPositions: Position[]
): {
  board: Tile[][];
  selectedTiles: Set<string>;
  isValidSelection: boolean;
} {
  return useMemo(() => {
    const selectedTiles = new Set(
      selectedPositions.map(pos => `${pos.row},${pos.col}`)
    );
    
    const isValidSelection = selectedPositions.length >= 3;
    
    return {
      board: tiles,
      selectedTiles,
      isValidSelection,
    };
  }, [tiles, selectedPositions]);
}

/**
 * Optimized tile press handler with debouncing
 */
export function useOptimizedTilePress(
  onTilePress: (row: number, col: number) => void,
  debounceMs: number = 50
): (row: number, col: number) => void {
  let lastPressTime = 0;
  
  return useCallback((row: number, col: number) => {
    const now = Date.now();
    if (now - lastPressTime < debounceMs) {
      return;
    }
    lastPressTime = now;
    onTilePress(row, col);
  }, [onTilePress, debounceMs]);
}

/**
 * Memoized word calculation
 */
export function useMemoizedWord(selectedPositions: Position[], board: Tile[][]): string {
  return useMemo(() => {
    return selectedPositions
      .map(pos => board[pos.row]?.[pos.col]?.letter || '')
      .join('');
  }, [selectedPositions, board]);
}

/**
 * Optimized adjacency check with caching
 */
const adjacencyCache = new Map<string, boolean>();

export function arePositionsAdjacentCached(pos1: Position, pos2: Position): boolean {
  const key = `${pos1.row},${pos1.col}-${pos2.row},${pos2.col}`;
  
  if (adjacencyCache.has(key)) {
    return adjacencyCache.get(key)!;
  }
  
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  const isAdjacent = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);
  
  adjacencyCache.set(key, isAdjacent);
  
  // Clear cache if it gets too large
  if (adjacencyCache.size > 1000) {
    adjacencyCache.clear();
  }
  
  return isAdjacent;
}

/**
 * Batch state updates for better performance
 */
export function batchBoardUpdates<T>(updates: (() => T)[]): T[] {
  // React 18+ automatically batches updates
  return updates.map(update => update());
}

/**
 * Optimized board rendering with virtualization hints
 */
export function getOptimizedBoardLayout(gridSize: number): {
  tileSize: number;
  gap: number;
  containerSize: number;
} {
  // Calculate optimal tile size based on screen size
  const screenWidth = 375; // Base width (iPhone SE)
  const padding = 40;
  const gap = 4;
  const availableWidth = screenWidth - padding;
  const tileSize = Math.floor((availableWidth - (gap * (gridSize - 1))) / gridSize);
  const containerSize = (tileSize * gridSize) + (gap * (gridSize - 1));
  
  return {
    tileSize,
    gap,
    containerSize,
  };
}

/**
 * Memory-efficient board state serialization
 */
export function serializeBoardState(board: Tile[][]): string {
  return board.map(row => 
    row.map(tile => tile.letter).join('')
  ).join('|');
}

export function deserializeBoardState(serialized: string, gridSize: number): Tile[][] {
  const rows = serialized.split('|');
  return rows.map((row, rowIndex) => 
    row.split('').map((letter, colIndex) => ({
      letter,
      row: rowIndex,
      col: colIndex,
      type: 'normal' as const,
    }))
  );
}
