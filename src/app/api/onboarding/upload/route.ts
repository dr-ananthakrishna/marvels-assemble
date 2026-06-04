import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreOnboardingVideo } from "@/lib/ai";
import { uploadOnboardingVideo } from "@/lib/supabase-storage";

export const maxDuration = 60;

const MAX_BYTES = 500 * 1024 * 1024; // 500MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("video") as File;
    if (!file) return NextResponse.json({ error: "No video file provided" }, { status: 400 });

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Video must be under 500MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "video/mp4";

    // Upload to Supabase Storage (skip gracefully if not configured)
    let videoUrl: string | null = null;
    try {
      videoUrl = await uploadOnboardingVideo(session.userId, buffer, mimeType, file.name);
    } catch (e) {
      console.warn("Video storage skipped:", (e as Error).message);
    }

    // Score with AI
    const result = await scoreOnboardingVideo(buffer, mimeType);
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
