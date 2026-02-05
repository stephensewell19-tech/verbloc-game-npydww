
import { BoardState, Position, PuzzleMode } from '@/types/game';

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
export function getLetterValue(letter: string): number {
  const LETTER_VALUES: { [key: string]: number } = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
  };
  
  return LETTER_VALUES[letter.toUpperCase()] || 1;
}
