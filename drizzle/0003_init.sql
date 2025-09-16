CREATE TABLE "enterprise_user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"cell_phone" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enterprise_user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enterprises" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprises" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "enterprises" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprise_users" ADD COLUMN "is_super_user" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprise_user_profiles" ADD CONSTRAINT "enterprise_user_profiles_user_id_enterprise_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enterprise_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_user_id_enterprise_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enterprise_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_slug_unique" UNIQUE("slug");