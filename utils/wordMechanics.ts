
import { BoardState, Position, PuzzleMode } from '@/types/game';
import { ALL_WORDS, validateWord as validateWordFromDictionary } from './wordDictionary';

// Re-export the comprehensive dictionary
export { ALL_WORDS };

// ============================================
// WORD VALIDATION
// ============================================

/**
 * Validates if a word is acceptable for gameplay
 * Uses the comprehensive dictionary from wordDictionary.ts
 * CRITICAL: This is the single source of truth for word validation
 */
export function validateWord(word: string): boolean {
  return validateWordFromDictionary(word);
}

// ============================================
// WORD EFFECT TYPES
// ============================================

export interface WordEffect {
  type: 'standard' | 'bonus' | 'major' | 'rare_letter' | 'palindrome' | 'repeated' | 'all_vowels' | 'category';
  category?: 'action_verb' | 'emotion_word' | 'direction_word';
  description: string;
  intensity: number; // 1-5 scale for effect strength
  triggeredBy: string[]; // What triggered this effect
}

// ============================================
// PATTERN DETECTION
// ============================================

/**
 * Checks if a word is a palindrome
 */
export function isPalindrome(word: string): boolean {
  const cleaned = word.toUpperCase().replace(/[^A-Z]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

/**
 * Checks if a word has repeated consecutive letters
 */
export function hasRepeatedLetters(word: string): boolean {
  const upper = word.toUpperCase();
  for (let i = 0; i < upper.length - 1; i++) {
    if (upper[i] === upper[i + 1]) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a word consists only of vowels
 */
export function isAllVowels(word: string): boolean {
  const upper = word.toUpperCase();
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
  
  if (upper.length === 0) {
    return false;
  }
  
  for (const char of upper) {
    if (!vowels.has(char)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Checks if a word contains rare letters (Q, Z, X, J)
 */
export function hasRareLetters(word: string): boolean {
  const upper = word.toUpperCase();
  const rareLetters = new Set(['Q', 'Z', 'X', 'J']);
  
  for (const char of upper) {
    if (rareLetters.has(char)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets all rare letters in a word
 */
export function getRareLetters(word: string): string[] {
  const upper = word.toUpperCase();
  const rareLetters = new Set(['Q', 'Z', 'X', 'J']);
  const found: string[] = [];
  
  for (const char of upper) {
    if (rareLetters.has(char) && !found.includes(char)) {
      found.push(char);
    }
  }
  
  return found;
}

// ============================================
// CATEGORY DETECTION (RULE-BASED)
// ============================================

const ACTION_VERBS = new Set([
  'MOVE', 'ROTATE', 'SHIFT', 'BREAK', 'UNLOCK', 'REVEAL', 'PUSH', 'PULL',
  'SLIDE', 'TWIST', 'FLIP', 'SPIN', 'SWAP', 'CHANGE', 'TRANSFORM',
  'TURN', 'OPEN', 'CLOSE', 'LIFT', 'DROP', 'THROW', 'CATCH',
]);

const EMOTION_WORDS = new Set([
  'HAPPY', 'SAD', 'JOY', 'FEAR', 'LOVE', 'ANGER', 'HOPE', 'PRIDE',
  'SHAME', 'GUILT', 'TRUST', 'CALM', 'RAGE', 'PEACE', 'WORRY',
  'HAPPINESS', 'SADNESS', 'EMOTIONAL',
]);

const DIRECTION_WORDS = new Set([
  'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 'LEFT', 'RIGHT',
  'FORWARD', 'BACKWARD', 'UPWARD', 'DOWNWARD', 'ABOVE', 'BELOW',
]);

export function isActionVerb(word: string): boolean {
  return ACTION_VERBS.has(word.toUpperCase());
}

export function isEmotionWord(word: string): boolean {
  return EMOTION_WORDS.has(word.toUpperCase());
}

export function isDirectionWord(word: string): boolean {
  return DIRECTION_WORDS.has(word.toUpperCase());
}

// ============================================
// WORD EFFECT ANALYSIS
// ============================================

/**
 * Analyzes a word and determines all effects it should trigger
 */
export function analyzeWordEffects(word: string, lastEffect: WordEffect | null): WordEffect[] {
  console.log('Analyzing word effects for:', word);
  const effects: WordEffect[] = [];
  const upper = word.toUpperCase();
  const triggeredBy: string[] = [];
  
  // 1. Word Length Effects
  if (word.length >= 7) {
    triggeredBy.push('7+ letters');
    effects.push({
      type: 'major',
      description: 'Major puzzle effect: unlock vaults, rotate board sections, large state changes',
      intensity: 5,
      triggeredBy: ['7+ letters'],
    });
  } else if (word.length >= 5) {
    triggeredBy.push('5-6 letters');
    effects.push({
      type: 'bonus',
      description: 'Bonus puzzle effect: reveal tiles, shift ownership, weaken locks',
      intensity: 3,
      triggeredBy: ['5-6 letters'],
    });
  } else {
    triggeredBy.push('3-4 letters');
    effects.push({
      type: 'standard',
      description: 'Standard placement with minor board interaction',
      intensity: 1,
      triggeredBy: ['3-4 letters'],
    });
  }
  
  // 2. Rare Letter Effects (Q, Z, X, J)
  if (hasRareLetters(word)) {
    const rareLetters = getRareLetters(word);
    effects.push({
      type: 'rare_letter',
      description: `Rare letter effect (${rareLetters.join(', ')}): instantly break locked tiles, amplify effects`,
      intensity: 4,
      triggeredBy: rareLetters.map(l => `rare letter ${l}`),
    });
  }
  
  // 3. Pattern Effects
  if (isPalindrome(word)) {
    effects.push({
      type: 'palindrome',
      description: 'Palindrome effect: reverse a defined board region',
      intensity: 3,
      triggeredBy: ['palindrome pattern'],
    });
  }
  
  if (hasRepeatedLetters(word) && lastEffect) {
    effects.push({
      type: 'repeated',
      description: `Repeated letters effect: duplicate the previous effect (${lastEffect.type})`,
      intensity: lastEffect.intensity,
      triggeredBy: ['repeated letters'],
    });
  }
  
  if (isAllVowels(word)) {
    effects.push({
      type: 'all_vowels',
      description: 'All vowels effect: reveal fogged or hidden tiles',
      intensity: 2,
      triggeredBy: ['all vowels'],
    });
  }
  
  // 4. Category Effects (Rule-based)
  if (isActionVerb(word)) {
    effects.push({
      type: 'category',
      category: 'action_verb',
      description: 'Action verb effect: move or rotate tiles',
      intensity: 3,
      triggeredBy: ['action verb'],
    });
  }
  
  if (isEmotionWord(word)) {
    effects.push({
      type: 'category',
      category: 'emotion_word',
      description: 'Emotion word effect: change tile ownership or state',
      intensity: 2,
      triggeredBy: ['emotion word'],
    });
  }
  
  if (isDirectionWord(word)) {
    effects.push({
      type: 'category',
      category: 'direction_word',
      description: 'Direction word effect: shift rows or columns',
      intensity: 3,
      triggeredBy: ['direction word'],
    });
  }
  
  console.log('Word effects analyzed:', effects.length, 'effects found');
  return effects;
}

// ============================================
// BOARD MANIPULATION UTILITIES
// ============================================

/**
 * Gets adjacent positions for a given position (8 directions)
 */
export function getAdjacentPositions(pos: Position, boardSize: number): Position[] {
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
 * Gets positions in a region around a center point
 */
export function getRegionPositions(center: Position, size: number, boardSize: number): Position[] {
  const positions: Position[] = [];
  const radius = Math.floor(size / 2);
  
  for (let row = center.row - radius; row <= center.row + radius; row++) {
    for (let col = center.col - radius; col <= center.col + radius; col++) {
      if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        positions.push({ row, col });
      }
    }
  }
  
  return positions;
}

/**
 * Reverses tiles in a region (for palindrome effect)
 */
export function reverseBoardRegion(board: BoardState, center: Position, regionSize: number): BoardState {
  console.log('Reversing board region around:', center, 'size:', regionSize);
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  const positions = getRegionPositions(center, regionSize, board.size);
  
  const tilesToReverse = positions.map(pos => newTiles[pos.row][pos.col]);
  tilesToReverse.reverse();
  
  positions.forEach((pos, index) => {
    const reversedTile = tilesToReverse[index];
    newTiles[pos.row][pos.col] = {
      ...reversedTile,
      row: pos.row,
      col: pos.col,
    };
  });
  
  return { ...board, tiles: newTiles };
}

/**
 * Rotates a section of the board (for action verb effect)
 */
export function rotateBoardSection(
  board: BoardState,
  center: Position,
  sectionSize: number,
  direction: 'clockwise' | 'counter-clockwise'
): BoardState {
  console.log('Rotating board section around:', center, 'direction:', direction);
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  const positions = getRegionPositions(center, sectionSize, board.size);
  
  const tilesToRotate = positions.map(pos => newTiles[pos.row][pos.col]);
  
  if (direction === 'clockwise') {
    tilesToRotate.unshift(tilesToRotate.pop()!);
  } else {
    tilesToRotate.push(tilesToRotate.shift()!);
  }
  
  positions.forEach((pos, index) => {
    const rotatedTile = tilesToRotate[index];
    newTiles[pos.row][pos.col] = {
      ...rotatedTile,
      row: pos.row,
      col: pos.col,
    };
  });
  
  return { ...board, tiles: newTiles };
}

/**
 * Shifts a row in a direction (for direction word effect)
 */
export function shiftRow(board: BoardState, rowIndex: number, direction: 'left' | 'right'): BoardState {
  console.log('Shifting row:', rowIndex, 'direction:', direction);
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  
  if (rowIndex < 0 || rowIndex >= board.size) {
    return board;
  }
  
  const row = newTiles[rowIndex];
  
  if (direction === 'right') {
    const lastTile = row.pop()!;
    row.unshift(lastTile);
  } else {
    const firstTile = row.shift()!;
    row.push(firstTile);
  }
  
  row.forEach((tile, colIndex) => {
    tile.col = colIndex;
  });
  
  return { ...board, tiles: newTiles };
}

/**
 * Shifts a column in a direction (for direction word effect)
 */
export function shiftColumn(board: BoardState, colIndex: number, direction: 'up' | 'down'): BoardState {
  console.log('Shifting column:', colIndex, 'direction:', direction);
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  
  if (colIndex < 0 || colIndex >= board.size) {
    return board;
  }
  
  const column = newTiles.map(row => row[colIndex]);
  
  if (direction === 'down') {
    const lastTile = column.pop()!;
    column.unshift(lastTile);
  } else {
    const firstTile = column.shift()!;
    column.push(firstTile);
  }
  
  column.forEach((tile, rowIndex) => {
    tile.row = rowIndex;
    newTiles[rowIndex][colIndex] = tile;
  });
  
  return { ...board, tiles: newTiles };
}

/**
 * Generates a random letter based on distribution
 */
export function generateRandomLetter(): string {
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
  
  const letterPool: string[] = [];
  LETTER_DISTRIBUTION.forEach(({ letter, count }) => {
    for (let i = 0; i < count; i++) {
      letterPool.push(letter);
    }
  });
  
  const randomIndex = Math.floor(Math.random() * letterPool.length);
  return letterPool[randomIndex];
}

// ============================================
// APPLY WORD EFFECTS TO BOARD
// ============================================

/**
 * Applies all word effects to the board based on puzzle mode
 */
export function applyWordEffectsToBoard(
  board: BoardState,
  word: string,
  selectedPositions: Position[],
  effects: WordEffect[],
  puzzleMode: PuzzleMode,
  playerId?: string,
  lastEffect?: WordEffect | null
): BoardState {
  console.log('Applying word effects to board:', word, 'effects:', effects.length);
  let updatedBoard = { ...board };
  
  effects.forEach(effect => {
    updatedBoard = applySingleEffect(
      updatedBoard,
      word,
      selectedPositions,
      effect,
      puzzleMode,
      playerId,
      lastEffect
    );
  });
  
  const newTiles = updatedBoard.tiles.map(row => row.map(tile => ({ ...tile })));
  
  selectedPositions.forEach(pos => {
    const tile = newTiles[pos.row][pos.col];
    
    if (!tile.isLocked && !tile.isVault && !tile.isPhraseLetter) {
      const newLetter = generateRandomLetter();
      newTiles[pos.row][pos.col] = {
        ...tile,
        letter: newLetter,
        value: getLetterValue(newLetter),
      };
    }
  });
  
  return { ...updatedBoard, tiles: newTiles };
}

/**
 * Applies a single effect to the board
 */
function applySingleEffect(
  board: BoardState,
  word: string,
  selectedPositions: Position[],
  effect: WordEffect,
  puzzleMode: PuzzleMode,
  playerId?: string,
  lastEffect?: WordEffect | null
): BoardState {
  console.log('Applying single effect:', effect.type, 'to puzzle mode:', puzzleMode);
  let updatedBoard = { ...board };
  const newTiles = updatedBoard.tiles.map(row => row.map(tile => ({ ...tile })));
  
  const centerPos = selectedPositions[Math.floor(selectedPositions.length / 2)];
  
  switch (effect.type) {
    case 'rare_letter':
      selectedPositions.forEach(pos => {
        const adjacent = getAdjacentPositions(pos, board.size);
        adjacent.forEach(adjPos => {
          const tile = newTiles[adjPos.row][adjPos.col];
          if (tile.isLocked || tile.isVault) {
            console.log('Breaking locked tile at:', adjPos);
            newTiles[adjPos.row][adjPos.col] = {
              ...tile,
              isLocked: false,
              letter: generateRandomLetter(),
            };
          }
        });
      });
      break;
      
    case 'palindrome':
      updatedBoard = reverseBoardRegion(updatedBoard, centerPos, 3);
      return updatedBoard;
      
    case 'repeated':
      if (lastEffect) {
        console.log('Duplicating previous effect:', lastEffect.type);
        updatedBoard = applySingleEffect(
          updatedBoard,
          word,
          selectedPositions,
          lastEffect,
          puzzleMode,
          playerId,
          null
        );
      }
      break;
      
    case 'all_vowels':
      newTiles.forEach(row => {
        row.forEach(tile => {
          if (tile.isPhraseLetter && !tile.isRevealed && tile.hiddenLetter) {
            console.log('Revealing phrase letter at:', tile.row, tile.col);
            tile.isRevealed = true;
            tile.letter = tile.hiddenLetter;
          }
        });
      });
      break;
      
    case 'category':
      if (effect.category === 'action_verb') {
        updatedBoard = rotateBoardSection(updatedBoard, centerPos, 3, 'clockwise');
        return updatedBoard;
      } else if (effect.category === 'emotion_word') {
        if (puzzleMode === 'territory_control') {
          selectedPositions.forEach(pos => {
            const adjacent = getAdjacentPositions(pos, board.size);
            adjacent.forEach(adjPos => {
              const tile = newTiles[adjPos.row][adjPos.col];
              if (tile.isClaimable) {
                console.log('Claiming tile at:', adjPos, 'for player:', playerId);
                newTiles[adjPos.row][adjPos.col] = {
                  ...tile,
                  ownerId: playerId || 'player1',
                  ownerColor: playerId === 'player2' ? '#EF4444' : '#3B82F6',
                };
              }
            });
          });
        }
      } else if (effect.category === 'direction_word') {
        const upper = word.toUpperCase();
        if (upper === 'NORTH' || upper === 'UP' || upper === 'UPWARD') {
          updatedBoard = shiftColumn(updatedBoard, centerPos.col, 'up');
          return updatedBoard;
        } else if (upper === 'SOUTH' || upper === 'DOWN' || upper === 'DOWNWARD') {
          updatedBoard = shiftColumn(updatedBoard, centerPos.col, 'down');
          return updatedBoard;
        } else if (upper === 'WEST' || upper === 'LEFT') {
          updatedBoard = shiftRow(updatedBoard, centerPos.row, 'left');
          return updatedBoard;
        } else if (upper === 'EAST' || upper === 'RIGHT') {
          updatedBoard = shiftRow(updatedBoard, centerPos.row, 'right');
          return updatedBoard;
        }
      }
      break;
      
    case 'bonus':
      if (puzzleMode === 'vault_break') {
        selectedPositions.forEach(pos => {
          const adjacent = getAdjacentPositions(pos, board.size);
          adjacent.forEach(adjPos => {
            const tile = newTiles[adjPos.row][adjPos.col];
            if (tile.isLocked || tile.isVault) {
              console.log('Weakening lock at:', adjPos);
              newTiles[adjPos.row][adjPos.col] = {
                ...tile,
                isSpecial: true,
                specialType: 'double',
              };
            }
          });
        });
      } else if (puzzleMode === 'hidden_phrase') {
        const hiddenTiles = newTiles.flat().filter(t => t.isPhraseLetter && !t.isRevealed);
        const toReveal = Math.min(2, hiddenTiles.length);
        for (let i = 0; i < toReveal; i++) {
          const tile = hiddenTiles[i];
          if (tile.hiddenLetter) {
            console.log('Revealing phrase letter at:', tile.row, tile.col);
            newTiles[tile.row][tile.col] = {
              ...tile,
              isRevealed: true,
              letter: tile.hiddenLetter,
            };
          }
        }
      } else if (puzzleMode === 'territory_control') {
        selectedPositions.forEach(pos => {
          const adjacent = getAdjacentPositions(pos, board.size);
          adjacent.forEach(adjPos => {
            const tile = newTiles[adjPos.row][adjPos.col];
            if (tile.isClaimable) {
              newTiles[adjPos.row][adjPos.col] = {
                ...tile,
                ownerId: playerId || 'player1',
                ownerColor: playerId === 'player2' ? '#EF4444' : '#3B82F6',
              };
            }
          });
        });
      }
      break;
      
    case 'major':
      if (puzzleMode === 'vault_break') {
        const vaultTiles = newTiles.flat().filter(t => t.isVault && t.isLocked);
        const toUnlock = Math.min(3, vaultTiles.length);
        for (let i = 0; i < toUnlock; i++) {
          const tile = vaultTiles[i];
          console.log('Unlocking vault at:', tile.row, tile.col);
          newTiles[tile.row][tile.col] = {
            ...tile,
            isLocked: false,
            letter: generateRandomLetter(),
          };
        }
      } else if (puzzleMode === 'hidden_phrase') {
        const hiddenTiles = newTiles.flat().filter(t => t.isPhraseLetter && !t.isRevealed);
        const toReveal = Math.min(5, hiddenTiles.length);
        for (let i = 0; i < toReveal; i++) {
          const tile = hiddenTiles[i];
          if (tile.hiddenLetter) {
            console.log('Revealing phrase letter at:', tile.row, tile.col);
            newTiles[tile.row][tile.col] = {
              ...tile,
              isRevealed: true,
              letter: tile.hiddenLetter,
            };
          }
        }
      } else if (puzzleMode === 'territory_control') {
        const regionPositions = getRegionPositions(centerPos, 5, board.size);
        regionPositions.forEach(pos => {
          const tile = newTiles[pos.row][pos.col];
          if (tile.isClaimable) {
            newTiles[pos.row][pos.col] = {
              ...tile,
              ownerId: playerId || 'player1',
              ownerColor: playerId === 'player2' ? '#EF4444' : '#3B82F6',
            };
          }
        });
      }
      break;
  }
  
  return { ...updatedBoard, tiles: newTiles };
}

/**
 * Gets the point value for a letter
 */
export function getLetterValue(letter: string): number {
  const LETTER_VALUES: { [key: string]: number } = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
  };
  
  return LETTER_VALUES[letter.toUpperCase()] || 1;
}
