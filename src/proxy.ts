import { NextRequest, NextResponse } from "next/server";
import { getHostSessionCookieName, isValidHostSessionToken } from "@/lib/adminAuth";

const PUBLIC_HOST_API_ACTIONS = new Set(["login", "session", "logout"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Page routes: /<slug>/host and /<slug>/host/dashboard
  if (segments[1] === "host" && segments[0]) {
    const slug = segments[0];
    const isLoginPage = segments.length === 2;
    if (!isLoginPage) {
      const token = request.cookies.get(getHostSessionCookieName(slug))?.value;
      const authenticated = await isValidHostSessionToken(token, slug);
      if (!authenticated) {
        return NextResponse.redirect(new URL(`/${slug}/host`, request.url));
      }
    }
    return NextResponse.next();
  }

  // API routes: /api/events/<slug>/host/<action>
  if (segments[0] === "api" && segments[1] === "events" && segments[3] === "host") {
    const slug = segments[2];
    const action = segments[4];
    if (!PUBLIC_HOST_API_ACTIONS.has(action)) {
      const token = request.cookies.get(getHostSessionCookieName(slug))?.value;
      const authenticated = await isValidHostSessionToken(token, slug);
      if (!authenticated) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:slug/host/:path*", "/api/events/:slug/host/:path*"],
};
