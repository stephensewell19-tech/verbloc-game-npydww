CREATE TABLE "special_event_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"game_id" uuid,
	"score" integer NOT NULL,
	"turns_used" integer,
	"words_formed" integer NOT NULL,
	"efficiency" numeric,
	"time_taken_seconds" integer,
	"is_completed" boolean NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "special_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"board_id" uuid NOT NULL,
	"rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rewards" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "special_event_completions" ADD CONSTRAINT "special_event_completions_event_id_special_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."special_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_event_completions" ADD CONSTRAINT "special_event_completions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_event_completions" ADD CONSTRAINT "special_event_completions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_events" ADD CONSTRAINT "special_events_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "special_event_completions_event_id_idx" ON "special_event_completions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "special_event_completions_user_id_idx" ON "special_event_completions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "special_event_completions_event_user_idx" ON "special_event_completions" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "special_events_type_idx" ON "special_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "special_events_is_active_idx" ON "special_events" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "special_events_start_date_idx" ON "special_events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "special_events_end_date_idx" ON "special_events" USING btree ("end_date");