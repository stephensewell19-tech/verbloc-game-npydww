
// ============================================
// BOARD SYSTEM TYPES
// ============================================

export type TileType = 'letter' | 'locked' | 'puzzle' | 'objective';
export type GridSize = 7 | 9;
export type PlayMode = 'Solo' | 'Multiplayer' | 'Both';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Special';
export type PuzzleMode = 'score_target' | 'clear_objectives' | 'word_count' | 'time_attack';

export interface TileMetadata {
  [key: string]: any;
}

export interface BoardTile {
  type: TileType;
  letter?: string;
  value?: number;
  metadata?: TileMetadata;
}

export interface WinCondition {
  type: string;
  target: number;
  description: string;
}

export interface BoardMetadata {
  id: string;
  name: string;
  supportedModes: PlayMode[];
  gridSize: GridSize;
  initialLayout: BoardTile[][];
  puzzleMode: PuzzleMode;
  winCondition: WinCondition;
  difficulty: Difficulty;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardListItem {
  id: string;
  name: string;
  supportedModes: PlayMode[];
  gridSize: GridSize;
  puzzleMode: PuzzleMode;
  difficulty: Difficulty;
  tags?: string[];
}

// ============================================
// GAME TILE TYPES (for active gameplay)
// ============================================

export interface Tile {
  letter: string;
  value: number;
  row: number;
  col: number;
  isSpecial?: boolean;
  specialType?: 'double' | 'triple' | 'wildcard';
  type?: TileType; // Added to support board system tile types
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  word: string;
  positions: Position[];
  score: number;
  timestamp: string;
}

export interface BoardState {
  tiles: Tile[][];
  size: number;
}

export interface GameState {
  id: string;
  gameMode: 'solo' | 'multiplayer';
  status: 'active' | 'completed' | 'abandoned';
  boardState: BoardState;
  moveHistory: Move[];
  currentScore: number;
  targetScore?: number;
  boardId?: string; // Reference to the board being played
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  highestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalWordsFormed: number;
  experiencePoints: number;
  level: number;
}
