import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { BOARD_LIBRARY } from '../lib/board-library.js';

interface CreateBoardRequest {
  name: string;
  supportedModes: ('Solo' | 'Multiplayer' | 'Both')[];
  gridSize: number;
  initialLayout: Array<Array<{
    type: 'letter' | 'locked' | 'puzzle' | 'objective';
    letter?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  }>>;
  puzzleMode: string;
  winCondition: {
    type: string;
    target: number;
    description: string;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Special';
  tags?: string[];
}

interface UpdateBoardRequest {
  name?: string;
  supportedModes?: ('Solo' | 'Multiplayer' | 'Both')[];
  gridSize?: number;
  initialLayout?: Array<Array<{
    type: 'letter' | 'locked' | 'puzzle' | 'objective';
    letter?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  }>>;
  puzzleMode?: string;
  winCondition?: {
    type: string;
    target: number;
    description: string;
  };
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Special';
  tags?: string[];
  isActive?: boolean;
}

// Validation helpers
function validateGridSize(size: number): boolean {
  return size === 7 || size === 9;
}

function validateInitialLayout(
  layout: Array<Array<unknown>>,
  gridSize: number
): boolean {
  if (!Array.isArray(layout) || layout.length !== gridSize) {
    return false;
  }
  return layout.every(
    (row) =>
      Array.isArray(row) &&
      row.length === gridSize &&
      row.every(
        (tile: any) =>
          tile &&
          typeof tile === 'object' &&
          ['letter', 'locked', 'puzzle', 'objective'].includes(tile.type)
      )
  );
}

function validateSupportedModes(modes: unknown[]): boolean {
  return (
    Array.isArray(modes) &&
    modes.length > 0 &&
    modes.every((mode) => ['Solo', 'Multiplayer', 'Both'].includes(mode as string))
  );
}

function validateDifficulty(difficulty: string): boolean {
  return ['Easy', 'Medium', 'Hard', 'Special'].includes(difficulty);
}

export function registerBoardRoutes(app: App) {
  // Get all active boards with pagination and filters
  app.fastify.get('/api/boards', async (
    request: FastifyRequest<{
      Querystring: {
        mode?: 'Solo' | 'Multiplayer';
        difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Special';
        limit?: string;
        offset?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const { mode, difficulty, limit = '20', offset = '0' } = request.query;

    app.logger.info({ mode, difficulty, limit, offset }, 'Fetching boards');

    try {
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      const filters = [eq(schema.boards.isActive, true)];

      if (difficulty) {
        filters.push(eq(schema.boards.difficulty, difficulty));
      }

      const allBoards = await app.db.query.boards.findMany({
        where: and(...filters),
      });

      // Filter by mode in application code
      const filteredByMode = mode
        ? allBoards.filter(
            (board) =>
              board.supportedModes.includes(mode) || board.supportedModes.includes('Both')
          )
        : allBoards;

      const paginatedBoards = filteredByMode.slice(offsetNum, offsetNum + limitNum);

      const boardsResponse = paginatedBoards.map((board) => ({
        id: board.id,
        name: board.name,
        supportedModes: board.supportedModes,
        gridSize: board.gridSize,
        puzzleMode: board.puzzleMode,
        difficulty: board.difficulty,
        tags: board.tags,
      }));

      app.logger.info(
        { count: boardsResponse.length, total: filteredByMode.length },
        'Boards retrieved'
      );

      return boardsResponse;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch boards');
      throw error;
    }
  });

  // Get specific board by ID
  app.fastify.get('/api/boards/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    app.logger.info({ boardId: id }, 'Fetching board details');

    try {
      const board = await app.db.query.boards.findFirst({
        where: eq(schema.boards.id, id as any),
      });

      if (!board) {
        app.logger.warn({ boardId: id }, 'Board not found');
        return reply.code(404).send({ error: 'Board not found' });
      }

      app.logger.info({ boardId: id }, 'Board details retrieved');

      return {
        id: board.id,
        name: board.name,
        supportedModes: board.supportedModes,
        gridSize: board.gridSize,
        initialLayout: board.initialLayout,
        puzzleMode: board.puzzleMode,
        winCondition: board.winCondition,
        difficulty: board.difficulty,
        tags: board.tags,
        createdAt: board.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, boardId: id }, 'Failed to fetch board details');
      throw error;
    }
  });

  // Create a new board (admin only for now)
  app.fastify.post('/api/boards', async (
    request: FastifyRequest<{ Body: CreateBoardRequest }>,
    reply: FastifyReply
  ) => {
    const { name, supportedModes, gridSize, initialLayout, puzzleMode, winCondition, difficulty, tags } =
      request.body;

    app.logger.info({ name, difficulty }, 'Creating new board');

    try {
      // Validate inputs
      if (!name || typeof name !== 'string') {
        return reply.code(400).send({ error: 'Board name is required and must be a string' });
      }

      if (!validateSupportedModes(supportedModes)) {
        return reply.code(400).send({
          error: 'supportedModes must be an array containing at least one of: Solo, Multiplayer, Both',
        });
      }

      if (!validateGridSize(gridSize)) {
        return reply.code(400).send({ error: 'gridSize must be either 7 or 9' });
      }

      if (!validateInitialLayout(initialLayout, gridSize)) {
        return reply.code(400).send({
          error: `initialLayout must be a ${gridSize}x${gridSize} 2D array with valid tile objects`,
        });
      }

      if (!validateDifficulty(difficulty)) {
        return reply.code(400).send({
          error: 'difficulty must be one of: Easy, Medium, Hard, Special',
        });
      }

      if (!winCondition || typeof winCondition !== 'object' || !winCondition.type || winCondition.target === undefined) {
        return reply
          .code(400)
          .send({ error: 'winCondition must have type, target, and description' });
      }

      const [newBoard] = await app.db
        .insert(schema.boards)
        .values({
          name,
          supportedModes,
          gridSize,
          initialLayout,
          puzzleMode,
          winCondition,
          difficulty,
          tags: tags || [],
        })
        .returning();

      app.logger.info({ boardId: newBoard.id, name }, 'Board created successfully');

      return {
        id: newBoard.id,
        name: newBoard.name,
        supportedModes: newBoard.supportedModes,
        gridSize: newBoard.gridSize,
        initialLayout: newBoard.initialLayout,
        puzzleMode: newBoard.puzzleMode,
        winCondition: newBoard.winCondition,
        difficulty: newBoard.difficulty,
        tags: newBoard.tags,
        createdAt: newBoard.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, name }, 'Failed to create board');
      throw error;
    }
  });

  // Update an existing board (admin only for now)
  app.fastify.put('/api/boards/:id', async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBoardRequest }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const { name, supportedModes, gridSize, initialLayout, puzzleMode, winCondition, difficulty, tags, isActive } =
      request.body;

    app.logger.info({ boardId: id }, 'Updating board');

    try {
      // Get existing board
      const existingBoard = await app.db.query.boards.findFirst({
        where: eq(schema.boards.id, id as any),
      });

      if (!existingBoard) {
        app.logger.warn({ boardId: id }, 'Board not found');
        return reply.code(404).send({ error: 'Board not found' });
      }

      // Validate updates if provided
      if (supportedModes !== undefined && !validateSupportedModes(supportedModes)) {
        return reply.code(400).send({
          error: 'supportedModes must be an array containing at least one of: Solo, Multiplayer, Both',
        });
      }

      if (gridSize !== undefined && !validateGridSize(gridSize)) {
        return reply.code(400).send({ error: 'gridSize must be either 7 or 9' });
      }

      const layoutToValidate = initialLayout || existingBoard.initialLayout;
      const sizeToValidate = gridSize || existingBoard.gridSize;

      if (initialLayout && !validateInitialLayout(initialLayout, sizeToValidate)) {
        return reply.code(400).send({
          error: `initialLayout must be a ${sizeToValidate}x${sizeToValidate} 2D array with valid tile objects`,
        });
      }

      if (difficulty !== undefined && !validateDifficulty(difficulty)) {
        return reply.code(400).send({
          error: 'difficulty must be one of: Easy, Medium, Hard, Special',
        });
      }

      if (
        winCondition &&
        (typeof winCondition !== 'object' || !winCondition.type || winCondition.target === undefined)
      ) {
        return reply.code(400).send({ error: 'winCondition must have type, target, and description' });
      }

      const updateData: any = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (supportedModes !== undefined) updateData.supportedModes = supportedModes;
      if (gridSize !== undefined) updateData.gridSize = gridSize;
      if (initialLayout !== undefined) updateData.initialLayout = initialLayout;
      if (puzzleMode !== undefined) updateData.puzzleMode = puzzleMode;
      if (winCondition !== undefined) updateData.winCondition = winCondition;
      if (difficulty !== undefined) updateData.difficulty = difficulty;
      if (tags !== undefined) updateData.tags = tags;
      if (isActive !== undefined) updateData.isActive = isActive;

      const [updatedBoard] = await app.db
        .update(schema.boards)
        .set(updateData)
        .where(eq(schema.boards.id, id as any))
        .returning();

      app.logger.info({ boardId: id }, 'Board updated successfully');

      return {
        id: updatedBoard.id,
        name: updatedBoard.name,
        supportedModes: updatedBoard.supportedModes,
        gridSize: updatedBoard.gridSize,
        initialLayout: updatedBoard.initialLayout,
        puzzleMode: updatedBoard.puzzleMode,
        winCondition: updatedBoard.winCondition,
        difficulty: updatedBoard.difficulty,
        tags: updatedBoard.tags,
        createdAt: updatedBoard.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, boardId: id }, 'Failed to update board');
      throw error;
    }
  });

  // Soft delete a board
  app.fastify.delete('/api/boards/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    app.logger.info({ boardId: id }, 'Deleting board');

    try {
      const existingBoard = await app.db.query.boards.findFirst({
        where: eq(schema.boards.id, id as any),
      });

      if (!existingBoard) {
        app.logger.warn({ boardId: id }, 'Board not found');
        return reply.code(404).send({ error: 'Board not found' });
      }

      await app.db
        .update(schema.boards)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schema.boards.id, id as any));

      app.logger.info({ boardId: id }, 'Board deleted successfully');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, boardId: id }, 'Failed to delete board');
      throw error;
    }
  });

  // Get a random board
  app.fastify.get('/api/boards/random', async (
    request: FastifyRequest<{
      Querystring: {
        mode?: 'Solo' | 'Multiplayer';
        difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Special';
      };
    }>,
    reply: FastifyReply
  ) => {
    const { mode, difficulty } = request.query;

    app.logger.info({ mode, difficulty }, 'Fetching random board');

    try {
      const filters = [eq(schema.boards.isActive, true)];

      if (difficulty) {
        filters.push(eq(schema.boards.difficulty, difficulty));
      }

      const allBoards = await app.db.query.boards.findMany({
        where: and(...filters),
      });

      // Filter by mode in application code
      const filteredByMode = mode
        ? allBoards.filter(
            (board) =>
              board.supportedModes.includes(mode) || board.supportedModes.includes('Both')
          )
        : allBoards;

      if (filteredByMode.length === 0) {
        app.logger.warn({ mode, difficulty }, 'No boards found matching criteria');
        return reply.code(404).send({ error: 'No boards found matching the criteria' });
      }

      const randomBoard = filteredByMode[Math.floor(Math.random() * filteredByMode.length)];

      app.logger.info({ boardId: randomBoard.id }, 'Random board retrieved');

      return {
        id: randomBoard.id,
        name: randomBoard.name,
        supportedModes: randomBoard.supportedModes,
        gridSize: randomBoard.gridSize,
        initialLayout: randomBoard.initialLayout,
        puzzleMode: randomBoard.puzzleMode,
        winCondition: randomBoard.winCondition,
        difficulty: randomBoard.difficulty,
        tags: randomBoard.tags,
        createdAt: randomBoard.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch random board');
      throw error;
    }
  });

  // Seed database with all production boards from board library
  app.fastify.post('/api/boards/seed', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    app.logger.info({}, 'Seeding boards database with production board library');

    try {
      // Get existing boards by name to prevent duplicates
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
        success: true,
        boardsCreated: created,
        message: `Seeded ${created} new boards from production library (${skipped} already existed)`,
        total,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed boards');
      throw error;
    }
  });
}
