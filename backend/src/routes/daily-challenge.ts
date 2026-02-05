import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface CompleteRequest {
  score: number;
}

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function registerDailyChallengeRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get today's daily challenge
  app.fastify.get('/api/daily-challenge/today', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching today daily challenge');

    try {
      const today = getTodayDate();

      let challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.date, today),
      });

      // Create today's challenge if it doesn't exist
      if (!challenge) {
        const [newChallenge] = await app.db
          .insert(schema.dailyChallenges)
          .values({
            date: today,
            boardState: { puzzle: 'default' },
            targetScore: 1000,
          })
          .returning();
        challenge = newChallenge;
      }

      // Check if user has completed this challenge
      const completion = await app.db.query.dailyChallengeCompletions.findFirst({
        where: and(
          eq(schema.dailyChallengeCompletions.challengeId, challenge.id),
          eq(schema.dailyChallengeCompletions.userId, session.user.id)
        ),
      });

      app.logger.info(
        { userId: session.user.id, challengeId: challenge.id, completed: !!completion },
        'Today daily challenge retrieved'
      );

      return {
        challengeId: challenge.id,
        date: challenge.date,
        boardState: challenge.boardState,
        targetScore: challenge.targetScore,
        userCompleted: !!completion,
        userScore: completion?.score || null,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch daily challenge');
      throw error;
    }
  });

  // Complete daily challenge
  app.fastify.post('/api/daily-challenge/:challengeId/complete', async (
    request: FastifyRequest<{ Params: { challengeId: string }; Body: CompleteRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { challengeId } = request.params;
    const { score } = request.body;

    app.logger.info({ userId: session.user.id, challengeId, score }, 'Completing daily challenge');

    try {
      const challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.id, challengeId as any),
      });

      if (!challenge) {
        app.logger.warn({ challengeId, userId: session.user.id }, 'Challenge not found');
        return reply.code(404).send({ error: 'Challenge not found' });
      }

      // Check if already completed
      const existingCompletion = await app.db.query.dailyChallengeCompletions.findFirst({
        where: and(
          eq(schema.dailyChallengeCompletions.challengeId, challengeId as any),
          eq(schema.dailyChallengeCompletions.userId, session.user.id)
        ),
      });

      if (existingCompletion) {
        app.logger.warn({ userId: session.user.id, challengeId }, 'Challenge already completed by user');
        return reply.code(400).send({ error: 'You have already completed this challenge' });
      }

      // Record completion
      const [completion] = await app.db
        .insert(schema.dailyChallengeCompletions)
        .values({
          challengeId: challengeId as any,
          userId: session.user.id,
          score,
        })
        .returning();

      // Count completions with higher scores and total completions
      const allCompletions = await app.db.query.dailyChallengeCompletions.findMany({
        where: eq(schema.dailyChallengeCompletions.challengeId, challengeId as any),
      });

      const rank = allCompletions.filter((c) => c.score > score).length + 1;

      app.logger.info(
        { userId: session.user.id, challengeId, score, rank, totalCompletions: allCompletions.length },
        'Daily challenge completed'
      );

      return {
        success: true,
        rank,
        totalCompletions: allCompletions.length,
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, challengeId },
        'Failed to complete daily challenge'
      );
      throw error;
    }
  });

  // Get today's leaderboard
  app.fastify.get('/api/daily-challenge/leaderboard', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Fetching daily challenge leaderboard');

    try {
      const today = getTodayDate();

      const challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.date, today),
      });

      if (!challenge) {
        app.logger.warn({}, 'No challenge found for today');
        return reply.code(404).send({ error: 'No challenge for today' });
      }

      // Get top 100 completions
      const topScores = await app.db
        .selectDistinct()
        .from(schema.dailyChallengeCompletions)
        .where(eq(schema.dailyChallengeCompletions.challengeId, challenge.id))
        .orderBy(desc(schema.dailyChallengeCompletions.score))
        .limit(100);

      // Enrich with user information from player stats
      const leaderboard = await Promise.all(
        topScores.map(async (completion) => {
          const userStats = await app.db.query.playerStats.findFirst({
            where: eq(schema.playerStats.userId, completion.userId),
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

          return {
            userId: completion.userId,
            userName: userStats?.user?.name || 'Unknown',
            score: completion.score,
            completedAt: completion.completedAt,
          };
        })
      );

      app.logger.info({}, 'Daily challenge leaderboard retrieved');

      return leaderboard;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch daily challenge leaderboard');
      throw error;
    }
  });
}
