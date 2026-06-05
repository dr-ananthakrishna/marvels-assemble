import { NextRequest, NextResponse } from "next/server";
import { scoreOnboardingVideo } from "@/lib/ai";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();
    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    // Score the video — no auth, no DB storage
    const result = await scoreOnboardingVideo(videoUrl);

    return NextResponse.json({ scoring: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to score video";
    console.error("Interview scorer score error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
