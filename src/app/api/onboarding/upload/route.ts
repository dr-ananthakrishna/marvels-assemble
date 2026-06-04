import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreOnboardingVideo } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { videoUrl } = await req.json();
    if (!videoUrl) return NextResponse.json({ error: "videoUrl required" }, { status: 400 });

    const result = await scoreOnboardingVideo(videoUrl);
    const status = result.approved ? "APPROVED" : result.needsHumanReview ? "PENDING" : "REJECTED";

    const onboarding = await prisma.onboarding.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        videoUrl,
        status,
        score: result.score,
        breakdown: result.breakdown,
        reason: result.reason,
        transcript: result.transcript,
      },
      update: {
        videoUrl,
        status,
        score: result.score,
        breakdown: result.breakdown,
        reason: result.reason,
        transcript: result.transcript,
      },
    });

    return NextResponse.json({ onboarding, scoring: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to process video";
    console.error("Onboarding upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
