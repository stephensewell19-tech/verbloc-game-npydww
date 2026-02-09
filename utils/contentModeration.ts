
/**
 * CONTENT MODERATION & SAFETY
 * Ensures VERBLOC meets age rating 13+ and safety standards
 */

// Offensive word filter (basic implementation)
// In production, use a comprehensive profanity filter library
const OFFENSIVE_WORDS = new Set([
  // Add comprehensive list of offensive words
  // This is a placeholder - use a proper profanity filter in production
  'badword1',
  'badword2',
  // ... etc
]);

// Check if text contains offensive language
export const containsOffensiveLanguage = (text: string): boolean => {
  const normalized = text.toLowerCase().trim();
  
  // Check against offensive words list
  for (const word of OFFENSIVE_WORDS) {
    if (normalized.includes(word)) {
      return true;
    }
  }
  
  return false;
};

// Validate username for safety
export const isValidUsername = (username: string): { valid: boolean; reason?: string } => {
  // Length check
  if (username.length < 3) {
    return { valid: false, reason: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { valid: false, reason: 'Username must be 20 characters or less' };
  }
  
  // Alphanumeric check (allow underscores and hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, reason: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  // Offensive language check
  if (containsOffensiveLanguage(username)) {
    return { valid: false, reason: 'Username contains inappropriate language' };
  }
  
  return { valid: true };
};

// Preset messages for multiplayer (no open chat)
export const PRESET_MESSAGES = [
  'Good game!',
  'Well played!',
  'Nice move!',
  'Thanks!',
  'Good luck!',
  'Great word!',
  'Impressive!',
  'Close game!',
  'Rematch?',
  'See you next time!',
] as const;

export type PresetMessage = typeof PRESET_MESSAGES[number];

// Validate that message is from preset list
export const isValidPresetMessage = (message: string): boolean => {
  return PRESET_MESSAGES.includes(message as PresetMessage);
};

// Allowed emojis for reactions (safe, non-offensive)
export const ALLOWED_REACTION_EMOJIS = [
  '👍', '👏', '🎉', '🔥', '💯', '⭐', '🏆', '💪', '🤝', '👋',
] as const;

export type AllowedReactionEmoji = typeof ALLOWED_REACTION_EMOJIS[number];

// Validate emoji reaction
export const isValidReactionEmoji = (emoji: string): boolean => {
  return ALLOWED_REACTION_EMOJIS.includes(emoji as AllowedReactionEmoji);
};

// Report types for user reporting system
export const REPORT_TYPES = [
  'inappropriate_username',
  'cheating',
  'harassment',
  'spam',
  'other',
] as const;

export type ReportType = typeof REPORT_TYPES[number];

// Validate report submission
export const isValidReport = (reportType: ReportType, details?: string): { valid: boolean; reason?: string } => {
  if (!REPORT_TYPES.includes(reportType)) {
    return { valid: false, reason: 'Invalid report type' };
  }
  
  if (reportType === 'other' && (!details || details.trim().length < 10)) {
    return { valid: false, reason: 'Please provide details for your report (minimum 10 characters)' };
  }
  
  return { valid: true };
};

// Age verification (13+)
export const isValidAge = (birthDate: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 13;
  }
  
  return age >= 13;
};

// Sanitize user input (prevent XSS, injection attacks)
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 500); // Limit length
};

// Rate limiting for user actions (prevent spam)
export class RateLimiter {
  private actions: Map<string, number[]> = new Map();
  
  constructor(
    private maxActions: number,
    private windowMs: number
  ) {}
  
  canPerformAction(userId: string): boolean {
    const now = Date.now();
    const userActions = this.actions.get(userId) || [];
    
    // Remove old actions outside the time window
    const recentActions = userActions.filter(timestamp => now - timestamp < this.windowMs);
    
    if (recentActions.length >= this.maxActions) {
      return false;
    }
    
    recentActions.push(now);
    this.actions.set(userId, recentActions);
    return true;
  }
  
  reset(userId: string): void {
    this.actions.delete(userId);
  }
}

// Create rate limiters for different actions
export const messagingRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute
export const reportRateLimiter = new RateLimiter(5, 3600000); // 5 reports per hour
export const gameCreationRateLimiter = new RateLimiter(20, 60000); // 20 games per minute
