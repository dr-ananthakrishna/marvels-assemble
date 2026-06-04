import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { idCardUrl, userId } = await req.json();
    if (!idCardUrl) return NextResponse.json({ error: "idCardUrl required" }, { status: 400 });

    // Try to get session first, fall back to userId parameter
    let finalUserId = userId;
    if (!finalUserId) {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      finalUserId = session.userId;
    }

    const onboarding = await prisma.onboarding.upsert({
      where: { userId: finalUserId },
      create: {
        userId: finalUserId,
        idCardUrl,
      },
      update: {
        idCardUrl,
      },
    });

    return NextResponse.json({ onboarding });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save ID card";
    console.error("ID card upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
