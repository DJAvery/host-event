import { NextRequest, NextResponse } from "next/server";
import { rsvpInputSchema } from "@/lib/validation";
import { getEventBySlug } from "@/lib/events";
import { findRecentDuplicate, insertRsvp, updateSmsResult } from "@/lib/rsvpStore";
import { isTwilioConfigured, sendInvitationSms } from "@/lib/twilio";
import { isRateLimited } from "@/lib/rateLimit";

const PRODUCTION_SITE_URL = "https://hostbabyshower.com";

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Builds the link texted to guests. Always points at the real public
 * domain (even during local development) so we never text a broken
 * localhost link — the site isn't guaranteed to be live there yet, but
 * that's the correct permanent destination once it is.
 */
function getInvitationUrl(slug: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isLocalhost = !configured || /localhost|127\.0\.0\.1/.test(configured);
  const base = isLocalhost ? PRODUCTION_SITE_URL : configured.replace(/\/$/, "");
  return `${base}/${slug}/rsvp`;
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = rsvpInputSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Please check your form and try again." },
      { status: 400 }
    );
  }

  const { fullName, phone, rsvpStatus, message } = parsed.data;

  const ip = getClientIp(request);

  // Guard the endpoint against bursts of automated submissions.
  if (isRateLimited(`ip:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }
  if (isRateLimited(`phone:${event.id}:${phone}`, { limit: 3, windowMs: 30 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "This phone number has already submitted an RSVP recently." },
      { status: 429 }
    );
  }

  // Prevent duplicate double-click submissions from re-sending a text.
  const dedupeWindowStart = new Date(Date.now() - 60 * 1000).toISOString();

  let inserted: { id: string };
  try {
    const isDuplicate = await findRecentDuplicate(event.id, phone, dedupeWindowStart);
    if (isDuplicate) {
      // Don't claim a fresh text was just sent — we only know a matching
      // RSVP already exists from the last minute, not what its SMS outcome was.
      return NextResponse.json({
        status: "duplicate",
        message: "You've already RSVP'd! 💕 We have your response on file.",
      });
    }

    inserted = await insertRsvp({ eventId: event.id, fullName, phone, rsvpStatus, message });
  } catch (storeError) {
    console.error(
      "Failed to save RSVP:",
      storeError instanceof Error ? storeError.message : storeError
    );
    return NextResponse.json(
      { error: "We couldn't save your RSVP. Please try again shortly." },
      { status: 500 }
    );
  }

  // The RSVP is already saved at this point, so a failed text below never
  // loses the guest's response — we just flag it for the hosts to see.
  console.log(
    isTwilioConfigured()
      ? `📨 Twilio is configured — attempting a REAL SMS send to ${phone}...`
      : `🧪 Twilio is NOT configured — this RSVP will get a DEV SMS SIMULATION, not a real text.`
  );

  try {
    const smsResult = await sendInvitationSms(phone, getInvitationUrl(event.slug));

    if (smsResult.simulated) {
      // Never claim a real text was sent when it wasn't — Twilio isn't
      // connected yet, so this was only logged to the server console.
      await updateSmsResult(inserted.id, { status: "simulated", sid: smsResult.sid });
      return NextResponse.json({
        status: "simulated",
        message:
          "Real SMS is not active yet — RSVP saved successfully, but text delivery is still in development mode.",
      });
    }

    await updateSmsResult(inserted.id, { status: "sent", sid: smsResult.sid });
  } catch (smsError) {
    const errorMessage =
      smsError instanceof Error ? smsError.message : "Unknown SMS error";
    console.error("Failed to send invitation SMS:", errorMessage);

    await updateSmsResult(inserted.id, { status: "failed", error: errorMessage });

    return NextResponse.json({
      status: "sms_failed",
      message: `Your RSVP was received, but we had trouble sending the invitation text. Please contact the hosts at ${event.hostPhone1} or ${event.hostPhone2}.`,
    });
  }

  return NextResponse.json({
    status: "sent",
    message:
      "You're RSVP'd! 💕 Your baby shower invitation has been sent to the phone number you entered.",
  });
}
