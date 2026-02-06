
/**
 * Optimized word dictionary using Trie data structure
 * Provides O(m) lookup time where m is word length
 * Much faster than Set for large dictionaries
 */

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class Trie {
  private root: TrieNode;
  
  constructor() {
    this.root = new TrieNode();
  }
  
  insert(word: string): void {
    let node = this.root;
    
    for (const char of word.toUpperCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    
    node.isEndOfWord = true;
  }
  
  search(word: string): boolean {
    let node = this.root;
    
    for (const char of word.toUpperCase()) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    
    return node.isEndOfWord;
  }
  
  startsWith(prefix: string): boolean {
    let node = this.root;
    
    for (const char of prefix.toUpperCase()) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    
    return true;
  }
}

// Initialize dictionary (lazy loaded)
let dictionaryTrie: Trie | null = null;

function initializeDictionary(): Trie {
  if (dictionaryTrie) {
    return dictionaryTrie;
  }
  
  console.log('[Dictionary] Initializing word dictionary...');
  const startTime = performance.now();
  
  dictionaryTrie = new Trie();
  
  // Import words from wordMechanics
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { validateWord } = require('./wordMechanics');
  
  // Add common words (this is a subset - full dictionary would be loaded from file)
  const commonWords = [
    'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT',
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
    'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
    'BOX', 'WORD', 'GAME', 'PLAY', 'WIN', 'LOSE', 'SCORE', 'TILE', 'BOARD',
    // ... (full list would be much longer)
  ];
  
  commonWords.forEach(word => dictionaryTrie!.insert(word));
  
  const endTime = performance.now();
  console.log(`[Dictionary] Initialized in ${(endTime - startTime).toFixed(2)}ms`);
  
  return dictionaryTrie;
}

/**
 * Fast word validation using Trie
 */
export function isValidWordFast(word: string): boolean {
  if (!word || word.length < 3) {
    return false;
  }
  
  const trie = initializeDictionary();
  return trie.search(word);
}

/**
 * Check if a prefix could lead to a valid word
 * Useful for providing hints while user is selecting tiles
 */
export function isValidPrefix(prefix: string): boolean {
  if (!prefix) {
    return true;
  }
  
  const trie = initializeDictionary();
  return trie.startsWith(prefix);
}

/**
 * Get word suggestions based on prefix
 * Useful for autocomplete or hints
 */
export function getWordSuggestions(prefix: string, maxSuggestions: number = 5): string[] {
  // This would require a more complex implementation
  // For now, return empty array
  return [];
}
