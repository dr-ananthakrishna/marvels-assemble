import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let onboarding = await prisma.onboarding.findUnique({
    where: { userId: session.userId },
  });

  // Auto-correct: if score > 10 but status is still PENDING, upgrade to APPROVED
  if (onboarding && onboarding.status === "PENDING" && onboarding.score !== null && onboarding.score > 10) {
    onboarding = await prisma.onboarding.update({
      where: { userId: session.userId },
      data: { status: "APPROVED" },
    });
  }

  return NextResponse.json({ onboarding });
}
