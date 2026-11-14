import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidPassword, isValidSession } from "@/lib/admin-auth";

/**
 * Keeps /admin private. In a browser you sign in on /admin/login, which
 * sets a session cookie (see lib/admin-auth.ts). Scripts can still send
 * HTTP Basic Auth (any username, the password), e.g. scripts/content-signals.mjs
 * reading /admin/signals. Without ADMIN_PASSWORD set, /admin doesn't exist.
 */
export async function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse(null, { status: 404 });

  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value, password)) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(":") + 1);
      if (await isValidPassword(given, password)) return NextResponse.next();
    } catch {
      // Malformed header: treat as signed out.
    }
  }

  // The signals digest is read by a script: answer plainly, don't redirect.
  if (pathname.startsWith("/admin/signals")) {
    return new NextResponse("Authentication required", { status: 401 });
  }

  const login = new URL("/admin/login", request.url);
  if (pathname !== "/admin" || search) login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
