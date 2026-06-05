import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSignedUploadUrl } from "@/lib/supabase-storage";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ext = req.nextUrl.searchParams.get("ext") || "mp4";
    const { signedUrl, path, publicUrl } = await createSignedUploadUrl(session.userId, ext);

    return NextResponse.json({ signedUrl, path, publicUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create upload URL";
    console.error("Video upload URL error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
