import { NextRequest, NextResponse } from "next/server";
import { createSignedUploadUrl } from "@/lib/supabase-storage";

export async function GET(req: NextRequest) {
  try {
    const ext = req.nextUrl.searchParams.get("ext") || "mp4";
    // Use a generic "interview-scorer" path — no user/auth required
    const { signedUrl, path, publicUrl } = await createSignedUploadUrl(
      "interview-scorer",
      ext
    );

    return NextResponse.json({ uploadUrl: signedUrl, path, publicUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create upload URL";
    console.error("Interview scorer upload URL error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
