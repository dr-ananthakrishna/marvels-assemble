/**
 * POST /api/admin/seed — creates a default admin user
 * Only works in development. Remove before production.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }
  const existing = await prisma.user.findUnique({ where: { email: "admin@marvels.com" } });
  if (existing) return NextResponse.json({ message: "Admin already exists" });

  const hashed = await hashPassword("admin123!");
  await prisma.user.create({
    data: { email: "admin@marvels.com", password: hashed, name: "Admin", college: "HQ", role: "ADMIN" },
  });
  return NextResponse.json({ message: "Admin created: admin@marvels.com / admin123!" });
}
