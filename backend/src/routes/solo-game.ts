import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface MoveRequest {
  word: string;
  positions: Array<{ row: number; col: number }>;
  newBoardState: unknown;
}

interface CompleteGameRequest {
  finalScore: number;
}

export function registerSoloGameRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Start a new solo game
  app.fastify.post('/api/game/solo/start', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Starting solo game');

    try {
      // Create the game
      const [game] = await app.db
        .insert(schema.games)
        .values({
          gameMode: 'solo',
          status: 'active',
          boardState: {},
          moveHistory: [],
        })
        .returning();

      // Add player to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: game.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      app.logger.info({ userId: session.user.id, gameId: game.id }, 'Solo game started');

      return {
        gameId: game.id,
        boardState: game.boardState,
        status: game.status,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to start solo game');
      throw error;
    }
  });

  // Submit a move in solo game
  app.fastify.post('/api/game/solo/:gameId/move', async (
    request: FastifyRequest<{ Params: { gameId: string }; Body: MoveRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { word, positions, newBoardState } = request.body;

    app.logger.info(
      { userId: session.user.id, gameId, word, positions },
      'Submitting solo game move'
    );

    try {
      // Get game and verify ownership
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: {
          players: true,
        },
      });

      if (!game) {
        app.logger.warn({ gameId, userId: session.user.id }, 'Game not found');
        return reply.code(404).send({ error: 'Game not found' });
      }

      const playerInGame = game.players.find((p) => p.userId === session.user.id);
      if (!playerInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      // Validate word (simplified - would need actual word validation)
      const isValid = word.length >= 2;

      // Calculate score based on word length and positions
      const score = isValid ? word.length * 10 : 0;

      // Update game with move
      const moveEntry = {
        word,
        positions,
        score,
        playerUserId: session.user.id,
        timestamp: new Date().toISOString(),
      };

      const updatedMoveHistory = Array.isArray(game.moveHistory)
        ? [...game.moveHistory, moveEntry]
        : [moveEntry];

      const [updatedGame] = await app.db
        .update(schema.games)
        .set({
          boardState: newBoardState,
          moveHistory: updatedMoveHistory,
          updatedAt: new Date(),
        })
        .where(eq(schema.games.id, gameId as any))
        .returning();

      // Update player score
      const newScore = (playerInGame.score || 0) + score;
      await app.db
        .update(schema.gamePlayers)
        .set({ score: newScore })
        .where(eq(schema.gamePlayers.id, playerInGame.id));

      app.logger.info(
        { userId: session.user.id, gameId, word, score, newScore },
        'Solo game move processed'
      );

      return {
        valid: isValid,
        score,
        newBoardState: updatedGame.boardState,
        gameStatus: updatedGame.status,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to process solo move');
      throw error;
    }
  });

  // Complete solo game
  app.fastify.post('/api/game/:gameId/complete', async (
    request: FastifyRequest<{ Params: { gameId: string }; Body: CompleteGameRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { finalScore } = request.body;

    app.logger.info({ userId: session.user.id, gameId, finalScore }, 'Completing game');

    try {
      // Get game
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: {
          players: true,
        },
      });

      if (!game) {
        app.logger.warn({ gameId, userId: session.user.id }, 'Game not found');
        return reply.code(404).send({ error: 'Game not found' });
      }

      const playerInGame = game.players.find((p) => p.userId === session.user.id);
      if (!playerInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      // Mark game as completed
      const [completedGame] = await app.db
        .update(schema.games)
        .set({
          status: 'completed',
          completedAt: new Date(),
          winnerId: session.user.id,
        })
        .where(eq(schema.games.id, gameId as any))
        .returning();

      // Get or create player stats
      let stats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (!stats) {
        const [newStats] = await app.db
          .insert(schema.playerStats)
          .values({
            userId: session.user.id,
          })
          .returning();
        stats = newStats;
      }

      // Update player stats
      const isWin = true; // Solo games are considered wins
      const newWins = stats.totalWins + 1;
      const newGamesPlayed = stats.totalGamesPlayed + 1;
      const newHighestScore = Math.max(stats.highestScore, finalScore);
      const newXP = stats.experiencePoints + finalScore;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newCurrentStreak = stats.currentStreak + 1;
      const newLongestStreak = Math.max(stats.longestStreak, newCurrentStreak);

      const [updatedStats] = await app.db
        .update(schema.playerStats)
        .set({
          totalGamesPlayed: newGamesPlayed,
          totalWins: newWins,
          highestScore: newHighestScore,
          experiencePoints: newXP,
          level: newLevel,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          updatedAt: new Date(),
        })
        .where(eq(schema.playerStats.userId, session.user.id))
        .returning();

      app.logger.info(
        { userId: session.user.id, gameId, finalScore, stats: updatedStats },
        'Game completed successfully'
      );

      return {
        success: true,
        updatedStats: {
          totalGamesPlayed: updatedStats.totalGamesPlayed,
          totalWins: updatedStats.totalWins,
          totalLosses: updatedStats.totalLosses,
          highestScore: updatedStats.highestScore,
          currentStreak: updatedStats.currentStreak,
          longestStreak: updatedStats.longestStreak,
          totalWordsFormed: updatedStats.totalWordsFormed,
          experiencePoints: updatedStats.experiencePoints,
          level: updatedStats.level,
        },
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to complete game');
      throw error;
    }
  });
}
