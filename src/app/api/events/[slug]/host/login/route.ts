import { NextRequest, NextResponse } from "next/server";
import { hostAccessCodeSchema } from "@/lib/validation";
import {
  createHostSessionToken,
  getHostSessionCookieName,
  isCorrectHostAccessCode,
} from "@/lib/adminAuth";
import { getEventBySlug } from "@/lib/events";
import { clearAttempts, isLockedOut, recordFailedAttempt } from "@/lib/rateLimit";

const LOCKOUT_LIMIT = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const ip = getClientIp(request);
  const lockoutKey = `host-login:${slug}:${ip}`;

  // Check for an existing lockout before even looking at the submitted code.
  if (isLockedOut(lockoutKey, { limit: LOCKOUT_LIMIT, windowMs: LOCKOUT_WINDOW_MS })) {
    return NextResponse.json(
      {
        error:
          "Too many incorrect attempts. Please wait a few minutes and try again.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = hostAccessCodeSchema.safeParse(body);
  if (!parsed.success) {
    recordFailedAttempt(lockoutKey, { limit: LOCKOUT_LIMIT, windowMs: LOCKOUT_WINDOW_MS });
    return NextResponse.json(
      { error: "Incorrect host code. Please try again." },
      { status: 400 }
    );
  }

  let correct: boolean;
  try {
    correct = isCorrectHostAccessCode(slug, parsed.data.code);
  } catch {
    return NextResponse.json(
      { error: "Host access is not configured yet for this event." },
      { status: 500 }
    );
  }

  if (!correct) {
    const lockedOut = recordFailedAttempt(lockoutKey, {
      limit: LOCKOUT_LIMIT,
      windowMs: LOCKOUT_WINDOW_MS,
    });
    return NextResponse.json(
      {
        error: lockedOut
          ? "Too many incorrect attempts. Please wait a few minutes and try again."
          : "Incorrect host code. Please try again.",
      },
      { status: lockedOut ? 429 : 401 }
    );
  }

  clearAttempts(lockoutKey);

  const response = NextResponse.json({ success: true });
  response.cookies.set(getHostSessionCookieName(slug), await createHostSessionToken(slug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return response;
}
