import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  const isPublic = pathname === "/" || pathname.startsWith("/scan");

  // Allow ?switch=true on /login so a logged-in user can switch accounts
  const isSwitching =
    pathname === "/login" && req.nextUrl.searchParams.get("switch") === "true";

  if (!session && !isAuthPage && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && isAuthPage && !isSwitching) {
    const role = session.user.role;
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", req.url));
    if (role === "LECTURER") return NextResponse.redirect(new URL("/lecturer/dashboard", req.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (session) {
    const role = session.user.role;
    if (pathname.startsWith("/student") && role !== "STUDENT")
      return NextResponse.redirect(new URL("/login", req.url));
    if (pathname.startsWith("/lecturer") && role !== "LECTURER")
      return NextResponse.redirect(new URL("/login", req.url));
    if (pathname.startsWith("/admin") && role !== "ADMIN")
      return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
