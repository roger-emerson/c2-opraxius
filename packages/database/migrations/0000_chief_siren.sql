CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'planning' NOT NULL,
	"venue_bounds" geometry(point),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" varchar(500),
	"role" varchar(50) NOT NULL,
	"workcenters" varchar(100)[] DEFAULT '{}' NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"auth0_user_id" varchar(255),
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_auth0_user_id_unique" UNIQUE("auth0_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "venue_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"feature_type" varchar(50) NOT NULL,
	"feature_category" varchar(50),
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"geometry" geometry(point) NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"workcenter_access" varchar(100)[] DEFAULT '{}' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"completion_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"venue_feature_id" uuid,
	"workcenter" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"is_critical_path" boolean DEFAULT false NOT NULL,
	"assigned_to" uuid,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"blocked_reason" text,
	"parent_task_id" uuid,
	"dependencies" uuid[] DEFAULT '{}' NOT NULL,
	"completion_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workcenters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"color" varchar(7),
	"total_tasks_count" integer DEFAULT 0 NOT NULL,
	"completed_tasks_count" integer DEFAULT 0 NOT NULL,
	"completion_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"status" varchar(50) DEFAULT 'on_track' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid,
	"activity_type" varchar(50) NOT NULL,
	"workcenter" varchar(50),
	"entity_type" varchar(50),
	"entity_id" uuid,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_chat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"context_used" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "venue_features" ADD CONSTRAINT "venue_features_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_venue_feature_id_venue_features_id_fk" FOREIGN KEY ("venue_feature_id") REFERENCES "public"."venue_features"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workcenters" ADD CONSTRAINT "workcenters_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_auth0" ON "users" USING btree ("auth0_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_venue_features_event" ON "venue_features" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_venue_features_type" ON "venue_features" USING btree ("feature_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_venue_features_category" ON "venue_features" USING btree ("feature_category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_venue_features_status" ON "venue_features" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_event" ON "tasks" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_feature" ON "tasks" USING btree ("venue_feature_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_workcenter" ON "tasks" USING btree ("workcenter");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_assigned" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workcenters_event" ON "workcenters" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workcenters_name" ON "workcenters" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_event" ON "activity_feed" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_workcenter" ON "activity_feed" USING btree ("workcenter");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_created" ON "activity_feed" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_type" ON "activity_feed" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_user" ON "ai_chat_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_session" ON "ai_chat_history" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_created" ON "ai_chat_history" USING btree ("created_at");