import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface StartChallengeRequest {
  gameMode: 'dailyChallengeSolo' | 'dailyChallengeMultiplayer';
}

interface CompleteChallengeRequest {
  gameId: string;
  score: number;
  turnsUsed: number;
  wordsFormed: number;
  efficiency: number;
  timeTakenSeconds: number;
  isWon: boolean;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

async function generateDailyChallenge(app: App, date: string): Promise<typeof schema.dailyChallenges.$inferSelect> {
  // Get a random active board
  const randomBoard = await app.db.query.boards.findMany({
    where: eq(schema.boards.isActive, true),
  });

  if (randomBoard.length === 0) {
    throw new Error('No active boards available for daily challenge');
  }

  const board = randomBoard[Math.floor(Math.random() * randomBoard.length)];

  const puzzleModes = ['scoreTarget', 'vaultBreak', 'hiddenPhrase', 'territoryControl'];
  const gameModes: ('dailyChallengeSolo' | 'dailyChallengeMultiplayer')[] = ['dailyChallengeSolo', 'dailyChallengeMultiplayer'];

  const selectedGameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
  const selectedPuzzleMode = puzzleModes[Math.floor(Math.random() * puzzleModes.length)];

  const [challenge] = await app.db
    .insert(schema.dailyChallenges)
    .values({
      date: date,
      boardState: board.initialLayout,
      targetScore: Math.floor(Math.random() * 500) + 1000, // 1000-1500 points
      gameMode: selectedGameMode,
      boardId: board.id,
      attemptsAllowed: 3,
      puzzleMode: selectedPuzzleMode,
      winCondition: {
        type: 'score',
        targetValue: Math.floor(Math.random() * 500) + 1000,
        description: 'Reach the target score to complete the challenge',
      },
      turnLimit: selectedGameMode === 'dailyChallengeSolo' ? Math.floor(Math.random() * 10) + 20 : null, // 20-30 turns for solo
      rewards: {
        xp: 100,
        streakProgression: 1,
      },
    })
    .returning();

  return challenge;
}

export function registerDailyChallengeSysRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get current daily challenge
  app.fastify.get('/api/daily-challenge/current', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const today = getTodayDateString();

    app.logger.info({ userId: session.user.id, date: today }, 'Fetching current daily challenge');

    try {
      let challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.date, today),
      });

      if (!challenge) {
        app.logger.info({ date: today }, 'Generating new daily challenge');
        challenge = await generateDailyChallenge(app, today);
      }

      // Get user's completion status for this challenge
      const userCompletion = await app.db.query.dailyChallengeCompletions.findFirst({
        where: and(
          eq(schema.dailyChallengeCompletions.challengeId, challenge.id),
          eq(schema.dailyChallengeCompletions.userId, session.user.id)
        ),
      });

      const timeRemaining = getSecondsUntilMidnight();

      app.logger.info(
        { userId: session.user.id, challengeId: challenge.id, isCompleted: !!userCompletion },
        'Current daily challenge retrieved'
      );

      return {
        id: challenge.id,
        date: challenge.date,
        gameMode: challenge.gameMode,
        boardId: challenge.boardId,
        puzzleMode: challenge.puzzleMode,
        winCondition: challenge.winCondition,
        turnLimit: challenge.turnLimit || null,
        attemptsAllowed: challenge.attemptsAllowed,
        attemptsUsed: userCompletion?.attemptsUsed || 0,
        isCompleted: !!userCompletion?.isCompleted,
        rewards: challenge.rewards,
        userBestScore: userCompletion?.score || null,
        timeRemaining,
        leaderboardId: challenge.leaderboardId || null,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch current daily challenge');
      throw error;
    }
  });

  // Start a daily challenge attempt
  app.fastify.post('/api/daily-challenge/:challengeId/start', async (
    request: FastifyRequest<{
      Params: { challengeId: string };
      Body: StartChallengeRequest;
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { challengeId } = request.params;
    const { gameMode } = request.body;

    app.logger.info({ userId: session.user.id, challengeId, gameMode }, 'Starting daily challenge');

    try {
      const challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.id, challengeId as any),
      });

      if (!challenge) {
        app.logger.warn({ challengeId, userId: session.user.id }, 'Challenge not found');
        return reply.code(404).send({ error: 'Challenge not found' });
      }

      // Get user's completion record
      const userCompletion = await app.db.query.dailyChallengeCompletions.findFirst({
        where: and(
          eq(schema.dailyChallengeCompletions.challengeId, challengeId as any),
          eq(schema.dailyChallengeCompletions.userId, session.user.id)
        ),
      });

      const attemptsUsed = userCompletion?.attemptsUsed || 0;

      if (attemptsUsed >= challenge.attemptsAllowed) {
        app.logger.warn(
          { userId: session.user.id, challengeId },
          'Attempts exhausted'
        );
        return reply.code(400).send({ error: 'You have exhausted your attempts for today' });
      }

      // Create a game session
      const [game] = await app.db
        .insert(schema.games)
        .values({
          gameMode: gameMode === 'dailyChallengeSolo' ? 'solo' : 'multiplayer',
          status: 'active',
          boardState: challenge.boardState,
          moveHistory: [],
          isLiveMatch: false,
          matchmakingType: gameMode === 'dailyChallengeSolo' ? undefined : 'random',
          maxPlayers: gameMode === 'dailyChallengeSolo' ? 1 : 2,
          boardId: challenge.boardId,
          currentTurnStartedAt: new Date(),
        })
        .returning();

      // Add player to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: game.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      const attemptsRemaining = challenge.attemptsAllowed - attemptsUsed - 1;

      app.logger.info(
        { userId: session.user.id, challengeId, gameId: game.id },
        'Daily challenge started'
      );

      return {
        gameId: game.id,
        attemptsRemaining,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, challengeId }, 'Failed to start daily challenge');
      throw error;
    }
  });

  // Complete a daily challenge attempt
  app.fastify.post('/api/daily-challenge/:challengeId/complete', async (
    request: FastifyRequest<{
      Params: { challengeId: string };
      Body: CompleteChallengeRequest;
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { challengeId } = request.params;
    const { gameId, score, turnsUsed, wordsFormed, efficiency, timeTakenSeconds, isWon } = request.body;

    app.logger.info(
      { userId: session.user.id, challengeId, gameId, score, isWon },
      'Completing daily challenge'
    );

    try {
      const challenge = await app.db.query.dailyChallenges.findFirst({
        where: eq(schema.dailyChallenges.id, challengeId as any),
      });

      if (!challenge) {
        app.logger.warn({ challengeId, userId: session.user.id }, 'Challenge not found');
        return reply.code(404).send({ error: 'Challenge not found' });
      }

      // Get or create user's completion record
      let completion = await app.db.query.dailyChallengeCompletions.findFirst({
        where: and(
          eq(schema.dailyChallengeCompletions.challengeId, challengeId as any),
          eq(schema.dailyChallengeCompletions.userId, session.user.id)
        ),
      });

      const today = getTodayDateString();
      let rewards = { xp: 0, streakProgression: 0 };
      let newStreak = 0;
      let leaderboardRank: number | null = null;

      if (!completion) {
        // First completion record
        const [newCompletion] = await app.db
          .insert(schema.dailyChallengeCompletions)
          .values({
            challengeId: challengeId as any,
            userId: session.user.id,
            score,
            attemptsUsed: 1,
            turnsUsed,
            wordsFormed,
            efficiency: efficiency as any,
            timeTakenSeconds,
            isCompleted: isWon,
            gameId: gameId as any,
          })
          .returning();

        completion = newCompletion;

        // Only award rewards on first win
        if (isWon) {
          rewards = challenge.rewards as any;

          // Update streak if this is the first completion today
          const streak = await app.db.query.dailyChallengeStreaks.findFirst({
            where: eq(schema.dailyChallengeStreaks.userId, session.user.id),
          });

          if (!streak) {
            // Create new streak
            const [createdStreak] = await app.db
              .insert(schema.dailyChallengeStreaks)
              .values({
                userId: session.user.id,
                currentStreak: 1,
                longestStreak: 1,
                lastCompletedDate: today,
              })
              .returning();

            newStreak = createdStreak.currentStreak;
          } else {
            // Update existing streak
            const lastCompleted = streak.lastCompletedDate
              ? new Date(streak.lastCompletedDate)
              : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const isConsecutive =
              lastCompleted &&
              lastCompleted.toDateString() === yesterday.toDateString();

            const updatedCurrentStreak = isConsecutive
              ? streak.currentStreak + 1
              : 1;

            const [updated] = await app.db
              .update(schema.dailyChallengeStreaks)
              .set({
                currentStreak: updatedCurrentStreak,
                longestStreak: Math.max(updatedCurrentStreak, streak.longestStreak),
                lastCompletedDate: today,
                updatedAt: new Date(),
              })
              .where(eq(schema.dailyChallengeStreaks.userId, session.user.id))
              .returning();

            newStreak = updated.currentStreak;
          }

          // Award XP to player stats
          const stats = await app.db.query.playerStats.findFirst({
            where: eq(schema.playerStats.userId, session.user.id),
          });

          if (stats) {
            const newXP = stats.experiencePoints + rewards.xp;
            const newLevel = Math.floor(newXP / 1000) + 1;

            await app.db
              .update(schema.playerStats)
              .set({
                experiencePoints: newXP,
                level: newLevel,
                updatedAt: new Date(),
              })
              .where(eq(schema.playerStats.userId, session.user.id));
          }
        }
      } else {
        // Update existing completion record
        await app.db
          .update(schema.dailyChallengeCompletions)
          .set({
            attemptsUsed: completion.attemptsUsed + 1,
            score: Math.max(completion.score, score), // Keep best score
            turnsUsed: completion.turnsUsed
              ? Math.min(completion.turnsUsed, turnsUsed)
              : turnsUsed,
            wordsFormed: Math.max(completion.wordsFormed, wordsFormed),
            efficiency: efficiency as any,
            timeTakenSeconds: timeTakenSeconds,
            isCompleted: isWon || completion.isCompleted,
          })
          .where(eq(schema.dailyChallengeCompletions.id, completion.id));

        // Get streak if exists
        const streak = await app.db.query.dailyChallengeStreaks.findFirst({
          where: eq(schema.dailyChallengeStreaks.userId, session.user.id),
        });

        newStreak = streak?.currentStreak || 0;
      }

      // Calculate leaderboard rank if completed
      if (isWon) {
        const betterScores = await app.db.query.dailyChallengeLeaderboards.findMany({
          where: and(
            eq(schema.dailyChallengeLeaderboards.challengeId, challengeId as any),
            eq(schema.dailyChallengeLeaderboards.score, { _gt: score } as any)
          ),
        });

        leaderboardRank = betterScores.length + 1;

        // Add to leaderboard
        await app.db
          .insert(schema.dailyChallengeLeaderboards)
          .values({
            challengeId: challengeId as any,
            userId: session.user.id,
            score,
            turnsUsed,
            timeTakenSeconds,
            efficiency: efficiency as any,
            rank: leaderboardRank,
          })
          .onConflictDoNothing()
          .returning();
      }

      app.logger.info(
        {
          userId: session.user.id,
          challengeId,
          score,
          isWon,
          rewards: rewards.xp,
          streak: newStreak,
        },
        'Daily challenge completed'
      );

      return {
        success: true,
        rewards,
        newStreak,
        leaderboardRank,
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, challengeId },
        'Failed to complete daily challenge'
      );
      throw error;
    }
  });

  // Get challenge leaderboard
  app.fastify.get('/api/daily-challenge/:challengeId/leaderboard', async (
    request: FastifyRequest<{
      Params: { challengeId: string };
      Querystring: { sortBy?: string; limit?: string };
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { challengeId } = request.params;
    const { sortBy = 'score', limit: limitStr = '100' } = request.query;

    app.logger.info({ userId: session.user.id, challengeId, sortBy }, 'Fetching challenge leaderboard');

    try {
      const limitNum = Math.min(parseInt(limitStr) || 100, 1000);

      const leaderboard = await app.db.query.dailyChallengeLeaderboards.findMany({
        where: eq(schema.dailyChallengeLeaderboards.challengeId, challengeId as any),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
        limit: limitNum,
      });

      // Sort based on parameter
      let sorted = [...leaderboard];
      switch (sortBy) {
        case 'turns':
          sorted.sort((a, b) => (a.turnsUsed ?? Infinity) - (b.turnsUsed ?? Infinity));
          break;
        case 'time':
          sorted.sort((a, b) => (a.timeTakenSeconds ?? Infinity) - (b.timeTakenSeconds ?? Infinity));
          break;
        case 'efficiency':
          sorted.sort((a, b) => (parseFloat(b.efficiency ?? '0') - parseFloat(a.efficiency ?? '0')));
          break;
        case 'score':
        default:
          sorted.sort((a, b) => b.score - a.score);
      }

      const entries = sorted.map((entry, index) => ({
        userId: entry.userId,
        userName: entry.user?.name || 'Unknown',
        score: entry.score,
        turnsUsed: entry.turnsUsed,
        timeTakenSeconds: entry.timeTakenSeconds,
        efficiency: entry.efficiency ? parseFloat(entry.efficiency) : null,
        rank: index + 1,
      }));

      const userEntry = entries.find((e) => e.userId === session.user.id);
      const userRank = userEntry?.rank || null;

      app.logger.info(
        { userId: session.user.id, challengeId, totalEntries: entries.length },
        'Challenge leaderboard retrieved'
      );

      return {
        entries,
        userRank,
        totalEntries: entries.length,
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, challengeId },
        'Failed to fetch challenge leaderboard'
      );
      throw error;
    }
  });

  // Get user's daily challenge history
  app.fastify.get('/api/daily-challenge/history', async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { limit: limitStr = '30' } = request.query;

    app.logger.info({ userId: session.user.id }, 'Fetching daily challenge history');

    try {
      const limitNum = Math.min(parseInt(limitStr) || 30, 365);

      const history = await app.db.query.dailyChallengeCompletions.findMany({
        where: eq(schema.dailyChallengeCompletions.userId, session.user.id),
        with: {
          challenge: true,
        },
        limit: limitNum,
      });

      const formattedHistory = history.map((h) => ({
        challengeId: h.challenge.id,
        date: h.challenge.date,
        gameMode: h.challenge.gameMode,
        isCompleted: h.isCompleted,
        score: h.score,
        attemptsUsed: h.attemptsUsed,
        rewards: h.isCompleted ? h.challenge.rewards : { xp: 0, streakProgression: 0 },
      }));

      app.logger.info({ userId: session.user.id, count: formattedHistory.length }, 'Daily challenge history retrieved');

      return formattedHistory;
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch daily challenge history');
      throw error;
    }
  });

  // Get user's streak info
  app.fastify.get('/api/daily-challenge/streak', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching daily challenge streak');

    try {
      let streak = await app.db.query.dailyChallengeStreaks.findFirst({
        where: eq(schema.dailyChallengeStreaks.userId, session.user.id),
      });

      if (!streak) {
        // Create default streak if doesn't exist
        const [newStreak] = await app.db
          .insert(schema.dailyChallengeStreaks)
          .values({
            userId: session.user.id,
            currentStreak: 0,
            longestStreak: 0,
          })
          .returning();

        streak = newStreak;
      }

      // Calculate days until streak breaks
      let daysUntilStreakBreak = 1; // Default to tomorrow
      if (streak.lastCompletedDate) {
        const lastCompleted = new Date(streak.lastCompletedDate);
        const today = new Date();
        const daysDiff = Math.floor(
          (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          daysUntilStreakBreak = 1;
        } else if (daysDiff === 1) {
          daysUntilStreakBreak = getSecondsUntilMidnight();
        } else {
          daysUntilStreakBreak = 0; // Streak already broken
        }
      }

      app.logger.info(
        {
          userId: session.user.id,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        },
        'Daily challenge streak retrieved'
      );

      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCompletedDate: streak.lastCompletedDate,
        daysUntilStreakBreak,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch daily challenge streak');
      throw error;
    }
  });
}
