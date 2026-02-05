import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { BOARD_LIBRARY } from '../lib/board-library.js';

export function registerBoardManagementRoutes(app: App) {
  // Seed production board library
  app.fastify.post('/api/boards/seed-production', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Starting production board library seed');

    try {
      // Get existing boards by name
      const existingBoards = await app.db.query.boards.findMany();
      const existingNames = new Set(existingBoards.map((b) => b.name));

      let created = 0;
      let skipped = 0;

      // Seed each board from the library
      for (const boardData of BOARD_LIBRARY) {
        if (existingNames.has(boardData.name)) {
          skipped++;
          app.logger.debug({ boardName: boardData.name }, 'Board already exists, skipping');
          continue;
        }

        try {
          await app.db.insert(schema.boards).values({
            name: boardData.name,
            supportedModes: boardData.supportedModes,
            gridSize: boardData.gridSize,
            initialLayout: boardData.initialLayout as any,
            puzzleMode: boardData.puzzleMode,
            winCondition: boardData.winCondition as any,
            difficulty: boardData.difficulty,
            tags: boardData.tags,
            isActive: true,
          });

          created++;
          app.logger.debug({ boardName: boardData.name }, 'Board created');
        } catch (error) {
          app.logger.error(
            { err: error, boardName: boardData.name },
            'Failed to create board'
          );
          // Continue with next board
        }
      }

      const total = BOARD_LIBRARY.length;

      app.logger.info(
        { created, skipped, total },
        'Production board library seed completed'
      );

      return {
        message: `Seeded production board library: ${created} new boards created, ${skipped} existing boards skipped`,
        created,
        skipped,
        total,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed production board library');
      throw error;
    }
  });

  // Get board library statistics
  app.fastify.get('/api/boards/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Fetching board statistics');

    try {
      const boards = await app.db.query.boards.findMany({
        where: eq(schema.boards.isActive, true),
      });

      // Calculate statistics
      const byDifficulty = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
        Special: 0,
      };

      const byMode = {
        Solo: 0,
        Multiplayer: 0,
        Both: 0,
      };

      const byPuzzleMode: Record<string, number> = {};
      const byGridSize = {
        '7x7': 0,
        '9x9': 0,
      };

      for (const board of boards) {
        // Count by difficulty
        byDifficulty[board.difficulty as keyof typeof byDifficulty]++;

        // Count by mode
        const modes = board.supportedModes as string[];
        if (
          modes.includes('Solo') &&
          modes.includes('Multiplayer')
        ) {
          byMode.Both++;
        } else if (modes.includes('Solo')) {
          byMode.Solo++;
        } else if (modes.includes('Multiplayer')) {
          byMode.Multiplayer++;
        }

        // Count by puzzle mode
        const puzzleMode = board.puzzleMode as string;
        byPuzzleMode[puzzleMode] =
          (byPuzzleMode[puzzleMode] || 0) + 1;

        // Count by grid size
        if (board.gridSize === 7) {
          byGridSize['7x7']++;
        } else if (board.gridSize === 9) {
          byGridSize['9x9']++;
        }
      }

      app.logger.info(
        { total: boards.length, byDifficulty, byMode },
        'Board statistics retrieved'
      );

      return {
        total: boards.length,
        byDifficulty,
        byMode,
        byPuzzleMode,
        byGridSize,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch board statistics');
      throw error;
    }
  });
}
