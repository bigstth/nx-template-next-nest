-- AddOAuthSupport Migration
-- Add OAuth provider support to User table

-- Make password optional for OAuth users
ALTER TABLE "User" ALTER COLUMN password DROP NOT NULL;

-- Add OAuth fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add unique constraint for provider + providerId combination
ALTER TABLE "User" ADD CONSTRAINT "User_provider_providerId_key" UNIQUE (provider, "providerId");

-- Add performance indexes
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "User_provider_providerId_idx" ON "User"(provider, "providerId");
