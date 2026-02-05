
import { BoardState, Tile, Position, PuzzleMode } from '@/types/game';

// ============================================
// WORD VALIDATION
// ============================================

/**
 * Common English words dictionary (3+ letters)
 * Rejects extremely obscure or exploitative entries
 * Case-insensitive validation
 */
const COMMON_WORDS = new Set([
  // 3-letter words
  'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT',
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
  'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
  'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID',
  'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'BIG', 'END', 'FAR',
  'FUN', 'GOT', 'HOT', 'JOB', 'LAY', 'LOT', 'MAY', 'RAN', 'RED', 'RUN',
  'SET', 'SIT', 'TEN', 'TOP', 'TRY', 'WIN', 'YES', 'YET', 'AGO', 'AIR',
  'BAD', 'BAG', 'BED', 'BIT', 'BOX', 'BUS', 'BUY', 'CAR', 'CUP', 'CUT',
  
  // 4-letter words
  'ABLE', 'BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'EACH', 'EVEN', 'FIND',
  'GIVE', 'GOOD', 'HAND', 'HAVE', 'HERE', 'HIGH', 'INTO', 'JUST', 'KNOW',
  'LAST', 'LIFE', 'LIKE', 'LINE', 'LONG', 'LOOK', 'MADE', 'MAKE', 'MANY',
  'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST', 'NAME', 'NEED', 'NEXT', 'ONLY',
  'OVER', 'PART', 'SAME', 'SEEM', 'SHOW', 'SIDE', 'SOME', 'SUCH', 'TAKE',
  'TELL', 'THAN', 'THAT', 'THEM', 'THEN', 'THIS', 'TIME', 'VERY', 'WANT',
  'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WITH', 'WORK', 'YEAR', 'YOUR',
  'ALSO', 'AREA', 'AWAY', 'BEST', 'BOTH', 'CITY', 'DOOR', 'DOWN', 'EACH',
  'FACE', 'FACT', 'FEEL', 'FELT', 'FIRE', 'FIVE', 'FOOD', 'FORM', 'FOUR',
  'FREE', 'FROM', 'FULL', 'GAME', 'GAVE', 'GIRL', 'GOES', 'GONE', 'HALF',
  'HEAD', 'HEAR', 'HELP', 'HOLD', 'HOME', 'HOPE', 'HOUR', 'IDEA', 'KEEP',
  'KIND', 'KNEW', 'LATE', 'LEAD', 'LEFT', 'LESS', 'LIVE', 'LOST', 'LOVE',
  'MAIN', 'MEAN', 'MEET', 'MIND', 'MISS', 'NEAR', 'ONCE', 'OPEN', 'PAID',
  'PASS', 'PAST', 'PLAN', 'PLAY', 'PULL', 'PUSH', 'READ', 'REAL', 'REST',
  'ROAD', 'ROOM', 'SAID', 'SAVE', 'SEEN', 'SELF', 'SEND', 'SENT', 'SOON',
  'SORT', 'STAY', 'STEP', 'STOP', 'SURE', 'TALK', 'TEAM', 'TOLD', 'TOOK',
  'TOWN', 'TREE', 'TRUE', 'TURN', 'USED', 'WAIT', 'WALK', 'WALL', 'WEEK',
  'WEST', 'WIFE', 'WILL', 'WIND', 'WISH', 'WORD', 'WORE', 'YARD', 'ZONE',
  
  // 5-letter words
  'ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'ALONG', 'AMONG', 'ASKED', 'BASED',
  'BEGIN', 'BEING', 'BELOW', 'BLACK', 'BRING', 'BUILD', 'CARRY', 'CAUSE',
  'CHAIR', 'CHILD', 'CLEAR', 'CLOSE', 'COULD', 'DOING', 'EARLY', 'EARTH',
  'EIGHT', 'ENTER', 'EVERY', 'FIELD', 'FIRST', 'FLOOR', 'FORCE', 'FOUND',
  'FRONT', 'GIVEN', 'GOING', 'GREAT', 'GREEN', 'GROUP', 'HAPPY', 'HEARD',
  'HEART', 'HEAVY', 'HORSE', 'HOUSE', 'HUMAN', 'LARGE', 'LATER', 'LEARN',
  'LEAST', 'LEAVE', 'LEVEL', 'LIGHT', 'LIVED', 'LOCAL', 'MAJOR', 'MIGHT',
  'MONEY', 'MONTH', 'MUSIC', 'NEVER', 'NIGHT', 'NORTH', 'OFTEN', 'ORDER',
  'OTHER', 'PARTY', 'PEACE', 'PLACE', 'PLANT', 'POINT', 'POWER', 'PRESS',
  'QUITE', 'REACH', 'RIGHT', 'RIVER', 'ROUND', 'SENSE', 'SEVEN', 'SHALL',
  'SHORT', 'SHOWN', 'SINCE', 'SMALL', 'SOUND', 'SOUTH', 'SPACE', 'SPEAK',
  'SPENT', 'STAND', 'START', 'STATE', 'STILL', 'STOOD', 'STORY', 'STUDY',
  'STUFF', 'TABLE', 'TAKEN', 'THANK', 'THEIR', 'THERE', 'THESE', 'THING',
  'THINK', 'THIRD', 'THOSE', 'THREE', 'TODAY', 'TOTAL', 'TOUCH', 'TRIED',
  'UNDER', 'UNTIL', 'USING', 'VALUE', 'VOICE', 'WATCH', 'WATER', 'WHERE',
  'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WORLD', 'WOULD',
  'WRITE', 'WRONG', 'YOUNG', 'BREAK', 'CLAIM', 'SHIFT', 'VAULT', 'NORTH',
  'SOUTH', 'MADAM', 'RADAR', 'CIVIC', 'KAYAK', 'REFER', 'ROTOR', 'SAGAS',
  
  // 6-letter words
  'ACROSS', 'ACTION', 'ALWAYS', 'AMOUNT', 'ANSWER', 'APPEAR', 'AROUND',
  'ATTACK', 'BECAME', 'BECOME', 'BEFORE', 'BEHIND', 'BETTER', 'BEYOND',
  'BOUGHT', 'BROKEN', 'CALLED', 'CANNOT', 'CENTER', 'CENTRE', 'CHANGE',
  'CHARGE', 'CHURCH', 'CLOSED', 'COMING', 'COMMON', 'COURSE', 'CREATE',
  'DECIDE', 'DEGREE', 'DEMAND', 'DEPEND', 'DESIGN', 'DETAIL', 'DIRECT',
  'DOCTOR', 'DURING', 'EFFECT', 'EFFORT', 'EITHER', 'ENERGY', 'ENOUGH',
  'ENTIRE', 'EUROPE', 'EXPECT', 'FAMILY', 'FATHER', 'FIGURE', 'FOLLOW',
  'FRIEND', 'FUTURE', 'GARDEN', 'GROUND', 'GROWTH', 'HAPPEN', 'HAVING',
  'HEALTH', 'HIDDEN', 'HIGHER', 'INDEED', 'INSIDE', 'ISLAND', 'ITSELF',
  'KILLED', 'LABOUR', 'LATEST', 'LATTER', 'LEADER', 'LETTER', 'LISTEN',
  'LITTLE', 'LIVING', 'LONDON', 'LOOKED', 'MAKING', 'MANNER', 'MARKET',
  'MATTER', 'MEMBER', 'MEMORY', 'METHOD', 'MIDDLE', 'MINUTE', 'MODERN',
  'MOMENT', 'MOTHER', 'MOTION', 'MOVING', 'MURDER', 'NATION', 'NATURE',
  'NEARLY', 'NEEDED', 'NOTICE', 'NUMBER', 'OBJECT', 'OFFICE', 'OPENED',
  'ORIGIN', 'OTHERS', 'PASSED', 'PEOPLE', 'PERIOD', 'PERSON', 'PLACED',
  'PLAYED', 'PLEASE', 'POLICY', 'PRETTY', 'PRINCE', 'PROPER', 'PUBLIC',
  'RATHER', 'REASON', 'RECENT', 'RECORD', 'REDUCE', 'REGION', 'REMAIN',
  'REMOVE', 'REPORT', 'RESULT', 'RETURN', 'REVEAL', 'ROTATE', 'SCHOOL',
  'SEASON', 'SECOND', 'SECRET', 'SEEMED', 'SERIES', 'SERVED', 'SETTLE',
  'SHOULD', 'SIMPLE', 'SINGLE', 'SISTER', 'SOCIAL', 'SPIRIT', 'SPREAD',
  'SPRING', 'SQUARE', 'STREET', 'STRONG', 'STRUCK', 'SUMMER', 'SUPPLY',
  'SYSTEM', 'TAKING', 'THOUGH', 'TOWARD', 'TRAVEL', 'TRYING', 'TURNED',
  'TWENTY', 'UNABLE', 'UNITED', 'UNLESS', 'UNLIKE', 'WANTED', 'WINDOW',
  'WINTER', 'WITHIN', 'WONDER', 'WORKED', 'WRITER', 'UNLOCK', 'PHRASE',
  
  // 7+ letter words
  'ABILITY', 'ACCOUNT', 'ADDRESS', 'AGAINST', 'ALREADY', 'ANOTHER',
  'ANYTHING', 'ARRIVED', 'ARTICLE', 'ATTEMPT', 'AVERAGE', 'BECAUSE',
  'BELIEVE', 'BENEFIT', 'BETWEEN', 'BROTHER', 'BROUGHT', 'BUILDING',
  'BUSINESS', 'CAPITAL', 'CAPTAIN', 'CENTURY', 'CERTAIN', 'CHAIRMAN',
  'CHAPTER', 'CHARACTER', 'CHILDREN', 'COLLEGE', 'COMPANY', 'COMPARE',
  'COMPLETE', 'CONCERN', 'CONDITION', 'CONSIDER', 'CONTAIN', 'CONTINUE',
  'CONTROL', 'COUNTRY', 'CURRENT', 'DECIDED', 'DEFENCE', 'DEFENSE',
  'DEVELOP', 'DIFFERENCE', 'DIFFERENT', 'DIFFICULT', 'DIRECTION', 'DISCOVER',
  'DISTANCE', 'DISTRICT', 'DIVISION', 'ECONOMY', 'EDUCATION', 'ELECTION',
  'ELEMENT', 'ENGLAND', 'ENGLISH', 'EVENING', 'EVIDENCE', 'EXAMPLE',
  'EXERCISE', 'EXPERIENCE', 'EXPLAIN', 'EXPRESS', 'FEELING', 'FINALLY',
  'FOREIGN', 'FORWARD', 'FREEDOM', 'FURTHER', 'GENERAL', 'GOVERNMENT',
  'GREATER', 'HISTORY', 'HOWEVER', 'HUNDRED', 'HUSBAND', 'IMAGINE',
  'IMPORTANT', 'IMPROVE', 'INCLUDE', 'INCREASE', 'INDUSTRY', 'INSTEAD',
  'INTEREST', 'JUSTICE', 'KITCHEN', 'LANGUAGE', 'LEADING', 'LEARNED',
  'LIBRARY', 'MACHINE', 'MANAGER', 'MEANING', 'MEASURE', 'MEETING',
  'MENTION', 'MESSAGE', 'MILLION', 'MINISTER', 'MORNING', 'MOVEMENT',
  'NATURAL', 'NEITHER', 'NOTHING', 'OBVIOUS', 'OFFICER', 'OPINION',
  'OUTSIDE', 'OVERALL', 'PARENTS', 'PARTICULAR', 'PASSAGE', 'PATTERN',
  'PERHAPS', 'PICTURE', 'POLITICAL', 'POPULAR', 'POSITION', 'POSSIBLE',
  'PRESENT', 'PRESIDENT', 'PRESSURE', 'PRIVATE', 'PROBABLY', 'PROBLEM',
  'PROCESS', 'PRODUCE', 'PRODUCT', 'PROGRAM', 'PROJECT', 'PROMISE',
  'PROTECT', 'PROVIDE', 'PURPOSE', 'QUALITY', 'QUARTER', 'QUESTION',
  'QUICKLY', 'RAILWAY', 'REALIZE', 'RECEIVE', 'RECENTLY', 'RECOGNIZE',
  'REQUIRE', 'RESPECT', 'SECTION', 'SERIOUS', 'SERVICE', 'SEVERAL',
  'SIMILAR', 'SOCIETY', 'SOLDIER', 'SOMEONE', 'SPECIAL', 'STATION',
  'STRANGE', 'STUDENT', 'SUBJECT', 'SUCCESS', 'SUGGEST', 'SUPPORT',
  'SURFACE', 'TEACHER', 'THOUGHT', 'THROUGH', 'TONIGHT', 'TOWARDS',
  'TRAFFIC', 'TROUBLE', 'TURNING', 'USUALLY', 'VARIOUS', 'VILLAGE',
  'WAITING', 'WALKING', 'WEATHER', 'WHETHER', 'WITHOUT', 'WORKING',
  'WRITING', 'WRITTEN', 'RACECAR', 'ROTATOR', 'DEIFIED', 'REPAPER',
  'REVIVER', 'TERRITORY', 'EMOTIONAL', 'HAPPINESS',
  
  // Action verbs
  'MOVE', 'ROTATE', 'SHIFT', 'BREAK', 'UNLOCK', 'REVEAL', 'PUSH', 'PULL',
  'SLIDE', 'TWIST', 'FLIP', 'SPIN', 'SWAP', 'CHANGE', 'TRANSFORM',
  
  // Emotion words
  'HAPPY', 'SAD', 'JOY', 'FEAR', 'LOVE', 'ANGER', 'HOPE', 'PRIDE',
  'SHAME', 'GUILT', 'TRUST', 'CALM', 'RAGE', 'PEACE', 'WORRY',
  
  // Direction words
  'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 'LEFT', 'RIGHT',
  'FORWARD', 'BACKWARD', 'UPWARD', 'DOWNWARD',
]);

/**
 * Validates if a word is acceptable for gameplay
 * - Minimum 3 letters
 * - Common English words only
 * - Case-insensitive
 */
export function validateWord(word: string): boolean {
  console.log('Validating word:', word);
  
  if (!word || word.length < 3) {
    console.log('Word too short:', word.length);
    return false;
  }
  
  const upperWord = word.toUpperCase();
  const isValid = COMMON_WORDS.has(upperWord);
  
  console.log('Word validation result:', isValid);
  return isValid;
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
  
  // Extract tiles from positions
  const tilesToReverse = positions.map(pos => newTiles[pos.row][pos.col]);
  
  // Reverse the array
  tilesToReverse.reverse();
  
  // Place them back
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
  
  // For simplicity, we'll rotate by swapping positions in a circular pattern
  // This is a simplified rotation - a full implementation would do proper matrix rotation
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
  
  // Update column positions
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
  
  // Update row positions and place back
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
  
  // Apply each effect in sequence
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
  
  // Replace used tiles with new letters (unless they're special puzzle tiles)
  const newTiles = updatedBoard.tiles.map(row => row.map(tile => ({ ...tile })));
  
  selectedPositions.forEach(pos => {
    const tile = newTiles[pos.row][pos.col];
    
    // Don't replace locked, vault, or phrase tiles
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
  
  // Get center position for area effects
  const centerPos = selectedPositions[Math.floor(selectedPositions.length / 2)];
  
  switch (effect.type) {
    case 'rare_letter':
      // Rare letters (Q, Z, X, J) instantly break locked tiles
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
      // Reverse a 3x3 region around the center
      updatedBoard = reverseBoardRegion(updatedBoard, centerPos, 3);
      return updatedBoard;
      
    case 'repeated':
      // Duplicate the previous effect
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
      // Reveal hidden or fogged tiles
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
        // Rotate a 3x3 section around the center
        updatedBoard = rotateBoardSection(updatedBoard, centerPos, 3, 'clockwise');
        return updatedBoard;
      } else if (effect.category === 'emotion_word') {
        // Change tile ownership (for territory control)
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
        // Shift rows or columns based on direction
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
      // Bonus effects based on puzzle mode
      if (puzzleMode === 'vault_break') {
        // Weaken locks on adjacent tiles
        selectedPositions.forEach(pos => {
          const adjacent = getAdjacentPositions(pos, board.size);
          adjacent.forEach(adjPos => {
            const tile = newTiles[adjPos.row][adjPos.col];
            if (tile.isLocked || tile.isVault) {
              console.log('Weakening lock at:', adjPos);
              // Mark as weakened (could be broken by next word)
              newTiles[adjPos.row][adjPos.col] = {
                ...tile,
                isSpecial: true,
                specialType: 'double', // Visual indicator
              };
            }
          });
        });
      } else if (puzzleMode === 'hidden_phrase') {
        // Reveal some hidden letters
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
        // Shift ownership of nearby tiles
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
      // Major effects based on puzzle mode
      if (puzzleMode === 'vault_break') {
        // Unlock multiple vaults
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
        // Reveal large portion of phrase
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
        // Claim large area
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
function getLetterValue(letter: string): number {
  const LETTER_VALUES: { [key: string]: number } = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
  };
  
  return LETTER_VALUES[letter.toUpperCase()] || 1;
}
</write file="utils/wordMechanics.ts">

Now I need to update the `gameLogic.ts` file to integrate the new word mechanics system:

<write file="utils/gameLogic.ts">
import { Tile, Position, BoardState, BoardTile, BoardMetadata, TileType, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import {
  validateWord,
  analyzeWordEffects,
  applyWordEffectsToBoard,
  WordEffect,
} from './wordMechanics';

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

/**
 * Validates if a word is acceptable for gameplay
 * Uses the new word mechanics validation system
 */
export function isValidWord(word: string): boolean {
  console.log('Validating word:', word);
  return validateWord(word);
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
  
  // Bonus for longer words
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

/**
 * Applies word effects to the board using the new word mechanics system
 * This is the main integration point for the strategic word system
 */
export function applyWordEffect(
  board: BoardState,
  positions: Position[],
  puzzleMode?: PuzzleMode,
  playerId?: string,
  word?: string,
  lastEffect?: WordEffect | null
): { board: BoardState; effects: WordEffect[] } {
  console.log('Applying word effect to board at positions:', positions, 'puzzleMode:', puzzleMode, 'word:', word);
  
  // If no word provided, fall back to old behavior
  if (!word) {
    const oldBoard = applyWordEffectLegacy(board, positions, puzzleMode, playerId);
    return { board: oldBoard, effects: [] };
  }
  
  // Analyze word effects
  const effects = analyzeWordEffects(word, lastEffect || null);
  console.log('Word effects analyzed:', effects.length, 'effects');
  
  // Apply effects to board
  const updatedBoard = applyWordEffectsToBoard(
    board,
    word,
    positions,
    effects,
    puzzleMode || 'score_target',
    playerId,
    lastEffect || null
  );
  
  return { board: updatedBoard, effects };
}

/**
 * Legacy word effect application (for backwards compatibility)
 */
function applyWordEffectLegacy(board: BoardState, positions: Position[], puzzleMode?: PuzzleMode, playerId?: string): BoardState {
  const newTiles = board.tiles.map(row => row.map(tile => ({ ...tile })));
  
  positions.forEach((pos) => {
    const tile = newTiles[pos.row][pos.col];
    
    // Apply puzzle mode specific effects
    if (puzzleMode === 'vault_break') {
      // Unlock adjacent locked tiles
      const adjacentPositions = getAdjacentPositions(pos, board.size);
      adjacentPositions.forEach(adjPos => {
        const adjTile = newTiles[adjPos.row][adjPos.col];
        if (adjTile.isLocked && adjTile.isVault) {
          console.log('Unlocking vault tile at:', adjPos);
          newTiles[adjPos.row][adjPos.col] = {
            ...adjTile,
            isLocked: false,
            letter: generateRandomLetter(),
          };
        }
      });
    } else if (puzzleMode === 'hidden_phrase') {
      // Reveal hidden phrase letters
      if (tile.isPhraseLetter && !tile.isRevealed && tile.hiddenLetter) {
        console.log('Revealing phrase letter at:', pos);
        newTiles[pos.row][pos.col] = {
          ...tile,
          isRevealed: true,
          letter: tile.hiddenLetter,
        };
      }
    } else if (puzzleMode === 'territory_control') {
      // Claim tiles for the player
      if (tile.isClaimable) {
        console.log('Claiming tile at:', pos, 'for player:', playerId);
        newTiles[pos.row][pos.col] = {
          ...tile,
          ownerId: playerId || 'player1',
          ownerColor: playerId === 'player2' ? '#EF4444' : '#3B82F6',
        };
      }
    }
    
    // Replace used tiles with new letters (unless it's a special puzzle tile)
    if (!tile.isLocked && !tile.isPhraseLetter) {
      const newLetter = generateRandomLetter();
      newTiles[pos.row][pos.col] = {
        ...newTiles[pos.row][pos.col],
        letter: newLetter,
        value: LETTER_VALUES[newLetter] || 1,
      };
    }
  });
  
  return { ...board, tiles: newTiles };
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
  gameMode: 'solo' | 'multiplayer'
): GameOutcome {
  console.log('Checking win condition for puzzle mode:', puzzleMode);
  
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
      return allVaultsUnlocked ? GameOutcome.Win : GameOutcome.Playing;
    }
    
    case 'hidden_phrase': {
      const phraseLetters = boardState.tiles.flat().filter(t => t.isPhraseLetter && !t.isDecoy);
      const revealedLetters = phraseLetters.filter(t => t.isRevealed);
      const allRevealed = phraseLetters.length > 0 && revealedLetters.length === phraseLetters.length;
      
      console.log('Hidden Phrase progress:', revealedLetters.length, '/', phraseLetters.length);
      return allRevealed ? GameOutcome.Win : GameOutcome.Playing;
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
      
      if (gameMode === 'multiplayer') {
        // For multiplayer, this would be checked after X turns
        return GameOutcome.Playing;
      } else {
        return controlPercentage >= targetPercentage ? GameOutcome.Win : GameOutcome.Playing;
      }
    }
    
    case 'score_target':
    default: {
      const targetScore = winCondition.target || 500;
      return currentScore >= targetScore ? GameOutcome.Win : GameOutcome.Playing;
    }
  }
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
</write file="utils/gameLogic.ts">

Now I need to update the game screen to use the new word mechanics system and display the effects:

<write file="app/game.tsx">
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Position, Move, BoardState, PuzzleMode, WinCondition, GameOutcome } from '@/types/game';
import WinConditionDisplay from '@/components/WinConditionDisplay';
import { authenticatedPost, authenticatedGet } from '@/utils/api';
import {
  generateInitialBoard,
  isValidWord,
  calculateScore,
  arePositionsAdjacent,
  applyWordEffect,
  checkWinCondition,
  getPuzzleModeProgress,
} from '@/utils/gameLogic';
import { WordEffect } from '@/utils/wordMechanics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Modal } from '@/components/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import GameBoard from '@/components/GameBoard';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import GameCompletionModal from '@/components/GameCompletionModal';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [board, setBoard] = useState<BoardState | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [movesMade, setMovesMade] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [wordsFormed, setWordsFormed] = useState(0);
  const [lastWordEffect, setLastWordEffect] = useState<WordEffect | null>(null);
  const [currentEffects, setCurrentEffects] = useState<WordEffect[]>([]);
  const [showEffects, setShowEffects] = useState(false);
  
  // Game configuration from params
  const gameId = params.gameId as string | undefined;
  const boardId = params.boardId as string | undefined;
  const gameMode = (params.mode as 'solo' | 'multiplayer') || 'solo';
  const puzzleMode = (params.puzzleMode as PuzzleMode) || 'score_target';
  const targetScore = params.targetScore ? parseInt(params.targetScore as string) : 500;
  const gridSize = params.gridSize ? parseInt(params.gridSize as string) : 7;
  
  const winCondition: WinCondition = {
    type: puzzleMode === 'score_target' ? 'score' : puzzleMode,
    target: targetScore,
    description: `Reach ${targetScore} points`,
    targetControlPercentage: puzzleMode === 'territory_control' ? 60 : undefined,
  };

  useEffect(() => {
    console.log('GameScreen mounted with params:', params);
    if (gameId) {
      loadExistingGame(gameId);
    } else {
      startNewGame();
    }
  }, []);

  async function loadExistingGame(id: string) {
    console.log('Loading existing game:', id);
    try {
      setLoading(true);
      const response = await authenticatedGet(`/api/game/${id}`);
      const gameData = response;
      
      setBoard(gameData.boardState);
      setScore(gameData.currentScore || 0);
      setMovesMade(gameData.moveHistory?.length || 0);
      setWordsFormed(gameData.moveHistory?.length || 0);
      setGameStatus(gameData.status === 'completed' ? 'won' : 'playing');
      
      console.log('Game loaded successfully');
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game. Starting new game instead.');
      startNewGame();
    } finally {
      setLoading(false);
    }
  }

  async function startNewGame() {
    console.log('Starting new game with gridSize:', gridSize, 'puzzleMode:', puzzleMode);
    try {
      setLoading(true);
      const initialBoard = generateInitialBoard(gridSize);
      setBoard(initialBoard);
      setScore(0);
      setMovesMade(0);
      setWordsFormed(0);
      setGameStatus('playing');
      setLastWordEffect(null);
      setCurrentEffects([]);
      
      console.log('New game started successfully');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  }

  function handleTilePress(row: number, col: number) {
    if (!board || gameStatus !== 'playing') {
      return;
    }
    
    console.log('Tile pressed:', row, col);
    
    const position = { row, col };
    const tile = board.tiles[row][col];
    
    // Don't allow selecting locked tiles
    if (tile.isLocked) {
      console.log('Cannot select locked tile');
      return;
    }
    
    // Check if already selected
    const existingIndex = selectedPositions.findIndex(
      p => p.row === row && p.col === col
    );
    
    if (existingIndex !== -1) {
      // Deselect if it's the last selected tile
      if (existingIndex === selectedPositions.length - 1) {
        console.log('Deselecting last tile');
        const newPositions = selectedPositions.slice(0, -1);
        setSelectedPositions(newPositions);
        setCurrentWord(newPositions.map(p => board.tiles[p.row][p.col].letter).join(''));
      }
      return;
    }
    
    // Check adjacency if not first tile
    if (selectedPositions.length > 0) {
      const lastPos = selectedPositions[selectedPositions.length - 1];
      const rowDiff = Math.abs(lastPos.row - row);
      const colDiff = Math.abs(lastPos.col - col);
      const isAdjacent = (rowDiff === 0 && colDiff === 1) ||
                         (rowDiff === 1 && colDiff === 0) ||
                         (rowDiff === 1 && colDiff === 1);
      
      if (!isAdjacent) {
        console.log('Tile not adjacent to last selected tile');
        return;
      }
    }
    
    // Add to selection
    const newPositions = [...selectedPositions, position];
    setSelectedPositions(newPositions);
    
    const newWord = newPositions.map(p => board.tiles[p.row][p.col].letter).join('');
    setCurrentWord(newWord);
    console.log('Current word:', newWord);
  }

  async function handleSubmitWord() {
    if (!board || selectedPositions.length < 3 || !currentWord) {
      console.log('Cannot submit: insufficient tiles selected');
      setError('Select at least 3 tiles to form a word');
      return;
    }
    
    console.log('Submitting word:', currentWord);
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate word
      const isValid = isValidWord(currentWord);
      if (!isValid) {
        console.log('Invalid word:', currentWord);
        setError(`"${currentWord}" is not a valid word`);
        setSubmitting(false);
        return;
      }
      
      // Calculate score
      const wordScore = calculateScore(currentWord, selectedPositions, board);
      console.log('Word score:', wordScore);
      
      // Apply word effects using the new mechanics system
      const { board: updatedBoard, effects } = applyWordEffect(
        board,
        selectedPositions,
        puzzleMode,
        'player1',
        currentWord,
        lastWordEffect
      );
      
      console.log('Word effects applied:', effects.length, 'effects');
      
      // Show effects to player
      if (effects.length > 0) {
        setCurrentEffects(effects);
        setShowEffects(true);
        
        // Store the primary effect for potential duplication
        setLastWordEffect(effects[0]);
        
        // Hide effects after 3 seconds
        setTimeout(() => {
          setShowEffects(false);
        }, 3000);
      }
      
      // Update game state
      const newScore = score + wordScore;
      const newMovesMade = movesMade + 1;
      const newWordsFormed = wordsFormed + 1;
      
      setBoard(updatedBoard);
      setScore(newScore);
      setMovesMade(newMovesMade);
      setWordsFormed(newWordsFormed);
      setSelectedPositions([]);
      setCurrentWord('');
      
      console.log('Game state updated - Score:', newScore, 'Moves:', newMovesMade);
      
      // Check win condition
      const outcome = checkWinCondition(
        updatedBoard,
        puzzleMode,
        winCondition,
        newScore,
        newMovesMade,
        gameMode
      );
      
      console.log('Win condition check result:', outcome);
      
      if (outcome === GameOutcome.Win) {
        console.log('Player won!');
        await completeGame('won', newScore);
      } else if (outcome === GameOutcome.Loss) {
        console.log('Player lost!');
        await completeGame('lost', newScore);
      }
      
    } catch (err) {
      console.error('Error submitting word:', err);
      setError('Failed to submit word');
    } finally {
      setSubmitting(false);
    }
  }

  async function completeGame(status: 'won' | 'lost', finalScore: number) {
    console.log('Completing game with status:', status, 'finalScore:', finalScore);
    setGameStatus(status);
    setShowCompletionModal(true);
    
    // TODO: Backend Integration - POST /api/game/complete with { gameId, status, finalScore, movesMade }
  }

  function handleClearSelection() {
    console.log('Clearing selection');
    setSelectedPositions([]);
    setCurrentWord('');
    setError(null);
  }

  function handleNewGame() {
    console.log('Starting new game');
    setShowCompletionModal(false);
    startNewGame();
  }

  function handleBackToHome() {
    console.log('Navigating back to home');
    router.back();
  }

  function getInstructionsText(): string {
    const wordLength = currentWord.length;
    
    if (wordLength === 0) {
      return 'Select tiles to form a word (min 3 letters)';
    } else if (wordLength < 3) {
      return `Need ${3 - wordLength} more letter${3 - wordLength > 1 ? 's' : ''}`;
    } else if (wordLength <= 4) {
      return 'Standard word - minor board effects';
    } else if (wordLength <= 6) {
      return 'Bonus word - trigger special effects!';
    } else {
      return 'Major word - powerful board changes!';
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={48}
            color={colors.error}
          />
          <Text style={styles.errorText}>Failed to load game</Text>
          <TouchableOpacity style={styles.retryButton} onPress={startNewGame}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = getPuzzleModeProgress(board, puzzleMode, winCondition);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'VERBLOC',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackToHome} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Score and Progress */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Words</Text>
            <Text style={styles.statValue}>{wordsFormed}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{movesMade}</Text>
          </View>
        </View>

        {/* Win Condition Display */}
        <WinConditionDisplay
          puzzleMode={puzzleMode}
          winCondition={winCondition}
          currentScore={score}
          progress={progress}
        />

        {/* Word Effects Display */}
        {showEffects && currentEffects.length > 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.effectsContainer}>
            <Text style={styles.effectsTitle}>Word Effects Triggered!</Text>
            {currentEffects.map((effect, index) => (
              <View key={index} style={styles.effectItem}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.effectText}>{effect.description}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>{getInstructionsText()}</Text>
        </View>

        {/* Current Word Display */}
        {currentWord && (
          <View style={styles.currentWordContainer}>
            <Text style={styles.currentWordLabel}>Current Word:</Text>
            <Text style={styles.currentWord}>{currentWord}</Text>
            <Text style={styles.wordLength}>{currentWord.length} letters</Text>
          </View>
        )}

        {/* Game Board */}
        <GameBoard
          tiles={board.tiles}
          selectedPositions={selectedPositions}
          onTilePress={handleTilePress}
          disabled={gameStatus !== 'playing' || submitting}
        />

        {/* Error Message */}
        {error && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorBanner}>
            <IconSymbol
              ios_icon_name="exclamationmark.circle"
              android_material_icon_name="error"
              size={20}
              color={colors.error}
            />
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearSelection}
            disabled={selectedPositions.length === 0 || submitting}
          >
            <IconSymbol
              ios_icon_name="xmark.circle"
              android_material_icon_name="clear"
              size={20}
              color={selectedPositions.length === 0 ? colors.textSecondary : colors.text}
            />
            <Text style={[
              styles.actionButtonText,
              selectedPositions.length === 0 && styles.actionButtonTextDisabled
            ]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              (selectedPositions.length < 3 || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitWord}
            disabled={selectedPositions.length < 3 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="checkmark.circle"
                  android_material_icon_name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Submit Word</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Game Completion Modal */}
      <GameCompletionModal
        visible={showCompletionModal}
        status={gameStatus}
        finalScore={score}
        targetScore={targetScore}
        wordsFormed={wordsFormed}
        onPlayAgain={handleNewGame}
        onBackToHome={handleBackToHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  effectsContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  effectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  effectText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  currentWordContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  currentWordLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currentWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
  },
  wordLength: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: colors.card,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
