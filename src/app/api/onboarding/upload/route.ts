import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreOnboardingVideo } from "@/lib/ai";

export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("video") as File;
    if (!file) return NextResponse.json({ error: "No video file provided" }, { status: 400 });

    // Limit 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Video must be under 100MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "video/mp4";

    // Score with AI
    const result = await scoreOnboardingVideo(buffer, mimeType);

    // Update onboarding record
    const onboarding = await prisma.onboarding.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        videoUrl: `uploaded:${file.name}`,
        status: result.approved ? "APPROVED" : result.needsHumanReview ? "PENDING" : "REJECTED",
        score: result.score,
        breakdown: result.breakdown,
        reason: result.reason,
      },
      update: {
        videoUrl: `uploaded:${file.name}`,
        status: result.approved ? "APPROVED" : result.needsHumanReview ? "PENDING" : "REJECTED",
        score: result.score,
        breakdown: result.breakdown,
        reason: result.reason,
      },
    });

    return NextResponse.json({ onboarding, scoring: result });
  } catch (err) {
    console.error("Onboarding upload error:", err);
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 });
  }
}
