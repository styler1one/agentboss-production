-- =============================================
-- EXPERT PROFILE COMPLETE UPDATE
-- =============================================
-- Copy and paste this ENTIRE block in Supabase SQL Editor

-- Add new columns to ExpertProfile table
ALTER TABLE "ExpertProfile" 
ADD COLUMN IF NOT EXISTS "expertise" TEXT,
ADD COLUMN IF NOT EXISTS "yearsExperience" TEXT,
ADD COLUMN IF NOT EXISTS "hourlyRate" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "linkedIn" TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "ExpertProfile_expertise_idx" ON "ExpertProfile"("expertise");
CREATE INDEX IF NOT EXISTS "ExpertProfile_location_idx" ON "ExpertProfile"("location");
CREATE INDEX IF NOT EXISTS "ExpertProfile_hourlyRate_idx" ON "ExpertProfile"("hourlyRate");

-- Update existing records to have default values
UPDATE "ExpertProfile" 
SET "bio" = COALESCE("bio", '')
WHERE "bio" IS NULL;

-- Verify the update worked
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ExpertProfile' 
AND table_schema = 'public'
ORDER BY ordinal_position;
