/**
 * Production board library for VERBLOC
 * Contains 70+ hand-designed boards organized by difficulty
 */

export type BoardTile = {
  type: 'letter' | 'locked' | 'puzzle' | 'objective';
  letter?: string;
  value?: number;
  metadata?: Record<string, unknown>;
};

export type SupportedModes = 'Solo' | 'Multiplayer' | 'Both';
export type PuzzleMode = 'score_target' | 'vault_break' | 'hidden_phrase' | 'territory_control';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Special';

export interface Board {
  name: string;
  supportedModes: SupportedModes[];
  gridSize: 7 | 9;
  initialLayout: BoardTile[][];
  puzzleMode: PuzzleMode;
  winCondition: {
    type: string;
    target?: number;
    description: string;
    targetPhrase?: string;
    targetControlPercentage?: number;
    requiredVaultTiles?: number;
    targetEfficiency?: number;
    turnLimit?: number;
  };
  difficulty: Difficulty;
  tags: string[];
}

// Helper functions to create layouts
function createEmptyLayout(size: 7 | 9): BoardTile[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill({ type: 'letter' }));
}

function createLayoutWithLocked(size: 7 | 9, lockedCount: number): BoardTile[][] {
  const layout = createEmptyLayout(size);
  let locked = 0;

  for (let i = 0; i < size && locked < lockedCount; i++) {
    for (let j = 0; j < size && locked < lockedCount; j++) {
      if (Math.random() < 0.3) {
        layout[i][j] = { type: 'locked' };
        locked++;
      }
    }
  }

  return layout;
}

function createLayoutWithVaults(size: 7 | 9, vaultCount: number): BoardTile[][] {
  const layout = createEmptyLayout(size);
  let vaults = 0;

  for (let i = 0; i < size && vaults < vaultCount; i++) {
    for (let j = 0; j < size && vaults < vaultCount; j++) {
      if (Math.random() < 0.25) {
        layout[i][j] = { type: 'puzzle', metadata: { vaultId: vaults } };
        vaults++;
      }
    }
  }

  return layout;
}

function createLayoutWithFog(size: 7 | 9): BoardTile[][] {
  const layout = createEmptyLayout(size);

  // Cover some area with fog
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (Math.random() < 0.2) {
        layout[i][j] = { type: 'objective', metadata: { foggy: true } };
      }
    }
  }

  return layout;
}

function createLayoutWithTerritory(size: 7 | 9): BoardTile[][] {
  const layout = createEmptyLayout(size);

  // Divide into territories
  const mid = Math.floor(size / 2);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if ((i < mid && j < mid) || (i >= mid && j >= mid)) {
        layout[i][j] = {
          type: 'objective',
          metadata: { territory: i < mid && j < mid ? 'A' : 'B' },
        };
      }
    }
  }

  return layout;
}

export const BOARD_LIBRARY: Board[] = [
  // ===== EASY BOARDS (20 boards) =====
  // Designed for onboarding and casual play
  // Fewer locked tiles, minimal board movement, clear progress feedback

  {
    name: 'First Steps',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 400, description: 'Reach 400 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['beginner', 'onboarding'],
  },
  {
    name: 'Garden Path',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 450, description: 'Reach 450 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['casual', 'daily'],
  },
  {
    name: 'Morning Breeze',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 2),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 425, description: 'Reach 425 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['beginner', 'relaxing'],
  },
  {
    name: 'Sunny Meadow',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 500, description: 'Reach 500 points', turnLimit: 17 },
    difficulty: 'Easy',
    tags: ['casual', 'multiplayer-friendly'],
  },
  {
    name: 'Gentle Stream',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 1),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 475, description: 'Reach 475 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['beginner', 'daily'],
  },
  {
    name: 'Pebble Beach',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 450, description: 'Reach 450 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['relaxing', 'beginner'],
  },
  {
    name: 'Butterfly Garden',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 2),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 500, description: 'Reach 500 points', turnLimit: 18 },
    difficulty: 'Easy',
    tags: ['casual', 'daily'],
  },
  {
    name: 'Dewdrop Morning',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 425, description: 'Reach 425 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['beginner', 'relaxing'],
  },
  {
    name: 'Clover Field',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 1),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 475, description: 'Reach 475 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['casual', 'daily'],
  },
  {
    name: 'Daisy Chain',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 500, description: 'Reach 500 points', turnLimit: 17 },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer-friendly'],
  },
  {
    name: 'Pond Ripples',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 2),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 450, description: 'Reach 450 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['relaxing', 'daily'],
  },
  {
    name: 'Seedling Sprout',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 425, description: 'Reach 425 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['casual', 'beginner'],
  },
  {
    name: 'Blossom Trail',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 1),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 475, description: 'Reach 475 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['daily', 'relaxing'],
  },
  {
    name: 'Raindrop Rhythm',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 500, description: 'Reach 500 points', turnLimit: 18 },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer-friendly'],
  },
  {
    name: 'Leaf Whisper',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 2),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 425, description: 'Reach 425 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['casual', 'daily'],
  },
  {
    name: 'Petal Dance',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 475, description: 'Reach 475 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['relaxing', 'beginner'],
  },
  {
    name: 'Sunrise Glow',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 1),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 450, description: 'Reach 450 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['daily', 'casual'],
  },
  {
    name: 'Honeycomb Haven',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 500, description: 'Reach 500 points', turnLimit: 17 },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer-friendly'],
  },
  {
    name: 'Willow Breeze',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 2),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 475, description: 'Reach 475 points', turnLimit: 16 },
    difficulty: 'Easy',
    tags: ['relaxing', 'daily'],
  },
  {
    name: 'Starlight Path',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 425, description: 'Reach 425 points', turnLimit: 15 },
    difficulty: 'Easy',
    tags: ['casual', 'beginner'],
  },

  // ===== MEDIUM BOARDS (25 boards) =====
  // Introduce board rotation or shifting, multiple puzzle elements
  // Require planning and timing

  {
    name: 'Mountain Pass',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 4),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 800, description: 'Reach 800 points', turnLimit: 20 },
    difficulty: 'Medium',
    tags: ['challenge', 'planning'],
  },
  {
    name: 'River Crossing',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 3),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 850, description: 'Reach 850 points', turnLimit: 22 },
    difficulty: 'Medium',
    tags: ['challenge', 'planning'],
  },
  {
    name: 'Crystal Cave',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, 3),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 3,
      description: 'Break 3 vaults',
      turnLimit: 23,
    },
    difficulty: 'Medium',
    tags: ['vault', 'puzzle'],
  },
  {
    name: 'Foggy Forest',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 800, description: 'Reach 800 points', turnLimit: 21 },
    difficulty: 'Medium',
    tags: ['exploration', 'puzzle'],
  },
  {
    name: 'Desert Oasis',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 5),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 900, description: 'Reach 900 points', turnLimit: 23 },
    difficulty: 'Medium',
    tags: ['challenge', 'strategy'],
  },
  {
    name: 'Thunderstorm',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 4),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 850, description: 'Reach 850 points', turnLimit: 22 },
    difficulty: 'Medium',
    tags: ['challenging', 'fast-paced'],
  },
  {
    name: 'Coral Reef',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, 2),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 2,
      description: 'Break 2 vaults',
      turnLimit: 20,
    },
    difficulty: 'Medium',
    tags: ['puzzle', 'vault'],
  },
  {
    name: 'Ancient Ruins',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 3),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 875, description: 'Reach 875 points', turnLimit: 21 },
    difficulty: 'Medium',
    tags: ['exploration', 'challenge'],
  },
  {
    name: 'Misty Valley',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 800, description: 'Reach 800 points', turnLimit: 22 },
    difficulty: 'Medium',
    tags: ['exploration', 'strategy'],
  },
  {
    name: 'Battlefield',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithTerritory(7),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 60,
      description: 'Control 60% of the board',
      turnLimit: 25,
    },
    difficulty: 'Medium',
    tags: ['competitive', 'strategy'],
  },
  {
    name: 'Spiral Galaxy',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 4),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 850, description: 'Reach 850 points', turnLimit: 20 },
    difficulty: 'Medium',
    tags: ['challenge', 'planning'],
  },
  {
    name: 'Frozen Lake',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 5),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 875, description: 'Reach 875 points', turnLimit: 23 },
    difficulty: 'Medium',
    tags: ['challenging', 'puzzle'],
  },
  {
    name: 'Treasure Hunt',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, 3),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 3,
      description: 'Find all treasures',
      turnLimit: 24,
    },
    difficulty: 'Medium',
    tags: ['exploration', 'vault'],
  },
  {
    name: 'Shadow Realm',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 825, description: 'Reach 825 points', turnLimit: 21 },
    difficulty: 'Medium',
    tags: ['mysterious', 'puzzle'],
  },
  {
    name: 'Volcano Crater',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 6),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 900, description: 'Reach 900 points', turnLimit: 24 },
    difficulty: 'Medium',
    tags: ['challenging', 'fast-paced'],
  },
  {
    name: 'Windmill Fields',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 3),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 800, description: 'Reach 800 points', turnLimit: 20 },
    difficulty: 'Medium',
    tags: ['challenge', 'planning'],
  },
  {
    name: 'Labyrinth Entrance',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, 4),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 850, description: 'Reach 850 points', turnLimit: 21 },
    difficulty: 'Medium',
    tags: ['exploration', 'strategy'],
  },
  {
    name: 'Moonlit Grove',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, 2),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 2,
      description: 'Unlock secrets',
      turnLimit: 22,
    },
    difficulty: 'Medium',
    tags: ['mysterious', 'vault'],
  },
  {
    name: 'Cloudy Skies',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 875, description: 'Reach 875 points', turnLimit: 23 },
    difficulty: 'Medium',
    tags: ['exploration', 'challenge'],
  },
  {
    name: 'Arena Center',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithTerritory(7),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 65,
      description: 'Dominate the arena',
      turnLimit: 25,
    },
    difficulty: 'Medium',
    tags: ['competitive', 'strategy'],
  },
  {
    name: 'Pyramid Chambers',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 5),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1200, description: 'Reach 1200 points', turnLimit: 24 },
    difficulty: 'Medium',
    tags: ['exploration', 'large-grid'],
  },
  {
    name: 'Tidal Pools',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 3),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 3,
      description: 'Explore tide pools',
      turnLimit: 23,
    },
    difficulty: 'Medium',
    tags: ['puzzle', 'vault', 'large-grid'],
  },
  {
    name: 'Enchanted Forest',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithFog(9),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1100, description: 'Reach 1100 points', turnLimit: 22 },
    difficulty: 'Medium',
    tags: ['exploration', 'strategy', 'large-grid'],
  },
  {
    name: 'Twilight Zone',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 6),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1150, description: 'Reach 1150 points', turnLimit: 24 },
    difficulty: 'Medium',
    tags: ['challenging', 'large-grid'],
  },
  {
    name: 'Fortress Walls',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithTerritory(9),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 60,
      description: 'Fortify your position',
      turnLimit: 26,
    },
    difficulty: 'Medium',
    tags: ['strategy', 'large-grid'],
  },

  // ===== HARD BOARDS (15 boards) =====
  // Multiple simultaneous puzzle mechanics
  // Aggressive board changes, punish inefficient choices
  // Designed for mastery and replay

  {
    name: "Dragon's Lair",
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 8),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1600, description: 'Reach 1600 points', turnLimit: 28 },
    difficulty: 'Hard',
    tags: ['expert', 'challenging'],
  },
  {
    name: 'Vault Fortress',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 5),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 5,
      description: 'Break all vaults',
      turnLimit: 30,
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault'],
  },
  {
    name: 'Phantom Maze',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithFog(9),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1550, description: 'Reach 1550 points', turnLimit: 29 },
    difficulty: 'Hard',
    tags: ['exploration', 'expert'],
  },
  {
    name: 'War Zone',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithTerritory(9),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 75,
      description: 'Dominate the war zone',
      turnLimit: 32,
    },
    difficulty: 'Hard',
    tags: ['competitive', 'expert'],
  },
  {
    name: 'Obsidian Spire',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 10),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1650, description: 'Reach 1650 points', turnLimit: 31 },
    difficulty: 'Hard',
    tags: ['expert', 'challenging'],
  },
  {
    name: 'Treasure Vault',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 4),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 4,
      description: 'Secure the treasure',
      turnLimit: 28,
    },
    difficulty: 'Hard',
    tags: ['vault', 'expert'],
  },
  {
    name: 'Eternal Fog',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithFog(9),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1600, description: 'Reach 1600 points', turnLimit: 30 },
    difficulty: 'Hard',
    tags: ['exploration', 'challenging'],
  },
  {
    name: 'Empire Clash',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithTerritory(9),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 80,
      description: 'Rule the empire',
      turnLimit: 33,
    },
    difficulty: 'Hard',
    tags: ['competitive', 'expert'],
  },
  {
    name: 'Chaos Grid',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 12),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1700, description: 'Reach 1700 points', turnLimit: 32 },
    difficulty: 'Hard',
    tags: ['challenging', 'expert'],
  },
  {
    name: 'Vault Labyrinth',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 6),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 6,
      description: 'Navigate the labyrinth',
      turnLimit: 34,
    },
    difficulty: 'Hard',
    tags: ['vault', 'exploration'],
  },
  {
    name: 'Shadow Kingdom',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 9),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1550, description: 'Reach 1550 points', turnLimit: 28 },
    difficulty: 'Hard',
    tags: ['mysterious', 'expert'],
  },
  {
    name: 'Total Domination',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithTerritory(9),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 85,
      description: 'Total domination',
      turnLimit: 35,
    },
    difficulty: 'Hard',
    tags: ['competitive', 'ultimate'],
  },
  {
    name: 'Inferno Gauntlet',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 11),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1700, description: 'Reach 1700 points', turnLimit: 33 },
    difficulty: 'Hard',
    tags: ['expert', 'challenging'],
  },
  {
    name: 'Ultimate Vault',
    supportedModes: ['Solo', 'Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 7),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 7,
      description: 'Open the ultimate vault',
      turnLimit: 35,
    },
    difficulty: 'Hard',
    tags: ['vault', 'ultimate'],
  },
  {
    name: 'Nightmare Realm',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithFog(9),
    puzzleMode: 'score_target',
    winCondition: { type: 'score', target: 1650, description: 'Reach 1650 points', turnLimit: 31 },
    difficulty: 'Hard',
    tags: ['exploration', 'ultimate'],
  },

  // ===== SPECIAL BOARDS (10 boards) =====
  // Experimental rule sets, event-specific mechanics
  // Designed to surprise experienced players

  {
    name: 'Daily Sprint',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score',
      target: 700,
      description: 'Quick challenge - 500 points',
      turnLimit: 12,
    },
    difficulty: 'Special',
    tags: ['special', 'daily', 'timed'],
  },
  {
    name: 'Vault Marathon',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 8),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 8,
      description: 'Break all vaults in marathon mode',
      turnLimit: 45,
    },
    difficulty: 'Special',
    tags: ['special', 'vault', 'endurance'],
  },
  {
    name: 'Fog Rush',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score',
      target: 600,
      description: 'Navigate fog quickly',
      turnLimit: 14,
    },
    difficulty: 'Special',
    tags: ['special', 'exploration', 'timed'],
  },
  {
    name: 'Territory Blitz',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithTerritory(7),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 70,
      description: 'Control territory in record time',
      turnLimit: 15,
    },
    difficulty: 'Special',
    tags: ['special', 'competitive', 'timed'],
  },
  {
    name: 'Perfect Score',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score',
      target: 1000,
      description: 'Achieve perfect score efficiency',
      turnLimit: 20,
    },
    difficulty: 'Special',
    tags: ['special', 'challenge', 'daily'],
  },
  {
    name: 'Vault Speedrun',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, 4),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 4,
      description: 'Speed run vault challenge',
      turnLimit: 12,
    },
    difficulty: 'Special',
    tags: ['special', 'vault', 'speedrun'],
  },
  {
    name: 'Fog Blitz',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score',
      target: 550,
      description: 'Fog exploration speed round',
      turnLimit: 13,
    },
    difficulty: 'Special',
    tags: ['special', 'exploration', 'speedrun'],
  },
  {
    name: 'Territory Rush',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithTerritory(7),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      targetControlPercentage: 65,
      description: 'Rapid territory takeover',
      turnLimit: 14,
    },
    difficulty: 'Special',
    tags: ['special', 'competitive', 'speedrun'],
  },
  {
    name: 'Endurance Test',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, 10),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score',
      target: 2000,
      description: 'Test your endurance',
      turnLimit: 40,
    },
    difficulty: 'Special',
    tags: ['special', 'endurance', 'ultimate'],
  },
  {
    name: 'Grand Finale',
    supportedModes: ['Solo', 'Multiplayer', 'Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, 8),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      requiredVaultTiles: 8,
      description: 'Ultimate special event',
      turnLimit: 42,
    },
    difficulty: 'Special',
    tags: ['special', 'event', 'ultimate'],
  },
];
