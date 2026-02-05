import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerGameStateRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get game state
  app.fastify.get('/api/game/:gameId', async (
    request: FastifyRequest<{ Params: { gameId: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;

    app.logger.info({ userId: session.user.id, gameId }, 'Fetching game state');

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

      // Verify user is a player in the game
      const playerInGame = game.players.find((p) => p.userId === session.user.id);
      if (!playerInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      app.logger.info({ userId: session.user.id, gameId }, 'Game state retrieved');

      return {
        id: game.id,
        gameMode: game.gameMode,
        status: game.status,
        boardState: game.boardState,
        moveHistory: game.moveHistory,
        players: game.players.map((p) => ({
          userId: p.userId,
          userName: p.user?.name || 'Unknown',
          score: p.score,
          isCurrentTurn: p.isCurrentTurn,
        })),
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, gameId }, 'Failed to fetch game state');
      throw error;
    }
  });
}
