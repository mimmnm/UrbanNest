import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Create response
  const response = NextResponse.next();

  // Security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // ═══ Admin routes — independent from NextAuth (uses admins collection) ═══
  if (pathname.startsWith("/mehedimnm") && pathname !== "/mehedimnm/login") {
    // Admin auth is cookie-based (admin_session + admin_id), NOT NextAuth
    const adminCookie = req.cookies.get("admin_session")?.value;
    const adminId = req.cookies.get("admin_id")?.value;
    if (!adminCookie || !adminId) {
      return NextResponse.redirect(new URL("/mehedimnm/login", req.url));
    }
    // No-cache headers for admin pages
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // Redirect logged-in admin away from admin login
  if (pathname === "/mehedimnm/login") {
    const adminCookie = req.cookies.get("admin_session")?.value;
    const adminId = req.cookies.get("admin_id")?.value;
    if (adminCookie && adminId) {
      return NextResponse.redirect(new URL("/mehedimnm", req.url));
    }
    return response;
  }

  // ═══ User routes — NextAuth based (uses users collection) ═══
  const protectedUserRoutes = ["/account", "/checkout"];
  if (protectedUserRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === "/login" || pathname === "/signup") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/mehedimnm",
    "/mehedimnm/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
};
