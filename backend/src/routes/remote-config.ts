import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { createHash } from 'crypto';

// Helper function to generate consistent hash for user + context
function consistentHash(userId: string, context: string): number {
  const hash = createHash('sha256').update(`${userId}:${context}`).digest('hex');
  // Convert first 8 hex characters to integer and map to 0-100 range
  return parseInt(hash.substring(0, 8), 16) % 100;
}

// Helper function to check if user should receive a feature flag
function shouldReceiveFeatureFlag(
  userId: string,
  flagName: string,
  rolloutPercentage: number,
  targetUserIds: string[] | null
): boolean {
  // If user is in target list, always enable
  if (targetUserIds && targetUserIds.includes(userId)) {
    return true;
  }

  // If no rollout percentage restriction, enable for all
  if (rolloutPercentage === 100) {
    return true;
  }

  // Use consistent hashing to determine if user is in rollout
  const hash = consistentHash(userId, flagName);
  return hash < rolloutPercentage;
}

// Helper function to assign A/B test variant
function assignVariant(userId: string, testName: string, variants: string[]): string {
  const hash = consistentHash(userId, testName);
  const variantIndex = hash % variants.length;
  return variants[variantIndex];
}

export function registerRemoteConfigRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Get complete remote configuration for authenticated user
  app.fastify.get('/api/remote-config', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching remote configuration');

    try {
      // Get all enabled feature flags
      const allFlags = await app.db.query.featureFlags.findMany();

      const featureFlags: Record<string, boolean> = {};

      for (const flag of allFlags) {
        const flagName = flag.flagName as string;
        if (flag.isEnabled) {
          const targetUserIds = flag.targetUserIds as string[] | null;
          const rolloutPercentage = flag.rolloutPercentage as number;
          const shouldEnable = shouldReceiveFeatureFlag(
            session.user.id,
            flagName,
            rolloutPercentage,
            targetUserIds
          );
          featureFlags[flagName] = shouldEnable;
        } else {
          featureFlags[flagName] = false;
        }
      }

      // Get all enabled A/B tests
      const allTests = await app.db.query.abTests.findMany({
        where: eq(schema.abTests.isEnabled, true),
      });

      const abTests: Record<string, { variant: string; enabled: boolean }> = {};

      for (const test of allTests) {
        // Check if user has existing assignment
        let assignment = await app.db.query.abTestAssignments.findFirst({
          where: and(
            eq(schema.abTestAssignments.testName, test.testName),
            eq(schema.abTestAssignments.userId, session.user.id)
          ),
        });

        // If no assignment, create one
        if (!assignment) {
          const variants = test.variants as string[];
          const variant = assignVariant(
            session.user.id,
            test.testName,
            variants
          );

          [assignment] = await app.db
            .insert(schema.abTestAssignments)
            .values({
              testName: test.testName,
              userId: session.user.id,
              variant,
            })
            .returning();
        }

        abTests[test.testName] = {
          variant: assignment.variant,
          enabled: true,
        };
      }

      // Get game configuration
      const gameConfigRecord = await app.db.query.remoteConfig.findFirst({
        where: and(
          eq(schema.remoteConfig.configKey, 'game_config'),
          eq(schema.remoteConfig.isActive, true)
        ),
      });

      const defaultGameConfig = {
        minAppVersion: '1.0.0',
        maxTurnTimeSeconds: 86400,
        dailyChallengeRefreshHour: 8,
        maxActiveGames: 10,
        xpMultipliers: {
          solo: 1.0,
          multiplayer: 1.2,
          dailyChallenge: 1.5,
          specialEvent: 2.0,
        },
      };

      const gameConfig = gameConfigRecord
        ? (gameConfigRecord.configValue as any)
        : defaultGameConfig;

      app.logger.info(
        {
          userId: session.user.id,
          flagCount: Object.keys(featureFlags).length,
          testCount: Object.keys(abTests).length,
        },
        'Remote configuration retrieved'
      );

      return {
        featureFlags,
        abTests,
        gameConfig,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch remote config');
      throw error;
    }
  });

  // Admin: List all feature flags
  app.fastify.get('/api/admin/feature-flags', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    // Note: In production, add admin authentication check
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Admin: Fetching feature flags');

    try {
      const flags = await app.db.query.featureFlags.findMany();

      app.logger.info({ flagCount: flags.length }, 'Feature flags retrieved');

      return flags.map((flag) => ({
        id: flag.id,
        flagName: flag.flagName,
        isEnabled: flag.isEnabled,
        description: flag.description,
        rolloutPercentage: flag.rolloutPercentage,
        targetUserIds: flag.targetUserIds,
        createdAt: (flag.createdAt as Date).toISOString(),
        updatedAt: (flag.updatedAt as Date).toISOString(),
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch feature flags');
      throw error;
    }
  });

  // Admin: Create feature flag
  app.fastify.post('/api/admin/feature-flags', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const {
      flagName,
      isEnabled,
      description,
      rolloutPercentage,
      targetUserIds,
    } = request.body as {
      flagName: string;
      isEnabled: boolean;
      description?: string;
      rolloutPercentage?: number;
      targetUserIds?: string[];
    };

    app.logger.info({ userId: session.user.id, flagName }, 'Admin: Creating feature flag');

    try {
      if (!flagName || typeof flagName !== 'string') {
        return reply.status(400).send({ error: 'flagName is required' });
      }

      if (typeof isEnabled !== 'boolean') {
        return reply.status(400).send({ error: 'isEnabled must be a boolean' });
      }

      const [newFlag] = await app.db
        .insert(schema.featureFlags)
        .values({
          flagName,
          isEnabled,
          description,
          rolloutPercentage: rolloutPercentage ?? 100,
          targetUserIds,
        })
        .returning();

      app.logger.info({ flagId: newFlag.id, flagName }, 'Feature flag created');

      return {
        id: newFlag.id,
        flagName: newFlag.flagName,
        isEnabled: newFlag.isEnabled,
        description: newFlag.description,
        rolloutPercentage: newFlag.rolloutPercentage,
        targetUserIds: newFlag.targetUserIds,
        createdAt: (newFlag.createdAt as Date).toISOString(),
        updatedAt: (newFlag.updatedAt as Date).toISOString(),
      };
    } catch (error) {
      app.logger.error({ err: error, flagName }, 'Failed to create feature flag');
      throw error;
    }
  });

  // Admin: Update feature flag
  app.fastify.put('/api/admin/feature-flags/:flagName', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { flagName } = request.params as { flagName: string };
    const {
      isEnabled,
      description,
      rolloutPercentage,
      targetUserIds,
    } = request.body as {
      isEnabled?: boolean;
      description?: string;
      rolloutPercentage?: number;
      targetUserIds?: string[];
    };

    app.logger.info({ userId: session.user.id, flagName }, 'Admin: Updating feature flag');

    try {
      const existingFlag = await app.db.query.featureFlags.findFirst({
        where: eq(schema.featureFlags.flagName, flagName),
      });

      if (!existingFlag) {
        return reply.status(404).send({ error: 'Feature flag not found' });
      }

      const updateData: any = { updatedAt: new Date() };
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
      if (description !== undefined) updateData.description = description;
      if (rolloutPercentage !== undefined) updateData.rolloutPercentage = rolloutPercentage;
      if (targetUserIds !== undefined) updateData.targetUserIds = targetUserIds;

      const [updatedFlag] = await app.db
        .update(schema.featureFlags)
        .set(updateData)
        .where(eq(schema.featureFlags.flagName, flagName))
        .returning();

      app.logger.info({ flagName }, 'Feature flag updated');

      return {
        id: updatedFlag.id,
        flagName: updatedFlag.flagName,
        isEnabled: updatedFlag.isEnabled,
        description: updatedFlag.description,
        rolloutPercentage: updatedFlag.rolloutPercentage,
        targetUserIds: updatedFlag.targetUserIds,
        createdAt: (updatedFlag.createdAt as Date).toISOString(),
        updatedAt: (updatedFlag.updatedAt as Date).toISOString(),
      };
    } catch (error) {
      app.logger.error({ err: error, flagName }, 'Failed to update feature flag');
      throw error;
    }
  });

  // Admin: List all A/B tests
  app.fastify.get('/api/admin/ab-tests', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Admin: Fetching A/B tests');

    try {
      const tests = await app.db.query.abTests.findMany();

      app.logger.info({ testCount: tests.length }, 'A/B tests retrieved');

      return tests.map((test) => ({
        id: test.id,
        testName: test.testName,
        isEnabled: test.isEnabled,
        variants: test.variants,
        description: test.description,
        createdAt: (test.createdAt as Date).toISOString(),
        updatedAt: (test.updatedAt as Date).toISOString(),
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch A/B tests');
      throw error;
    }
  });

  // Admin: Create A/B test
  app.fastify.post('/api/admin/ab-tests', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { testName, isEnabled, variants, description } = request.body as {
      testName: string;
      isEnabled: boolean;
      variants: string[];
      description?: string;
    };

    app.logger.info({ userId: session.user.id, testName }, 'Admin: Creating A/B test');

    try {
      if (!testName || typeof testName !== 'string') {
        return reply.status(400).send({ error: 'testName is required' });
      }

      if (typeof isEnabled !== 'boolean') {
        return reply.status(400).send({ error: 'isEnabled must be a boolean' });
      }

      if (!Array.isArray(variants) || variants.length < 2) {
        return reply.status(400).send({ error: 'variants must be an array with at least 2 variants' });
      }

      const [newTest] = await app.db
        .insert(schema.abTests)
        .values({
          testName,
          isEnabled,
          variants,
          description,
        })
        .returning();

      app.logger.info({ testId: newTest.id, testName }, 'A/B test created');

      return {
        id: newTest.id,
        testName: newTest.testName,
        isEnabled: newTest.isEnabled,
        variants: newTest.variants,
        description: newTest.description,
        createdAt: (newTest.createdAt as Date).toISOString(),
        updatedAt: (newTest.updatedAt as Date).toISOString(),
      };
    } catch (error) {
      app.logger.error({ err: error, testName }, 'Failed to create A/B test');
      throw error;
    }
  });

  // Admin: Update A/B test
  app.fastify.put('/api/admin/ab-tests/:testName', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { testName } = request.params as { testName: string };
    const { isEnabled, variants, description } = request.body as {
      isEnabled?: boolean;
      variants?: string[];
      description?: string;
    };

    app.logger.info({ userId: session.user.id, testName }, 'Admin: Updating A/B test');

    try {
      const existingTest = await app.db.query.abTests.findFirst({
        where: eq(schema.abTests.testName, testName),
      });

      if (!existingTest) {
        return reply.status(404).send({ error: 'A/B test not found' });
      }

      if (variants && (!Array.isArray(variants) || variants.length < 2)) {
        return reply.status(400).send({ error: 'variants must be an array with at least 2 variants' });
      }

      const updateData: any = { updatedAt: new Date() };
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
      if (variants !== undefined) updateData.variants = variants;
      if (description !== undefined) updateData.description = description;

      const [updatedTest] = await app.db
        .update(schema.abTests)
        .set(updateData)
        .where(eq(schema.abTests.testName, testName))
        .returning();

      app.logger.info({ testName }, 'A/B test updated');

      return {
        id: updatedTest.id,
        testName: updatedTest.testName,
        isEnabled: updatedTest.isEnabled,
        variants: updatedTest.variants,
        description: updatedTest.description,
        createdAt: (updatedTest.createdAt as Date).toISOString(),
        updatedAt: (updatedTest.updatedAt as Date).toISOString(),
      };
    } catch (error) {
      app.logger.error({ err: error, testName }, 'Failed to update A/B test');
      throw error;
    }
  });

  // Admin: View A/B test assignments
  app.fastify.get('/api/admin/ab-test-assignments/:testName', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { testName } = request.params as { testName: string };

    app.logger.info(
      { userId: session.user.id, testName },
      'Admin: Fetching A/B test assignments'
    );

    try {
      const assignments = await app.db
        .select()
        .from(schema.abTestAssignments)
        .where(eq(schema.abTestAssignments.testName, testName));

      app.logger.info({ testName, assignmentCount: assignments.length }, 'A/B test assignments retrieved');

      return assignments.map((assignment) => ({
        userId: assignment.userId,
        variant: assignment.variant,
        assignedAt: (assignment.assignedAt as Date).toISOString(),
      }));
    } catch (error) {
      app.logger.error({ err: error, testName }, 'Failed to fetch A/B test assignments');
      throw error;
    }
  });

  // Seed initial feature flags and game config
  app.fastify.post('/api/admin/seed-config', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Admin: Seeding configuration');

    try {
      // Seed feature flags
      const initialFlags = [
        { flagName: 'rankedMode', isEnabled: false, description: 'Enable ranked competitive mode' },
        { flagName: 'aiOpponentDifficulty', isEnabled: false, description: 'Enable AI opponent difficulty levels' },
        { flagName: 'newWordEffects', isEnabled: false, description: 'Enable new word effect categories' },
        { flagName: 'communityChallenges', isEnabled: false, description: 'Enable community-created challenges' },
        { flagName: 'liveMultiplayer', isEnabled: true, description: 'Enable live multiplayer matches' },
        { flagName: 'voiceChat', isEnabled: false, description: 'Enable voice chat in multiplayer' },
        { flagName: 'customBoards', isEnabled: false, description: 'Enable custom board creation' },
        { flagName: 'tournamentMode', isEnabled: false, description: 'Enable tournament mode' },
      ];

      let flagsCreated = 0;
      for (const flagData of initialFlags) {
        const existing = await app.db.query.featureFlags.findFirst({
          where: eq(schema.featureFlags.flagName, flagData.flagName),
        });

        if (!existing) {
          await app.db.insert(schema.featureFlags).values(flagData);
          flagsCreated++;
        }
      }

      // Seed game config
      const existingConfig = await app.db.query.remoteConfig.findFirst({
        where: eq(schema.remoteConfig.configKey, 'game_config'),
      });

      let configCreated = false;
      if (!existingConfig) {
        await app.db.insert(schema.remoteConfig).values({
          configKey: 'game_config',
          configValue: {
            minAppVersion: '1.0.0',
            maxTurnTimeSeconds: 86400,
            dailyChallengeRefreshHour: 8,
            maxActiveGames: 10,
            xpMultipliers: {
              solo: 1.0,
              multiplayer: 1.2,
              dailyChallenge: 1.5,
              specialEvent: 2.0,
            },
          },
          version: 1,
          isActive: true,
        });
        configCreated = true;
      }

      app.logger.info({ flagsCreated, configCreated }, 'Configuration seeding completed');

      return {
        success: true,
        flagsCreated,
        configCreated,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed configuration');
      throw error;
    }
  });
}
