import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerTurnManagementRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get turn status
  app.fastify.get('/api/game/multiplayer/:gameId/turn-status', async (
    request: FastifyRequest<{ Params: { gameId: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;

    app.logger.info({ userId: session.user.id, gameId }, 'Fetching turn status');

    try {
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: {
          players: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!game) {
        app.logger.warn({ gameId, userId: session.user.id }, 'Game not found');
        return reply.code(404).send({ error: 'Game not found' });
      }

      // Verify user is in game
      const userInGame = game.players.find((p) => p.userId === session.user.id);
      if (!userInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      const currentPlayer = game.players.find((p) => p.isCurrentTurn);
      const isMyTurn = currentPlayer?.userId === session.user.id;

      let turnTimeRemaining: number | undefined;
      if (game.isLiveMatch && game.turnTimerSeconds && game.currentTurnStartedAt) {
        const elapsedSeconds = Math.floor(
          (new Date().getTime() - game.currentTurnStartedAt.getTime()) / 1000
        );
        turnTimeRemaining = Math.max(0, game.turnTimerSeconds - elapsedSeconds);
      }

      app.logger.info(
        {
          userId: session.user.id,
          gameId,
          currentPlayerId: currentPlayer?.userId,
          isMyTurn,
        },
        'Turn status retrieved'
      );

      return {
        currentPlayerId: currentPlayer?.userId,
        currentPlayerName: currentPlayer?.user?.name || 'Unknown',
        turnStartedAt: game.currentTurnStartedAt,
        turnTimeRemaining,
        isMyTurn,
        isLiveMatch: game.isLiveMatch,
        turnTimerSeconds: game.turnTimerSeconds || undefined,
        gracePeriodHours: game.turnGracePeriodHours,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to get turn status');
      throw error;
    }
  });

  // Auto-skip turn if timer expired (for live matches)
  async function autoSkipTurnIfExpired(gameId: string, app: App) {
    const game = await app.db.query.games.findFirst({
      where: eq(schema.games.id, gameId as any),
      with: {
        players: true,
      },
    });

    if (!game || !game.isLiveMatch || !game.turnTimerSeconds || !game.currentTurnStartedAt) {
      return false;
    }

    const elapsedSeconds = Math.floor(
      (new Date().getTime() - game.currentTurnStartedAt.getTime()) / 1000
    );

    if (elapsedSeconds >= game.turnTimerSeconds) {
      // Skip to next player
      const currentPlayerIndex = game.players.findIndex((p) => p.isCurrentTurn);
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

      const currentPlayer = game.players[currentPlayerIndex];
      const nextPlayer = game.players[nextPlayerIndex];

      await app.db
        .update(schema.gamePlayers)
        .set({ isCurrentTurn: false })
        .where(eq(schema.gamePlayers.id, currentPlayer.id));

      await app.db
        .update(schema.gamePlayers)
        .set({ isCurrentTurn: true })
        .where(eq(schema.gamePlayers.id, nextPlayer.id));

      const now = new Date();
      await app.db
        .update(schema.games)
        .set({ currentTurnStartedAt: now, updatedAt: now })
        .where(eq(schema.games.id, gameId as any));

      return true;
    }

    return false;
  }

  // Enhanced move endpoint for multiplayer
  app.fastify.post('/api/game/multiplayer/:gameId/move-enhanced', async (
    request: FastifyRequest<{
      Params: { gameId: string };
      Body: {
        word: string;
        positions: Array<{ row: number; col: number }>;
        newBoardState: unknown;
      };
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { word, positions, newBoardState } = request.body;

    app.logger.info(
      { userId: session.user.id, gameId, word },
      'Submitting multiplayer move with turn management'
    );

    try {
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: {
          players: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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

      // Verify it's player's turn
      if (!playerInGame.isCurrentTurn) {
        app.logger.warn({ gameId, userId: session.user.id }, 'Not player turn');
        return reply.code(400).send({ error: 'It is not your turn' });
      }

      // Check timer expiration for live matches
      if (game.isLiveMatch && game.turnTimerSeconds && game.currentTurnStartedAt) {
        const elapsedSeconds = Math.floor(
          (new Date().getTime() - game.currentTurnStartedAt.getTime()) / 1000
        );

        if (elapsedSeconds >= game.turnTimerSeconds) {
          app.logger.warn(
            { gameId, userId: session.user.id },
            'Turn timer expired'
          );
          return reply.code(400).send({ error: 'Your turn time has expired' });
        }
      }

      // Validate word
      const isValid = word.length >= 2;
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

      const now = new Date();
      const [updatedGame] = await app.db
        .update(schema.games)
        .set({
          boardState: newBoardState,
          moveHistory: updatedMoveHistory,
          updatedAt: now,
        })
        .where(eq(schema.games.id, gameId as any))
        .returning();

      // Update player score
      const newScore = (playerInGame.score || 0) + score;
      await app.db
        .update(schema.gamePlayers)
        .set({ score: newScore })
        .where(eq(schema.gamePlayers.id, playerInGame.id));

      // Switch to next player's turn
      const playerIndex = game.players.findIndex((p) => p.userId === session.user.id);
      const nextPlayerIndex = (playerIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextPlayerIndex];
      const nextPlayerId = nextPlayer.userId;

      await app.db
        .update(schema.gamePlayers)
        .set({ isCurrentTurn: false })
        .where(eq(schema.gamePlayers.id, playerInGame.id));

      await app.db
        .update(schema.gamePlayers)
        .set({ isCurrentTurn: true })
        .where(eq(schema.gamePlayers.id, nextPlayer.id));

      // Update turn start time
      await app.db
        .update(schema.games)
        .set({ currentTurnStartedAt: now })
        .where(eq(schema.games.id, gameId as any));

      let turnTimeRemaining: number | undefined;
      if (game.isLiveMatch && game.turnTimerSeconds) {
        turnTimeRemaining = game.turnTimerSeconds;
      }

      app.logger.info(
        {
          userId: session.user.id,
          gameId,
          word,
          score,
          nextPlayerId,
        },
        'Multiplayer move processed with turn switch'
      );

      // TODO: Send turn notification to next player

      return {
        valid: isValid,
        score,
        newBoardState: updatedGame.boardState,
        nextPlayerId,
        nextPlayerName: nextPlayer.user?.name || 'Unknown',
        gameStatus: updatedGame.status,
        turnTimeRemaining,
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, gameId },
        'Failed to process multiplayer move'
      );
      throw error;
    }
  });
}
