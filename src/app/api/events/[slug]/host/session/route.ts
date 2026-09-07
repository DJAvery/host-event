import { NextRequest, NextResponse } from "next/server";
import { getHostSessionCookieName, isValidHostSessionToken } from "@/lib/adminAuth";

/**
 * Public, unauthenticated-safe endpoint that only reveals whether the
 * current visitor already has a valid session for THIS event — never any
 * guest data. Used by the Navbar to decide between "Host Login" and
 * "Host Dashboard".
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.cookies.get(getHostSessionCookieName(slug))?.value;
  const authenticated = await isValidHostSessionToken(token, slug);
  return NextResponse.json({ authenticated });
}
