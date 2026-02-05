import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function registerDailyChallengeRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get today's daily challenge (simplified version)
  // Note: The comprehensive daily challenge system is in daily-challenges.ts
  // This endpoint is kept for backwards compatibility
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
        // Get a random board
        const randomBoards = await app.db.query.boards.findMany({
          where: eq(schema.boards.isActive, true),
        });

        if (randomBoards.length === 0) {
          app.logger.error({}, 'No active boards available for daily challenge');
          return reply.code(500).send({ error: 'No boards available' });
        }

        const randomBoard = randomBoards[Math.floor(Math.random() * randomBoards.length)];

        const [newChallenge] = await app.db
          .insert(schema.dailyChallenges)
          .values({
            date: today,
            boardState: randomBoard.initialLayout,
            targetScore: 1000,
            gameMode: 'dailyChallengeSolo',
            boardId: randomBoard.id,
            puzzleMode: 'scoreTarget',
            winCondition: {
              type: 'score',
              targetValue: 1000,
              description: 'Reach 1000 points to complete the challenge',
            },
            rewards: {
              xp: 100,
              streakProgression: 1,
            },
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
}
