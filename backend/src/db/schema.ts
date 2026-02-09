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

// Notification tokens table (Expo Push Tokens)
export const notificationTokens = pgTable('notification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expoPushToken: text('expo_push_token').notNull().unique(),
  platform: text('platform', { enum: ['ios', 'android'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('notification_tokens_user_id_idx').on(table.userId),
]);

// Notification preferences table
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  multiplayerTurnReminders: boolean('multiplayer_turn_reminders').default(true).notNull(),
  dailyChallengeAvailability: boolean('daily_challenge_availability').default(true).notNull(),
  eventBoardStartEnd: boolean('event_board_start_end').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Notification history table
export const notificationHistory = pgTable('notification_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  notificationType: text('notification_type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  data: jsonb('data'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  deliveryStatus: text('delivery_status', { enum: ['sent', 'failed', 'delivered'] }).notNull(),
}, (table) => [
  index('notification_history_user_id_idx').on(table.userId),
  index('notification_history_sent_at_idx').on(table.sentAt),
  index('notification_history_type_idx').on(table.notificationType),
]);

// Push notification tokens table (legacy - keeping for backwards compatibility)
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

export const notificationTokensRelations = relations(notificationTokens, ({ one }) => ({
  user: one(user, {
    fields: [notificationTokens.userId],
    references: [user.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreferences.userId],
    references: [user.id],
  }),
}));

export const notificationHistoryRelations = relations(notificationHistory, ({ one }) => ({
  user: one(user, {
    fields: [notificationHistory.userId],
    references: [user.id],
  }),
}));

// Remote configuration table
export const remoteConfig = pgTable('remote_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  configKey: text('config_key').notNull().unique(),
  configValue: jsonb('config_value').notNull(),
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('remote_config_key_idx').on(table.configKey),
  index('remote_config_is_active_idx').on(table.isActive),
]);

// Feature flags table
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  flagName: text('flag_name').notNull().unique(),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  description: text('description'),
  rolloutPercentage: integer('rollout_percentage').default(100).notNull(),
  targetUserIds: jsonb('target_user_ids').$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('feature_flags_flag_name_idx').on(table.flagName),
]);

// A/B tests table
export const abTests = pgTable('ab_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  testName: text('test_name').notNull().unique(),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  variants: jsonb('variants').$type<string[]>().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('ab_tests_test_name_idx').on(table.testName),
]);

// A/B test assignments table
export const abTestAssignments = pgTable('ab_test_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  testName: text('test_name').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  variant: text('variant').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('ab_test_assignments_test_user_idx').on(table.testName, table.userId),
  index('ab_test_assignments_user_id_idx').on(table.userId),
]);

// Relations for A/B test assignments
export const abTestAssignmentsRelations = relations(abTestAssignments, ({ one }) => ({
  user: one(user, {
    fields: [abTestAssignments.userId],
    references: [user.id],
  }),
}));

// Special events table
export const specialEvents = pgTable('special_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', {
    enum: [
      'DailyFeaturedBoard',
      'WeeklyChallengeBoard',
      'LimitedTimeEventBoard',
      'AllMirrorTiles',
      'RareLetterAmplified',
      'BoardRotatesEveryTurn',
      'VowelsUnlockTiles',
    ],
  }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  boardId: uuid('board_id').notNull().references(() => boards.id, { onDelete: 'restrict' }),
  rules: jsonb('rules').$type<string[]>().default([]).notNull(),
  rewards: jsonb('rewards').$type<Array<{
    type: 'XP' | 'Cosmetic' | 'Currency' | 'StreakBonus';
    value: number | string;
    description?: string;
  }>>().default([]).notNull(),
  difficulty: text('difficulty', { enum: ['Easy', 'Medium', 'Hard', 'Special'] }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('special_events_type_idx').on(table.type),
  index('special_events_is_active_idx').on(table.isActive),
  index('special_events_start_date_idx').on(table.startDate),
  index('special_events_end_date_idx').on(table.endDate),
]);

// Special event completions table
export const specialEventCompletions = pgTable('special_event_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => specialEvents.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'set null' }),
  score: integer('score').notNull(),
  turnsUsed: integer('turns_used'),
  wordsFormed: integer('words_formed').notNull(),
  efficiency: numeric('efficiency'),
  timeTakenSeconds: integer('time_taken_seconds'),
  isCompleted: boolean('is_completed').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('special_event_completions_event_id_idx').on(table.eventId),
  index('special_event_completions_user_id_idx').on(table.userId),
  uniqueIndex('special_event_completions_event_user_idx').on(table.eventId, table.userId),
]);

// Relations for special events
export const specialEventsRelations = relations(specialEvents, ({ many, one }) => ({
  board: one(boards, {
    fields: [specialEvents.boardId],
    references: [boards.id],
  }),
  completions: many(specialEventCompletions),
}));

export const specialEventCompletionsRelations = relations(specialEventCompletions, ({ one }) => ({
  event: one(specialEvents, {
    fields: [specialEventCompletions.eventId],
    references: [specialEvents.id],
  }),
  user: one(user, {
    fields: [specialEventCompletions.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [specialEventCompletions.gameId],
    references: [games.id],
  }),
}));

// Player unlocks table (cosmetics, titles, badges)
export const playerUnlocks = pgTable('player_unlocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  unlockType: text('unlock_type', { enum: ['cosmetic', 'title', 'badge'] }).notNull(),
  unlockId: text('unlock_id').notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('player_unlocks_user_id_idx').on(table.userId),
  uniqueIndex('player_unlocks_user_unlock_idx').on(table.userId, table.unlockId),
]);

// Player achievements table
export const playerAchievements = pgTable('player_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull(),
  achievementName: text('achievement_name').notNull(),
  achievementDescription: text('achievement_description').notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow().notNull(),
  rewardXp: integer('reward_xp').notNull(),
  rewardCosmeticId: text('reward_cosmetic_id'),
}, (table) => [
  index('player_achievements_user_id_idx').on(table.userId),
  uniqueIndex('player_achievements_user_achievement_idx').on(table.userId, table.achievementId),
]);

// Relations for player unlocks
export const playerUnlocksRelations = relations(playerUnlocks, ({ one }) => ({
  user: one(user, {
    fields: [playerUnlocks.userId],
    references: [user.id],
  }),
}));

// Relations for player achievements
export const playerAchievementsRelations = relations(playerAchievements, ({ one }) => ({
  user: one(user, {
    fields: [playerAchievements.userId],
    references: [user.id],
  }),
}));
