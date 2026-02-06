import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, lte, gte, desc, asc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { randomUUID } from 'crypto';

interface SpecialEventWithTimeRemaining {
  id: string;
  type: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  boardId: string;
  rules: string[];
  rewards: Array<{
    type: 'XP' | 'Cosmetic' | 'Currency' | 'StreakBonus';
    value: number | string;
    description?: string;
  }>;
  difficulty: string;
  timeRemaining: number;
}

export function registerSpecialEventsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get current active special events grouped by type
  app.fastify.get('/api/special-events/current', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Fetching current special events');

    try {
      const now = new Date();

      // Get all currently active events
      const events = await app.db.query.specialEvents.findMany({
        where: and(
          eq(schema.specialEvents.isActive, true),
          lte(schema.specialEvents.startDate, now),
          gte(schema.specialEvents.endDate, now)
        ),
      });

      // Calculate time remaining and build response
      const eventsWithTime: SpecialEventWithTimeRemaining[] = events.map((event) => ({
        ...event,
        timeRemaining: Math.max(0, Math.floor((event.endDate.getTime() - now.getTime()) / 1000)),
      }));

      // Group by type
      const dailyFeatured = eventsWithTime.find((e) => e.type === 'DailyFeaturedBoard') || null;
      const weeklyChallenges = eventsWithTime.filter((e) => e.type === 'WeeklyChallengeBoard');
      const limitedTimeEvents = eventsWithTime.filter((e) => e.type === 'LimitedTimeEventBoard');

      app.logger.info(
        {
          totalEvents: events.length,
          dailyFeatured: !!dailyFeatured,
          weeklyChallenges: weeklyChallenges.length,
          limitedTimeEvents: limitedTimeEvents.length,
        },
        'Current special events retrieved'
      );

      return {
        dailyFeatured,
        weeklyChallenges,
        limitedTimeEvents,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch current special events');
      throw error;
    }
  });

  // Get detailed information about a specific event
  app.fastify.get('/api/special-events/:eventId', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { eventId } = request.params as { eventId: string };

    app.logger.info({ eventId, userId: session.user.id }, 'Fetching special event details');

    try {
      // Get event details
      const event = await app.db.query.specialEvents.findFirst({
        where: eq(schema.specialEvents.id, eventId),
      });

      if (!event) {
        app.logger.warn({ eventId }, 'Special event not found');
        return reply.status(404).send({ error: 'Event not found' });
      }

      // Get user's progress on this event
      const userProgress = await app.db
        .select({
          attemptCount: schema.specialEventCompletions.id,
          bestScore: schema.specialEventCompletions.score,
          isCompleted: schema.specialEventCompletions.isCompleted,
        })
        .from(schema.specialEventCompletions)
        .where(
          and(
            eq(schema.specialEventCompletions.eventId, eventId),
            eq(schema.specialEventCompletions.userId, session.user.id)
          )
        )
        .limit(1);

      const progress = userProgress.length > 0 ? userProgress[0] : null;

      app.logger.info(
        { eventId, hasProgress: !!progress },
        'Special event details retrieved'
      );

      return {
        ...event,
        userProgress: progress
          ? {
              attemptsUsed: 1,
              bestScore: progress.bestScore,
              isCompleted: progress.isCompleted,
            }
          : null,
      };
    } catch (error) {
      app.logger.error({ err: error, eventId }, 'Failed to fetch special event details');
      throw error;
    }
  });

  // Start a special event game
  app.fastify.post('/api/special-events/:eventId/start', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { eventId } = request.params as { eventId: string };
    const { gameMode } = request.body as {
      gameMode: 'specialEventSolo' | 'specialEventMultiplayer';
    };

    app.logger.info(
      { eventId, userId: session.user.id, gameMode },
      'Starting special event game'
    );

    try {
      // Validate event exists and is active
      const event = await app.db.query.specialEvents.findFirst({
        where: eq(schema.specialEvents.id, eventId),
        with: { board: true },
      });

      if (!event) {
        app.logger.warn({ eventId }, 'Special event not found');
        return reply.status(404).send({ error: 'Event not found' });
      }

      const now = new Date();
      if (now < event.startDate || now > event.endDate) {
        app.logger.warn({ eventId }, 'Special event is not active');
        return reply.status(400).send({ error: 'Event is not currently active' });
      }

      if (!event.board) {
        app.logger.error({ eventId }, 'Board not found for event');
        return reply.status(500).send({ error: 'Board configuration missing' });
      }

      // Create new game
      const gameId = randomUUID();
      await app.db.insert(schema.games).values({
        id: gameId as any,
        gameMode: gameMode === 'specialEventMultiplayer' ? 'multiplayer' : 'solo',
        status: 'active',
        boardState: event.board.initialLayout as any,
        moveHistory: [],
        boardId: event.boardId as any,
      });

      // Add player to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: gameId as any,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      app.logger.info(
        { gameId, eventId, userId: session.user.id },
        'Special event game started'
      );

      return {
        gameId,
        boardState: event.board.initialLayout,
      };
    } catch (error) {
      app.logger.error({ err: error, eventId }, 'Failed to start special event game');
      throw error;
    }
  });

  // Complete a special event game
  app.fastify.post('/api/special-events/:eventId/complete', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { eventId } = request.params as { eventId: string };
    const {
      gameId,
      score,
      turnsUsed,
      wordsFormed,
      efficiency,
      timeTakenSeconds,
      isWon,
    } = request.body as {
      gameId: string;
      score: number;
      turnsUsed: number;
      wordsFormed: number;
      efficiency: number;
      timeTakenSeconds: number;
      isWon: boolean;
    };

    app.logger.info(
      { eventId, gameId, userId: session.user.id, score, isWon },
      'Completing special event'
    );

    try {
      // Validate event is still active
      const event = await app.db.query.specialEvents.findFirst({
        where: eq(schema.specialEvents.id, eventId),
      });

      if (!event) {
        app.logger.warn({ eventId }, 'Special event not found');
        return reply.status(404).send({ error: 'Event not found' });
      }

      const now = new Date();
      if (now > event.endDate) {
        app.logger.warn({ eventId }, 'Special event has ended');
        return reply.status(400).send({ error: 'Event has ended' });
      }

      // Check if user already has a completion
      const existingCompletion = await app.db.query.specialEventCompletions.findFirst({
        where: and(
          eq(schema.specialEventCompletions.eventId, eventId),
          eq(schema.specialEventCompletions.userId, session.user.id)
        ),
      });

      let newBestScore = false;
      if (!existingCompletion) {
        newBestScore = true;
      } else if (isWon && score > (existingCompletion.score || 0)) {
        // Update existing record with new high score
        await app.db
          .update(schema.specialEventCompletions)
          .set({
            score,
            turnsUsed,
            wordsFormed,
            efficiency: efficiency.toString(),
            timeTakenSeconds,
            isCompleted: isWon,
            completedAt: new Date(),
          })
          .where(eq(schema.specialEventCompletions.id, existingCompletion.id));

        newBestScore = true;
      }

      // Create or update completion record
      if (!existingCompletion) {
        await app.db.insert(schema.specialEventCompletions).values({
          eventId: eventId as any,
          userId: session.user.id,
          gameId: gameId as any,
          score,
          turnsUsed,
          wordsFormed,
          efficiency: efficiency.toString(),
          timeTakenSeconds,
          isCompleted: isWon,
        });
      }

      // Award rewards if won
      const rewards = isWon ? event.rewards : [];
      let xpAwarded = 0;

      if (isWon && event.rewards) {
        for (const reward of event.rewards) {
          if (reward.type === 'XP') {
            xpAwarded = typeof reward.value === 'number' ? reward.value : 0;

            // Update player XP
            const playerStats = await app.db.query.playerStats.findFirst({
              where: eq(schema.playerStats.userId, session.user.id),
            });

            if (playerStats) {
              const newXP = playerStats.experiencePoints + xpAwarded;
              const newLevel = Math.floor(newXP / 1000) + 1;

              await app.db
                .update(schema.playerStats)
                .set({
                  experiencePoints: newXP,
                  level: newLevel,
                })
                .where(eq(schema.playerStats.userId, session.user.id));
            }
          }
        }
      }

      app.logger.info(
        { eventId, userId: session.user.id, score, xpAwarded, newBestScore },
        'Special event completed'
      );

      return {
        success: true,
        rewards: rewards.map((r) => ({
          type: r.type,
          value: r.value,
          description: r.description || '',
        })),
        newBestScore,
      };
    } catch (error) {
      app.logger.error({ err: error, eventId }, 'Failed to complete special event');
      throw error;
    }
  });

  // Get leaderboard for a specific event
  app.fastify.get('/api/special-events/:eventId/leaderboard', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { eventId } = request.params as { eventId: string };
    const { limit = 50 } = request.query as { limit?: number };

    app.logger.info({ eventId, limit }, 'Fetching special event leaderboard');

    try {
      // Verify event exists
      const event = await app.db.query.specialEvents.findFirst({
        where: eq(schema.specialEvents.id, eventId),
      });

      if (!event) {
        app.logger.warn({ eventId }, 'Special event not found');
        return reply.status(404).send({ error: 'Event not found' });
      }

      // Get top scores ordered by score DESC, turnsUsed ASC, timeTakenSeconds ASC
      const leaderboardEntries = await app.db
        .select({
          userId: schema.specialEventCompletions.userId,
          score: schema.specialEventCompletions.score,
          turnsUsed: schema.specialEventCompletions.turnsUsed,
          timeTakenSeconds: schema.specialEventCompletions.timeTakenSeconds,
          efficiency: schema.specialEventCompletions.efficiency,
        })
        .from(schema.specialEventCompletions)
        .where(
          and(
            eq(schema.specialEventCompletions.eventId, eventId),
            eq(schema.specialEventCompletions.isCompleted, true)
          )
        )
        .orderBy(
          desc(schema.specialEventCompletions.score),
          asc(schema.specialEventCompletions.turnsUsed),
          asc(schema.specialEventCompletions.timeTakenSeconds)
        )
        .limit(limit);

      // Add ranks and find user's rank
      const rankedEntries = leaderboardEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      const userRank = rankedEntries.findIndex((e) => e.userId === session.user.id) + 1 || null;

      app.logger.info(
        { eventId, entriesCount: leaderboardEntries.length, userRank },
        'Special event leaderboard retrieved'
      );

      return {
        entries: rankedEntries,
        userRank: userRank > 0 ? userRank : null,
        totalEntries: leaderboardEntries.length,
      };
    } catch (error) {
      app.logger.error({ err: error, eventId }, 'Failed to fetch special event leaderboard');
      throw error;
    }
  });

  // Seed initial special events (for testing/admin)
  app.fastify.post('/api/special-events/seed', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Starting special events seed');

    try {
      // Get some boards to use for events
      const boards = await app.db.query.boards.findMany({ limit: 10 });

      if (boards.length === 0) {
        app.logger.warn({}, 'No boards available for seeding events');
        return reply.status(400).send({ error: 'No boards available for seeding' });
      }

      const now = new Date();

      // Create sample events
      const events = [
        {
          type: 'DailyFeaturedBoard' as const,
          name: 'Daily Featured: Mirror Tiles',
          description: 'Today\'s featured board with special mirror tile mechanics',
          startDate: new Date(now.getTime() - 1000 * 60 * 60),
          endDate: new Date(now.getTime() + 1000 * 60 * 60 * 23),
          boardId: boards[0].id as any,
          rules: ['All mirror tiles double your score', 'Rare letters unlock bonus tiles'],
          rewards: [
            { type: 'XP' as const, value: 150, description: 'Bonus XP for daily featured' },
          ],
          difficulty: 'Medium' as const,
          isActive: true,
        },
        {
          type: 'WeeklyChallengeBoard' as const,
          name: 'Weekly Challenge: Speed Run',
          description: 'Complete the challenge in minimum turns',
          startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24),
          endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 6),
          boardId: boards[1].id as any,
          rules: ['Minimize turns used', 'Efficient word placement rewards bonus XP'],
          rewards: [
            { type: 'XP' as const, value: 200, description: 'Weekly challenge completion' },
          ],
          difficulty: 'Hard' as const,
          isActive: true,
        },
        {
          type: 'LimitedTimeEventBoard' as const,
          name: 'Event: Rare Letters Festival',
          description: 'Special event celebrating rare letters in the English language',
          startDate: new Date(now.getTime() - 1000 * 60 * 60),
          endDate: new Date(now.getTime() + 1000 * 60 * 60 * 48),
          boardId: boards[2].id as any,
          rules: ['Rare letters worth 2x points', 'Q, X, Z unlock special tiles'],
          rewards: [
            { type: 'XP' as const, value: 250, description: 'Event completion bonus' },
            { type: 'Cosmetic' as const, value: 'rare_letter_badge', description: 'Special cosmetic badge' },
          ],
          difficulty: 'Hard' as const,
          isActive: true,
        },
      ];

      let created = 0;
      for (const eventData of events) {
        try {
          await app.db.insert(schema.specialEvents).values(eventData as any);
          created++;
          app.logger.debug({ eventName: eventData.name }, 'Event created');
        } catch (error) {
          app.logger.error({ err: error, eventName: eventData.name }, 'Failed to create event');
        }
      }

      app.logger.info({ created }, 'Special events seeding completed');

      return {
        success: true,
        eventsCreated: created,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed special events');
      throw error;
    }
  });
}
