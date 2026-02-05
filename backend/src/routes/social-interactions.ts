import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';

const ALLOWED_EMOJIS = ['👍', '🔥', '😮', '💪', '🎯', '⭐'];
const ALLOWED_TAUNTS: Record<string, string> = {
  nice_move: 'Nice move!',
  watch_this: 'Watch this!',
  good_game: 'Good game!',
  your_turn: 'Your turn!',
  thinking: '🤔 Thinking...',
  impressive: 'Impressive!',
};

export function registerSocialInteractionRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Send reaction to a move
  app.fastify.post('/api/game/multiplayer/:gameId/react', async (
    request: FastifyRequest<{
      Params: { gameId: string };
      Body: { targetMoveIndex: number; emoji: string };
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { targetMoveIndex, emoji } = request.body;

    app.logger.info(
      { userId: session.user.id, gameId, targetMoveIndex, emoji },
      'Sending reaction'
    );

    try {
      // Validate emoji
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        return reply.code(400).send({
          error: `Emoji must be one of: ${ALLOWED_EMOJIS.join(', ')}`,
        });
      }

      // Get game and verify user is a player
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

      // Validate move index
      const moveHistory = Array.isArray(game.moveHistory) ? game.moveHistory : [];
      if (targetMoveIndex < 0 || targetMoveIndex >= moveHistory.length) {
        return reply.code(400).send({ error: 'Invalid move index' });
      }

      // Check if user already reacted to this move
      const existingReaction = await app.db.query.gameReactions.findFirst({
        where: and(
          eq(schema.gameReactions.gameId, gameId as any),
          eq(schema.gameReactions.userId, session.user.id),
          eq(schema.gameReactions.targetMoveIndex, targetMoveIndex)
        ),
      });

      if (existingReaction) {
        app.logger.warn(
          { userId: session.user.id, gameId, targetMoveIndex },
          'User already reacted to this move'
        );
        return reply.code(400).send({ error: 'You have already reacted to this move' });
      }

      // Create reaction
      const [reaction] = await app.db
        .insert(schema.gameReactions)
        .values({
          gameId: gameId as any,
          userId: session.user.id,
          targetMoveIndex,
          emoji,
        })
        .returning();

      app.logger.info(
        { userId: session.user.id, gameId, reactionId: reaction.id },
        'Reaction created'
      );

      // Get user info for response
      const userInfo = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
      });

      // TODO: Send push notification to move author

      return {
        success: true,
        reaction: {
          emoji,
          userName: userInfo?.user?.name || 'Unknown',
          createdAt: reaction.createdAt,
        },
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, gameId },
        'Failed to create reaction'
      );
      throw error;
    }
  });

  // Send taunt
  app.fastify.post('/api/game/multiplayer/:gameId/taunt', async (
    request: FastifyRequest<{
      Params: { gameId: string };
      Body: { tauntType: string };
    }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;
    const { tauntType } = request.body;

    app.logger.info({ userId: session.user.id, gameId, tauntType }, 'Sending taunt');

    try {
      // Validate taunt type
      if (!ALLOWED_TAUNTS[tauntType]) {
        return reply.code(400).send({
          error: `Taunt must be one of: ${Object.keys(ALLOWED_TAUNTS).join(', ')}`,
        });
      }

      // Get game and verify user is a player
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

      // Check if user already taunted this turn
      const moveHistory = Array.isArray(game.moveHistory) ? game.moveHistory : [];
      const lastTaunt = await app.db.query.gameTaunts.findFirst({
        where: and(
          eq(schema.gameTaunts.gameId, gameId as any),
          eq(schema.gameTaunts.userId, session.user.id)
        ),
        orderBy: [desc(schema.gameTaunts.createdAt)],
      });

      if (lastTaunt && moveHistory.length > 0) {
        const lastMoveIndex = moveHistory.length - 1;
        const lastMoveTimestamp = (moveHistory[lastMoveIndex] as any)?.timestamp;

        if (lastMoveTimestamp && new Date(lastMoveTimestamp) < lastTaunt.createdAt) {
          app.logger.warn(
            { userId: session.user.id, gameId },
            'User already taunted this turn'
          );
          return reply.code(400).send({ error: 'You have already taunted this turn' });
        }
      }

      // Create taunt
      const [taunt] = await app.db
        .insert(schema.gameTaunts)
        .values({
          gameId: gameId as any,
          userId: session.user.id,
          tauntType,
        })
        .returning();

      app.logger.info({ userId: session.user.id, gameId, tauntId: taunt.id }, 'Taunt created');

      // Get user info for response
      const userInfo = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
      });

      // TODO: Send push notifications to other players

      return {
        success: true,
        taunt: {
          tauntType,
          userName: userInfo?.user?.name || 'Unknown',
          message: ALLOWED_TAUNTS[tauntType],
          createdAt: taunt.createdAt,
        },
      };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, gameId },
        'Failed to create taunt'
      );
      throw error;
    }
  });

  // Get reactions for a game
  app.fastify.get('/api/game/multiplayer/:gameId/reactions', async (
    request: FastifyRequest<{ Params: { gameId: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;

    app.logger.info({ userId: session.user.id, gameId }, 'Fetching reactions');

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

      // Verify user is a player
      const userInGame = game.players.find((p) => p.userId === session.user.id);
      if (!userInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      // Get all reactions with user info
      const reactions = await app.db.query.gameReactions.findMany({
        where: eq(schema.gameReactions.gameId, gameId as any),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
      });

      const formattedReactions = reactions.map((r) => ({
        emoji: r.emoji,
        userName: r.user?.name || 'Unknown',
        targetMoveIndex: r.targetMoveIndex,
        createdAt: r.createdAt,
      }));

      app.logger.info({ userId: session.user.id, gameId, count: formattedReactions.length }, 'Reactions retrieved');

      return formattedReactions;
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, gameId },
        'Failed to fetch reactions'
      );
      throw error;
    }
  });

  // Get taunts for a game
  app.fastify.get('/api/game/multiplayer/:gameId/taunts', async (
    request: FastifyRequest<{ Params: { gameId: string } }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId } = request.params;

    app.logger.info({ userId: session.user.id, gameId }, 'Fetching taunts');

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

      // Verify user is a player
      const userInGame = game.players.find((p) => p.userId === session.user.id);
      if (!userInGame) {
        app.logger.warn({ gameId, userId: session.user.id }, 'User not in game');
        return reply.code(403).send({ error: 'User is not a player in this game' });
      }

      // Get all taunts with user info
      const taunts = await app.db.query.gameTaunts.findMany({
        where: eq(schema.gameTaunts.gameId, gameId as any),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: [desc(schema.gameTaunts.createdAt)],
      });

      const formattedTaunts = taunts.map((t) => ({
        tauntType: t.tauntType,
        userName: t.user?.name || 'Unknown',
        message: ALLOWED_TAUNTS[t.tauntType],
        createdAt: t.createdAt,
      }));

      app.logger.info({ userId: session.user.id, gameId, count: formattedTaunts.length }, 'Taunts retrieved');

      return formattedTaunts;
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id, gameId },
        'Failed to fetch taunts'
      );
      throw error;
    }
  });
}
