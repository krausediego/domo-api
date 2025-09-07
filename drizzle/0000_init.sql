CREATE TABLE "enterprise_users" (
	"id" text PRIMARY KEY NOT NULL,
	"enterprise_id" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"temp_password" boolean DEFAULT true NOT NULL,
	"email_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enterprises" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cell_phone" text NOT NULL,
	"email" text NOT NULL,
	"logo_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enterprise_users" ADD CONSTRAINT "enterprise_users_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_enterprise_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enterprise_users"("id") ON DELETE cascade ON UPDATE no action;