import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/welcome",
  "/login",
  "/register",
  "/application-success",
  "/admin-login",
  "/signup",
];

// Routes only accessible to admins
const ADMIN_ONLY_ROUTES = ["/admin", "/admin-dashboard"];

// Routes only accessible to logged-in users
const PROTECTED_ROUTES = [
  "/dashboard",
  "/activities",
  "/badges",
  "/masterclasses",
  "/rewards",
  "/profile",
  "/onboarding",
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow API auth routes and static assets
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const token = req.cookies.get("auth-token")?.value;

  // Check if this is a public route
  const isPublic = PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // If logged in and visiting a public route, redirect to appropriate home
  if (isPublic && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      // Don't redirect from splash/welcome — let them navigate naturally
      if (pathname === "/login" || pathname === "/register" || pathname === "/admin-login") {
        return NextResponse.redirect(
          new URL(role === "ADMIN" ? "/admin-dashboard" : "/dashboard", req.url)
        );
      }
    } catch {
      // Invalid token — clear it and continue
    }
    return NextResponse.next();
  }

  // Public routes — allow without auth
  if (isPublic) return NextResponse.next();

  // Protected routes — require auth
  const isProtected = PROTECTED_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAdminOnly = ADMIN_ONLY_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected || isAdminOnly) {
    if (!token) {
      const loginUrl = isAdminOnly ? "/admin-login" : "/login";
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // Admin-only routes: reject non-admins
      if (isAdminOnly && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Marvel-only routes: reject admins (send to admin dashboard)
      if (isProtected && role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin-dashboard", req.url));
      }

      return NextResponse.next();
    } catch {
      const loginUrl = isAdminOnly ? "/admin-login" : "/login";
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)",
  ],
};
