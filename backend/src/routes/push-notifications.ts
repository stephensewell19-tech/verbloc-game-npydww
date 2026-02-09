import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lt } from 'drizzle-orm';
import * as schema from '../db/schema.js';

// Expo Push Notification types (stub for now - would use expo-server-sdk-node in production)
interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default';
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: any;
}

// Mock Expo push service (replace with actual expo-server-sdk-node in production)
class ExpoNotificationService {
  async sendPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
    // In production, use: const expo = new Expo();
    // return await expo.sendPushNotificationsAsync(messages);

    // Mock implementation for now
    return messages.map(() => ({
      status: 'ok' as const,
      id: `mock-ticket-${Date.now()}`,
    }));
  }
}

const expoService = new ExpoNotificationService();

// Helper to check if we've sent a similar notification recently
async function hasRecentNotification(
  app: App,
  userId: string,
  notificationType: string,
  contextData: Record<string, any>,
  hoursAgo: number = 24
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const recentNotifications = await app.db
    .select()
    .from(schema.notificationHistory)
    .where(
      and(
        eq(schema.notificationHistory.userId, userId),
        eq(schema.notificationHistory.notificationType, notificationType),
        gte(schema.notificationHistory.sentAt, cutoffTime)
      )
    )
    .limit(10);

  // Check if any recent notification has matching context
  for (const notification of recentNotifications) {
    const notificationData = notification.data as Record<string, any> | null;
    if (!notificationData) continue;

    // Check if context matches (e.g., same gameId)
    const contextMatches = Object.keys(contextData).every(
      (key) => notificationData[key] === contextData[key]
    );

    if (contextMatches) {
      return true;
    }
  }

  return false;
}

export function registerPushNotificationRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Register or update push token
  app.fastify.post('/api/notifications/register-token', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { expoPushToken, platform } = request.body as {
      expoPushToken: string;
      platform: 'ios' | 'android';
    };

    app.logger.info(
      { userId: session.user.id, platform },
      'Registering push notification token'
    );

    try {
      // Validate token format (Expo tokens start with ExponentPushToken[)
      if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
        return reply.status(400).send({ error: 'Invalid Expo push token format' });
      }

      if (!['ios', 'android'].includes(platform)) {
        return reply.status(400).send({ error: 'Platform must be ios or android' });
      }

      // Check if token already exists
      const existingToken = await app.db.query.notificationTokens.findFirst({
        where: eq(schema.notificationTokens.expoPushToken, expoPushToken),
      });

      if (existingToken) {
        // Update existing token if user changed
        if (existingToken.userId !== session.user.id) {
          await app.db
            .update(schema.notificationTokens)
            .set({
              userId: session.user.id,
              platform,
              updatedAt: new Date(),
            })
            .where(eq(schema.notificationTokens.expoPushToken, expoPushToken));
        }
      } else {
        // Insert new token
        await app.db.insert(schema.notificationTokens).values({
          userId: session.user.id,
          expoPushToken,
          platform,
        });
      }

      // Create default preferences if they don't exist
      const existingPrefs = await app.db.query.notificationPreferences.findFirst({
        where: eq(schema.notificationPreferences.userId, session.user.id),
      });

      if (!existingPrefs) {
        await app.db.insert(schema.notificationPreferences).values({
          userId: session.user.id,
          multiplayerTurnReminders: true,
          dailyChallengeAvailability: true,
          eventBoardStartEnd: true,
        });
      }

      app.logger.info(
        { userId: session.user.id, platform },
        'Push notification token registered'
      );

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to register push token');
      throw error;
    }
  });

  // Get notification preferences
  app.fastify.get('/api/notifications/preferences', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching notification preferences');

    try {
      let preferences = await app.db.query.notificationPreferences.findFirst({
        where: eq(schema.notificationPreferences.userId, session.user.id),
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        const [newPrefs] = await app.db
          .insert(schema.notificationPreferences)
          .values({
            userId: session.user.id,
            multiplayerTurnReminders: true,
            dailyChallengeAvailability: true,
            eventBoardStartEnd: true,
          })
          .returning();

        preferences = newPrefs;
      }

      app.logger.info({ userId: session.user.id }, 'Notification preferences retrieved');

      return {
        multiplayerTurnReminders: preferences.multiplayerTurnReminders,
        dailyChallengeAvailability: preferences.dailyChallengeAvailability,
        eventBoardStartEnd: preferences.eventBoardStartEnd,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch preferences');
      throw error;
    }
  });

  // Update notification preferences
  app.fastify.put('/api/notifications/preferences', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const {
      multiplayerTurnReminders,
      dailyChallengeAvailability,
      eventBoardStartEnd,
    } = request.body as {
      multiplayerTurnReminders?: boolean;
      dailyChallengeAvailability?: boolean;
      eventBoardStartEnd?: boolean;
    };

    app.logger.info({ userId: session.user.id }, 'Updating notification preferences');

    try {
      // Get existing preferences
      const existingPrefs = await app.db.query.notificationPreferences.findFirst({
        where: eq(schema.notificationPreferences.userId, session.user.id),
      });

      const updateData: any = { updatedAt: new Date() };
      if (multiplayerTurnReminders !== undefined) {
        updateData.multiplayerTurnReminders = multiplayerTurnReminders;
      }
      if (dailyChallengeAvailability !== undefined) {
        updateData.dailyChallengeAvailability = dailyChallengeAvailability;
      }
      if (eventBoardStartEnd !== undefined) {
        updateData.eventBoardStartEnd = eventBoardStartEnd;
      }

      let updatedPrefs;

      if (existingPrefs) {
        [updatedPrefs] = await app.db
          .update(schema.notificationPreferences)
          .set(updateData)
          .where(eq(schema.notificationPreferences.userId, session.user.id))
          .returning();
      } else {
        // Create if doesn't exist
        [updatedPrefs] = await app.db
          .insert(schema.notificationPreferences)
          .values({
            userId: session.user.id,
            multiplayerTurnReminders: multiplayerTurnReminders ?? true,
            dailyChallengeAvailability: dailyChallengeAvailability ?? true,
            eventBoardStartEnd: eventBoardStartEnd ?? true,
          })
          .returning();
      }

      app.logger.info({ userId: session.user.id }, 'Notification preferences updated');

      return {
        multiplayerTurnReminders: updatedPrefs.multiplayerTurnReminders,
        dailyChallengeAvailability: updatedPrefs.dailyChallengeAvailability,
        eventBoardStartEnd: updatedPrefs.eventBoardStartEnd,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to update preferences');
      throw error;
    }
  });

  // Send turn reminder notification
  app.fastify.post('/api/notifications/send-turn-reminder', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { gameId, recipientUserId } = request.body as {
      gameId: string;
      recipientUserId: string;
    };

    app.logger.info(
      { gameId, recipientUserId, senderId: session.user.id },
      'Sending turn reminder notification'
    );

    try {
      // Check if recipient has enabled turn reminders
      const preferences = await app.db.query.notificationPreferences.findFirst({
        where: eq(schema.notificationPreferences.userId, recipientUserId),
      });

      if (!preferences || !preferences.multiplayerTurnReminders) {
        app.logger.info({ recipientUserId }, 'User has disabled turn reminders');
        return { success: true, sent: false, reason: 'disabled' };
      }

      // Check for recent notifications
      const hasRecent = await hasRecentNotification(
        app,
        recipientUserId,
        'turn_reminder',
        { gameId },
        12 // 12 hours
      );

      if (hasRecent) {
        app.logger.info({ recipientUserId, gameId }, 'Recent turn reminder already sent');
        return { success: true, sent: false, reason: 'recent' };
      }

      // Get recipient's push token
      const tokens = await app.db
        .select()
        .from(schema.notificationTokens)
        .where(eq(schema.notificationTokens.userId, recipientUserId));

      if (tokens.length === 0) {
        app.logger.info({ recipientUserId }, 'No push tokens found for user');
        return { success: true, sent: false, reason: 'no_token' };
      }

      // Get sender name for context
      const game = await app.db.query.games.findFirst({
        where: eq(schema.games.id, gameId as any),
        with: { players: true },
      });

      const opponentName = 'Your opponent'; // Could fetch from user profile

      // Send notifications
      const messages: ExpoPushMessage[] = tokens.map((token) => ({
        to: token.expoPushToken,
        title: 'Your move',
        body: 'Your move.',
        data: { gameId, type: 'turn_reminder', opponentName },
        sound: 'default',
        priority: 'high',
      }));

      const tickets = await expoService.sendPushNotifications(messages);

      // Log to notification history
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        await app.db.insert(schema.notificationHistory).values({
          userId: recipientUserId,
          notificationType: 'turn_reminder',
          title: 'Your move',
          body: 'Your move.',
          data: { gameId, opponentName },
          deliveryStatus: ticket.status === 'ok' ? 'sent' : 'failed',
        });
      }

      app.logger.info(
        { recipientUserId, gameId, tokenCount: tokens.length },
        'Turn reminder sent'
      );

      return { success: true, sent: true };
    } catch (error) {
      app.logger.error({ err: error, gameId, recipientUserId }, 'Failed to send turn reminder');
      throw error;
    }
  });

  // Send daily challenge notifications to all eligible users
  app.fastify.post('/api/notifications/send-daily-challenge', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({}, 'Sending daily challenge notifications');

    try {
      // Get all users who have daily challenge notifications enabled
      const eligibleUsers = await app.db
        .select({
          userId: schema.notificationPreferences.userId,
        })
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.dailyChallengeAvailability, true));

      let sentCount = 0;

      for (const { userId } of eligibleUsers) {
        // Check for recent notifications
        const hasRecent = await hasRecentNotification(
          app,
          userId,
          'daily_challenge',
          {},
          20 // 20 hours to avoid duplicate daily notifications
        );

        if (hasRecent) {
          continue;
        }

        // Get user's push tokens
        const tokens = await app.db
          .select()
          .from(schema.notificationTokens)
          .where(eq(schema.notificationTokens.userId, userId));

        if (tokens.length === 0) {
          continue;
        }

        // Send notifications
        const messages: ExpoPushMessage[] = tokens.map((token) => ({
          to: token.expoPushToken,
          title: 'Daily Challenge',
          body: 'Daily Challenge is live.',
          data: { type: 'daily_challenge' },
          sound: 'default',
          priority: 'normal',
        }));

        const tickets = await expoService.sendPushNotifications(messages);

        // Log to notification history
        for (const ticket of tickets) {
          await app.db.insert(schema.notificationHistory).values({
            userId,
            notificationType: 'daily_challenge',
            title: 'Daily Challenge',
            body: 'Daily Challenge is live.',
            data: {},
            deliveryStatus: ticket.status === 'ok' ? 'sent' : 'failed',
          });
        }

        if (tickets.some((t) => t.status === 'ok')) {
          sentCount++;
        }
      }

      app.logger.info({ sentCount }, 'Daily challenge notifications sent');

      return { success: true, sentCount };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to send daily challenge notifications');
      throw error;
    }
  });

  // Send event notification
  app.fastify.post('/api/notifications/send-event-notification', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { eventId, type } = request.body as {
      eventId: string;
      type: 'start' | 'ending_soon';
    };

    app.logger.info({ eventId, type }, 'Sending event notification');

    try {
      // Get event details
      const event = await app.db.query.specialEvents.findFirst({
        where: eq(schema.specialEvents.id, eventId),
      });

      if (!event) {
        app.logger.warn({ eventId }, 'Event not found');
        return reply.status(404).send({ error: 'Event not found' });
      }

      // Get all users who have event notifications enabled
      const eligibleUsers = await app.db
        .select({
          userId: schema.notificationPreferences.userId,
        })
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.eventBoardStartEnd, true));

      let sentCount = 0;

      for (const { userId } of eligibleUsers) {
        // Check for recent notifications
        const hasRecent = await hasRecentNotification(
          app,
          userId,
          `event_${type}`,
          { eventId },
          12 // 12 hours
        );

        if (hasRecent) {
          continue;
        }

        // Get user's push tokens
        const tokens = await app.db
          .select()
          .from(schema.notificationTokens)
          .where(eq(schema.notificationTokens.userId, userId));

        if (tokens.length === 0) {
          continue;
        }

        // Prepare notification content
        const title = type === 'start' ? 'New Event' : 'Event Ending Soon';
        const body =
          type === 'start'
            ? `New event: ${event.name}`
            : `${event.name} ends in 2 hours.`;

        // Send notifications
        const messages: ExpoPushMessage[] = tokens.map((token) => ({
          to: token.expoPushToken,
          title,
          body,
          data: { eventId, type: `event_${type}`, eventName: event.name },
          sound: 'default',
          priority: 'normal',
        }));

        const tickets = await expoService.sendPushNotifications(messages);

        // Log to notification history
        for (const ticket of tickets) {
          await app.db.insert(schema.notificationHistory).values({
            userId,
            notificationType: `event_${type}`,
            title,
            body,
            data: { eventId, eventName: event.name },
            deliveryStatus: ticket.status === 'ok' ? 'sent' : 'failed',
          });
        }

        if (tickets.some((t) => t.status === 'ok')) {
          sentCount++;
        }
      }

      app.logger.info({ eventId, type, sentCount }, 'Event notifications sent');

      return { success: true, sentCount };
    } catch (error) {
      app.logger.error({ err: error, eventId, type }, 'Failed to send event notifications');
      throw error;
    }
  });
}
