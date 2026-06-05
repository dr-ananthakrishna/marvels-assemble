import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      college,
      phone,
      state,
      admissionYear,
      dob,
      referredBy,
      about,
      interests,
    } = await req.json();

    if (!email || !password || !name || !college) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        college,
        phone,
        role: "MARVEL",
        dob: dob ? new Date(dob) : null,
        state: state || null,
        admissionYear: admissionYear || null,
        referredBy: referredBy || null,
        about: about || null,
        interests: interests || null,
      },
    });

    // Create onboarding record
    await prisma.onboarding.create({
      data: {
        userId: user.id,
      },
    });

    // Do NOT set auth cookie on signup — user must wait for approval
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Signup error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
