
import { Tile, Position, BoardState, BoardTile, BoardMetadata, TileType, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import { analyzeWordEffects, applyWordEffectsToBoard } from './wordMechanics';

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
    'WORK', 'WORLD', 'WOULD', 'WRITE', 'YEAR', 'YOUR', 'LOCK', 'UNLOCK',
    'VAULT', 'BREAK', 'OPEN', 'REVEAL', 'HIDDEN', 'PHRASE', 'CLAIM',
    'CONTROL', 'TERRITORY', 'AREA', 'ZONE', 'REGION'
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

export function applyWordEffect(
  board: BoardState,
  positions: Position[],
  puzzleMode?: PuzzleMode,
  playerId?: string,
  word?: string,
  lastEffect?: any
): { board: BoardState; effects: any[] } {
  console.log('Applying word effect to board at positions:', positions, 'puzzleMode:', puzzleMode, 'word:', word);
  
  // Analyze word to determine effects
  const effects = word ? analyzeWordEffects(word, lastEffect) : [];
  console.log('Word effects analyzed:', effects.length, 'effects');
  
  // Apply effects to board
  const updatedBoard = word 
    ? applyWordEffectsToBoard(board, word, positions, effects, puzzleMode || 'score_target', playerId, lastEffect)
    : board;
  
  return { board: updatedBoard, effects };
}

// ============================================
// PUZZLE MODE WIN CONDITION CHECKS
// ============================================

export function checkWinCondition(
  boardState: BoardState,
  puzzleMode: PuzzleMode,
  winCondition: WinCondition,
  currentScore: number,
  movesMade: number,
  gameMode: 'solo' | 'multiplayer',
  turnsLeft?: number
): GameOutcome {
  console.log('Checking win condition for puzzle mode:', puzzleMode, 'moves:', movesMade, 'turnsLeft:', turnsLeft);
  
  // FAIL CONDITION: Run out of turns (solo mode only)
  if (gameMode === 'solo' && turnsLeft !== undefined && turnsLeft <= 0) {
    console.log('Game lost: ran out of turns');
    return GameOutcome.Loss;
  }
  
  // Rule: No puzzle may be completed in a single move
  if (movesMade < 2) {
    return GameOutcome.Playing;
  }
  
  switch (puzzleMode) {
    case 'vault_break': {
      const requiredVaultTiles = boardState.tiles.flat().filter(t => t.isVault && t.isRequired);
      const unlockedVaults = requiredVaultTiles.filter(t => !t.isLocked);
      const allVaultsUnlocked = requiredVaultTiles.length > 0 && unlockedVaults.length === requiredVaultTiles.length;
      
      console.log('Vault Break progress:', unlockedVaults.length, '/', requiredVaultTiles.length);
      
      // WIN CONDITION: All required vaults unlocked
      if (allVaultsUnlocked) {
        return GameOutcome.Win;
      }
      
      // FAIL CONDITION: Check if board is irreversibly locked (no more valid moves)
      if (gameMode === 'solo' && isBoardLocked(boardState)) {
        console.log('Game lost: board irreversibly locked');
        return GameOutcome.Loss;
      }
      
      return GameOutcome.Playing;
    }
    
    case 'hidden_phrase': {
      const phraseLetters = boardState.tiles.flat().filter(t => t.isPhraseLetter && !t.isDecoy);
      const revealedLetters = phraseLetters.filter(t => t.isRevealed);
      const allRevealed = phraseLetters.length > 0 && revealedLetters.length === phraseLetters.length;
      
      console.log('Hidden Phrase progress:', revealedLetters.length, '/', phraseLetters.length);
      
      // WIN CONDITION: All phrase letters revealed
      if (allRevealed) {
        return GameOutcome.Win;
      }
      
      return GameOutcome.Playing;
    }
    
    case 'territory_control': {
      const claimableTiles = boardState.tiles.flat().filter(t => t.isClaimable);
      const playerControlledTiles = claimableTiles.filter(t => t.ownerId === 'player1');
      const totalClaimable = claimableTiles.length;
      
      if (totalClaimable === 0) {
        return GameOutcome.Playing;
      }
      
      const controlPercentage = (playerControlledTiles.length / totalClaimable) * 100;
      const targetPercentage = winCondition.targetControlPercentage || 60;
      
      console.log('Territory Control progress:', controlPercentage.toFixed(1), '% (target:', targetPercentage, '%)');
      
      // WIN CONDITION: Reached target control percentage
      if (controlPercentage >= targetPercentage) {
        return GameOutcome.Win;
      }
      
      return GameOutcome.Playing;
    }
    
    case 'score_target':
    default: {
      const targetScore = winCondition.target || 500;
      
      // WIN CONDITION: Reached target score
      if (currentScore >= targetScore) {
        return GameOutcome.Win;
      }
      
      // Optional: Check efficiency score
      if (winCondition.targetEfficiency && movesMade > 0) {
        const efficiency = currentScore / movesMade;
        console.log('Efficiency score:', efficiency.toFixed(2), 'target:', winCondition.targetEfficiency);
      }
      
      return GameOutcome.Playing;
    }
  }
}

/**
 * Checks if the board is irreversibly locked (no valid moves possible)
 */
function isBoardLocked(boardState: BoardState): boolean {
  // Check if there are any unlocked tiles that can form words
  const unlockedTiles = boardState.tiles.flat().filter(t => !t.isLocked);
  
  // If we have at least 3 unlocked tiles, the board is not locked
  if (unlockedTiles.length >= 3) {
    return false;
  }
  
  // Board is locked if we can't form any words
  return true;
}

export function getPuzzleModeProgress(boardState: BoardState, puzzleMode: PuzzleMode, winCondition: WinCondition) {
  switch (puzzleMode) {
    case 'vault_break': {
      const requiredVaultTiles = boardState.tiles.flat().filter(t => t.isVault && t.isRequired);
      const unlockedVaults = requiredVaultTiles.filter(t => !t.isLocked);
      return {
        current: unlockedVaults.length,
        target: requiredVaultTiles.length,
        percentage: requiredVaultTiles.length > 0 ? (unlockedVaults.length / requiredVaultTiles.length) * 100 : 0,
      };
    }
    
    case 'hidden_phrase': {
      const phraseLetters = boardState.tiles.flat().filter(t => t.isPhraseLetter && !t.isDecoy);
      const revealedLetters = phraseLetters.filter(t => t.isRevealed);
      return {
        current: revealedLetters.length,
        target: phraseLetters.length,
        percentage: phraseLetters.length > 0 ? (revealedLetters.length / phraseLetters.length) * 100 : 0,
      };
    }
    
    case 'territory_control': {
      const claimableTiles = boardState.tiles.flat().filter(t => t.isClaimable);
      const playerControlledTiles = claimableTiles.filter(t => t.ownerId === 'player1');
      const totalClaimable = claimableTiles.length;
      const controlPercentage = totalClaimable > 0 ? (playerControlledTiles.length / totalClaimable) * 100 : 0;
      const targetPercentage = winCondition.targetControlPercentage || 60;
      
      return {
        current: controlPercentage,
        target: targetPercentage,
        percentage: controlPercentage,
      };
    }
    
    case 'score_target':
    default: {
      return {
        current: 0,
        target: winCondition.target || 500,
        percentage: 0,
      };
    }
  }
}

// ============================================
// BOARD SYSTEM UTILITIES
// ============================================

/**
 * Converts a BoardMetadata's initialLayout to a playable BoardState
 * This transforms the board definition into the active game board
 */
export function convertBoardToGameState(boardMetadata: BoardMetadata): BoardState {
  console.log('Converting board to game state:', boardMetadata.name, 'puzzleMode:', boardMetadata.puzzleMode);
  const { gridSize, initialLayout, puzzleMode } = boardMetadata;
  
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
        // Locked tile - for vault_break mode
        const isVault = puzzleMode === 'vault_break';
        gameTile = {
          letter: '🔒',
          value: 0,
          row,
          col,
          type: 'locked',
          isLocked: true,
          isVault,
          isRequired: isVault && (boardTile.metadata?.required !== false),
        };
      } else if (boardTile.type === 'puzzle') {
        // Puzzle tile - for hidden_phrase mode
        const letter = boardTile.letter || generateRandomLetter();
        const isPhraseLetter = puzzleMode === 'hidden_phrase' && boardTile.metadata?.isPhraseLetter === true;
        const hiddenLetter = boardTile.metadata?.hiddenLetter as string | undefined;
        
        gameTile = {
          letter: isPhraseLetter && !boardTile.metadata?.revealed ? '?' : letter,
          value: boardTile.value || LETTER_VALUES[letter] || 1,
          row,
          col,
          type: 'puzzle',
          isPhraseLetter,
          isRevealed: boardTile.metadata?.revealed === true,
          isDecoy: boardTile.metadata?.isDecoy === true,
          hiddenLetter: isPhraseLetter ? hiddenLetter : undefined,
          isSpecial: true,
          specialType: 'double',
        };
      } else if (boardTile.type === 'objective') {
        // Objective tile - for territory_control mode
        const letter = boardTile.letter || generateRandomLetter();
        const isClaimable = puzzleMode === 'territory_control';
        
        gameTile = {
          letter,
          value: boardTile.value || LETTER_VALUES[letter] || 5,
          row,
          col,
          type: 'objective',
          isClaimable,
          ownerId: undefined,
          ownerColor: undefined,
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
 * Gets adjacent positions for a given position
 */
function getAdjacentPositions(pos: Position, boardSize: number): Position[] {
  const adjacent: Position[] = [];
  const directions = [
    { row: -1, col: 0 },  // up
    { row: 1, col: 0 },   // down
    { row: 0, col: -1 },  // left
    { row: 0, col: 1 },   // right
    { row: -1, col: -1 }, // up-left
    { row: -1, col: 1 },  // up-right
    { row: 1, col: -1 },  // down-left
    { row: 1, col: 1 },   // down-right
  ];
  
  directions.forEach(dir => {
    const newRow = pos.row + dir.row;
    const newCol = pos.col + dir.col;
    
    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
      adjacent.push({ row: newRow, col: newCol });
    }
  });
  
  return adjacent;
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

// ============================================
// PROGRESSION SYSTEM UTILITIES
// ============================================

export type GameSource = 'solo' | 'multiplayer' | 'dailyChallenge' | 'specialEvent';

/**
 * Calculates XP earned from a game based on performance
 */
export function calculateXpEarned(
  source: GameSource,
  score: number,
  wordsFormed: number,
  efficiency: number,
  isWon: boolean,
  isDailyChallenge: boolean = false,
  isSpecialEvent: boolean = false
): number {
  console.log('Calculating XP:', { source, score, wordsFormed, efficiency, isWon, isDailyChallenge, isSpecialEvent });
  
  let xp = 0;
  
  // Base XP from score (1 XP per 10 points)
  xp += Math.floor(score / 10);
  
  // Bonus for words formed (5 XP per word)
  xp += wordsFormed * 5;
  
  // Efficiency bonus (high efficiency = more XP)
  if (efficiency > 50) {
    xp += Math.floor(score * 0.15); // 15% bonus for high efficiency
  } else if (efficiency > 30) {
    xp += Math.floor(score * 0.1); // 10% bonus for medium efficiency
  }
  
  // Win bonus
  if (isWon) {
    xp += 50; // Flat win bonus
  }
  
  // Game mode multipliers
  if (source === 'multiplayer') {
    xp = Math.floor(xp * 1.2); // 20% bonus for multiplayer
  } else if (source === 'solo') {
    xp = Math.floor(xp * 1.0); // No multiplier for solo (but still rewarding!)
  }
  
  // Daily Challenge bonus
  if (isDailyChallenge) {
    xp = Math.floor(xp * 1.5); // 50% bonus for daily challenges
  }
  
  // Special Event bonus
  if (isSpecialEvent) {
    xp = Math.floor(xp * 1.3); // 30% bonus for special events
  }
  
  // Ensure minimum XP (always reward participation)
  xp = Math.max(10, xp);
  
  console.log('XP calculated:', xp);
  return xp;
}

/**
 * Calculates level from XP
 * Formula: level = floor(sqrt(xp / 100))
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Calculates XP required for next level
 */
export function calculateXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevel = currentLevel + 1;
  const xpForNextLevel = nextLevel * nextLevel * 100;
  return xpForNextLevel - currentXp;
}
