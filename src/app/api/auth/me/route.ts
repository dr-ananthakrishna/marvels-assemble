import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Points awarded per approved submission
const POINTS_PER_ACTIVITY = 50;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      college: true,
      role: true,
      instagramId: true,
      phone: true,
      dob: true,
      state: true,
      admissionYear: true,
      about: true,
      interests: true,
      onboarding: {
        select: {
          status: true,
        },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Calculate metrics from database
  const approvedSubmissions = await prisma.submission.count({
    where: { userId: session.userId, status: "APPROVED" },
  });

  const totalPoints = approvedSubmissions * POINTS_PER_ACTIVITY;
  const activitiesCompleted = approvedSubmissions;

  // Calculate badges based on points thresholds
  const badges = [];
  if (totalPoints >= 50) badges.push({ name: "Influence", points: 3 });
  if (totalPoints >= 150) badges.push({ name: "Visionary", points: 5 });
  if (totalPoints >= 300) badges.push({ name: "Impact", points: 10 });
  if (totalPoints >= 500) badges.push({ name: "Honor", points: 3 });
  if (totalPoints >= 750) badges.push({ name: "Excellence", points: 5 });
  if (totalPoints >= 1000) badges.push({ name: "Brilliance", points: 10 });

  // For now, assume no rewards redeemed (can be tracked in future)
  const totalRewards = 0;
  const availablePoints = totalPoints;

  return NextResponse.json({
    user: {
      ...user,
      points: totalPoints,
      availablePoints,
      totalPoints,
      activitiesCompleted,
      totalRewards,
      recentBadges: badges,
    },
  });
}
