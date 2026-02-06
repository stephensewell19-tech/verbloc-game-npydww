import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerPlayerStatsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get current user's stats
  app.fastify.get('/api/player/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching player stats');

    try {
      const stats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (!stats) {
        app.logger.warn({ userId: session.user.id }, 'Player stats not found');
        return reply.code(404).send({ error: 'Player stats not found' });
      }

      app.logger.info({ userId: session.user.id, stats }, 'Player stats retrieved');

      return {
        totalGamesPlayed: stats.totalGamesPlayed,
        totalWins: stats.totalWins,
        totalLosses: stats.totalLosses,
        highestScore: stats.highestScore,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalWordsFormed: stats.totalWordsFormed,
        experiencePoints: stats.experiencePoints,
        level: stats.level,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch player stats');
      throw error;
    }
  });

  // Initialize stats for new user (creates if doesn't exist, returns existing if already created)
  app.fastify.post('/api/player/stats/init', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Initializing player stats');

    try {
      // Check if stats already exist
      const existingStats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (existingStats) {
        app.logger.info({ userId: session.user.id }, 'Player stats already exist');
        return {
          id: existingStats.id,
          userId: existingStats.userId,
          totalGamesPlayed: existingStats.totalGamesPlayed,
          totalWins: existingStats.totalWins,
          totalLosses: existingStats.totalLosses,
          highestScore: existingStats.highestScore,
          currentStreak: existingStats.currentStreak,
          longestStreak: existingStats.longestStreak,
          totalWordsFormed: existingStats.totalWordsFormed,
          experiencePoints: existingStats.experiencePoints,
          level: existingStats.level,
        };
      }

      const [newStats] = await app.db
        .insert(schema.playerStats)
        .values({
          userId: session.user.id,
          totalGamesPlayed: 0,
          totalWins: 0,
          totalLosses: 0,
          highestScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalWordsFormed: 0,
          experiencePoints: 0,
          level: 1,
        })
        .returning();

      app.logger.info({ userId: session.user.id, statsId: newStats.id }, 'Player stats initialized');

      return {
        id: newStats.id,
        userId: newStats.userId,
        totalGamesPlayed: newStats.totalGamesPlayed,
        totalWins: newStats.totalWins,
        totalLosses: newStats.totalLosses,
        highestScore: newStats.highestScore,
        currentStreak: newStats.currentStreak,
        longestStreak: newStats.longestStreak,
        totalWordsFormed: newStats.totalWordsFormed,
        experiencePoints: newStats.experiencePoints,
        level: newStats.level,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to initialize player stats');
      throw error;
    }
  });

  // Initialize player stats (alternative naming for clarity)
  app.fastify.post('/api/player/stats/initialize', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Initializing player stats');

    try {
      // Check if stats already exist
      const existingStats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (existingStats) {
        app.logger.info({ userId: session.user.id }, 'Player stats already exist');
        return {
          id: existingStats.id,
          userId: existingStats.userId,
          totalGamesPlayed: existingStats.totalGamesPlayed,
          totalWins: existingStats.totalWins,
          totalLosses: existingStats.totalLosses,
          highestScore: existingStats.highestScore,
          currentStreak: existingStats.currentStreak,
          longestStreak: existingStats.longestStreak,
          totalWordsFormed: existingStats.totalWordsFormed,
          experiencePoints: existingStats.experiencePoints,
          level: existingStats.level,
        };
      }

      const [newStats] = await app.db
        .insert(schema.playerStats)
        .values({
          userId: session.user.id,
          totalGamesPlayed: 0,
          totalWins: 0,
          totalLosses: 0,
          highestScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalWordsFormed: 0,
          experiencePoints: 0,
          level: 1,
        })
        .returning();

      app.logger.info({ userId: session.user.id, statsId: newStats.id }, 'Player stats initialized');

      return {
        id: newStats.id,
        userId: newStats.userId,
        totalGamesPlayed: newStats.totalGamesPlayed,
        totalWins: newStats.totalWins,
        totalLosses: newStats.totalLosses,
        highestScore: newStats.highestScore,
        currentStreak: newStats.currentStreak,
        longestStreak: newStats.longestStreak,
        totalWordsFormed: newStats.totalWordsFormed,
        experiencePoints: newStats.experiencePoints,
        level: newStats.level,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to initialize player stats');
      throw error;
    }
  });
}
