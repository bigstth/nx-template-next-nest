-- Migration: Separate OAuth Accounts to new table with UUID support
-- This allows users to link multiple OAuth providers

-- Step 1: Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Add new UUID column to User table
ALTER TABLE "User" ADD COLUMN "uuid" UUID DEFAULT uuid_generate_v4();
UPDATE "User" SET "uuid" = uuid_generate_v4();
ALTER TABLE "User" ALTER COLUMN "uuid" SET NOT NULL;

-- Step 3: Create OAuthAccount table with UUID
CREATE TABLE "OAuthAccount" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- Step 4: Migrate existing OAuth data from User table to OAuthAccount
-- Using the new UUID column
INSERT INTO "OAuthAccount" ("provider", "providerId", "userId", "createdAt", "updatedAt")
SELECT 
    "provider",
    "providerId",
    "uuid" as "userId",
    "createdAt",
    "updatedAt"
FROM "User"
WHERE "provider" IS NOT NULL 
  AND "providerId" IS NOT NULL;

-- Step 5: Drop old primary key and rename uuid to id
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "User" DROP COLUMN "id";
ALTER TABLE "User" RENAME COLUMN "uuid" TO "id";
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- Step 6: Add foreign key constraint
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add unique constraint on provider + providerId
CREATE UNIQUE INDEX "OAuthAccount_provider_providerId_key" ON "OAuthAccount"("provider", "providerId");

-- Step 8: Add index on userId for better performance
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- Step 9: Drop old columns from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "User" DROP COLUMN IF EXISTS "providerId";

-- Step 10: Drop old indexes (they will error if already gone, that's ok)
DROP INDEX IF EXISTS "User_provider_providerId_key";
DROP INDEX IF EXISTS "User_provider_providerId_idx";
