-- Migration: Add idCardUrl column to Onboarding table
-- Description: Store the URL of the uploaded ID card/fee slip/marksheet in Supabase Storage

ALTER TABLE "Onboarding" ADD COLUMN "idCardUrl" text;

-- Add comment for documentation
COMMENT ON COLUMN "Onboarding"."idCardUrl" IS 'URL to the uploaded college ID card, fee slip, or marksheet stored in Supabase Storage';
