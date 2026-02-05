
import { Tile, Position, BoardState, BoardTile, BoardMetadata, TileType } from '@/types/game';

const LETTER_VALUES: { [key: string]: number } = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const LETTER_DISTRIBUTION = [
  { letter: 'E', count: 12 },
  { letter: 'A', count: 9 },
  { letter: 'I', count: 9 },
  { letter: 'O', count: 8 },
  { letter: 'N', count: 6 },
  { letter: 'R', count: 6 },
  { letter: 'T', count: 6 },
  { letter: 'L', count: 4 },
  { letter: 'S', count: 4 },
  { letter: 'U', count: 4 },
  { letter: 'D', count: 4 },
  { letter: 'G', count: 3 },
  { letter: 'B', count: 2 },
  { letter: 'C', count: 2 },
  { letter: 'M', count: 2 },
  { letter: 'P', count: 2 },
  { letter: 'F', count: 2 },
  { letter: 'H', count: 2 },
  { letter: 'V', count: 2 },
  { letter: 'W', count: 2 },
  { letter: 'Y', count: 2 },
  { letter: 'K', count: 1 },
  { letter: 'J', count: 1 },
  { letter: 'X', count: 1 },
  { letter: 'Q', count: 1 },
  { letter: 'Z', count: 1 },
];

export function generateInitialBoard(size: number = 6): BoardState {
  console.log('Generating initial board with size:', size);
  const tiles: Tile[][] = [];
  const letterPool: string[] = [];
  
  LETTER_DISTRIBUTION.forEach(({ letter, count }) => {
    for (let i = 0; i < count; i++) {
      letterPool.push(letter);
    }
  });
  
  for (let row = 0; row < size; row++) {
    tiles[row] = [];
    for (let col = 0; col < size; col++) {
      const randomIndex = Math.floor(Math.random() * letterPool.length);
      const letter = letterPool[randomIndex];
      
      const isSpecial = Math.random() < 0.15;
      let specialType: 'double' | 'triple' | 'wildcard' | undefined;
      
      if (isSpecial) {
        const rand = Math.random();
        if (rand < 0.5) {
          specialType = 'double';
        } else if (rand < 0.85) {
          specialType = 'triple';
        } else {
          specialType = 'wildcard';
        }
      }
      
      tiles[row][col] = {
        letter,
        value: LETTER_VALUES[letter] || 1,
        row,
        col,
        isSpecial,
        specialType,
      };
    }
  }
  
  return { tiles, size };
}

export function isValidWord(word: string): boolean {
  console.log('Validating word:', word);
  if (word.length < 3) {
    return false;
  }
  
  const validWords = [
    'CAT', 'DOG', 'BIRD', 'FISH', 'TREE', 'STAR', 'MOON', 'SUN',
    'WORD', 'GAME', 'PLAY', 'WIN', 'LOSE', 'SCORE', 'TILE', 'BOARD',
    'PUZZLE', 'LETTER', 'BLOCK', 'CHAIN', 'MATCH', 'CLEAR', 'BONUS',
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN',
    'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM',
    'HIS', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY',
    'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO',
    'USE', 'ABLE', 'BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'COULD',
    'EACH', 'EVEN', 'FIND', 'FIRST', 'FROM', 'GIVE', 'GOOD', 'GREAT',
    'HAND', 'HAVE', 'HERE', 'HIGH', 'INTO', 'JUST', 'KNOW', 'LAST',
    'LIFE', 'LIKE', 'LINE', 'LONG', 'LOOK', 'MADE', 'MAKE', 'MANY',
    'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST', 'NAME', 'NEED', 'NEXT',
    'ONLY', 'OVER', 'PART', 'PLACE', 'SAME', 'SEEM', 'SHOW', 'SIDE',
    'SOME', 'SUCH', 'TAKE', 'TELL', 'THAN', 'THAT', 'THEM', 'THEN',
    'THERE', 'THESE', 'THEY', 'THIS', 'TIME', 'VERY', 'WANT', 'WELL',
    'WENT', 'WERE', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHILE', 'WITH',
    'WORK', 'WORLD', 'WOULD', 'WRITE', 'YEAR', 'YOUR'
  ];
  
  return validWords.includes(word.toUpperCase());
}

export function calculateScore(word: string, positions: Position[], board: BoardState): number {
  console.log('Calculating score for word:', word, 'at positions:', positions);
  let score = 0;
  let multiplier = 1;
  
  positions.forEach((pos) => {
    const tile = board.tiles[pos.row][pos.col];
    let letterScore = tile.value;
    
    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        letterScore *= 2;
      } else if (tile.specialType === 'triple') {
        letterScore *= 3;
      } else if (tile.specialType === 'wildcard') {
        multiplier *= 2;
      }
    }
    
    score += letterScore;
  });
  
  score *= multiplier;
  
  if (word.length >= 6) {
    score += 10;
  }
  if (word.length >= 8) {
    score += 20;
  }
  
  return score;
}

export function arePositionsAdjacent(positions: Position[]): boolean {
  console.log('Checking if positions are adjacent:', positions);
  if (positions.length < 2) {
    return true;
  }
  
  for (let i = 0; i < positions.length - 1; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    
    const rowDiff = Math.abs(current.row - next.row);
    const colDiff = Math.abs(current.col - next.col);
    
    const isAdjacent = (rowDiff === 0 && colDiff === 1) ||
                       (rowDiff === 1 && colDiff === 0) ||
                       (rowDiff === 1 && colDiff === 1);
    
    if (!isAdjacent) {
      return false;
    }
  }
  
  return true;
}

export function applyWordEffect(board: BoardState, positions: Position[]): BoardState {
  console.log('Applying word effect to board at positions:', positions);
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  
  positions.forEach((pos) => {
    const randomIndex = Math.floor(Math.random() * LETTER_DISTRIBUTION.length);
    const newLetter = LETTER_DISTRIBUTION[randomIndex].letter;
    
    newTiles[pos.row][pos.col] = {
      ...newTiles[pos.row][pos.col],
      letter: newLetter,
      value: LETTER_VALUES[newLetter] || 1,
    };
  });
  
  return { ...board, tiles: newTiles };
}

// ============================================
// BOARD SYSTEM UTILITIES
// ============================================

/**
 * Converts a BoardMetadata's initialLayout to a playable BoardState
 * This transforms the board definition into the active game board
 */
export function convertBoardToGameState(boardMetadata: BoardMetadata): BoardState {
  console.log('Converting board to game state:', boardMetadata.name);
  const { gridSize, initialLayout } = boardMetadata;
  
  const tiles: Tile[][] = [];
  
  for (let row = 0; row < gridSize; row++) {
    tiles[row] = [];
    for (let col = 0; col < gridSize; col++) {
      const boardTile = initialLayout[row][col];
      
      // Convert BoardTile to game Tile
      let gameTile: Tile;
      
      if (boardTile.type === 'letter') {
        // Letter tile - use provided letter or generate random
        const letter = boardTile.letter || generateRandomLetter();
        gameTile = {
          letter,
          value: boardTile.value || LETTER_VALUES[letter] || 1,
          row,
          col,
          type: 'letter',
        };
      } else if (boardTile.type === 'locked') {
        // Locked tile - cannot be used
        gameTile = {
          letter: '🔒',
          value: 0,
          row,
          col,
          type: 'locked',
        };
      } else if (boardTile.type === 'puzzle') {
        // Puzzle tile - special mechanics
        const letter = boardTile.letter || generateRandomLetter();
        gameTile = {
          letter,
          value: boardTile.value || LETTER_VALUES[letter] || 1,
          row,
          col,
          type: 'puzzle',
          isSpecial: true,
          specialType: 'double', // Can be customized based on metadata
        };
      } else if (boardTile.type === 'objective') {
        // Objective tile - must be cleared to win
        const letter = boardTile.letter || '⭐';
        gameTile = {
          letter,
          value: boardTile.value || 5,
          row,
          col,
          type: 'objective',
          isSpecial: true,
        };
      } else {
        // Fallback
        const letter = generateRandomLetter();
        gameTile = {
          letter,
          value: LETTER_VALUES[letter] || 1,
          row,
          col,
        };
      }
      
      tiles[row][col] = gameTile;
    }
  }
  
  return { tiles, size: gridSize };
}

/**
 * Generates a random letter based on distribution
 */
function generateRandomLetter(): string {
  const letterPool: string[] = [];
  LETTER_DISTRIBUTION.forEach(({ letter, count }) => {
    for (let i = 0; i < count; i++) {
      letterPool.push(letter);
    }
  });
  const randomIndex = Math.floor(Math.random() * letterPool.length);
  return letterPool[randomIndex];
}

/**
 * Validates if a board layout is correctly structured
 */
export function validateBoardLayout(layout: BoardTile[][], gridSize: number): boolean {
  if (!layout || layout.length !== gridSize) {
    return false;
  }
  
  for (let row = 0; row < gridSize; row++) {
    if (!layout[row] || layout[row].length !== gridSize) {
      return false;
    }
    
    for (let col = 0; col < gridSize; col++) {
      const tile = layout[row][col];
      if (!tile || !tile.type) {
        return false;
      }
      
      const validTypes: TileType[] = ['letter', 'locked', 'puzzle', 'objective'];
      if (!validTypes.includes(tile.type)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Creates a simple board layout for testing
 */
export function createSimpleBoardLayout(gridSize: number): BoardTile[][] {
  const layout: BoardTile[][] = [];
  
  for (let row = 0; row < gridSize; row++) {
    layout[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // Create a mix of tile types
      let type: TileType = 'letter';
      
      // Add some locked tiles at edges
      if ((row === 0 || row === gridSize - 1) && (col === 0 || col === gridSize - 1)) {
        type = 'locked';
      }
      // Add objective tiles in center
      else if (row === Math.floor(gridSize / 2) && col === Math.floor(gridSize / 2)) {
        type = 'objective';
      }
      // Add some puzzle tiles randomly
      else if (Math.random() < 0.1) {
        type = 'puzzle';
      }
      
      layout[row][col] = {
        type,
        letter: type === 'letter' || type === 'puzzle' ? generateRandomLetter() : undefined,
        value: type === 'objective' ? 10 : undefined,
      };
    }
  }
  
  return layout;
}
