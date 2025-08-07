import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/charities",
    "/impact-reports",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith("/charities/") ||
      pathname.startsWith("/impact-reports/")
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is trying to access protected routes
  // if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
  //   if (!token) {
  //     console.log();
  //     return NextResponse.redirect(new URL("/auth/login", request.url));
  //   }

  //   // try {
  //   //   const payload = verifyToken(token);
  //   //   console.log(payload, "payload");
  //   //   // Role-based route protection
  //   //   if (pathname.startsWith("/dashboard/admin") && payload.role !== "admin") {
  //   //     return NextResponse.redirect(new URL("/dashboard/user", request.url));
  //   //   }

  //   //   if (
  //   //     pathname.startsWith("/dashboard/charity") &&
  //   //     payload.role !== "charity"
  //   //   ) {
  //   //     return NextResponse.redirect(new URL("/dashboard/user", request.url));
  //   //   }

  //   //   if (
  //   //     pathname.startsWith("/dashboard/user") &&
  //   //     payload.role === "charity"
  //   //   ) {
  //   //     return NextResponse.redirect(
  //   //       new URL("/dashboard/charity", request.url)
  //   //     );
  //   //   }

  //   //   if (pathname.startsWith("/dashboard/user") && payload.role === "admin") {
  //   //     return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  //   //   }
  //   // } catch (error) {
  //   //   return NextResponse.redirect(new URL("/auth/login", request.url));
  //   // }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
