import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Server-side route protection. This runs before any page renders,
// so a student can never reach /faculty or /admin routes even if the
// client-side navigation were somehow bypassed.
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/faculty") && role !== "FACULTY" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/student") && !role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};
