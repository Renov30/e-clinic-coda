import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isRouteAllowed } from "@/lib/auth/permissions";

const SESSION_COOKIE_NAME = "coda_session";
const SESSION_SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "e-clinic-coda-super-secure-jwt-secret-key-32chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static assets, internal next routes, dan api health
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let userRole: string | null = null;
  let userPermissions: string[] | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SESSION_SECRET_KEY);
      isAuthenticated = true;
      userRole = (payload.role as string) || null;
      userPermissions = Array.isArray(payload.permissions)
        ? (payload.permissions as string[])
        : null;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Jika belum login dan mengakses halaman selain /login -> redirect ke /login
  if (!isAuthenticated && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika sudah login dan mencoba mengakses /login -> redirect ke dashboard /
  if (isAuthenticated && pathname === "/login") {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Proteksi Hak Akses (Role & Permission Based Route Guard)
  if (isAuthenticated && userRole && pathname !== "/login") {
    if (!isRouteAllowed(userRole, pathname, userPermissions)) {
      // Jika peran tidak memiliki izin untuk halaman ini, redirect ke dashboard
      const dashboardUrl = new URL("/", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
