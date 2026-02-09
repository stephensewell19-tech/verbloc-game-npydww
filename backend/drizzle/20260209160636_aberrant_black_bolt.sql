CREATE TABLE "ab_test_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_name" text NOT NULL,
	"user_id" text NOT NULL,
	"variant" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_name" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"variants" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ab_tests_test_name_unique" UNIQUE("test_name")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_name" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"rollout_percentage" integer DEFAULT 100 NOT NULL,
	"target_user_ids" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_flag_name_unique" UNIQUE("flag_name")
);
--> statement-breakpoint
CREATE TABLE "remote_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_key" text NOT NULL,
	"config_value" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "remote_config_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
ALTER TABLE "ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ab_test_assignments_test_user_idx" ON "ab_test_assignments" USING btree ("test_name","user_id");--> statement-breakpoint
CREATE INDEX "ab_test_assignments_user_id_idx" ON "ab_test_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ab_tests_test_name_idx" ON "ab_tests" USING btree ("test_name");--> statement-breakpoint
CREATE INDEX "feature_flags_flag_name_idx" ON "feature_flags" USING btree ("flag_name");--> statement-breakpoint
CREATE INDEX "remote_config_key_idx" ON "remote_config" USING btree ("config_key");--> statement-breakpoint
CREATE INDEX "remote_config_is_active_idx" ON "remote_config" USING btree ("is_active");