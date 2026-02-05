import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface MoveRequest {
  word: string;
  positions: Array<{ row: number; col: number }>;
  newBoardState: unknown;
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function registerMultiplayerGameRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Create a multiplayer game
  app.fastify.post('/api/game/multiplayer/create', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Creating multiplayer game');

    try {
      // Create game with an invite code stored in metadata
      const inviteCode = generateInviteCode();

      const [game] = await app.db
        .insert(schema.games)
        .values({
          gameMode: 'multiplayer',
          status: 'active',
          boardState: { inviteCode },
          moveHistory: [],
        })
        .returning();

      // Add creator as first player
      await app.db.insert(schema.gamePlayers).values({
        gameId: game.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      app.logger.info({ userId: session.user.id, gameId: game.id, inviteCode }, 'Multiplayer game created');

      return {
        gameId: game.id,
        boardState: game.boardState,
        inviteCode,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to create multiplayer game');
      throw error;
    }
  });

  // Join a multiplayer game
  app.fastify.post('/api/game/multiplayer/:gameId/join', async (
    request: FastifyRequest<{ Params: { gameId: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;

    app.logger.info({ userId: session.user.id, gameId }, 'Joining multiplayer game');

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
                  email: true,
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

      // Check if user already in game
      const alreadyInGame = game.players.find((p) => p.userId === session.user.id);
      if (alreadyInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User already in game');
        return reply.code(400).send({ error: 'User is already in this game' });
      }

      // Add user to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: game.id as any,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: false,
      });

      // Fetch updated game
      const updatedGame = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: {
          players: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      app.logger.info({ userId: session.user.id, gameId }, 'Joined multiplayer game');

      return {
        gameId: updatedGame!.id,
        boardState: updatedGame!.boardState,
        players: updatedGame!.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to join multiplayer game');
      throw error;
    }
  });

  // Submit a move in multiplayer game
  app.fastify.post('/api/game/multiplayer/:gameId/move', async (
    request: FastifyRequest<{ Params: { gameId: string }; Body: MoveRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { word, positions, newBoardState } = request.body;

    app.logger.info({ userId: session.user.id, gameId, word }, 'Submitting multiplayer move');

    try {
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

      // Verify it's player's turn
      if (!playerInGame.isCurrentTurn) {
        app.logger.warn({ gameId, userId: session.user.id }, 'Not player turn');
        return reply.code(400).send({ error: 'It is not your turn' });
      }

      // Validate word
      const isValid = word.length >= 2;

      // Calculate score
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

      app.logger.info(
        { userId: session.user.id, gameId, word, score, nextPlayerId },
        'Multiplayer move processed'
      );

      return {
        valid: isValid,
        score,
        newBoardState: updatedGame.boardState,
        nextPlayerId,
        gameStatus: updatedGame.status,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to process multiplayer move');
      throw error;
    }
  });

  // Get user's active multiplayer games
  app.fastify.get('/api/game/multiplayer/active', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching active multiplayer games');

    try {
      // Get all games where user is a player
      const userGames = await app.db.query.gamePlayers.findMany({
        where: eq(schema.gamePlayers.userId, session.user.id),
        with: {
          game: {
            with: {
              players: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Filter for active games
      const activeGames = userGames.filter((gp) => gp.game.status === 'active');

      const formattedGames = activeGames.map((gp) => {
        const opponentUser = gp.game.players.find((p) => p.userId !== session.user.id)?.user;

        let turnTimeRemaining: number | undefined;
        let isUrgent = false;

        if (gp.isCurrentTurn && gp.game.isLiveMatch && gp.game.turnTimerSeconds && gp.game.currentTurnStartedAt) {
          const elapsedSeconds = Math.floor(
            (new Date().getTime() - gp.game.currentTurnStartedAt.getTime()) / 1000
          );
          turnTimeRemaining = Math.max(0, gp.game.turnTimerSeconds - elapsedSeconds);
          isUrgent = turnTimeRemaining < 30; // Urgent if less than 30 seconds
        }

        return {
          gameId: gp.game.id,
          opponentName: opponentUser?.name || 'Unknown',
          isMyTurn: gp.isCurrentTurn,
          lastMoveAt: gp.game.updatedAt,
          turnTimeRemaining,
          isLiveMatch: gp.game.isLiveMatch,
          isUrgent,
        };
      });

      app.logger.info({ userId: session.user.id, count: formattedGames.length }, 'Active multiplayer games retrieved');

      return formattedGames;
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch active multiplayer games');
      throw error;
    }
  });
}
