
export interface Tile {
  letter: string;
  value: number;
  row: number;
  col: number;
  isSpecial?: boolean;
  specialType?: 'double' | 'triple' | 'wildcard';
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
