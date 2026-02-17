import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedPaths = ["/interview-ui", "/interview", "/dashboard", "/profile"];
  const isProtected = protectedPaths.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  if (!token && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/interview-ui/:path*",
    "/interview/:path*",
    "/interview/session/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/profile/settings/:path*",
    "/profile/upgrade/:path*",
  ],
};
