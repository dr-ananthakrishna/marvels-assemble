-- ============================================================
-- BlueStreaks / Marvels Assemble — Full Database Schema + Mock Data
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- MIGRATE EXISTING TABLES: Add new columns if they don't exist
-- (Safe to run even if columns already exist)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "admissionYear" TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS interests JSONB;

ALTER TABLE public."Submission" ADD COLUMN IF NOT EXISTS "pointsAwarded" INTEGER;


-- ─────────────────────────────────────────────────────────────
-- 0. ENUMS
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('MARVEL', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityType" AS ENUM (
    'REEL',
    'COMMUNITY',
    'QUIZ',
    'DOUBT_SESSION',
    'CLASSROOM_SESSION',
    'COLLEGE_EVENT',
    'REFERRAL',
    'REPORT_PIRACY',
    'CASE_CLUB',
    'NEW_INITIATIVE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BadgeCategory" AS ENUM ('INFLUENCER', 'ACADEMIC', 'LEADERSHIP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MasterclassTier" AS ENUM ('TIER_1', 'TIER_2');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 1. CORE USER TABLE (already exists — extended version)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."User" (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  email           TEXT        NOT NULL UNIQUE,
  password        TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  college         TEXT        NOT NULL,
  phone           TEXT,
  role            "Role"      NOT NULL DEFAULT 'MARVEL',
  "instagramId"   TEXT,
  -- Extended onboarding fields
  dob             DATE,
  state           TEXT,
  "admissionYear" TEXT,
  "referredBy"    TEXT,
  about           TEXT,
  interests       JSONB,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "User_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 2. ONBOARDING TABLE (already exists — extended)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Onboarding" (
  id          TEXT              NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"    TEXT              NOT NULL UNIQUE,
  "videoUrl"  TEXT,
  status      "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
  score       DOUBLE PRECISION,
  breakdown   JSONB,
  reason      TEXT,
  transcript  TEXT,
  "createdAt" TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  CONSTRAINT "Onboarding_pkey" PRIMARY KEY (id),
  CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 3. SUBMISSION TABLE (already exists — extended)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Submission" (
  id             TEXT               NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"       TEXT               NOT NULL,
  "activityType" "ActivityType"     NOT NULL,
  "proofUrl"     TEXT,
  "proofNote"    TEXT,
  metrics        JSONB,
  status         "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "autoChecked"  BOOLEAN            NOT NULL DEFAULT FALSE,
  "adminNote"    TEXT,
  "videoUrl"     TEXT,
  "pointsAwarded" INTEGER,
  "createdAt"    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT "Submission_pkey" PRIMARY KEY (id),
  CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 4. ACTIVITY POINTS CONFIG TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."ActivityConfig" (
  id             TEXT           NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "activityType" "ActivityType" NOT NULL UNIQUE,
  points         INTEGER        NOT NULL,
  label          TEXT           NOT NULL,
  verification   TEXT           NOT NULL,
  "isActive"     BOOLEAN        NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT "ActivityConfig_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. BADGES TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Badge" (
  id           TEXT            NOT NULL DEFAULT gen_random_uuid()::TEXT,
  name         TEXT            NOT NULL,
  category     "BadgeCategory" NOT NULL,
  "pointsRequired" INTEGER     NOT NULL,
  description  TEXT,
  icon         TEXT,
  "createdAt"  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  CONSTRAINT "Badge_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 6. USER BADGES (earned badges)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."UserBadge" (
  id          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"    TEXT        NOT NULL,
  "badgeId"   TEXT        NOT NULL,
  "earnedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "UserBadge_pkey" PRIMARY KEY (id),
  CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE,
  CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public."Badge"(id) ON DELETE CASCADE,
  CONSTRAINT "UserBadge_unique" UNIQUE ("userId", "badgeId")
);

-- ─────────────────────────────────────────────────────────────
-- 7. MASTERCLASSES TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Masterclass" (
  id               TEXT               NOT NULL DEFAULT gen_random_uuid()::TEXT,
  title            TEXT               NOT NULL,
  description      TEXT,
  duration         TEXT,
  "videoUrl"       TEXT,
  "thumbnailUrl"   TEXT,
  "publishDate"    DATE,
  "requiredPoints" INTEGER            NOT NULL DEFAULT 1000,
  tier             "MasterclassTier"  NOT NULL DEFAULT 'TIER_1',
  "isPublished"    BOOLEAN            NOT NULL DEFAULT FALSE,
  "createdAt"      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT "Masterclass_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 8. USER MASTERCLASS PROGRESS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."UserMasterclass" (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"        TEXT        NOT NULL,
  "masterclassId" TEXT        NOT NULL,
  "watchedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completedAt"   TIMESTAMPTZ,
  progress        INTEGER     NOT NULL DEFAULT 0, -- percentage 0-100
  CONSTRAINT "UserMasterclass_pkey" PRIMARY KEY (id),
  CONSTRAINT "UserMasterclass_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE,
  CONSTRAINT "UserMasterclass_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES public."Masterclass"(id) ON DELETE CASCADE,
  CONSTRAINT "UserMasterclass_unique" UNIQUE ("userId", "masterclassId")
);

-- ─────────────────────────────────────────────────────────────
-- 9. REWARDS CATALOG TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Reward" (
  id           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  name         TEXT        NOT NULL,
  description  TEXT,
  points       INTEGER     NOT NULL,
  category     TEXT        NOT NULL,
  image        TEXT,
  "isActive"   BOOLEAN     NOT NULL DEFAULT TRUE,
  stock        INTEGER,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Reward_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 10. REWARD REDEMPTIONS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Redemption" (
  id           TEXT               NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"     TEXT               NOT NULL,
  "rewardId"   TEXT               NOT NULL,
  points       INTEGER            NOT NULL,
  status       "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
  address      JSONB,
  "trackingId" TEXT,
  "adminNote"  TEXT,
  "createdAt"  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT "Redemption_pkey" PRIMARY KEY (id),
  CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE,
  CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES public."Reward"(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 11. USER POINTS LEDGER (audit trail)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."PointsLedger" (
  id           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"     TEXT        NOT NULL,
  points       INTEGER     NOT NULL, -- positive = earned, negative = spent
  reason       TEXT        NOT NULL,
  "refId"      TEXT,       -- submission id or redemption id
  "refType"    TEXT,       -- 'SUBMISSION' | 'REDEMPTION' | 'BONUS'
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PointsLedger_pkey" PRIMARY KEY (id),
  CONSTRAINT "PointsLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 12. RANKS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."Rank" (
  id           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  name         TEXT        NOT NULL UNIQUE,
  "minSales"   INTEGER     NOT NULL,
  "maxSales"   INTEGER,
  description  TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Rank_pkey" PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_submission_userid ON public."Submission"("userId");
CREATE INDEX IF NOT EXISTS idx_submission_status ON public."Submission"(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public."Onboarding"(status);
CREATE INDEX IF NOT EXISTS idx_userbadge_userid ON public."UserBadge"("userId");
CREATE INDEX IF NOT EXISTS idx_redemption_userid ON public."Redemption"("userId");
CREATE INDEX IF NOT EXISTS idx_pointsledger_userid ON public."PointsLedger"("userId");

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_user_updated_at
  BEFORE UPDATE ON public."User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON public."Onboarding"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_submission_updated_at
  BEFORE UPDATE ON public."Submission"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_masterclass_updated_at
  BEFORE UPDATE ON public."Masterclass"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_reward_updated_at
  BEFORE UPDATE ON public."Reward"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_redemption_updated_at
  BEFORE UPDATE ON public."Redemption"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- HELPER VIEW: user_points (total available points per user)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.user_points AS
SELECT
  u.id AS "userId",
  u.name,
  u.email,
  u.college,
  COALESCE(SUM(pl.points), 0) AS "totalPoints",
  COALESCE(SUM(CASE WHEN pl.points > 0 THEN pl.points ELSE 0 END), 0) AS "totalEarned",
  COALESCE(SUM(CASE WHEN pl.points < 0 THEN ABS(pl.points) ELSE 0 END), 0) AS "totalSpent"
FROM public."User" u
LEFT JOIN public."PointsLedger" pl ON pl."userId" = u.id
GROUP BY u.id, u.name, u.email, u.college;

-- ─────────────────────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════
-- MOCK DATA
-- ═══════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- RANKS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Rank" (id, name, "minSales", "maxSales", description) VALUES
  ('rank-appointed',  'APPOINTED',  0,  4,    'Starting rank for all new Marvels'),
  ('rank-nominated',  'NOMINATED',  5,  24,   'Completed first 5 sales'),
  ('rank-captain',    'CAPTAIN',    25, 39,   'Proven campus leader'),
  ('rank-major',      'MAJOR',      40, 99,   'Top performer in the region'),
  ('rank-commander',  'COMMANDER',  100, NULL, 'Elite Marvel ambassador')
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ACTIVITY CONFIG
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."ActivityConfig" (id, "activityType", points, label, verification) VALUES
  ('ac-reel',      'REEL',              50,  'Reels',                              'Insta reel link'),
  ('ac-community', 'COMMUNITY',         30,  'Community platforms - Quora/Reddit', 'Link & Screenshot'),
  ('ac-quiz',      'QUIZ',              80,  'Quiz: Google Form / Creator plus',   'Custom module code, Sheet Link with edit access'),
  ('ac-doubt',     'DOUBT_SESSION',     100, 'Doubt solving sessions',             'Photos & Videos'),
  ('ac-classroom', 'CLASSROOM_SESSION', 150, 'Classroom sessions',                 'Photos & Videos'),
  ('ac-event',     'COLLEGE_EVENT',     200, 'College events',                     'Photos & Videos'),
  ('ac-referral',  'REFERRAL',          120, 'Referring a captain marvel',         'Registered email id and mobile'),
  ('ac-piracy',    'REPORT_PIRACY',     150, 'Report Piracy Event',                'Link, Photos, Videos'),
  ('ac-case',      'CASE_CLUB',         100, 'Case club',                          'Photos & Videos'),
  ('ac-initiative','NEW_INITIATIVE',    180, 'New Initiative',                     'Link, Photos, Videos')
ON CONFLICT ("activityType") DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- BADGES
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Badge" (id, name, category, "pointsRequired", description, icon) VALUES
  -- Influencer
  ('badge-influence',  'Influence',   'INFLUENCER', 3,  'Earned 3 influencer points',  'TrendingUp'),
  ('badge-visionary',  'Visionary',   'INFLUENCER', 5,  'Earned 5 influencer points',  'Eye'),
  ('badge-impact',     'Impact',      'INFLUENCER', 10, 'Earned 10 influencer points', 'Target'),
  -- Academic
  ('badge-honor',      'Honor',       'ACADEMIC',   3,  'Earned 3 academic points',    'BookOpen'),
  ('badge-excellence', 'Excellence',  'ACADEMIC',   5,  'Earned 5 academic points',    'Lightbulb'),
  ('badge-brilliance', 'Brilliance',  'ACADEMIC',   10, 'Earned 10 academic points',   'Sparkles'),
  -- Leadership
  ('badge-distinction','Distinction', 'LEADERSHIP', 3,  'Earned 3 leadership points',  'Shield'),
  ('badge-promise',    'Promise',     'LEADERSHIP', 5,  'Earned 5 leadership points',  'Star'),
  ('badge-integrity',  'Integrity',   'LEADERSHIP', 10, 'Earned 10 leadership points', 'Heart')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- MASTERCLASSES
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Masterclass" (id, title, description, duration, "publishDate", "requiredPoints", tier, "isPublished") VALUES
  ('mc-1', 'Social Media Influencer',
   'Master the art of creating engaging content and growing your digital presence',
   '2.5 hours', '2026-01-15', 1000, 'TIER_1', TRUE),
  ('mc-2', 'Public Speaking',
   'Develop confidence and techniques for impactful presentations and speeches',
   '3 hours', '2026-02-20', 1000, 'TIER_1', TRUE),
  ('mc-3', 'Storytelling',
   'Learn to craft compelling narratives that inspire and engage audiences',
   '2 hours', '2026-03-10', 2500, 'TIER_2', TRUE),
  ('mc-4', 'Career Paths',
   'Navigate your medical career with insights from industry leaders and mentors',
   '4 hours', '2026-04-05', 2500, 'TIER_2', TRUE),
  ('mc-5', 'AI in Healthcare',
   'Explore the future of medicine with AI and emerging technologies',
   '3.5 hours', '2026-05-12', 2500, 'TIER_2', TRUE)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- REWARDS CATALOG
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Reward" (id, name, description, points, category, image, "isActive", stock) VALUES
  ('reward-1', 'Plan C 3 month',          '3-month Plan C subscription',          50,  'Subscription', '📋', TRUE, 100),
  ('reward-2', 'Marrow Hoodies',           'Exclusive Marrow branded hoodie',       100, 'Merchandise',  '👕', TRUE, 50),
  ('reward-3', 'Stethoscope',              'Professional medical stethoscope',      200, 'Medical',      '🩺', TRUE, 30),
  ('reward-4', 'Amazon Voucher (Rs 10,000)','Amazon gift voucher worth Rs 10,000',  300, 'Voucher',      '🎁', TRUE, 20),
  ('reward-5', 'iPad 11th gen',            'Apple iPad 11th generation',            500, 'Electronics',  '📱', TRUE, 10)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- MOCK USERS
-- Passwords are bcrypt hashes of 'Password@123'
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."User" (id, email, password, name, college, phone, role, "updatedAt", state, "admissionYear", "referredBy", about) VALUES
  -- Admin
  ('user-admin-1',
   'admin@marrow.com',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password@123
   'Admin User',
   'Marrow HQ',
   '+91 98765 00000',
   'ADMIN',
   NOW(),
   'Karnataka',
   NULL,
   NULL,
   NULL),
  -- Marvels
  ('user-marvel-1',
   'nawaz.m@aiims.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Dr. Nawaz M',
   'AIIMS Delhi',
   '+91 98765 43210',
   'MARVEL',
   NOW(),
   'Delhi',
   '2023',
   'Friend',
   'I am a passionate medical student with a keen interest in digital health and community outreach.'),
  ('user-marvel-2',
   'priya.sharma@jipmer.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Dr. Priya Sharma',
   'JIPMER Puducherry',
   '+91 87654 32109',
   'MARVEL',
   NOW(),
   'Tamil Nadu',
   '2022',
   'Social Media',
   'Enthusiastic about medical education and helping peers excel in their studies.'),
  ('user-marvel-3',
   'arjun.k@mamc.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Dr. Arjun Kumar',
   'MAMC Delhi',
   '+91 76543 21098',
   'MARVEL',
   NOW(),
   'Delhi',
   '2024',
   'College Event',
   'Love organizing events and creating awareness about quality medical education resources.'),
  ('user-marvel-4',
   'sneha.r@kmc.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Dr. Sneha Reddy',
   'Kasturba Medical College',
   '+91 65432 10987',
   'MARVEL',
   NOW(),
   'Karnataka',
   '2023',
   'Friend',
   'Passionate about public health and leveraging technology for better medical outcomes.'),
  ('user-marvel-5',
   'rahul.v@bmc.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Dr. Rahul Verma',
   'BJ Medical College',
   '+91 54321 09876',
   'MARVEL',
   NOW(),
   'Maharashtra',
   '2022',
   'Marrow Representative',
   'Dedicated to spreading awareness about evidence-based medical education.')
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ONBOARDING RECORDS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Onboarding" (id, "userId", status, score, reason, "updatedAt") VALUES
  ('ob-1', 'user-marvel-1', 'APPROVED', 8.5,
   'Strong communication skills, clear motivation, and excellent understanding of the Marvel program.', NOW()),
  ('ob-2', 'user-marvel-2', 'APPROVED', 7.8,
   'Good enthusiasm and relevant experience in campus activities.', NOW()),
  ('ob-3', 'user-marvel-3', 'PENDING',  NULL, NULL, NOW()),
  ('ob-4', 'user-marvel-4', 'APPROVED', 9.1,
   'Outstanding presentation, very articulate about goals and impact.', NOW()),
  ('ob-5', 'user-marvel-5', 'REJECTED', 4.2,
   'Video quality was poor and motivation was unclear. Encouraged to reapply.', NOW())
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SUBMISSIONS (mock activity submissions)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Submission" (id, "userId", "activityType", "proofUrl", "proofNote", status, "autoChecked", "pointsAwarded", "updatedAt") VALUES
  ('sub-1',  'user-marvel-1', 'REEL',              'https://instagram.com/reel/abc123', 'Marrow awareness reel with 5K views', 'APPROVED', TRUE,  50,  NOW()),
  ('sub-2',  'user-marvel-1', 'CLASSROOM_SESSION', 'https://drive.google.com/photos1',  'Conducted session for 60 students at AIIMS', 'APPROVED', FALSE, 150, NOW()),
  ('sub-3',  'user-marvel-1', 'QUIZ',              'https://forms.google.com/quiz1',    'Online quiz with 120 participants', 'APPROVED', FALSE, 80,  NOW()),
  ('sub-4',  'user-marvel-1', 'COLLEGE_EVENT',     'https://drive.google.com/event1',   'Annual medical fest booth', 'PENDING', FALSE, NULL, NOW()),
  ('sub-5',  'user-marvel-2', 'REEL',              'https://instagram.com/reel/def456', 'Study tips reel', 'APPROVED', TRUE,  50,  NOW()),
  ('sub-6',  'user-marvel-2', 'COMMUNITY',         'https://quora.com/answer/xyz',      'Answered 10 NEET PG questions on Quora', 'APPROVED', FALSE, 30,  NOW()),
  ('sub-7',  'user-marvel-2', 'DOUBT_SESSION',     'https://drive.google.com/photos2',  'Online doubt session via Zoom', 'PENDING', FALSE, NULL, NOW()),
  ('sub-8',  'user-marvel-4', 'REFERRAL',          NULL,                                'Referred Dr. Kiran Patel, email: kiran@college.edu', 'APPROVED', FALSE, 120, NOW()),
  ('sub-9',  'user-marvel-4', 'CASE_CLUB',         'https://drive.google.com/case1',    'Monthly case club session', 'APPROVED', FALSE, 100, NOW()),
  ('sub-10', 'user-marvel-4', 'NEW_INITIATIVE',    'https://instagram.com/initiative1', 'Started a weekly medical trivia series', 'PENDING', FALSE, NULL, NOW()),
  ('sub-11', 'user-marvel-1', 'REPORT_PIRACY',     'https://evidence.link/piracy1',     'Found pirated Marrow content on Telegram', 'APPROVED', FALSE, 150, NOW()),
  ('sub-12', 'user-marvel-2', 'CLASSROOM_SESSION', 'https://drive.google.com/photos3',  'Pharmacology revision session', 'REJECTED', FALSE, NULL, NOW())
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- POINTS LEDGER (matching approved submissions)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."PointsLedger" (id, "userId", points, reason, "refId", "refType") VALUES
  ('pl-1',  'user-marvel-1', 50,  'Approved: REEL',              'sub-1',  'SUBMISSION'),
  ('pl-2',  'user-marvel-1', 150, 'Approved: CLASSROOM_SESSION', 'sub-2',  'SUBMISSION'),
  ('pl-3',  'user-marvel-1', 80,  'Approved: QUIZ',              'sub-3',  'SUBMISSION'),
  ('pl-4',  'user-marvel-1', 150, 'Approved: REPORT_PIRACY',     'sub-11', 'SUBMISSION'),
  ('pl-5',  'user-marvel-2', 50,  'Approved: REEL',              'sub-5',  'SUBMISSION'),
  ('pl-6',  'user-marvel-2', 30,  'Approved: COMMUNITY',         'sub-6',  'SUBMISSION'),
  ('pl-7',  'user-marvel-4', 120, 'Approved: REFERRAL',          'sub-8',  'SUBMISSION'),
  ('pl-8',  'user-marvel-4', 100, 'Approved: CASE_CLUB',         'sub-9',  'SUBMISSION'),
  ('pl-9',  'user-marvel-1', 50,  'Welcome bonus',               NULL,     'BONUS'),
  ('pl-10', 'user-marvel-2', 50,  'Welcome bonus',               NULL,     'BONUS'),
  ('pl-11', 'user-marvel-4', 50,  'Welcome bonus',               NULL,     'BONUS')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- USER BADGES (earned)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."UserBadge" (id, "userId", "badgeId") VALUES
  ('ub-1', 'user-marvel-1', 'badge-influence'),
  ('ub-2', 'user-marvel-4', 'badge-influence')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- REDEMPTIONS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public."Redemption" (id, "userId", "rewardId", points, status, address, "updatedAt") VALUES
  ('red-1', 'user-marvel-1', 'reward-1', 50, 'SHIPPED',
   '{"name": "Dr. Nawaz M", "address": "Room 204, AIIMS Hostel", "city": "New Delhi", "pincode": "110029", "phone": "+91 98765 43210"}',
   NOW()),
  ('red-2', 'user-marvel-4', 'reward-1', 50, 'PENDING',
   '{"name": "Dr. Sneha Reddy", "address": "KMC Hostel Block B", "city": "Mangalore", "pincode": "575001", "phone": "+91 65432 10987"}',
   NOW())
ON CONFLICT DO NOTHING;

-- Deduct redeemed points from ledger
INSERT INTO public."PointsLedger" (id, "userId", points, reason, "refId", "refType") VALUES
  ('pl-red-1', 'user-marvel-1', -50, 'Redeemed: Plan C 3 month', 'red-1', 'REDEMPTION'),
  ('pl-red-2', 'user-marvel-4', -50, 'Redeemed: Plan C 3 month', 'red-2', 'REDEMPTION')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION QUERY: Check totals
-- ─────────────────────────────────────────────────────────────
-- SELECT * FROM public.user_points ORDER BY "totalEarned" DESC;
