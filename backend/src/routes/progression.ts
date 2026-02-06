import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

// Level unlock system - defines unlocks at specific levels
const LEVEL_UNLOCKS: Record<
  number,
  Array<{ type: 'cosmetic' | 'title' | 'badge'; id: string; name: string }>
> = {
  2: [{ type: 'cosmetic', id: 'ocean_blue_skin', name: 'Ocean Blue Board Skin' }],
  3: [{ type: 'title', id: 'word_apprentice', name: 'Word Apprentice' }],
  5: [{ type: 'cosmetic', id: 'forest_green_skin', name: 'Forest Green Board Skin' }],
  7: [{ type: 'title', id: 'puzzle_solver', name: 'Puzzle Solver' }],
  10: [
    { type: 'cosmetic', id: 'sunset_orange_skin', name: 'Sunset Orange Board Skin' },
    { type: 'badge', id: 'veteran_badge', name: 'Veteran Badge' },
  ],
  15: [{ type: 'title', id: 'word_master', name: 'Word Master' }],
  20: [
    { type: 'cosmetic', id: 'midnight_purple_skin', name: 'Midnight Purple Board Skin' },
    { type: 'badge', id: 'elite_badge', name: 'Elite Badge' },
  ],
  25: [{ type: 'title', id: 'grandmaster', name: 'Grandmaster' }],
  30: [
    { type: 'cosmetic', id: 'golden_glow_skin', name: 'Golden Glow Board Skin' },
    { type: 'badge', id: 'legend_badge', name: 'Legend Badge' },
  ],
};

// Helper function to calculate level from XP
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

// Helper function to calculate XP needed for next level
function calculateXpToNextLevel(currentXp: number, currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  const xpForNextLevel = nextLevel * nextLevel * 100;
  return Math.max(0, xpForNextLevel - currentXp);
}

// Helper function to get unlocks for a level range
function getUnlocksForLevelRange(
  oldLevel: number,
  newLevel: number
): Array<{ type: 'cosmetic' | 'title' | 'badge'; id: string; name: string }> {
  const unlockedItems: Array<{ type: 'cosmetic' | 'title' | 'badge'; id: string; name: string }> = [];

  for (let level = oldLevel + 1; level <= newLevel; level++) {
    if (LEVEL_UNLOCKS[level]) {
      unlockedItems.push(...LEVEL_UNLOCKS[level]);
    }
  }

  return unlockedItems;
}

export function registerProgressionRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Award XP to the authenticated user
  app.fastify.post('/api/player/progress/award-xp', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { xp, source, gameId } = request.body as {
      xp: number;
      source: 'solo' | 'multiplayer' | 'dailyChallenge' | 'specialEvent';
      gameId?: string;
    };

    app.logger.info(
      { userId: session.user.id, xp, source, gameId },
      'Awarding XP to player'
    );

    try {
      // Get current player stats
      const playerStats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (!playerStats) {
        app.logger.warn({ userId: session.user.id }, 'Player stats not found');
        return reply.status(404).send({ error: 'Player stats not found' });
      }

      const oldLevel = calculateLevel(playerStats.experiencePoints);
      const newXp = playerStats.experiencePoints + xp;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel > oldLevel;

      // Update player stats
      await app.db
        .update(schema.playerStats)
        .set({
          experiencePoints: newXp,
          level: newLevel,
        })
        .where(eq(schema.playerStats.userId, session.user.id));

      app.logger.debug(
        { userId: session.user.id, oldLevel, newLevel, newXp },
        'Player stats updated'
      );

      // Check for new unlocks if leveled up
      let newUnlocks: Array<{ type: string; id: string; name: string }> = [];

      if (leveledUp) {
        const unlocksToAdd = getUnlocksForLevelRange(oldLevel, newLevel);

        for (const unlock of unlocksToAdd) {
          try {
            await app.db.insert(schema.playerUnlocks).values({
              userId: session.user.id,
              unlockType: unlock.type,
              unlockId: unlock.id,
            });

            newUnlocks.push(unlock);
            app.logger.debug(
              { userId: session.user.id, unlockId: unlock.id },
              'Unlock granted'
            );
          } catch (error) {
            app.logger.warn(
              { err: error, userId: session.user.id, unlockId: unlock.id },
              'Unlock already exists or error occurred'
            );
          }
        }
      }

      const xpToNextLevel = calculateXpToNextLevel(newXp, newLevel);

      app.logger.info(
        { userId: session.user.id, newLevel, newXp, leveledUp, unlocksCount: newUnlocks.length },
        'XP awarded successfully'
      );

      return {
        newXp,
        newLevel,
        leveledUp,
        newUnlocks,
        xpToNextLevel,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to award XP');
      throw error;
    }
  });

  // Get current player progression data
  app.fastify.get('/api/player/progress', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching player progression');

    try {
      // Get player stats
      const playerStats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (!playerStats) {
        app.logger.warn({ userId: session.user.id }, 'Player stats not found');
        return reply.status(404).send({ error: 'Player stats not found' });
      }

      // Get player unlocks
      const unlocks = await app.db.query.playerUnlocks.findMany({
        where: eq(schema.playerUnlocks.userId, session.user.id),
      });

      // Get player achievements
      const achievements = await app.db.query.playerAchievements.findMany({
        where: eq(schema.playerAchievements.userId, session.user.id),
      });

      const unlockedCosmetics = unlocks
        .filter((u) => u.unlockType === 'cosmetic')
        .map((u) => u.unlockId);
      const unlockedTitles = unlocks
        .filter((u) => u.unlockType === 'title')
        .map((u) => u.unlockId);
      const unlockedBadges = unlocks
        .filter((u) => u.unlockType === 'badge')
        .map((u) => u.unlockId);

      const xpToNextLevel = calculateXpToNextLevel(
        playerStats.experiencePoints,
        playerStats.level
      );

      app.logger.info(
        { userId: session.user.id, level: playerStats.level, unlocksCount: unlocks.length },
        'Player progression retrieved'
      );

      return {
        level: playerStats.level,
        xp: playerStats.experiencePoints,
        xpToNextLevel,
        unlockedCosmetics,
        unlockedTitles,
        unlockedBadges,
        achievements: achievements.map((a) => ({
          id: a.achievementId,
          name: a.achievementName,
          description: a.achievementDescription,
          unlockedAt: a.unlockedAt.toISOString(),
          rewardXp: a.rewardXp,
          rewardCosmeticId: a.rewardCosmeticId,
        })),
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch progression');
      throw error;
    }
  });

  // Unlock an achievement
  app.fastify.post('/api/player/achievements/unlock', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const {
      achievementId,
      achievementName,
      achievementDescription,
      rewardXp,
      rewardCosmeticId,
    } = request.body as {
      achievementId: string;
      achievementName: string;
      achievementDescription: string;
      rewardXp: number;
      rewardCosmeticId?: string;
    };

    app.logger.info(
      { userId: session.user.id, achievementId, rewardXp },
      'Unlocking achievement'
    );

    try {
      // Check if achievement already unlocked
      const existingAchievement = await app.db.query.playerAchievements.findFirst({
        where: and(
          eq(schema.playerAchievements.userId, session.user.id),
          eq(schema.playerAchievements.achievementId, achievementId)
        ),
      });

      if (existingAchievement) {
        app.logger.warn({ userId: session.user.id, achievementId }, 'Achievement already unlocked');
        return reply.status(400).send({ error: 'Achievement already unlocked' });
      }

      // Get current player stats
      const playerStats = await app.db.query.playerStats.findFirst({
        where: eq(schema.playerStats.userId, session.user.id),
      });

      if (!playerStats) {
        app.logger.warn({ userId: session.user.id }, 'Player stats not found');
        return reply.status(404).send({ error: 'Player stats not found' });
      }

      const oldLevel = playerStats.level;

      // Award achievement XP
      const newXp = playerStats.experiencePoints + rewardXp;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel > oldLevel;

      // Insert achievement
      await app.db.insert(schema.playerAchievements).values({
        userId: session.user.id,
        achievementId,
        achievementName,
        achievementDescription,
        rewardXp,
        rewardCosmeticId,
      });

      // Update player stats
      await app.db
        .update(schema.playerStats)
        .set({
          experiencePoints: newXp,
          level: newLevel,
        })
        .where(eq(schema.playerStats.userId, session.user.id));

      app.logger.debug(
        { userId: session.user.id, oldLevel, newLevel, newXp },
        'Player stats updated with achievement XP'
      );

      // Check for new unlocks from level up
      let newUnlocks: Array<{ type: string; id: string; name: string }> = [];

      if (leveledUp) {
        const unlocksToAdd = getUnlocksForLevelRange(oldLevel, newLevel);

        for (const unlock of unlocksToAdd) {
          try {
            await app.db.insert(schema.playerUnlocks).values({
              userId: session.user.id,
              unlockType: unlock.type,
              unlockId: unlock.id,
            });

            newUnlocks.push(unlock);
            app.logger.debug(
              { userId: session.user.id, unlockId: unlock.id },
              'Unlock granted from achievement level up'
            );
          } catch (error) {
            app.logger.warn(
              { err: error, userId: session.user.id, unlockId: unlock.id },
              'Unlock already exists or error occurred'
            );
          }
        }
      }

      app.logger.info(
        { userId: session.user.id, achievementId, newLevel, leveledUp },
        'Achievement unlocked'
      );

      return {
        success: true,
        achievement: {
          id: achievementId,
          name: achievementName,
          description: achievementDescription,
          rewardXp,
          rewardCosmeticId,
        },
        newXp,
        newLevel,
        leveledUp,
        newUnlocks,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to unlock achievement');
      throw error;
    }
  });

  // Get all achievements for the user
  app.fastify.get('/api/player/achievements', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching player achievements');

    try {
      const achievements = await app.db.query.playerAchievements.findMany({
        where: eq(schema.playerAchievements.userId, session.user.id),
      });

      app.logger.info(
        { userId: session.user.id, achievementsCount: achievements.length },
        'Player achievements retrieved'
      );

      return achievements.map((a) => ({
        id: a.achievementId,
        name: a.achievementName,
        description: a.achievementDescription,
        unlockedAt: a.unlockedAt.toISOString(),
        rewardXp: a.rewardXp,
        rewardCosmeticId: a.rewardCosmeticId,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch achievements');
      throw error;
    }
  });
}
