-- =============================================
-- AGENTBOSS DATABASE RESET & REBUILD
-- =============================================
-- Execute this in Supabase SQL Editor to fix schema issues

-- =============================================
-- 1. DROP ALL EXISTING TABLES (CLEAN SLATE)
-- =============================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "AgentPurchase" CASCADE;
DROP TABLE IF EXISTS "Agent" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Contract" CASCADE;
DROP TABLE IF EXISTS "Proposal" CASCADE;
DROP TABLE IF EXISTS "ProjectSkill" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "ExpertSkill" CASCADE;
DROP TABLE IF EXISTS "Skill" CASCADE;
DROP TABLE IF EXISTS "ExpertProfile" CASCADE;
DROP TABLE IF EXISTS "ClientProfile" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "ProjectPriority" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "VerificationStatus" CASCADE;
DROP TYPE IF EXISTS "AgentCategory" CASCADE;

-- =============================================
-- 2. CREATE ENUMS
-- =============================================

CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'EXPERT', 'ADMIN');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- =============================================
-- 3. CREATE CORE TABLES
-- =============================================

-- Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Client profiles
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- Expert profiles  
CREATE TABLE "ExpertProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 4. CREATE INDEXES
-- =============================================

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- =============================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- 6. CREATE TRIGGER FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profile_updated_at BEFORE UPDATE ON "ClientProfile"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_profile_updated_at BEFORE UPDATE ON "ExpertProfile"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. INSERT TEST DATA (OPTIONAL)
-- =============================================

-- Test client user
INSERT INTO "User" ("id", "email", "passwordHash", "role", "emailVerified", "profileComplete") VALUES
('test_client_1', 'client@agentboss.nl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'CLIENT', true, true);

INSERT INTO "ClientProfile" ("id", "userId", "companyName", "industry", "description") VALUES
('client_profile_1', 'test_client_1', 'Test Company BV', 'Technology', 'AI solutions company');

-- Test expert user  
INSERT INTO "User" ("id", "email", "passwordHash", "role", "emailVerified", "profileComplete") VALUES
('test_expert_1', 'expert@agentboss.nl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'EXPERT', true, true);

INSERT INTO "ExpertProfile" ("id", "userId", "firstName", "lastName", "bio", "verificationStatus") VALUES
('expert_profile_1', 'test_expert_1', 'John', 'Doe', 'Senior AI Engineer with 10+ years experience', 'VERIFIED');

-- =============================================
-- 8. VERIFICATION QUERIES
-- =============================================

-- Check table structure
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'ClientProfile', 'ExpertProfile')
ORDER BY table_name, ordinal_position;

-- Check test data
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'ClientProfiles', COUNT(*) FROM "ClientProfile"  
UNION ALL
SELECT 'ExpertProfiles', COUNT(*) FROM "ExpertProfile";

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Database reset and rebuild complete!
-- Test credentials:
-- Client: client@agentboss.nl / password123
-- Expert: expert@agentboss.nl / password123
-- 
-- Next steps:
-- 1. Run: npm run db:generate
-- 2. Test registration via web interface
-- 3. Verify authentication flow
