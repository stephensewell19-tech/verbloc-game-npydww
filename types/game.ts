
// ============================================
// BOARD SYSTEM TYPES
// ============================================

export type TileType = 'letter' | 'locked' | 'puzzle' | 'objective';
export type GridSize = 7 | 9;
export type PlayMode = 'Solo' | 'Multiplayer' | 'Both';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Special';
export type PuzzleMode = 'score_target' | 'vault_break' | 'hidden_phrase' | 'territory_control';

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
  targetPhrase?: string; // For hidden_phrase mode
  targetControlPercentage?: number; // For territory_control mode
  requiredVaultTiles?: number; // For vault_break mode
  targetEfficiency?: number; // Optional efficiency score target
  turnLimit?: number; // Turn limit for solo mode
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
  
  // Vault Break properties
  isLocked?: boolean;
  isVault?: boolean;
  isRequired?: boolean;
  
  // Hidden Phrase properties
  isPhraseLetter?: boolean;
  isRevealed?: boolean;
  isDecoy?: boolean;
  hiddenLetter?: string; // The actual letter hidden beneath
  
  // Territory Control properties
  isClaimable?: boolean;
  ownerId?: string;
  ownerColor?: string;
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
  puzzleMode?: PuzzleMode;
  winCondition?: WinCondition;
  
  // Puzzle mode specific state
  vaultProgress?: {
    unlockedCount: number;
    totalRequired: number;
  };
  phraseProgress?: {
    revealedLetters: string;
    targetPhrase: string;
  };
  territoryProgress?: {
    playerControlled: number;
    totalClaimable: number;
    controlPercentage: number;
  };
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

export enum GameOutcome {
  Playing = 'playing',
  Win = 'win',
  Loss = 'loss',
  Draw = 'draw',
}

// ============================================
// MULTIPLAYER TYPES
// ============================================

export type MatchmakingType = 'random' | 'invite' | 'private';

export interface MultiplayerPlayer {
  userId: string;
  userName: string;
  score: number;
  isCurrentTurn: boolean;
  joinedAt?: string;
}

export interface MultiplayerGame {
  gameId: string;
  boardId: string;
  boardState: BoardState;
  players: MultiplayerPlayer[];
  currentPlayerId: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  matchmakingType: MatchmakingType;
  isLiveMatch: boolean;
  turnTimerSeconds?: number;
  turnGracePeriodHours?: number;
  currentTurnStartedAt?: string;
  inviteCode?: string;
  maxPlayers: number;
  moveHistory: Move[];
  reactions: GameReaction[];
  taunts: GameTaunt[];
  createdAt: string;
  updatedAt: string;
}

export interface GameReaction {
  id: string;
  emoji: string;
  userName: string;
  userId: string;
  targetMoveIndex: number;
  createdAt: string;
}

export interface GameTaunt {
  id: string;
  tauntType: TauntType;
  userName: string;
  userId: string;
  message: string;
  createdAt: string;
}

export type TauntType = 'nice_move' | 'watch_this' | 'good_game' | 'your_turn' | 'thinking' | 'impressive';

export interface TurnStatus {
  currentPlayerId: string;
  currentPlayerName: string;
  turnStartedAt: string;
  turnTimeRemaining: number; // seconds
  isMyTurn: boolean;
  isLiveMatch: boolean;
  turnTimerSeconds?: number;
  gracePeriodsHours?: number;
}

export interface ActiveMultiplayerGame {
  gameId: string;
  opponentName: string;
  isMyTurn: boolean;
  lastMoveAt: string;
  turnTimeRemaining?: number;
  isLiveMatch: boolean;
  isUrgent: boolean;
}

export const ALLOWED_EMOJIS = ['👍', '🔥', '😮', '💪', '🎯', '⭐'] as const;
export type AllowedEmoji = typeof ALLOWED_EMOJIS[number];

export const TAUNT_MESSAGES: Record<TauntType, string> = {
  nice_move: 'Nice move!',
  watch_this: 'Watch this!',
  good_game: 'Good game!',
  your_turn: 'Your turn!',
  thinking: 'Thinking...',
  impressive: 'Impressive!',
};

// ============================================
// DAILY CHALLENGE TYPES
// ============================================

export type DailyChallengeGameMode = 'dailyChallengeSolo' | 'dailyChallengeMultiplayer';

export interface DailyChallengeRewards {
  xp: number;
  cosmeticUnlockIds: string[];
  streakProgression: number;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  gameMode: DailyChallengeGameMode;
  boardId: string;
  puzzleMode: PuzzleMode;
  winCondition: WinCondition;
  turnLimit: number | null;
  attemptsAllowed: number;
  attemptsUsed: number;
  isCompleted: boolean;
  rewards: DailyChallengeRewards;
  userBestScore: number | null;
  timeRemaining: number; // seconds until reset
  leaderboardId: string | null;
}

export interface DailyChallengeCompletion {
  id: string;
  challengeId: string;
  userId: string;
  score: number;
  turnsUsed: number | null;
  wordsFormed: number;
  efficiency: number | null;
  timeTakenSeconds: number | null;
  isCompleted: boolean;
  gameId: string | null;
  completedAt: string;
}

export interface DailyChallengeLeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  turnsUsed: number | null;
  timeTakenSeconds: number | null;
  efficiency: number | null;
  rank: number;
}

export interface DailyChallengeLeaderboard {
  entries: DailyChallengeLeaderboardEntry[];
  userRank: number | null;
  totalEntries: number;
}

export interface DailyChallengeStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  daysUntilStreakBreak: number;
}

export interface DailyChallengeHistory {
  challengeId: string;
  date: string;
  gameMode: DailyChallengeGameMode;
  isCompleted: boolean;
  score: number;
  attemptsUsed: number;
  rewards: DailyChallengeRewards;
}

// ============================================
// SPECIAL EVENTS TYPES
// ============================================

export type SpecialEventType =
  | 'DailyFeaturedBoard'
  | 'WeeklyChallengeBoard'
  | 'LimitedTimeEventBoard'
  | 'AllMirrorTiles'
  | 'RareLetterAmplified'
  | 'BoardRotatesEveryTurn'
  | 'VowelsUnlockTiles';

export interface SpecialEventReward {
  type: 'XP' | 'Cosmetic' | 'Currency' | 'StreakBonus';
  value: number | string;
  description?: string;
}

export interface SpecialEvent {
  id: string;
  type: SpecialEventType;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  boardId: string;
  rules: string[];
  rewards: SpecialEventReward[];
  difficulty: Difficulty;
  timeRemaining: number; // seconds until event ends
  isActive: boolean;
}

export interface SpecialEventProgress {
  attemptsUsed: number;
  bestScore: number | null;
  isCompleted: boolean;
}

export interface SpecialEventDetail extends SpecialEvent {
  userProgress: SpecialEventProgress;
}

export interface CurrentSpecialEvents {
  dailyFeatured: SpecialEvent | null;
  weeklyChallenges: SpecialEvent[];
  limitedTimeEvents: SpecialEvent[];
}

export interface SpecialEventLeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  turnsUsed: number | null;
  timeTakenSeconds: number | null;
  efficiency: number | null;
  rank: number;
}

export interface SpecialEventLeaderboard {
  entries: SpecialEventLeaderboardEntry[];
  userRank: number | null;
  totalEntries: number;
}
