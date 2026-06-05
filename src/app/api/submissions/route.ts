import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SubmissionStatus } from "@prisma/client";
import { verifyReel, scoreReel } from "@/lib/verifiers";

const POINTS_PER_ACTIVITY: Record<string, number> = {
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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.role === "ADMIN" ? {} : { userId: session.userId };
  const submissions = await prisma.submission.findMany({
    where,
    include: { user: { select: { name: true, email: true, college: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const onboarding = await prisma.onboarding.findUnique({ where: { userId: session.userId } });
    if (!onboarding || onboarding.status !== "APPROVED") {
      return NextResponse.json({ error: "Complete onboarding first" }, { status: 403 });
    }

    const { activityType, proofUrl, proofNote } = await req.json();
    if (!activityType) return NextResponse.json({ error: "Activity type required" }, { status: 400 });

    let status: SubmissionStatus = "PENDING";
    let metrics: object | undefined = undefined;
    let autoChecked = false;
    let autoApproved = false;
    let rejectionReason: string | undefined = undefined;

    // Only Instagram Reels are auto-verified
    if (activityType === "REEL" && proofUrl) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { instagramId: true },
      });

      if (!user?.instagramId) {
        return NextResponse.json({ error: "Save your Instagram username before submitting a reel" }, { status: 400 });
      }

      const reelMetrics = await verifyReel(proofUrl, user.instagramId);
      const approved = scoreReel(reelMetrics);
      status = approved ? "APPROVED" : "REJECTED";
      metrics = reelMetrics;
      autoChecked = true;
      autoApproved = approved;
      rejectionReason = reelMetrics.rejectionReason;
    }

    const submission = await prisma.submission.create({
      data: {
        userId: session.userId,
        activityType,
        proofUrl,
        proofNote,
        metrics,
        status,
        autoChecked,
      },
    });

    // Calculate updated points total for the user
    const approvedCount = await prisma.submission.count({
      where: { userId: session.userId, status: "APPROVED" },
    });
    const totalPoints = approvedCount * 50; // base calculation (matches /api/auth/me)

    return NextResponse.json({
      submission,
      autoApproved,
      pointsEarned: autoApproved ? (POINTS_PER_ACTIVITY[activityType] ?? 50) : 0,
      rejectionReason,
      totalPoints,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("Submission error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
