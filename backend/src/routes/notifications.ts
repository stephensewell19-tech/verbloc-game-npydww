import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface RegisterTokenRequest {
  pushToken: string;
  platform: 'ios' | 'android';
}

interface SendTurnNotificationRequest {
  userId: string;
  gameId: string;
  opponentName: string;
}

interface SendGameCompleteNotificationRequest {
  userId: string;
  gameId: string;
  outcome: 'win' | 'loss' | 'draw';
}

export function registerNotificationRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Register push notification token
  app.fastify.post('/api/notifications/register-token', async (
    request: FastifyRequest<{ Body: RegisterTokenRequest }>,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { pushToken, platform } = request.body;

    app.logger.info({ userId: session.user.id, platform }, 'Registering push token');

    try {
      if (!['ios', 'android'].includes(platform)) {
        return reply.code(400).send({ error: 'Platform must be ios or android' });
      }

      if (!pushToken || typeof pushToken !== 'string') {
        return reply.code(400).send({ error: 'pushToken is required' });
      }

      // Check if token already exists for user
      const existingToken = await app.db.query.pushNotificationTokens.findFirst({
        where: eq(schema.pushNotificationTokens.userId, session.user.id),
      });

      if (existingToken) {
        // Update existing token
        await app.db
          .update(schema.pushNotificationTokens)
          .set({
            pushToken,
            platform,
            updatedAt: new Date(),
          })
          .where(eq(schema.pushNotificationTokens.userId, session.user.id));

        app.logger.info({ userId: session.user.id }, 'Push token updated');
      } else {
        // Create new token
        await app.db.insert(schema.pushNotificationTokens).values({
          userId: session.user.id,
          pushToken,
          platform,
        });

        app.logger.info({ userId: session.user.id }, 'Push token registered');
      }

      return { success: true };
    } catch (error) {
      app.logger.error(
        { err: error, userId: session.user.id },
        'Failed to register push token'
      );
      throw error;
    }
  });

  // Send turn notification (internal endpoint)
  app.fastify.post('/api/notifications/send-turn-notification', async (
    request: FastifyRequest<{ Body: SendTurnNotificationRequest }>,
    reply: FastifyReply
  ) => {
    const { userId, gameId, opponentName } = request.body;

    app.logger.info(
      { userId, gameId, opponentName },
      'Sending turn notification'
    );

    try {
      // Get user's push token
      const tokenRecord = await app.db.query.pushNotificationTokens.findFirst({
        where: eq(schema.pushNotificationTokens.userId, userId),
      });

      if (!tokenRecord) {
        app.logger.info({ userId }, 'No push token registered for user');
        return { success: false, reason: 'No push token registered' };
      }

      // TODO: Send actual push notification using push service
      // This would use a service like Firebase Cloud Messaging (FCM) for Android
      // or Apple Push Notification service (APNs) for iOS
      const notification = {
        title: "It's your turn!",
        body: `${opponentName} finished their move in VERBLOC`,
        data: {
          gameId,
          type: 'turn_notification',
        },
      };

      app.logger.info(
        { userId, platform: tokenRecord.platform },
        'Push notification would be sent',
        notification
      );

      return { success: true, notification };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to send turn notification');
      throw error;
    }
  });

  // Send game complete notification (internal endpoint)
  app.fastify.post('/api/notifications/send-game-complete-notification', async (
    request: FastifyRequest<{ Body: SendGameCompleteNotificationRequest }>,
    reply: FastifyReply
  ) => {
    const { userId, gameId, outcome } = request.body;

    app.logger.info({ userId, gameId, outcome }, 'Sending game complete notification');

    try {
      // Get user's push token
      const tokenRecord = await app.db.query.pushNotificationTokens.findFirst({
        where: eq(schema.pushNotificationTokens.userId, userId),
      });

      if (!tokenRecord) {
        app.logger.info({ userId }, 'No push token registered for user');
        return { success: false, reason: 'No push token registered' };
      }

      // TODO: Send actual push notification
      const outcomeText =
        outcome === 'win' ? 'You won!' : outcome === 'loss' ? 'You lost!' : "It's a draw!";

      const notification = {
        title: 'Game Complete!',
        body: `VERBLOC game finished - ${outcomeText}`,
        data: {
          gameId,
          type: 'game_complete',
          outcome,
        },
      };

      app.logger.info(
        { userId, platform: tokenRecord.platform },
        'Game complete notification would be sent',
        notification
      );

      return { success: true, notification };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to send game complete notification');
      throw error;
    }
  });

  // Send reaction notification (internal endpoint)
  app.fastify.post('/api/notifications/send-reaction-notification', async (
    request: FastifyRequest<{
      Body: { userId: string; gameId: string; reactorName: string; emoji: string };
    }>,
    reply: FastifyReply
  ) => {
    const { userId, gameId, reactorName, emoji } = request.body;

    app.logger.info({ userId, gameId, reactorName, emoji }, 'Sending reaction notification');

    try {
      const tokenRecord = await app.db.query.pushNotificationTokens.findFirst({
        where: eq(schema.pushNotificationTokens.userId, userId),
      });

      if (!tokenRecord) {
        app.logger.info({ userId }, 'No push token registered for user');
        return { success: false, reason: 'No push token registered' };
      }

      const notification = {
        title: 'New Reaction!',
        body: `${reactorName} reacted ${emoji} to your move`,
        data: {
          gameId,
          type: 'reaction',
        },
      };

      app.logger.info(
        { userId, platform: tokenRecord.platform },
        'Reaction notification would be sent'
      );

      return { success: true, notification };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to send reaction notification');
      throw error;
    }
  });

  // Send taunt notification (internal endpoint)
  app.fastify.post('/api/notifications/send-taunt-notification', async (
    request: FastifyRequest<{
      Body: { userIds: string[]; gameId: string; tauntAuthorName: string; message: string };
    }>,
    reply: FastifyReply
  ) => {
    const { userIds, gameId, tauntAuthorName, message } = request.body;

    app.logger.info(
      { userIds, gameId, tauntAuthorName },
      'Sending taunt notification'
    );

    try {
      const notifications = [];

      for (const userId of userIds) {
        const tokenRecord = await app.db.query.pushNotificationTokens.findFirst({
          where: eq(schema.pushNotificationTokens.userId, userId),
        });

        if (tokenRecord) {
          const notification = {
            title: 'Incoming Taunt!',
            body: `${tauntAuthorName}: ${message}`,
            data: {
              gameId,
              type: 'taunt',
            },
          };

          notifications.push({
            userId,
            platform: tokenRecord.platform,
            notification,
          });

          app.logger.info(
            { userId, platform: tokenRecord.platform },
            'Taunt notification would be sent'
          );
        }
      }

      return { success: true, notificationsSent: notifications.length };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to send taunt notifications');
      throw error;
    }
  });
}
