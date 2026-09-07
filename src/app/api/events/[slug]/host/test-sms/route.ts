import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhoneToE164 } from "@/lib/phone";
import { sendSms } from "@/lib/twilio";
import { getEventBySlug } from "@/lib/events";

const DEFAULT_TEST_MESSAGE =
  "🧸🎀 Test successful! This is a test message from the HostBabyShower RSVP website. Your digital invitation SMS system is working.";

const testSmsSchema = z.object({
  phone: z.string().trim().min(7).max(25),
  message: z.string().trim().min(1).max(500).optional(),
});

/**
 * Host-only diagnostic endpoint to verify the Twilio wiring (credentials,
 * sender number, normalization) without touching the RSVP table. Not part
 * of the guest-facing RSVP flow. Protected by src/proxy.ts like every
 * other /api/events/<slug>/host/* route.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getEventBySlug(slug)) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = testSmsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A phone number is required." }, { status: 400 });
  }

  const toE164 = normalizePhoneToE164(parsed.data.phone);
  if (!toE164) {
    return NextResponse.json(
      { error: "Could not normalize that phone number to E.164 format." },
      { status: 400 }
    );
  }

  try {
    const result = await sendSms(toE164, parsed.data.message ?? DEFAULT_TEST_MESSAGE);
    return NextResponse.json({
      success: true,
      normalizedPhone: toE164,
      sid: result.sid,
      status: result.status,
      simulated: result.simulated,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Twilio error";
    console.error("Test SMS failed:", detail);
    return NextResponse.json(
      { success: false, normalizedPhone: toE164, error: detail },
      { status: 500 }
    );
  }
}
