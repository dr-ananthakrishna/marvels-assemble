import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { instagramId } = await req.json();
  if (!instagramId || typeof instagramId !== "string") {
    return NextResponse.json({ error: "instagramId required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { instagramId: instagramId.replace(/^@/, "").trim() },
    select: { id: true, instagramId: true },
  });

  return NextResponse.json({ user });
}
