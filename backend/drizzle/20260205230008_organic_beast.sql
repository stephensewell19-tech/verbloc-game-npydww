CREATE TABLE "daily_challenge_leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"score" integer NOT NULL,
	"turns_used" integer,
	"time_taken_seconds" integer,
	"efficiency" numeric,
	"rank" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_challenge_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_completed_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_challenge_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DROP INDEX "daily_challenge_completions_challenge_id_user_id_idx";--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "attempts_used" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "turns_used" integer;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "words_formed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "efficiency" numeric;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "time_taken_seconds" integer;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD COLUMN "game_id" uuid;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "game_mode" text DEFAULT 'dailyChallengeSolo' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "board_id" uuid;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "attempts_allowed" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "puzzle_mode" text DEFAULT 'scoreTarget' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "win_condition" jsonb DEFAULT '{"type":"score","targetValue":1000,"description":"Reach the target score"}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "turn_limit" integer;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "rewards" jsonb DEFAULT '{"xp":100,"streakProgression":1}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD COLUMN "leaderboard_id" uuid;--> statement-breakpoint
ALTER TABLE "daily_challenge_leaderboards" ADD CONSTRAINT "daily_challenge_leaderboards_challenge_id_daily_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."daily_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenge_leaderboards" ADD CONSTRAINT "daily_challenge_leaderboards_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenge_streaks" ADD CONSTRAINT "daily_challenge_streaks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenge_completions" ADD CONSTRAINT "daily_challenge_completions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_challenge_completions_challenge_user_idx" ON "daily_challenge_completions" USING btree ("challenge_id","user_id");