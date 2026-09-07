import { NextRequest, NextResponse } from "next/server";
import { getHostSessionCookieName, isValidHostSessionToken } from "@/lib/adminAuth";
import { getEventBySlug } from "@/lib/events";
import { isUsingMockRsvpStore, listAllRsvps } from "@/lib/rsvpStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // src/proxy.ts already guards this route, but we re-check here in case
  // it's ever reached a different way.
  const token = request.cookies.get(getHostSessionCookieName(slug))?.value;
  if (!(await isValidHostSessionToken(token, slug))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const rsvps = await listAllRsvps(event.id);
    return NextResponse.json({ rsvps, devMode: isUsingMockRsvpStore() });
  } catch (error) {
    console.error(
      "Failed to fetch RSVPs:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Could not load RSVPs." },
      { status: 500 }
    );
  }
}
