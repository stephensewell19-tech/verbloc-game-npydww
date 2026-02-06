CREATE TABLE "player_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"achievement_name" text NOT NULL,
	"achievement_description" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reward_xp" integer NOT NULL,
	"reward_cosmetic_id" text
);
--> statement-breakpoint
CREATE TABLE "player_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"unlock_type" text NOT NULL,
	"unlock_id" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_unlocks" ADD CONSTRAINT "player_unlocks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "player_achievements_user_id_idx" ON "player_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_achievements_user_achievement_idx" ON "player_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "player_unlocks_user_id_idx" ON "player_unlocks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_unlocks_user_unlock_idx" ON "player_unlocks" USING btree ("user_id","unlock_id");