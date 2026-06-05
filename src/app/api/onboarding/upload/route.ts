import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreOnboardingVideo } from "@/lib/ai";

export const maxDuration = 300; // Vercel Pro: up to 300s; Hobby: capped at 60s

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, userId } = await req.json();
    if (!videoUrl) return NextResponse.json({ error: "videoUrl required" }, { status: 400 });

    // Try to get session first, fall back to userId parameter
    let finalUserId = userId;
    if (!finalUserId) {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      finalUserId = session.userId;
    }

    const result = await scoreOnboardingVideo(videoUrl);
    // Auto-approve if score > 10; otherwise put in PENDING for human review
    const status = result.score > 10 ? "APPROVED" : "PENDING";

    const onboarding = await prisma.onboarding.upsert({
      where: { userId: finalUserId },
      create: {
        userId: finalUserId,
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
