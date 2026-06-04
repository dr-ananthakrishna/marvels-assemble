import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = ["/", "/login", "/signup"];
const ADMIN_ONLY = ["/admin"];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = req.cookies.get("auth-token")?.value;

  // Logged-in users visiting public pages → send to their home
  if (PUBLIC.some(p => pathname === p)) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;
        return NextResponse.redirect(
          new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url)
        );
      } catch {}
    }
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (ADMIN_ONLY.some(p => pathname.startsWith(p)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
