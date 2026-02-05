import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerPlayerStatsRoutes } from './routes/player-stats.js';
import { registerSoloGameRoutes } from './routes/solo-game.js';
import { registerGameStateRoutes } from './routes/game-state.js';
import { registerMultiplayerGameRoutes } from './routes/multiplayer-game.js';
import { registerDailyChallengeRoutes } from './routes/daily-challenge.js';
import { registerDailyChallengeSysRoutes } from './routes/daily-challenges.js';
import { registerLeaderboardRoutes } from './routes/leaderboard.js';
import { registerBoardRoutes } from './routes/boards.js';
import { registerMatchmakingRoutes } from './routes/matchmaking.js';
import { registerTurnManagementRoutes } from './routes/turn-management.js';
import { registerSocialInteractionRoutes } from './routes/social-interactions.js';
import { registerNotificationRoutes } from './routes/notifications.js';

// Combine schemas for full database type support
const schema = { ...appSchema, ...authSchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication
app.withAuth();

// Register all route modules
registerPlayerStatsRoutes(app);
registerSoloGameRoutes(app);
registerGameStateRoutes(app);
registerMultiplayerGameRoutes(app);
registerDailyChallengeRoutes(app);
registerDailyChallengeSysRoutes(app);
registerLeaderboardRoutes(app);
registerBoardRoutes(app);
registerMatchmakingRoutes(app);
registerTurnManagementRoutes(app);
registerSocialInteractionRoutes(app);
registerNotificationRoutes(app);

await app.run();
app.logger.info('VERBLOC backend running');
