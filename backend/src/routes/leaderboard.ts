import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { desc, sql, and, gte, eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerLeaderboardRoutes(app: App) {
  // Get global leaderboard by experience points
  app.fastify.get('/api/leaderboard/global', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Fetching global leaderboard');

    try {
      const topPlayers = await app.db.query.playerStats.findMany({
        orderBy: [
          desc(schema.playerStats.experiencePoints),
          desc(schema.playerStats.totalWins),
        ],
        limit: 100,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const leaderboard = topPlayers.map((stat) => ({
        userId: stat.userId,
        userName: stat.user?.name || 'Unknown',
        level: stat.level,
        experiencePoints: stat.experiencePoints,
        totalWins: stat.totalWins,
      }));

      app.logger.info({ count: leaderboard.length }, 'Global leaderboard retrieved');

      return leaderboard;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch global leaderboard');
      throw error;
    }
  });

  // Get weekly leaderboard by wins this week
  app.fastify.get('/api/leaderboard/weekly', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Fetching weekly leaderboard');

    try {
      // Get start of this week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // Get all player stats sorted by current streak
      const allStats = await app.db.query.playerStats.findMany({
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Count wins this week for each player
      const statsWithWeeklyWins = await Promise.all(
        allStats.map(async (stat) => {
          const weeklyWins = await app.db
            .select({ count: sql<number>`COUNT(*)` })
            .from(schema.games)
            .where(
              and(
                eq(schema.games.winnerId, stat.userId),
                gte(schema.games.completedAt, startOfWeek)
              )
            );

          return {
            userId: stat.userId,
            userName: stat.user?.name || 'Unknown',
            winsThisWeek: Number(weeklyWins[0]?.count) || 0,
            currentStreak: stat.currentStreak,
          };
        })
      );

      // Sort by wins this week, then by current streak
      const leaderboard = statsWithWeeklyWins
        .filter((s) => s.winsThisWeek > 0)
        .sort((a, b) => {
          if (b.winsThisWeek !== a.winsThisWeek) {
            return b.winsThisWeek - a.winsThisWeek;
          }
          return b.currentStreak - a.currentStreak;
        })
        .slice(0, 100);

      app.logger.info({ count: leaderboard.length }, 'Weekly leaderboard retrieved');

      return leaderboard;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch weekly leaderboard');
      throw error;
    }
  });
}
