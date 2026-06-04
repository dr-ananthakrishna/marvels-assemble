import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function hash(p: string) {
  return bcrypt.hash(p, 12);
}

const MARVEL_USERS = [
  // ── Approved + active (have submissions) ──────────────────────────────────
  { name: "Arjun Sharma",    email: "arjun@iitb.ac.in",    college: "IIT Bombay",               score: 82, approved: true,  instagramId: "arjun.sharma.iitb" },
  { name: "Priya Nair",      email: "priya@bits.ac.in",    college: "BITS Pilani",               score: 74, approved: true,  instagramId: "priya_nair_bits" },
  { name: "Rohan Verma",     email: "rohan@nitk.edu.in",   college: "NIT Trichy",                score: 91, approved: true,  instagramId: "rohan.verma.nitk" },
  { name: "Sneha Iyer",      email: "sneha@vit.ac.in",     college: "VIT Vellore",               score: 68, approved: true,  instagramId: null },
  { name: "Karthik Menon",   email: "karthik@manipal.edu", college: "Manipal Institute of Technology", score: 77, approved: true, instagramId: null },
  // ── Approved but no submissions yet ──────────────────────────────────────
  { name: "Deepika Reddy",   email: "deepika@srm.edu.in",  college: "SRM University",            score: 72, approved: true,  instagramId: null },
  { name: "Aditya Kumar",    email: "aditya@rvce.edu.in",  college: "RVCE Bangalore",            score: 85, approved: true,  instagramId: null },
  // ── Pending onboarding ────────────────────────────────────────────────────
  { name: "Meera Pillai",    email: "meera@jadavpur.edu",  college: "Jadavpur University",       score: null, approved: null, instagramId: null },
  { name: "Siddharth Joshi", email: "sid@psgtech.ac.in",   college: "PSG College of Technology", score: null, approved: null, instagramId: null },
  // ── Rejected onboarding ───────────────────────────────────────────────────
  { name: "Tanvi Desai",     email: "tanvi@iitd.ac.in",    college: "IIT Delhi",                 score: 42, approved: false, instagramId: null },
  { name: "Akash Patel",     email: "akash@vit.ac.in",     college: "VIT Vellore",               score: 38, approved: false, instagramId: null },
];

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
type ActivityType =
  | "REEL" | "COMMUNITY" | "QUIZ" | "REFERRAL"
  | "DOUBT_SESSION" | "CLASSROOM_SESSION" | "COLLEGE_EVENT"
  | "REPORT_PIRACY" | "CASE_CLUB" | "NEW_INITIATIVE";

const SAMPLE_SUBMISSIONS: Array<{
  activityType: ActivityType;
  proofUrl: string;
  proofNote?: string;
  status: SubmissionStatus;
  autoChecked: boolean;
  metrics?: object;
}> = [
  {
    activityType: "REEL",
    proofUrl: "https://www.instagram.com/reel/Cxample1/",
    status: "APPROVED",
    autoChecked: true,
    metrics: { views: 1240, likes: 89, comments: 14, shares: 22, verified: true },
  },
  {
    activityType: "COMMUNITY",
    proofUrl: "https://www.quora.com/profile/example/How-to-ace-placements",
    status: "APPROVED",
    autoChecked: true,
  },
  {
    activityType: "QUIZ",
    proofUrl: "https://docs.google.com/spreadsheets/d/exampleSheetId/edit",
    status: "APPROVED",
    autoChecked: true,
    metrics: { moduleCode: "MOD-101", sheetChecked: true },
  },
  {
    activityType: "DOUBT_SESSION",
    proofUrl: "https://drive.google.com/file/d/examplePhotoId/view",
    proofNote: "Conducted a 2-hour doubt solving session for 23 first-year students on data structures.",
    status: "APPROVED",
    autoChecked: false,
  },
  {
    activityType: "CLASSROOM_SESSION",
    proofUrl: "https://drive.google.com/file/d/examplePhotoId2/view",
    proofNote: "Presented the app to 40 students in CS-301 class. Got 12 sign-ups.",
    status: "PENDING",
    autoChecked: false,
  },
  {
    activityType: "COLLEGE_EVENT",
    proofUrl: "https://drive.google.com/file/d/exampleEventPhoto/view",
    proofNote: "Tech Fest 2025 — set up a stall, distributed flyers, 30+ app installs.",
    status: "PENDING",
    autoChecked: false,
  },
  {
    activityType: "REEL",
    proofUrl: "https://www.instagram.com/reel/Cxample2/",
    status: "REJECTED",
    autoChecked: true,
    metrics: { views: 187, likes: 3, comments: 1, shares: 0, verified: true },
  },
  {
    activityType: "NEW_INITIATIVE",
    proofUrl: "https://drive.google.com/file/d/exampleInitiative/view",
    proofNote: "Started a weekly 'Study with Marvel' session in the library — 15 regulars after 3 weeks.",
    status: "PENDING",
    autoChecked: false,
  },
  {
    activityType: "CASE_CLUB",
    proofUrl: "https://drive.google.com/file/d/exampleCaseClub/view",
    proofNote: "Presented at IIM-A case club meet. Mentioned the platform to 60+ attendees.",
    status: "APPROVED",
    autoChecked: false,
  },
  {
    activityType: "REPORT_PIRACY",
    proofUrl: "https://drive.google.com/file/d/examplePiracyReport/view",
    status: "PENDING",
    autoChecked: false,
  },
];

const APPROVED_WITH_SUBMISSIONS = [
  "arjun@iitb.ac.in",
  "priya@bits.ac.in",
  "rohan@nitk.edu.in",
  "sneha@vit.ac.in",
  "karthik@manipal.edu",
];

async function main() {
  console.log("🌱 Seeding database...\n");

  await prisma.submission.deleteMany();
  await prisma.onboarding.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ Cleared existing data");

  const marvelPassword = await hash("marvel123!");
  const adminPassword = await hash("admin123!");

  // Admins
  for (const a of [
    { email: "admin@marvels.com",  name: "Super Admin",    college: "HQ" },
    { email: "admin2@marvels.com", name: "Regional Admin", college: "HQ" },
  ]) {
    await prisma.user.create({ data: { ...a, password: adminPassword, role: "ADMIN" } });
    console.log(`✓ Admin: ${a.email}`);
  }

  // Marvel users
  const createdMarvels: Array<{ email: string; id: string }> = [];

  for (const m of MARVEL_USERS) {
    const user = await prisma.user.create({
      data: { email: m.email, password: marvelPassword, name: m.name, college: m.college, role: "MARVEL", instagramId: m.instagramId ?? null },
    });
    createdMarvels.push({ email: m.email, id: user.id });

    if (m.approved !== null) {
      const s = m.score!;
      const status = m.approved === true ? (s > 80 ? "APPROVED" : "PENDING") : "REJECTED";
      const breakdown = {
        communication:    Math.round(s * 0.25),
        confidence:       Math.round(s * 0.25),
        leadership:       Math.round(s * 0.10),
        academics:        Math.round(s * 0.10),
        extracurriculars: Math.round(s * 0.10),
        loveForMarrow:    Math.round(s * 0.10),
        entrepreneurial:  Math.round(s * 0.05),
        socialMedia:      s - Math.round(s * 0.95),
      };
      const reason = status === "APPROVED"
        ? `Strong application. Score ${s}/100 — auto-approved.`
        : status === "PENDING"
        ? `Score ${s}/100 — flagged for human review (threshold >80).`
        : `Score ${s}/100. Communication and confidence need improvement.`;
      await prisma.onboarding.create({
        data: {
          userId: user.id,
          videoUrl: null,
          status,
          score: s,
          breakdown,
          reason,
          transcript: null,
        },
      });
    } else {
      await prisma.onboarding.create({ data: { userId: user.id, status: "PENDING" } });
    }

    const stage = m.approved === true ? "APPROVED" : m.approved === false ? "REJECTED" : "PENDING ";
    console.log(`✓ Marvel: ${m.email.padEnd(28)} ${stage}`);
  }

  // Submissions for active Marvels
  let subIndex = 0;
  for (const email of APPROVED_WITH_SUBMISSIONS) {
    const marvel = createdMarvels.find(u => u.email === email)!;
    const count = 1 + (subIndex % 3); // cycles 1, 2, 3, 1, 2
    for (let i = 0; i < count; i++) {
      const sub = SAMPLE_SUBMISSIONS[(subIndex + i) % SAMPLE_SUBMISSIONS.length];
      await prisma.submission.create({
        data: {
          userId: marvel.id,
          activityType: sub.activityType,
          proofUrl: sub.proofUrl,
          proofNote: sub.proofNote ?? null,
          videoUrl: null,
          status: sub.status,
          autoChecked: sub.autoChecked,
          metrics: sub.metrics ?? undefined,
        },
      });
    }
    console.log(`✓ Submissions for ${email}: ${count}`);
    subIndex += count;
  }

  console.log("\n✅ Done!\n");
  console.log("── Admins ──────────────────────────────────────────────");
  console.log("  admin@marvels.com   / admin123!");
  console.log("  admin2@marvels.com  / admin123!");
  console.log("── Marvels (password: marvel123!) ──────────────────────");
  for (const m of MARVEL_USERS) {
    const stage = m.approved === true ? "✅ APPROVED" : m.approved === false ? "❌ REJECTED" : "⏳ PENDING";
    console.log(`  ${m.email.padEnd(32)} ${stage}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
