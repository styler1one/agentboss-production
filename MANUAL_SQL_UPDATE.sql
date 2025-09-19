-- =============================================
-- MANUAL SQL UPDATE FOR CLIENTPROFILE TABLE
-- =============================================
-- Copy and paste this in Supabase SQL Editor

-- Add new columns to ClientProfile table
ALTER TABLE "ClientProfile" 
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "companySize" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");
CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");
CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");

-- Update existing records to have default values
UPDATE "ClientProfile" 
SET "description" = COALESCE("description", '')
WHERE "description" IS NULL;

-- Verify the update
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ClientProfile' 
AND table_schema = 'public'
ORDER BY ordinal_position;
