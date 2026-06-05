import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check onboarding status for MARVEL users
    if (user.role === "MARVEL") {
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId: user.id },
      });
      if (onboarding && onboarding.status === "PENDING") {
        return NextResponse.json(
          { error: "Your application is still under review. You will be able to log in once approved.", pending: true },
          { status: 403 }
        );
      }
      if (onboarding && onboarding.status === "REJECTED") {
        return NextResponse.json(
          { error: "Your application has been rejected. Please contact support for more information.", rejected: true },
          { status: 403 }
        );
      }
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookie = setAuthCookie(token);

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(cookie);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
