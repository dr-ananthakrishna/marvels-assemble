import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Points per activity type (must match activities page & me route)
const ACTIVITY_POINTS: Record<string, number> = {
  REEL: 50,
  COMMUNITY: 30,
  QUIZ: 80,
  DOUBT_SESSION: 100,
  CLASSROOM_SESSION: 150,
  COLLEGE_EVENT: 200,
  REFERRAL: 120,
  REPORT_PIRACY: 150,
  CASE_CLUB: 100,
  NEW_INITIATIVE: 180,
};

const ACTIVITY_LABELS: Record<string, string> = {
  REEL: "Instagram Reel",
  COMMUNITY: "Community Platform (Quora/Reddit)",
  QUIZ: "Quiz",
  DOUBT_SESSION: "Doubt Solving Session",
  CLASSROOM_SESSION: "Classroom Session",
  COLLEGE_EVENT: "College Event",
  REFERRAL: "Referral",
  REPORT_PIRACY: "Report Piracy",
  CASE_CLUB: "Case Club",
  NEW_INITIATIVE: "New Initiative",
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all approved submissions (earned points)
  const approvedSubmissions = await prisma.submission.findMany({
    where: { userId: session.userId, status: "APPROVED" },
    orderBy: { updatedAt: "desc" },
  });

  const earnedEntries = approvedSubmissions.map((s) => ({
    id: s.id,
    type: "earned" as const,
    description: ACTIVITY_LABELS[s.activityType] ?? s.activityType,
    activityType: s.activityType,
    points: ACTIVITY_POINTS[s.activityType] ?? 50,
    date: s.updatedAt.toISOString(),
  }));

  // Calculate totals
  const totalEarned = earnedEntries.reduce((sum, e) => sum + e.points, 0);
  // Spent is 0 until redemption model is added to DB
  const totalSpent = 0;
  const currentBalance = totalEarned - totalSpent;

  // Merge and sort all entries by date descending
  const history = [...earnedEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({
    history,
    summary: {
      totalEarned,
      totalSpent,
      currentBalance,
    },
  });
}
