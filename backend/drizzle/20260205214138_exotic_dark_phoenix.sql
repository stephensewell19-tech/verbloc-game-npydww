CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"supported_modes" jsonb NOT NULL,
	"grid_size" integer NOT NULL,
	"initial_layout" jsonb NOT NULL,
	"puzzle_mode" text NOT NULL,
	"win_condition" jsonb NOT NULL,
	"difficulty" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boards_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "boards_difficulty_idx" ON "boards" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "boards_is_active_idx" ON "boards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "boards_puzzle_mode_idx" ON "boards" USING btree ("puzzle_mode");