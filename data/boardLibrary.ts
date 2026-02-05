
import { BoardTile, PuzzleMode, Difficulty, PlayMode, WinCondition } from '@/types/game';

/**
 * VERBLOC Production Board Library
 * 70+ unique, hand-designed boards with varied layouts and objectives
 * 
 * Distribution:
 * - Easy: 20 boards
 * - Medium: 25 boards
 * - Hard: 15 boards
 * - Special: 10 boards
 * 
 * Each board is tagged for Solo, Multiplayer, or Both modes
 */

interface BoardDefinition {
  name: string;
  supportedModes: PlayMode[];
  gridSize: 7 | 9;
  initialLayout: BoardTile[][];
  puzzleMode: PuzzleMode;
  winCondition: WinCondition;
  difficulty: Difficulty;
  tags: string[];
  description: string;
}

// Helper functions for creating board layouts
function createEmptyLayout(size: 7 | 9): BoardTile[][] {
  return Array(size).fill(null).map(() => 
    Array(size).fill(null).map(() => ({ type: 'letter' as const }))
  );
}

function createLayoutWithLocked(size: 7 | 9, lockedPositions: [number, number][]): BoardTile[][] {
  const layout = createEmptyLayout(size);
  lockedPositions.forEach(([row, col]) => {
    layout[row][col] = { type: 'locked' };
  });
  return layout;
}

function createLayoutWithVaults(size: 7 | 9, vaultPositions: [number, number][]): BoardTile[][] {
  const layout = createEmptyLayout(size);
  vaultPositions.forEach(([row, col]) => {
    layout[row][col] = { 
      type: 'puzzle',
      metadata: { puzzleType: 'vault', isLocked: true }
    };
  });
  return layout;
}

function createLayoutWithFog(size: 7 | 9, fogPositions: [number, number][]): BoardTile[][] {
  const layout = createEmptyLayout(size);
  fogPositions.forEach(([row, col]) => {
    layout[row][col] = { 
      type: 'puzzle',
      metadata: { puzzleType: 'fog', isRevealed: false }
    };
  });
  return layout;
}

function createLayoutWithTerritory(size: 7 | 9, territoryPositions: [number, number][]): BoardTile[][] {
  const layout = createEmptyLayout(size);
  territoryPositions.forEach(([row, col]) => {
    layout[row][col] = { 
      type: 'objective',
      metadata: { objectiveType: 'territory', isClaimable: true }
    };
  });
  return layout;
}

// ============================================
// EASY BOARDS (20 boards)
// ============================================

const easyBoards: BoardDefinition[] = [
  // 1. First Steps
  {
    name: 'First Steps',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 400,
      description: 'Reach 400 points',
      turnLimit: 15
    },
    difficulty: 'Easy',
    tags: ['beginner', 'tutorial', 'score'],
    description: 'A gentle introduction to VERBLOC. Form words to reach 400 points.'
  },

  // 2. Garden Path
  {
    name: 'Garden Path',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[3, 0], [3, 1], [3, 5], [3, 6]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 450,
      description: 'Navigate around obstacles to score 450 points',
      turnLimit: 16
    },
    difficulty: 'Easy',
    tags: ['beginner', 'obstacles', 'score'],
    description: 'A path through the garden with a few locked tiles to navigate.'
  },

  // 3. Morning Breeze
  {
    name: 'Morning Breeze',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 500,
      description: 'Score 500 points in a relaxed morning session',
      turnLimit: 18
    },
    difficulty: 'Easy',
    tags: ['beginner', 'solo', 'relaxed'],
    description: 'Start your day with a calm word puzzle.'
  },

  // 4. Sunny Meadow
  {
    name: 'Sunny Meadow',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[1, 3], [5, 3]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 480,
      description: 'Enjoy the meadow and reach 480 points',
      turnLimit: 17
    },
    difficulty: 'Easy',
    tags: ['beginner', 'scenic', 'score'],
    description: 'A bright, open board with minimal obstacles.'
  },

  // 5. Gentle Stream
  {
    name: 'Gentle Stream',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 520,
      description: 'Cross the stream to reach 520 points',
      turnLimit: 19
    },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer', 'pattern'],
    description: 'A vertical stream divides the board. Work around it.'
  },

  // 6. Pebble Beach
  {
    name: 'Pebble Beach',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[2, 2], [2, 4], [4, 2], [4, 4]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 460,
      description: 'Navigate the pebbles to score 460 points',
      turnLimit: 16
    },
    difficulty: 'Easy',
    tags: ['beginner', 'scattered', 'score'],
    description: 'Scattered pebbles create interesting word paths.'
  },

  // 7. Butterfly Garden
  {
    name: 'Butterfly Garden',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[3, 3]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 1,
      description: 'Unlock the central vault',
      requiredVaultTiles: 1,
      turnLimit: 12
    },
    difficulty: 'Easy',
    tags: ['beginner', 'vault', 'solo'],
    description: 'Your first vault challenge. Unlock the center tile.'
  },

  // 8. Dewdrop Morning
  {
    name: 'Dewdrop Morning',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 440,
      description: 'Fresh start - reach 440 points',
      turnLimit: 15
    },
    difficulty: 'Easy',
    tags: ['beginner', 'fresh', 'score'],
    description: 'A clean slate for word formation.'
  },

  // 9. Clover Field
  {
    name: 'Clover Field',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[1, 1], [1, 5], [5, 1], [5, 5]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 470,
      description: 'Find your luck and score 470 points',
      turnLimit: 17
    },
    difficulty: 'Easy',
    tags: ['beginner', 'corners', 'score'],
    description: 'Corner obstacles create a clover pattern.'
  },

  // 10. Daisy Chain
  {
    name: 'Daisy Chain',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[3, 1], [3, 2], [3, 4], [3, 5]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 490,
      description: 'Link words like daisies to reach 490 points',
      turnLimit: 18
    },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer', 'chain'],
    description: 'A horizontal chain pattern encourages creative word paths.'
  },

  // 11. Pond Ripples
  {
    name: 'Pond Ripples',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[3, 3], [2, 3], [4, 3], [3, 2], [3, 4]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 500,
      description: 'Ripple outward to score 500 points',
      turnLimit: 18
    },
    difficulty: 'Easy',
    tags: ['beginner', 'radial', 'score'],
    description: 'A cross pattern in the center creates ripple-like gameplay.'
  },

  // 12. Seedling Sprout
  {
    name: 'Seedling Sprout',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[2, 3], [4, 3]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 2,
      description: 'Unlock 2 vaults to help the seedling grow',
      requiredVaultTiles: 2,
      turnLimit: 14
    },
    difficulty: 'Easy',
    tags: ['beginner', 'vault', 'growth'],
    description: 'Two vaults to unlock. A step up from single vault puzzles.'
  },

  // 13. Blossom Trail
  {
    name: 'Blossom Trail',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 510,
      description: 'Follow the blossom trail to 510 points',
      turnLimit: 19
    },
    difficulty: 'Easy',
    tags: ['beginner', 'diagonal', 'score'],
    description: 'A diagonal trail of locked tiles creates interesting paths.'
  },

  // 14. Raindrop Rhythm
  {
    name: 'Raindrop Rhythm',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[0, 2], [1, 4], [3, 1], [4, 5], [6, 3]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 480,
      description: 'Dance with the raindrops to reach 480 points',
      turnLimit: 17
    },
    difficulty: 'Easy',
    tags: ['beginner', 'scattered', 'rhythm'],
    description: 'Randomly scattered obstacles like falling raindrops.'
  },

  // 15. Leaf Whisper
  {
    name: 'Leaf Whisper',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 520,
      description: 'Listen to the leaves and score 520 points',
      turnLimit: 20
    },
    difficulty: 'Easy',
    tags: ['beginner', 'solo', 'peaceful'],
    description: 'A peaceful, open board for solo contemplation.'
  },

  // 16. Petal Dance
  {
    name: 'Petal Dance',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[2, 2], [2, 3], [2, 4], [4, 2], [4, 3], [4, 4]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 530,
      description: 'Dance between the petals to reach 530 points',
      turnLimit: 20
    },
    difficulty: 'Easy',
    tags: ['beginner', 'multiplayer', 'pattern'],
    description: 'Two horizontal rows of obstacles create a dance floor.'
  },

  // 17. Sunrise Glow
  {
    name: 'Sunrise Glow',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[0, 0], [0, 6], [6, 0], [6, 6]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 450,
      description: 'Bask in the sunrise and reach 450 points',
      turnLimit: 16
    },
    difficulty: 'Easy',
    tags: ['beginner', 'corners', 'glow'],
    description: 'Four corner obstacles frame the board like a sunrise.'
  },

  // 18. Honeycomb Haven
  {
    name: 'Honeycomb Haven',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[1, 2], [1, 4], [3, 1], [3, 5], [5, 2], [5, 4]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 540,
      description: 'Navigate the honeycomb to score 540 points',
      turnLimit: 21
    },
    difficulty: 'Easy',
    tags: ['beginner', 'hexagonal', 'score'],
    description: 'A honeycomb-like pattern of obstacles.'
  },

  // 19. Willow Breeze
  {
    name: 'Willow Breeze',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[2, 0], [3, 0], [4, 0]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 460,
      description: 'Sway with the willow to reach 460 points',
      turnLimit: 17
    },
    difficulty: 'Easy',
    tags: ['beginner', 'solo', 'edge'],
    description: 'Edge obstacles create a willow-like sway.'
  },

  // 20. Starlight Path
  {
    name: 'Starlight Path',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[1, 3], [3, 1], [3, 5], [5, 3]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 4,
      description: 'Light up 4 stars by unlocking all vaults',
      requiredVaultTiles: 4,
      turnLimit: 16
    },
    difficulty: 'Easy',
    tags: ['beginner', 'vault', 'star'],
    description: 'Four vaults arranged in a star pattern.'
  }
];

// ============================================
// MEDIUM BOARDS (25 boards)
// ============================================

const mediumBoards: BoardDefinition[] = [
  {
    name: 'Mountain Pass',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 2], [1, 3], [1, 4],
      [2, 1], [2, 5],
      [3, 0], [3, 6],
      [4, 1], [4, 5],
      [5, 2], [5, 3], [5, 4]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 800,
      description: 'Navigate the mountain pass to reach 800 points',
      turnLimit: 22
    },
    difficulty: 'Medium',
    tags: ['challenge', 'obstacles', 'mountain'],
    description: 'A challenging mountain-shaped obstacle pattern.'
  },
  {
    name: 'Crystal Cavern',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[1, 1], [1, 5], [3, 3], [5, 1], [5, 5]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 5,
      description: 'Unlock all 5 crystal vaults',
      requiredVaultTiles: 5,
      turnLimit: 18
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'crystal'],
    description: 'Five vaults scattered like crystals in a cavern.'
  },
  {
    name: 'Tidal Wave',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 0], [0, 1], [0, 2],
      [1, 1], [1, 2], [1, 3],
      [2, 2], [2, 3], [2, 4],
      [3, 3], [3, 4], [3, 5],
      [4, 4], [4, 5], [4, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 850,
      description: 'Ride the tidal wave to 850 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'multiplayer', 'wave'],
    description: 'A diagonal wave pattern sweeps across the board.'
  },
  {
    name: 'Forest Maze',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 1], [1, 3], [1, 5],
      [2, 2], [2, 4],
      [3, 1], [3, 3], [3, 5],
      [4, 2], [4, 4],
      [5, 1], [5, 3], [5, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 820,
      description: 'Navigate the forest maze to reach 820 points',
      turnLimit: 23
    },
    difficulty: 'Medium',
    tags: ['challenge', 'maze', 'forest'],
    description: 'A checkerboard-like maze of obstacles.'
  },
  {
    name: 'Volcano Core',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [3, 3],
      [2, 2], [2, 3], [2, 4],
      [3, 2], [3, 4],
      [4, 2], [4, 3], [4, 4],
      [1, 3], [5, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 900,
      description: 'Reach the volcano core with 900 points',
      turnLimit: 25
    },
    difficulty: 'Medium',
    tags: ['challenge', 'solo', 'volcano'],
    description: 'A volcanic core surrounded by locked tiles.'
  },
  {
    name: 'Spiral Galaxy',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 3], [1, 2], [1, 4], [2, 1], [2, 5],
      [3, 0], [3, 6], [4, 1], [4, 5], [5, 2], [5, 4], [6, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 880,
      description: 'Spiral through the galaxy to 880 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'spiral', 'space'],
    description: 'A spiral pattern of obstacles radiating from the center.'
  },
  {
    name: 'Ancient Ruins',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[0, 0], [0, 6], [3, 3], [6, 0], [6, 6]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 5,
      description: 'Unlock the ancient vaults in the ruins',
      requiredVaultTiles: 5,
      turnLimit: 20
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'ancient'],
    description: 'Five ancient vaults at the corners and center.'
  },
  {
    name: 'Lightning Strike',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 3], [1, 2], [1, 4], [2, 3], [3, 2], [3, 4], [4, 3], [5, 2], [5, 4], [6, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 840,
      description: 'Strike like lightning to reach 840 points',
      turnLimit: 23
    },
    difficulty: 'Medium',
    tags: ['challenge', 'multiplayer', 'lightning'],
    description: 'A zigzag lightning pattern down the center.'
  },
  {
    name: 'Coral Reef',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 0], [1, 2], [1, 4], [1, 6],
      [3, 1], [3, 3], [3, 5],
      [5, 0], [5, 2], [5, 4], [5, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 860,
      description: 'Explore the coral reef to reach 860 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'ocean', 'coral'],
    description: 'Coral-like obstacles scattered across the board.'
  },
  {
    name: 'Frozen Lake',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 1], [3, 5],
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 890,
      description: 'Skate across the frozen lake to 890 points',
      turnLimit: 25
    },
    difficulty: 'Medium',
    tags: ['challenge', 'solo', 'ice'],
    description: 'A rectangular frozen section in the middle.'
  },
  {
    name: 'Windmill Blades',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 3], [1, 3], [2, 3],
      [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6],
      [4, 3], [5, 3], [6, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 870,
      description: 'Spin the windmill blades to 870 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'windmill', 'cross'],
    description: 'A cross pattern like windmill blades.'
  },
  {
    name: 'Temple Gates',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[1, 2], [1, 4], [5, 2], [5, 4]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 4,
      description: 'Open the temple gates by unlocking 4 vaults',
      requiredVaultTiles: 4,
      turnLimit: 17
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'temple'],
    description: 'Four vaults guard the temple gates.'
  },
  {
    name: 'Meteor Shower',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 1], [0, 5], [1, 2], [1, 4], [2, 0], [2, 6],
      [3, 3], [4, 1], [4, 5], [5, 2], [5, 4], [6, 0], [6, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 910,
      description: 'Dodge the meteor shower to reach 910 points',
      turnLimit: 26
    },
    difficulty: 'Medium',
    tags: ['challenge', 'multiplayer', 'meteor'],
    description: 'Meteors scattered across the board like a shower.'
  },
  {
    name: 'Bamboo Forest',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 920,
      description: 'Navigate the bamboo forest to 920 points',
      turnLimit: 26
    },
    difficulty: 'Medium',
    tags: ['challenge', 'solo', 'bamboo'],
    description: 'Two vertical columns of bamboo obstacles.'
  },
  {
    name: 'Hourglass',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 0], [0, 1], [0, 5], [0, 6],
      [1, 1], [1, 2], [1, 4], [1, 5],
      [2, 2], [2, 3], [2, 4],
      [3, 3],
      [4, 2], [4, 3], [4, 4],
      [5, 1], [5, 2], [5, 4], [5, 5],
      [6, 0], [6, 1], [6, 5], [6, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 950,
      description: 'Time runs through the hourglass - reach 950 points',
      turnLimit: 27
    },
    difficulty: 'Medium',
    tags: ['challenge', 'hourglass', 'time'],
    description: 'An hourglass shape of locked tiles.'
  },
  {
    name: 'Pyramid Chambers',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[2, 2], [2, 4], [4, 2], [4, 4], [3, 3]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 5,
      description: 'Unlock all pyramid chambers',
      requiredVaultTiles: 5,
      turnLimit: 19
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'pyramid'],
    description: 'Five vaults arranged like pyramid chambers.'
  },
  {
    name: 'Whirlpool',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 3], [2, 2], [2, 4], [3, 1], [3, 5], [4, 2], [4, 4], [5, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 880,
      description: 'Escape the whirlpool with 880 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'multiplayer', 'whirlpool'],
    description: 'A circular whirlpool pattern of obstacles.'
  },
  {
    name: 'Constellation',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 2], [1, 1], [1, 5], [2, 4], [3, 0], [4, 3], [5, 2], [6, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 830,
      description: 'Connect the constellation to reach 830 points',
      turnLimit: 23
    },
    difficulty: 'Medium',
    tags: ['challenge', 'stars', 'constellation'],
    description: 'Stars scattered like a constellation.'
  },
  {
    name: 'Fortress Walls',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
      [1, 0], [1, 6],
      [2, 0], [2, 6],
      [4, 0], [4, 6],
      [5, 0], [5, 6],
      [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1000,
      description: 'Break through the fortress walls to reach 1000 points',
      turnLimit: 28
    },
    difficulty: 'Medium',
    tags: ['challenge', 'solo', 'fortress'],
    description: 'Fortress walls surround the playable area.'
  },
  {
    name: 'Diamond Mine',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[1, 3], [2, 2], [2, 4], [3, 1], [3, 3], [3, 5], [4, 2], [4, 4], [5, 3]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 9,
      description: 'Mine all 9 diamond vaults',
      requiredVaultTiles: 9,
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'diamond'],
    description: 'Nine vaults arranged in a diamond shape.'
  },
  {
    name: 'Tornado Alley',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 3], [1, 2], [1, 3], [1, 4], [2, 1], [2, 5],
      [3, 2], [3, 4], [4, 1], [4, 5], [5, 2], [5, 3], [5, 4], [6, 3]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 940,
      description: 'Survive tornado alley to reach 940 points',
      turnLimit: 27
    },
    difficulty: 'Medium',
    tags: ['challenge', 'multiplayer', 'tornado'],
    description: 'A tornado-shaped pattern of obstacles.'
  },
  {
    name: 'Zen Garden',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 1], [1, 3], [1, 5],
      [3, 0], [3, 2], [3, 4], [3, 6],
      [5, 1], [5, 3], [5, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 850,
      description: 'Find peace in the zen garden with 850 points',
      turnLimit: 24
    },
    difficulty: 'Medium',
    tags: ['challenge', 'solo', 'zen'],
    description: 'A peaceful, symmetrical pattern of obstacles.'
  },
  {
    name: 'Labyrinth',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 0], [1, 2], [1, 4], [1, 6],
      [2, 1], [2, 3], [2, 5],
      [3, 0], [3, 2], [3, 4], [3, 6],
      [4, 1], [4, 3], [4, 5],
      [5, 0], [5, 2], [5, 4], [5, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 960,
      description: 'Solve the labyrinth to reach 960 points',
      turnLimit: 28
    },
    difficulty: 'Medium',
    tags: ['challenge', 'maze', 'labyrinth'],
    description: 'A complex labyrinth pattern.'
  },
  {
    name: 'Aurora Borealis',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 1], [0, 3], [0, 5],
      [1, 0], [1, 2], [1, 4], [1, 6],
      [2, 1], [2, 3], [2, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 820,
      description: 'Dance with the aurora to reach 820 points',
      turnLimit: 23
    },
    difficulty: 'Medium',
    tags: ['challenge', 'aurora', 'lights'],
    description: 'Wavy aurora-like pattern at the top.'
  },
  {
    name: 'Treasure Vault',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithVaults(7, [[2, 1], [2, 3], [2, 5], [4, 1], [4, 3], [4, 5]]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 6,
      description: 'Unlock all treasure vaults',
      requiredVaultTiles: 6,
      turnLimit: 21
    },
    difficulty: 'Medium',
    tags: ['challenge', 'vault', 'treasure'],
    description: 'Six treasure vaults to unlock.'
  }
];

// ============================================
// HARD BOARDS (15 boards)
// ============================================

const hardBoards: BoardDefinition[] = [
  {
    name: "Dragon's Lair",
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 4], [1, 3], [1, 5], [2, 2], [2, 6],
      [3, 1], [3, 4], [3, 7],
      [4, 0], [4, 4], [4, 8],
      [5, 1], [5, 4], [5, 7],
      [6, 2], [6, 6], [7, 3], [7, 5], [8, 4]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1500,
      description: 'Conquer the dragon and reach 1500 points',
      turnLimit: 30
    },
    difficulty: 'Hard',
    tags: ['expert', 'dragon', 'large'],
    description: 'A dragon-shaped obstacle pattern in a 9x9 lair.'
  },
  {
    name: 'Inferno',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
      [2, 2], [2, 3], [2, 5], [2, 6],
      [3, 3], [3, 4], [3, 5],
      [4, 4],
      [5, 3], [5, 4], [5, 5],
      [6, 2], [6, 3], [6, 5], [6, 6],
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1600,
      description: 'Survive the inferno to reach 1600 points',
      turnLimit: 32
    },
    difficulty: 'Hard',
    tags: ['expert', 'solo', 'fire'],
    description: 'A flame-shaped pattern of obstacles.'
  },
  {
    name: 'Titan Fortress',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [1, 1], [1, 4], [1, 7],
      [4, 1], [4, 4], [4, 7],
      [7, 1], [7, 4], [7, 7]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 9,
      description: 'Breach the titan fortress by unlocking 9 vaults',
      requiredVaultTiles: 9,
      turnLimit: 28
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault', 'fortress'],
    description: 'Nine vaults arranged in a 3x3 grid pattern.'
  },
  {
    name: 'Black Hole',
    supportedModes: ['Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [2, 4], [3, 3], [3, 4], [3, 5],
      [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
      [5, 3], [5, 4], [5, 5], [6, 4]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1700,
      description: 'Escape the black hole with 1700 points',
      turnLimit: 34
    },
    difficulty: 'Hard',
    tags: ['expert', 'multiplayer', 'space'],
    description: 'A dense black hole at the center.'
  },
  {
    name: 'Kraken Depths',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 4], [1, 2], [1, 4], [1, 6],
      [2, 1], [2, 3], [2, 5], [2, 7],
      [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
      [4, 1], [4, 3], [4, 5], [4, 7],
      [5, 0], [5, 2], [5, 4], [5, 6], [5, 8],
      [6, 1], [6, 3], [6, 5], [6, 7],
      [7, 2], [7, 4], [7, 6], [8, 4]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1800,
      description: 'Defeat the kraken to reach 1800 points',
      turnLimit: 36
    },
    difficulty: 'Hard',
    tags: ['expert', 'kraken', 'ocean'],
    description: 'Tentacle-like obstacles spread across the board.'
  },
  {
    name: 'Phoenix Rising',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [1, 4], [2, 3], [2, 5], [3, 2], [3, 4], [3, 6],
      [4, 1], [4, 4], [4, 7], [5, 2], [5, 4], [5, 6],
      [6, 3], [6, 5], [7, 4]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 14,
      description: 'Awaken the phoenix by unlocking 14 vaults',
      requiredVaultTiles: 14,
      turnLimit: 32
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault', 'phoenix'],
    description: 'A phoenix-shaped pattern of vaults.'
  },
  {
    name: 'Quantum Maze',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 2], [0, 4], [0, 6],
      [1, 1], [1, 3], [1, 5], [1, 7],
      [2, 0], [2, 2], [2, 4], [2, 6], [2, 8],
      [3, 1], [3, 3], [3, 5], [3, 7],
      [4, 2], [4, 4], [4, 6],
      [5, 1], [5, 3], [5, 5], [5, 7],
      [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
      [7, 1], [7, 3], [7, 5], [7, 7],
      [8, 2], [8, 4], [8, 6]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1900,
      description: 'Navigate the quantum maze to 1900 points',
      turnLimit: 38
    },
    difficulty: 'Hard',
    tags: ['expert', 'maze', 'quantum'],
    description: 'A complex quantum maze pattern.'
  },
  {
    name: 'Colossus',
    supportedModes: ['Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [1, 0], [1, 1], [1, 7], [1, 8],
      [2, 0], [2, 2], [2, 6], [2, 8],
      [3, 0], [3, 3], [3, 5], [3, 8],
      [4, 0], [4, 4], [4, 8],
      [5, 0], [5, 3], [5, 5], [5, 8],
      [6, 0], [6, 2], [6, 6], [6, 8],
      [7, 0], [7, 1], [7, 7], [7, 8]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1750,
      description: 'Topple the colossus with 1750 points',
      turnLimit: 35
    },
    difficulty: 'Hard',
    tags: ['expert', 'multiplayer', 'colossus'],
    description: 'A giant humanoid shape of obstacles.'
  },
  {
    name: 'Supernova',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 4], [1, 3], [1, 4], [1, 5],
      [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 5], [4, 6], [4, 7], [4, 8],
      [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7],
      [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
      [7, 3], [7, 4], [7, 5], [8, 4]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 2000,
      description: 'Survive the supernova to reach 2000 points',
      turnLimit: 40
    },
    difficulty: 'Hard',
    tags: ['expert', 'supernova', 'explosion'],
    description: 'A massive explosion pattern radiating from center.'
  },
  {
    name: 'Leviathan',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [2, 2], [2, 4], [2, 6],
      [3, 1], [3, 3], [3, 5], [3, 7],
      [4, 2], [4, 4], [4, 6],
      [5, 1], [5, 3], [5, 5], [5, 7],
      [6, 2], [6, 4], [6, 6]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 15,
      description: 'Slay the leviathan by unlocking 15 vaults',
      requiredVaultTiles: 15,
      turnLimit: 35
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault', 'leviathan'],
    description: 'Fifteen vaults forming a sea monster.'
  },
  {
    name: 'Nexus',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 0], [0, 4], [0, 8],
      [1, 1], [1, 4], [1, 7],
      [2, 2], [2, 4], [2, 6],
      [3, 3], [3, 4], [3, 5],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 5], [4, 6], [4, 7], [4, 8],
      [5, 3], [5, 4], [5, 5],
      [6, 2], [6, 4], [6, 6],
      [7, 1], [7, 4], [7, 7],
      [8, 0], [8, 4], [8, 8]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1850,
      description: 'Reach the nexus with 1850 points',
      turnLimit: 37
    },
    difficulty: 'Hard',
    tags: ['expert', 'nexus', 'convergence'],
    description: 'Multiple paths converging at the center.'
  },
  {
    name: 'Apocalypse',
    supportedModes: ['Multiplayer'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 1], [0, 3], [0, 5], [0, 7],
      [1, 0], [1, 2], [1, 4], [1, 6], [1, 8],
      [2, 1], [2, 3], [2, 5], [2, 7],
      [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
      [4, 1], [4, 3], [4, 5], [4, 7],
      [5, 0], [5, 2], [5, 4], [5, 6], [5, 8],
      [6, 1], [6, 3], [6, 5], [6, 7],
      [7, 0], [7, 2], [7, 4], [7, 6], [7, 8],
      [8, 1], [8, 3], [8, 5], [8, 7]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 2100,
      description: 'Survive the apocalypse with 2100 points',
      turnLimit: 42
    },
    difficulty: 'Hard',
    tags: ['expert', 'multiplayer', 'apocalypse'],
    description: 'A checkerboard apocalypse pattern.'
  },
  {
    name: 'Celestial Vault',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [0, 0], [0, 4], [0, 8],
      [2, 2], [2, 4], [2, 6],
      [4, 0], [4, 2], [4, 4], [4, 6], [4, 8],
      [6, 2], [6, 4], [6, 6],
      [8, 0], [8, 4], [8, 8]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 16,
      description: 'Unlock the celestial vault',
      requiredVaultTiles: 16,
      turnLimit: 38
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault', 'celestial'],
    description: 'Sixteen celestial vaults in a symmetrical pattern.'
  },
  {
    name: 'Omega',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
      [2, 1], [2, 7],
      [3, 0], [3, 8],
      [4, 0], [4, 8],
      [5, 0], [5, 8],
      [6, 1], [6, 7],
      [7, 2], [7, 6],
      [8, 3], [8, 4], [8, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1950,
      description: 'Reach omega with 1950 points',
      turnLimit: 39
    },
    difficulty: 'Hard',
    tags: ['expert', 'solo', 'omega'],
    description: 'An omega symbol pattern of obstacles.'
  },
  {
    name: 'Endgame',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [1, 1], [1, 3], [1, 5], [1, 7],
      [3, 1], [3, 3], [3, 5], [3, 7],
      [5, 1], [5, 3], [5, 5], [5, 7],
      [7, 1], [7, 3], [7, 5], [7, 7]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 16,
      description: 'Complete the endgame by unlocking 16 vaults',
      requiredVaultTiles: 16,
      turnLimit: 40
    },
    difficulty: 'Hard',
    tags: ['expert', 'vault', 'endgame'],
    description: 'The ultimate vault challenge - 16 vaults in a grid.'
  }
];

// ============================================
// SPECIAL BOARDS (10 boards)
// ============================================

const specialBoards: BoardDefinition[] = [
  {
    name: 'Daily Sprint',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 600,
      description: 'Sprint to 600 points in limited turns',
      turnLimit: 12
    },
    difficulty: 'Special',
    tags: ['special', 'daily', 'sprint', 'timed'],
    description: 'A fast-paced daily challenge with limited turns.'
  },
  {
    name: 'Chaos Mode',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [0, 1], [0, 5], [1, 0], [1, 3], [1, 6],
      [2, 2], [2, 4], [3, 1], [3, 5],
      [4, 0], [4, 3], [4, 6], [5, 2], [5, 4],
      [6, 1], [6, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 1200,
      description: 'Embrace chaos to reach 1200 points',
      turnLimit: 25
    },
    difficulty: 'Special',
    tags: ['special', 'chaos', 'random'],
    description: 'Randomly scattered obstacles create unpredictable gameplay.'
  },
  {
    name: 'Speed Run',
    supportedModes: ['Solo'],
    gridSize: 7,
    initialLayout: createEmptyLayout(7),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 800,
      description: 'Speed run to 800 points',
      turnLimit: 10
    },
    difficulty: 'Special',
    tags: ['special', 'solo', 'speed'],
    description: 'How fast can you reach 800 points?'
  },
  {
    name: 'Vault Marathon',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [0, 0], [0, 4], [0, 8],
      [2, 2], [2, 6],
      [4, 0], [4, 4], [4, 8],
      [6, 2], [6, 6],
      [8, 0], [8, 4], [8, 8]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 13,
      description: 'Marathon vault challenge - unlock 13 vaults',
      requiredVaultTiles: 13,
      turnLimit: 30
    },
    difficulty: 'Special',
    tags: ['special', 'vault', 'marathon'],
    description: 'A marathon of vault unlocking.'
  },
  {
    name: 'Mirror Match',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [
      [1, 1], [1, 5],
      [2, 2], [2, 4],
      [3, 3],
      [4, 2], [4, 4],
      [5, 1], [5, 5]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 900,
      description: 'Mirror your opponent to reach 900 points',
      turnLimit: 24
    },
    difficulty: 'Special',
    tags: ['special', 'multiplayer', 'mirror'],
    description: 'A perfectly symmetrical board for competitive play.'
  },
  {
    name: 'Fog of War',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithFog(7, [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
      [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]
    ]),
    puzzleMode: 'hidden_phrase',
    winCondition: {
      type: 'hidden_phrase',
      target: 25,
      description: 'Reveal the hidden phrase by clearing the fog',
      targetPhrase: 'VERBLOC',
      turnLimit: 20
    },
    difficulty: 'Special',
    tags: ['special', 'fog', 'hidden'],
    description: 'Most of the board is hidden in fog. Reveal it to win.'
  },
  {
    name: 'Territory War',
    supportedModes: ['Multiplayer'],
    gridSize: 7,
    initialLayout: createLayoutWithTerritory(7, [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
      [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]
    ]),
    puzzleMode: 'territory_control',
    winCondition: {
      type: 'territory_control',
      target: 60,
      description: 'Control 60% of the territory',
      targetControlPercentage: 60,
      turnLimit: 25
    },
    difficulty: 'Special',
    tags: ['special', 'multiplayer', 'territory'],
    description: 'Claim territory by forming words. Control 60% to win.'
  },
  {
    name: 'Puzzle Master',
    supportedModes: ['Solo'],
    gridSize: 9,
    initialLayout: createLayoutWithLocked(9, [
      [0, 0], [0, 2], [0, 4], [0, 6], [0, 8],
      [2, 1], [2, 3], [2, 5], [2, 7],
      [4, 0], [4, 2], [4, 4], [4, 6], [4, 8],
      [6, 1], [6, 3], [6, 5], [6, 7],
      [8, 0], [8, 2], [8, 4], [8, 6], [8, 8]
    ]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 2500,
      description: 'Prove your mastery with 2500 points',
      turnLimit: 50
    },
    difficulty: 'Special',
    tags: ['special', 'solo', 'master'],
    description: 'The ultimate puzzle challenge for masters.'
  },
  {
    name: 'Blitz',
    supportedModes: ['Both'],
    gridSize: 7,
    initialLayout: createLayoutWithLocked(7, [[3, 3]]),
    puzzleMode: 'score_target',
    winCondition: {
      type: 'score_target',
      target: 500,
      description: 'Blitz to 500 points',
      turnLimit: 8
    },
    difficulty: 'Special',
    tags: ['special', 'blitz', 'fast'],
    description: 'Ultra-fast gameplay - reach 500 in just 8 turns.'
  },
  {
    name: 'Grand Finale',
    supportedModes: ['Both'],
    gridSize: 9,
    initialLayout: createLayoutWithVaults(9, [
      [1, 1], [1, 4], [1, 7],
      [3, 2], [3, 4], [3, 6],
      [4, 1], [4, 3], [4, 4], [4, 5], [4, 7],
      [5, 2], [5, 4], [5, 6],
      [7, 1], [7, 4], [7, 7]
    ]),
    puzzleMode: 'vault_break',
    winCondition: {
      type: 'vault_break',
      target: 17,
      description: 'The grand finale - unlock 17 vaults',
      requiredVaultTiles: 17,
      turnLimit: 45
    },
    difficulty: 'Special',
    tags: ['special', 'vault', 'finale'],
    description: 'The ultimate VERBLOC challenge - 17 vaults to unlock.'
  }
];

// ============================================
// EXPORT ALL BOARDS
// ============================================

export const BOARD_LIBRARY: BoardDefinition[] = [
  ...easyBoards,
  ...mediumBoards,
  ...hardBoards,
  ...specialBoards
];

export const BOARD_COUNTS = {
  easy: easyBoards.length,
  medium: mediumBoards.length,
  hard: hardBoards.length,
  special: specialBoards.length,
  total: BOARD_LIBRARY.length
};

console.log('Board library loaded successfully');
console.log(`Total: ${BOARD_COUNTS.total} boards (Easy: ${BOARD_COUNTS.easy}, Medium: ${BOARD_COUNTS.medium}, Hard: ${BOARD_COUNTS.hard}, Special: ${BOARD_COUNTS.special})`);
