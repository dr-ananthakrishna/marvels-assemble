-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.User (
  id text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  college text NOT NULL,
  phone text,
  role USER-DEFINED NOT NULL DEFAULT 'MARVEL'::"Role",
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  instagramId text,
  dob date,
  state text,
  admissionYear text,
  referredBy text,
  about text,
  interests jsonb,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Onboarding (
  id text NOT NULL,
  userId text NOT NULL,
  videoUrl text,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"OnboardingStatus",
  score double precision,
  breakdown jsonb,
  reason text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  transcript text,
  idCardUrl text,
  CONSTRAINT Onboarding_pkey PRIMARY KEY (id),
  CONSTRAINT Onboarding_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Submission (
  id text NOT NULL,
  userId text NOT NULL,
  activityType USER-DEFINED NOT NULL,
  proofUrl text,
  proofNote text,
  metrics jsonb,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"SubmissionStatus",
  autoChecked boolean NOT NULL DEFAULT false,
  adminNote text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  videoUrl text,
  pointsAwarded integer,
  CONSTRAINT Submission_pkey PRIMARY KEY (id),
  CONSTRAINT Submission_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.ActivityConfig (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  activityType USER-DEFINED NOT NULL UNIQUE,
  points integer NOT NULL,
  label text NOT NULL,
  verification text NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ActivityConfig_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Badge (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL,
  category USER-DEFINED NOT NULL,
  pointsRequired integer NOT NULL,
  description text,
  icon text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Badge_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserBadge (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  userId text NOT NULL,
  badgeId text NOT NULL,
  earnedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT UserBadge_pkey PRIMARY KEY (id),
  CONSTRAINT UserBadge_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT UserBadge_badgeId_fkey FOREIGN KEY (badgeId) REFERENCES public.Badge(id)
);
CREATE TABLE public.Masterclass (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  title text NOT NULL,
  description text,
  duration text,
  videoUrl text,
  thumbnailUrl text,
  publishDate date,
  requiredPoints integer NOT NULL DEFAULT 1000,
  tier USER-DEFINED NOT NULL DEFAULT 'TIER_1'::"MasterclassTier",
  isPublished boolean NOT NULL DEFAULT false,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Masterclass_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserMasterclass (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  userId text NOT NULL,
  masterclassId text NOT NULL,
  watchedAt timestamp with time zone NOT NULL DEFAULT now(),
  completedAt timestamp with time zone,
  progress integer NOT NULL DEFAULT 0,
  CONSTRAINT UserMasterclass_pkey PRIMARY KEY (id),
  CONSTRAINT UserMasterclass_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT UserMasterclass_masterclassId_fkey FOREIGN KEY (masterclassId) REFERENCES public.Masterclass(id)
);
CREATE TABLE public.Reward (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL,
  description text,
  points integer NOT NULL,
  category text NOT NULL,
  image text,
  isActive boolean NOT NULL DEFAULT true,
  stock integer,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Reward_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Redemption (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  userId text NOT NULL,
  rewardId text NOT NULL,
  points integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"RedemptionStatus",
  address jsonb,
  trackingId text,
  adminNote text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Redemption_pkey PRIMARY KEY (id),
  CONSTRAINT Redemption_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Redemption_rewardId_fkey FOREIGN KEY (rewardId) REFERENCES public.Reward(id)
);
CREATE TABLE public.PointsLedger (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  userId text NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  refId text,
  refType text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT PointsLedger_pkey PRIMARY KEY (id),
  CONSTRAINT PointsLedger_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Rank (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL UNIQUE,
  minSales integer NOT NULL,
  maxSales integer,
  description text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Rank_pkey PRIMARY KEY (id)
);