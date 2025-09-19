-- =============================================
-- AGENTBOSS PRODUCTION DATABASE SCHEMA
-- =============================================
-- Generated for Supabase PostgreSQL
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- User roles
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'EXPERT', 'ADMIN');

-- Project status
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Project priority
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Payment status
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Verification status
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Agent category
CREATE TYPE "AgentCategory" AS ENUM ('CUSTOMER_SERVICE', 'SALES', 'MARKETING', 'ANALYTICS', 'AUTOMATION', 'CONTENT', 'RESEARCH', 'OTHER');

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

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

-- =============================================
-- USER PROFILES
-- =============================================

CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "companySize" TEXT,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "availability" TEXT,
    "location" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- SKILLS & EXPERTISE
-- =============================================

CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertSkill" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiencyLevel" INTEGER NOT NULL DEFAULT 1,
    "yearsOfExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertSkill_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- PROJECTS
-- =============================================

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(10,2),
    "timeline" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "requirements" TEXT,
    "deliverables" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectSkill" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minimumLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- PROPOSALS & MATCHING
-- =============================================

CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "proposedRate" DECIMAL(10,2),
    "estimatedHours" INTEGER,
    "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- CONTRACTS & PAYMENTS
-- =============================================

CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- AGENT MARKETPLACE
-- =============================================

CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AgentCategory" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT,
    "technicalSpecs" TEXT,
    "demoUrl" TEXT,
    "documentationUrl" TEXT,
    "supportEmail" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentPurchase" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "licenseKey" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentPurchase_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- REVIEWS & RATINGS
-- =============================================

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT,
    "agentId" TEXT,
    "contractId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE UNIQUE INDEX "ExpertSkill_expertId_skillId_key" ON "ExpertSkill"("expertId", "skillId");
CREATE UNIQUE INDEX "ProjectSkill_projectId_skillId_key" ON "ProjectSkill"("projectId", "skillId");
CREATE UNIQUE INDEX "Proposal_projectId_expertId_key" ON "Proposal"("projectId", "expertId");

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertSkill" ADD CONSTRAINT "ExpertSkill_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertSkill" ADD CONSTRAINT "ExpertSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentPurchase" ADD CONSTRAINT "AgentPurchase_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentPurchase" ADD CONSTRAINT "AgentPurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Agent_category_idx" ON "Agent"("category");
CREATE INDEX "Agent_isPublished_idx" ON "Agent"("isPublished");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample skills
INSERT INTO "Skill" ("id", "name", "category", "description") VALUES
('skill_1', 'Machine Learning', 'AI/ML', 'Experience with ML algorithms and frameworks'),
('skill_2', 'Natural Language Processing', 'AI/ML', 'NLP and text processing expertise'),
('skill_3', 'Computer Vision', 'AI/ML', 'Image and video processing with AI'),
('skill_4', 'Python', 'Programming', 'Python programming language'),
('skill_5', 'TensorFlow', 'Frameworks', 'TensorFlow machine learning framework'),
('skill_6', 'PyTorch', 'Frameworks', 'PyTorch deep learning framework'),
('skill_7', 'Data Analysis', 'Analytics', 'Data analysis and visualization'),
('skill_8', 'Cloud Computing', 'Infrastructure', 'AWS, GCP, Azure cloud platforms');

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Schema created successfully!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test with Prisma: npm run db:pull
-- 4. Generate Prisma client: npm run db:generate
