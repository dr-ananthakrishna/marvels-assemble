import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marvels = await prisma.user.findMany({
    where: { role: "MARVEL" },
    include: { onboarding: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ marvels });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, status, adminNote } = await req.json();
  if (!userId || !status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "userId and status (APPROVED|REJECTED) required" }, { status: 400 });
  }

  const onboarding = await prisma.onboarding.update({
    where: { userId },
    data: { status, reason: adminNote ?? undefined },
  });

  return NextResponse.json({ onboarding });
}
