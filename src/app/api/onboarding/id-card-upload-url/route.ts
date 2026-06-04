import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSignedUploadUrl } from "@/lib/supabase-storage";

export async function POST(req: NextRequest) {
  try {
    const { ext, userId: bodyUserId } = await req.json();
    if (!ext) return NextResponse.json({ error: "ext required" }, { status: 400 });

    // Try to get session first, fall back to userId parameter (needed during registration
    // flow where the auth cookie may not yet be propagated to subsequent requests)
    let finalUserId = bodyUserId;
    if (!finalUserId) {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      finalUserId = session.userId;
    }

    const { signedUrl, publicUrl } = await createSignedUploadUrl(finalUserId, ext);

    return NextResponse.json({ uploadUrl: signedUrl, publicUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create upload URL";
    console.error("ID card upload URL error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
