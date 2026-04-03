import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/dashboard/business") && role !== "business") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/dashboard/reprocessor") && role !== "reprocessor") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    // Added protection for customer role if needed.
    if (path.startsWith("/dashboard/customer") && role !== "customer") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
