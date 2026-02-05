import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface RandomMatchmakingRequest {
  boardId: string;
  isLiveMatch: boolean;
  maxPlayers: number;
}

interface PrivateLobbyRequest {
  boardId: string;
  isLiveMatch: boolean;
  maxPlayers: number;
}

interface JoinByCodeRequest {
  inviteCode: string;
}

interface InviteFriendRequest {
  friendUserId: string;
  boardId: string;
  isLiveMatch: boolean;
  maxPlayers?: number;
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function validateMaxPlayers(max: number): boolean {
  return max >= 2 && max <= 4;
}

function getTurnTimerSeconds(isLiveMatch: boolean): number | null {
  return isLiveMatch ? 120 : null; // 2 minutes for live matches
}

export function registerMatchmakingRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Random matchmaking
  app.fastify.post('/api/game/multiplayer/matchmaking/random', async (
    request: FastifyRequest<{ Body: RandomMatchmakingRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { boardId, isLiveMatch, maxPlayers } = request.body;

    app.logger.info(
      { userId: session.user.id, boardId, isLiveMatch, maxPlayers },
      'Random matchmaking request'
    );

    try {
      if (!validateMaxPlayers(maxPlayers)) {
        return reply.code(400).send({ error: 'maxPlayers must be between 2 and 4' });
      }

      // Find existing open game with same settings
      const existingGames = await app.db.query.games.findMany({
        where: and(
          eq(schema.games.status, 'active'),
          eq(schema.games.matchmakingType, 'random'),
          eq(schema.games.isLiveMatch, isLiveMatch),
          eq(schema.games.maxPlayers, maxPlayers),
          eq(schema.games.boardId, boardId as any)
        ),
        with: {
          players: true,
        },
      });

      let gameId: string;
      const openGame = existingGames.find((g) => g.players.length < g.maxPlayers);

      if (!openGame) {
        // Create new game
        const turnTimerSeconds = getTurnTimerSeconds(isLiveMatch);
        const [newGame] = await app.db
          .insert(schema.games)
          .values({
            gameMode: 'multiplayer',
            status: 'active',
            boardState: {},
            moveHistory: [],
            isLiveMatch,
            turnTimerSeconds,
            matchmakingType: 'random',
            maxPlayers,
            boardId: boardId as any,
            currentTurnStartedAt: new Date(),
          })
          .returning();

        gameId = newGame.id;
      } else {
        gameId = openGame.id;
      }

      // Add user to game if not already there
      const userAlreadyInGame = await app.db.query.gamePlayers.findFirst({
        where: and(
          eq(schema.gamePlayers.gameId, gameId as any),
          eq(schema.gamePlayers.userId, session.user.id)
        ),
      });

      if (!userAlreadyInGame) {
        // Get current player count to determine if this is the first player
        const currentPlayers = await app.db.query.gamePlayers.findMany({
          where: eq(schema.gamePlayers.gameId, gameId as any),
        });

        const isFirstPlayer = currentPlayers.length === 0;
        await app.db.insert(schema.gamePlayers).values({
          gameId: gameId as any,
          userId: session.user.id,
          score: 0,
          isCurrentTurn: isFirstPlayer,
        });
      }

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
                },
              },
            },
          },
        },
      });

      app.logger.info({ userId: session.user.id, gameId }, 'Matched with random game');

      return {
        gameId: updatedGame!.id,
        boardState: updatedGame!.boardState,
        players: updatedGame!.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
        matchmakingType: 'random',
        isLiveMatch: updatedGame!.isLiveMatch,
        turnTimerSeconds: updatedGame!.turnTimerSeconds || undefined,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Random matchmaking failed');
      throw error;
    }
  });

  // Create private lobby
  app.fastify.post('/api/game/multiplayer/matchmaking/create-private', async (
    request: FastifyRequest<{ Body: PrivateLobbyRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { boardId, isLiveMatch, maxPlayers } = request.body;

    app.logger.info(
      { userId: session.user.id, boardId, isLiveMatch, maxPlayers },
      'Creating private lobby'
    );

    try {
      if (!validateMaxPlayers(maxPlayers)) {
        return reply.code(400).send({ error: 'maxPlayers must be between 2 and 4' });
      }

      const inviteCode = generateInviteCode();
      const turnTimerSeconds = getTurnTimerSeconds(isLiveMatch);

      const [newGame] = await app.db
        .insert(schema.games)
        .values({
          gameMode: 'multiplayer',
          status: 'active',
          boardState: {},
          moveHistory: [],
          isLiveMatch,
          turnTimerSeconds,
          inviteCode,
          matchmakingType: 'private',
          maxPlayers,
          boardId: boardId as any,
          currentTurnStartedAt: new Date(),
        })
        .returning();

      // Add creator to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: newGame.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      const updatedGame = await app.db.query.games.findFirst({
        where: eq(schema.games.id, newGame.id),
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

      app.logger.info(
        { userId: session.user.id, gameId: newGame.id, inviteCode },
        'Private lobby created'
      );

      return {
        gameId: updatedGame!.id,
        inviteCode,
        boardState: updatedGame!.boardState,
        players: updatedGame!.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
        matchmakingType: 'private',
        isLiveMatch: updatedGame!.isLiveMatch,
        turnTimerSeconds: updatedGame!.turnTimerSeconds || undefined,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to create private lobby');
      throw error;
    }
  });

  // Join by code
  app.fastify.post('/api/game/multiplayer/matchmaking/join-by-code', async (
    request: FastifyRequest<{ Body: JoinByCodeRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { inviteCode } = request.body;

    app.logger.info({ userId: session.user.id, inviteCode }, 'Attempting to join by code');

    try {
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.inviteCode, inviteCode),
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
        app.logger.warn({ inviteCode, userId: session.user.id }, 'Invalid invite code');
        return reply.code(404).send({ error: 'Invalid invite code' });
      }

      if (game.status !== 'active') {
        app.logger.warn(
          { gameId: game.id, userId: session.user.id },
          'Game is not active'
        );
        return reply.code(400).send({ error: 'Game is not active' });
      }

      if (game.players.length >= game.maxPlayers) {
        app.logger.warn(
          { gameId: game.id, userId: session.user.id },
          'Game is full'
        );
        return reply.code(400).send({ error: 'Game is full' });
      }

      // Check if user already in game
      const userAlreadyInGame = game.players.some((p) => p.userId === session.user.id);
      if (userAlreadyInGame) {
        app.logger.warn({ gameId: game.id, userId: session.user.id }, 'User already in game');
        return reply.code(400).send({ error: 'User is already in this game' });
      }

      // Add user to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: game.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: false,
      });

      // Fetch updated game
      const updatedGame = await app.db.query.games.findFirst({
        where: eq(schema.games.id, game.id),
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

      app.logger.info({ userId: session.user.id, gameId: game.id }, 'Joined game by code');

      return {
        gameId: updatedGame!.id,
        boardState: updatedGame!.boardState,
        players: updatedGame!.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
        matchmakingType: updatedGame!.matchmakingType,
        isLiveMatch: updatedGame!.isLiveMatch,
        turnTimerSeconds: updatedGame!.turnTimerSeconds || undefined,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to join by code');
      throw error;
    }
  });

  // Invite friend
  app.fastify.post('/api/game/multiplayer/matchmaking/invite-friend', async (
    request: FastifyRequest<{ Body: InviteFriendRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { friendUserId, boardId, isLiveMatch, maxPlayers = 2 } = request.body;

    app.logger.info(
      { userId: session.user.id, friendUserId, boardId },
      'Inviting friend to game'
    );

    try {
      if (!validateMaxPlayers(maxPlayers)) {
        return reply.code(400).send({ error: 'maxPlayers must be between 2 and 4' });
      }

      const inviteCode = generateInviteCode();
      const turnTimerSeconds = getTurnTimerSeconds(isLiveMatch);

      const [newGame] = await app.db
        .insert(schema.games)
        .values({
          gameMode: 'multiplayer',
          status: 'active',
          boardState: {},
          moveHistory: [],
          isLiveMatch,
          turnTimerSeconds,
          inviteCode,
          matchmakingType: 'invite',
          maxPlayers,
          boardId: boardId as any,
          currentTurnStartedAt: new Date(),
        })
        .returning();

      // Add creator to game
      await app.db.insert(schema.gamePlayers).values({
        gameId: newGame.id,
        userId: session.user.id,
        score: 0,
        isCurrentTurn: true,
      });

      const updatedGame = await app.db.query.games.findFirst({
        where: eq(schema.games.id, newGame.id),
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

      app.logger.info(
        { userId: session.user.id, gameId: newGame.id, friendUserId },
        'Friend invite created'
      );

      // TODO: Send push notification to friend with invite link/code

      return {
        gameId: updatedGame!.id,
        inviteCode,
        boardState: updatedGame!.boardState,
        players: updatedGame!.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
        matchmakingType: 'invite',
        isLiveMatch: updatedGame!.isLiveMatch,
        turnTimerSeconds: updatedGame!.turnTimerSeconds || undefined,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to invite friend');
      throw error;
    }
  });
}
