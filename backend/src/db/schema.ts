import {
  pgTable,
  text,
  integer,
  uuid,
  timestamp,
  jsonb,
  boolean,
  date,
  uniqueIndex,
  index,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema.js';

// Boards table
export const boards = pgTable('boards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  supportedModes: jsonb('supported_modes').$type<('Solo' | 'Multiplayer' | 'Both')[]>().notNull(),
  gridSize: integer('grid_size').notNull(), // 7 or 9
  initialLayout: jsonb('initial_layout').$type<Array<Array<{
    type: 'letter' | 'locked' | 'puzzle' | 'objective';
    letter?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  }>>>().notNull(),
  puzzleMode: text('puzzle_mode').notNull(), // e.g., 'score_target', 'clear_objectives', 'word_count', 'time_attack'
  winCondition: jsonb('win_condition').$type<{
    type: string;
    target: number;
    description: string;
  }>().notNull(),
  difficulty: text('difficulty', { enum: ['Easy', 'Medium', 'Hard', 'Special'] }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('boards_difficulty_idx').on(table.difficulty),
  index('boards_is_active_idx').on(table.isActive),
  index('boards_puzzle_mode_idx').on(table.puzzleMode),
]);

// Player stats table
export const playerStats = pgTable('player_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  totalGamesPlayed: integer('total_games_played').default(0).notNull(),
  totalWins: integer('total_wins').default(0).notNull(),
  totalLosses: integer('total_losses').default(0).notNull(),
  highestScore: integer('highest_score').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  totalWordsFormed: integer('total_words_formed').default(0).notNull(),
  experiencePoints: integer('experience_points').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Games table
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameMode: text('game_mode', { enum: ['solo', 'multiplayer'] }).notNull(),
  status: text('status', { enum: ['active', 'completed', 'abandoned'] }).notNull(),
  boardState: jsonb('board_state').notNull(),
  moveHistory: jsonb('move_history').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  winnerId: text('winner_id').references(() => user.id, { onDelete: 'set null' }),
  isLiveMatch: boolean('is_live_match').default(false).notNull(),
  turnTimerSeconds: integer('turn_timer_seconds'),
  turnGracePeriodHours: integer('turn_grace_period_hours').default(24).notNull(),
  inviteCode: text('invite_code').unique(),
  matchmakingType: text('matchmaking_type'), // 'random', 'invite', or 'private'
  maxPlayers: integer('max_players').default(2).notNull(),
  currentTurnStartedAt: timestamp('current_turn_started_at', { withTimezone: true }),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'set null' }),
});

// Game players table
export const gamePlayers = pgTable('game_players', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  score: integer('score').default(0).notNull(),
  isCurrentTurn: boolean('is_current_turn').default(false).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('game_players_game_id_user_id_idx').on(table.gameId, table.userId),
]);

// Daily challenges table
export const dailyChallenges = pgTable('daily_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull().unique(),
  boardState: jsonb('board_state').notNull(),
  targetScore: integer('target_score').notNull(),
  gameMode: text('game_mode', { enum: ['dailyChallengeSolo', 'dailyChallengeMultiplayer'] }).default('dailyChallengeSolo').notNull(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'restrict' }),
  attemptsAllowed: integer('attempts_allowed').default(3).notNull(),
  puzzleMode: text('puzzle_mode').default('scoreTarget').notNull(),
  winCondition: jsonb('win_condition').$type<{
    type: string;
    targetValue: number;
    description: string;
  }>().default({
    type: 'score',
    targetValue: 1000,
    description: 'Reach the target score',
  }).notNull(),
  turnLimit: integer('turn_limit'),
  rewards: jsonb('rewards').$type<{
    xp: number;
    cosmeticUnlockIds?: string[];
    streakProgression: number;
  }>().default({
    xp: 100,
    streakProgression: 1,
  }).notNull(),
  leaderboardId: uuid('leaderboard_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Daily challenge completions table
export const dailyChallengeCompletions = pgTable('daily_challenge_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').notNull().references(() => dailyChallenges.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  attemptsUsed: integer('attempts_used').default(1).notNull(),
  turnsUsed: integer('turns_used'),
  wordsFormed: integer('words_formed').default(0).notNull(),
  efficiency: numeric('efficiency'),
  timeTakenSeconds: integer('time_taken_seconds'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'set null' }),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('daily_challenge_completions_challenge_user_idx').on(table.challengeId, table.userId),
]);

// Daily challenge leaderboards table
export const dailyChallengeLeaderboards = pgTable('daily_challenge_leaderboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').notNull().references(() => dailyChallenges.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  turnsUsed: integer('turns_used'),
  timeTakenSeconds: integer('time_taken_seconds'),
  efficiency: numeric('efficiency'),
  rank: integer('rank'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Daily challenge streaks table
export const dailyChallengeStreaks = pgTable('daily_challenge_streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastCompletedDate: date('last_completed_date'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Game reactions table
export const gameReactions = pgTable('game_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  targetMoveIndex: integer('target_move_index').notNull(),
  emoji: text('emoji').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Game taunts table
export const gameTaunts = pgTable('game_taunts', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tauntType: text('taunt_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Push notification tokens table
export const pushNotificationTokens = pgTable('push_notification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  pushToken: text('push_token').notNull(),
  platform: text('platform', { enum: ['ios', 'android'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Relations
export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  user: one(user, {
    fields: [playerStats.userId],
    references: [user.id],
  }),
}));

export const gamesRelations = relations(games, ({ many, one }) => ({
  players: many(gamePlayers),
  winner: one(user, {
    fields: [games.winnerId],
    references: [user.id],
  }),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  game: one(games, {
    fields: [gamePlayers.gameId],
    references: [games.id],
  }),
  user: one(user, {
    fields: [gamePlayers.userId],
    references: [user.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ many, one }) => ({
  completions: many(dailyChallengeCompletions),
  board: one(boards, {
    fields: [dailyChallenges.boardId],
    references: [boards.id],
  }),
  leaderboardEntries: many(dailyChallengeLeaderboards),
}));

export const dailyChallengeCompletionsRelations = relations(dailyChallengeCompletions, ({ one }) => ({
  challenge: one(dailyChallenges, {
    fields: [dailyChallengeCompletions.challengeId],
    references: [dailyChallenges.id],
  }),
  user: one(user, {
    fields: [dailyChallengeCompletions.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [dailyChallengeCompletions.gameId],
    references: [games.id],
  }),
}));

export const dailyChallengeLeaderboardsRelations = relations(dailyChallengeLeaderboards, ({ one }) => ({
  challenge: one(dailyChallenges, {
    fields: [dailyChallengeLeaderboards.challengeId],
    references: [dailyChallenges.id],
  }),
  user: one(user, {
    fields: [dailyChallengeLeaderboards.userId],
    references: [user.id],
  }),
}));

export const dailyChallengeStreaksRelations = relations(dailyChallengeStreaks, ({ one }) => ({
  user: one(user, {
    fields: [dailyChallengeStreaks.userId],
    references: [user.id],
  }),
}));

export const gameReactionsRelations = relations(gameReactions, ({ one }) => ({
  game: one(games, {
    fields: [gameReactions.gameId],
    references: [games.id],
  }),
  user: one(user, {
    fields: [gameReactions.userId],
    references: [user.id],
  }),
}));

export const gameTauntsRelations = relations(gameTaunts, ({ one }) => ({
  game: one(games, {
    fields: [gameTaunts.gameId],
    references: [games.id],
  }),
  user: one(user, {
    fields: [gameTaunts.userId],
    references: [user.id],
  }),
}));

export const pushNotificationTokensRelations = relations(pushNotificationTokens, ({ one }) => ({
  user: one(user, {
    fields: [pushNotificationTokens.userId],
    references: [user.id],
  }),
}));
