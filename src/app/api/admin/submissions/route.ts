import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    include: { user: { select: { name: true, email: true, college: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, status, adminNote } = await req.json();
  if (!submissionId || !status) {
    return NextResponse.json({ error: "submissionId and status required" }, { status: 400 });
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { status, adminNote },
  });

  return NextResponse.json({ submission: updated });
}
