
# VERBLOC Board System

## Overview

The VERBLOC board system is a flexible, data-driven architecture that allows for dynamic board creation, storage, and loading without requiring app updates. Boards are stored in a database and can be fetched via API endpoints.

## Board Structure

### Grid Sizes
- **7x7 grids**: Smaller, faster-paced games
- **9x9 grids**: Larger, more complex strategic games

### Tile Types

Each tile on the board can be one of four types:

1. **Letter Tiles** (`type: 'letter'`)
   - Standard playable tiles with letters
   - Can be selected to form words
   - Have point values based on letter rarity

2. **Locked Tiles** (`type: 'locked'`)
   - Cannot be selected or used in words
   - Create obstacles and strategic challenges
   - Displayed with a lock icon (🔒)

3. **Puzzle Tiles** (`type: 'puzzle'`)
   - Special tiles with bonus mechanics
   - Can provide score multipliers or special effects
   - Displayed with distinct visual styling

4. **Objective Tiles** (`type: 'objective'`)
   - Must be cleared to complete certain win conditions
   - High value targets for strategic play
   - Displayed with star icon (⭐)

## Board Metadata

Each board includes the following metadata:

```typescript
interface BoardMetadata {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Beginner's Garden")
  supportedModes: PlayMode[];    // ['Solo', 'Multiplayer', 'Both']
  gridSize: GridSize;            // 7 or 9
  initialLayout: BoardTile[][];  // 2D array of tiles
  puzzleMode: PuzzleMode;        // Game mode type
  winCondition: WinCondition;    // Victory requirements
  difficulty: Difficulty;        // 'Easy', 'Medium', 'Hard', 'Special'
  tags?: string[];               // Optional categorization
  isActive?: boolean;            // Whether board is available
  createdAt?: string;            // ISO 8601 timestamp
  updatedAt?: string;            // ISO 8601 timestamp
}
```

### Puzzle Modes

- **score_target**: Reach a target score within turn limit
- **clear_objectives**: Clear all objective tiles from the board
- **word_count**: Form a specific number of valid words
- **time_attack**: Score as many points as possible in limited time

### Win Conditions

```typescript
interface WinCondition {
  type: string;        // e.g., 'score', 'objectives', 'words'
  target: number;      // Target value to achieve
  description: string; // Human-readable description
}
```

### Difficulty Levels

- **Easy**: Beginner-friendly, forgiving win conditions
- **Medium**: Balanced challenge for regular players
- **Hard**: Expert-level difficulty, tight constraints
- **Special**: Unique or event-specific boards

## API Endpoints

### GET /api/boards
Fetch all active boards with optional filtering.

**Query Parameters:**
- `mode`: Filter by play mode (Solo, Multiplayer)
- `difficulty`: Filter by difficulty (Easy, Medium, Hard, Special)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "boards": [
    {
      "id": "uuid",
      "name": "Beginner's Garden",
      "supportedModes": ["Solo", "Multiplayer", "Both"],
      "gridSize": 7,
      "puzzleMode": "score_target",
      "difficulty": "Easy",
      "tags": ["beginner", "tutorial"]
    }
  ],
  "total": 42
}
```

### GET /api/boards/:id
Fetch full board details including layout.

**Response:**
```json
{
  "id": "uuid",
  "name": "Beginner's Garden",
  "supportedModes": ["Solo", "Multiplayer", "Both"],
  "gridSize": 7,
  "initialLayout": [[...], [...], ...],
  "puzzleMode": "score_target",
  "winCondition": {
    "type": "score",
    "target": 500,
    "description": "Reach 500 points"
  },
  "difficulty": "Easy",
  "tags": ["beginner"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/boards/random
Fetch a random board matching criteria.

**Query Parameters:**
- `mode`: Filter by play mode
- `difficulty`: Filter by difficulty

**Response:** Full BoardMetadata object

### POST /api/boards/seed
Seed database with example boards (admin only).

**Response:**
```json
{
  "message": "Seeded 10 boards",
  "count": 10
}
```

## Frontend Integration

### Board Selection Flow

1. User selects play mode (Solo or Multiplayer)
2. Navigate to `/board-select?mode=solo`
3. Display filtered list of available boards
4. User selects a board or chooses "Random Board"
5. Navigate to `/game?mode=solo&boardId=uuid`
6. Game screen loads board and starts gameplay

### Converting Boards to Game State

The `convertBoardToGameState()` utility function transforms a BoardMetadata object into a playable BoardState:

```typescript
import { convertBoardToGameState } from '@/utils/gameLogic';

const boardMetadata = await fetchBoardById(boardId);
const gameBoard = convertBoardToGameState(boardMetadata);
```

This function:
- Converts BoardTile types to game Tile objects
- Generates random letters for letter tiles if not specified
- Applies special tile properties (locked, puzzle, objective)
- Creates a playable grid ready for gameplay

## Creating New Boards

Boards can be created via the POST /api/boards endpoint:

```typescript
const newBoard = {
  name: "Word Maze",
  supportedModes: ["Solo", "Multiplayer", "Both"],
  gridSize: 7,
  initialLayout: createSimpleBoardLayout(7), // Use utility function
  puzzleMode: "clear_objectives",
  winCondition: {
    type: "objectives",
    target: 5,
    description: "Clear 5 objective tiles"
  },
  difficulty: "Medium",
  tags: ["puzzle", "strategy"]
};
```

## Scalability

The board system is designed to scale to hundreds or thousands of boards:

- **Database-driven**: All boards stored in PostgreSQL
- **Pagination**: API supports limit/offset for large datasets
- **Filtering**: Efficient queries by mode, difficulty, tags
- **Caching**: Frontend can cache frequently-used boards
- **Dynamic loading**: No app updates required for new boards

## Best Practices

1. **Always validate board layouts** before saving to database
2. **Use descriptive names** that hint at the board's challenge
3. **Tag boards appropriately** for better discoverability
4. **Test win conditions** to ensure they're achievable
5. **Balance difficulty** across the board library
6. **Provide variety** in puzzle modes and grid sizes

## Future Enhancements

- Board editor UI for admins
- User-created boards (with moderation)
- Board ratings and favorites
- Seasonal/event boards
- Board achievements and challenges
- Board analytics (completion rates, average scores)
