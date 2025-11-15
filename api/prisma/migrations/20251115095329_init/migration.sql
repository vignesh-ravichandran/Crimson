-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{"sounds": true, "haptics": true, "theme": "auto", "timezone": "UTC"}',
    "oauth_provider" TEXT,
    "oauth_provider_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_seen_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journeys" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_members" (
    "id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_checkin_at" TIMESTAMPTZ,

    CONSTRAINT "journey_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimensions" (
    "id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "client_checkin_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkin_details" (
    "id" UUID NOT NULL,
    "checkin_id" UUID NOT NULL,
    "dimension_id" UUID NOT NULL,
    "effort_level" SMALLINT NOT NULL,
    "score" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkin_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "icon_url" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "journey_id" UUID,
    "awarded_on" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_checkin_date" DATE,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_invites" (
    "id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "invited_by" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "accepted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journey_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_cache" (
    "id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "period_key" TEXT NOT NULL,
    "total_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "checkin_count" INTEGER NOT NULL DEFAULT 0,
    "streak_count" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_oauth_provider_oauth_provider_id_idx" ON "users"("oauth_provider", "oauth_provider_id");

-- CreateIndex
CREATE INDEX "journeys_created_by_idx" ON "journeys"("created_by");

-- CreateIndex
CREATE INDEX "journeys_is_public_idx" ON "journeys"("is_public");

-- CreateIndex
CREATE INDEX "journeys_status_idx" ON "journeys"("status");

-- CreateIndex
CREATE INDEX "journeys_created_at_idx" ON "journeys"("created_at" DESC);

-- CreateIndex
CREATE INDEX "journey_members_journey_id_idx" ON "journey_members"("journey_id");

-- CreateIndex
CREATE INDEX "journey_members_user_id_idx" ON "journey_members"("user_id");

-- CreateIndex
CREATE INDEX "journey_members_journey_id_role_idx" ON "journey_members"("journey_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "journey_members_journey_id_user_id_key" ON "journey_members"("journey_id", "user_id");

-- CreateIndex
CREATE INDEX "dimensions_journey_id_display_order_idx" ON "dimensions"("journey_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "checkins_client_checkin_id_key" ON "checkins"("client_checkin_id");

-- CreateIndex
CREATE INDEX "checkins_user_id_journey_id_date_idx" ON "checkins"("user_id", "journey_id", "date" DESC);

-- CreateIndex
CREATE INDEX "checkins_journey_id_date_idx" ON "checkins"("journey_id", "date" DESC);

-- CreateIndex
CREATE INDEX "checkins_client_checkin_id_idx" ON "checkins"("client_checkin_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkins_user_id_journey_id_date_key" ON "checkins"("user_id", "journey_id", "date");

-- CreateIndex
CREATE INDEX "checkin_details_checkin_id_idx" ON "checkin_details"("checkin_id");

-- CreateIndex
CREATE INDEX "checkin_details_dimension_id_idx" ON "checkin_details"("dimension_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkin_details_checkin_id_dimension_id_key" ON "checkin_details"("checkin_id", "dimension_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_key_key" ON "badges"("key");

-- CreateIndex
CREATE INDEX "badges_key_idx" ON "badges"("key");

-- CreateIndex
CREATE INDEX "user_badges_user_id_awarded_on_idx" ON "user_badges"("user_id", "awarded_on" DESC);

-- CreateIndex
CREATE INDEX "user_badges_badge_id_idx" ON "user_badges"("badge_id");

-- CreateIndex
CREATE INDEX "user_badges_journey_id_idx" ON "user_badges"("journey_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_journey_id_key" ON "user_badges"("user_id", "badge_id", "journey_id");

-- CreateIndex
CREATE INDEX "streaks_user_id_journey_id_idx" ON "streaks"("user_id", "journey_id");

-- CreateIndex
CREATE INDEX "streaks_journey_id_longest_streak_idx" ON "streaks"("journey_id", "longest_streak" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_journey_id_key" ON "streaks"("user_id", "journey_id");

-- CreateIndex
CREATE UNIQUE INDEX "journey_invites_token_key" ON "journey_invites"("token");

-- CreateIndex
CREATE INDEX "journey_invites_token_idx" ON "journey_invites"("token");

-- CreateIndex
CREATE INDEX "journey_invites_email_status_idx" ON "journey_invites"("email", "status");

-- CreateIndex
CREATE INDEX "journey_invites_journey_id_status_idx" ON "journey_invites"("journey_id", "status");

-- CreateIndex
CREATE INDEX "leaderboard_cache_journey_id_period_period_key_total_score_idx" ON "leaderboard_cache"("journey_id", "period", "period_key", "total_score" DESC);

-- CreateIndex
CREATE INDEX "leaderboard_cache_journey_id_period_period_key_rank_idx" ON "leaderboard_cache"("journey_id", "period", "period_key", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_cache_journey_id_user_id_period_period_key_key" ON "leaderboard_cache"("journey_id", "user_id", "period", "period_key");

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_members" ADD CONSTRAINT "journey_members_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_members" ADD CONSTRAINT "journey_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_details" ADD CONSTRAINT "checkin_details_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "checkins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_details" ADD CONSTRAINT "checkin_details_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_invites" ADD CONSTRAINT "journey_invites_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_invites" ADD CONSTRAINT "journey_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_cache" ADD CONSTRAINT "leaderboard_cache_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
