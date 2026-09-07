import twilio from "twilio";

const EVENT_DATE_TIME = "Saturday, October 10, 2026 from 2:00 PM–4:00 PM";

export type SmsResult = { sid: string; status: string; simulated: boolean };

/** True once all three Twilio environment variables are set. */
export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );
}

// TODO — Connect Twilio account and add:
// TWILIO_ACCOUNT_SID
// TWILIO_AUTH_TOKEN
// TWILIO_PHONE_NUMBER
// Until then, sendSms() below simulates delivery in local development only.

/**
 * Low-level SMS sender used by both the guest invitation flow and the
 * admin-only Twilio wiring test. Throws (with a clearly logged reason) if
 * credentials are missing in production, or if Twilio rejects the send.
 *
 * In local development, when Twilio isn't configured yet, this simulates a
 * successful send instead of failing so the rest of the RSVP flow can still
 * be tested end-to-end. This DEVELOPMENT-ONLY fallback never runs once real
 * credentials are present, and never runs in production.
 */
export async function sendSms(toE164: string, body: string): Promise<SmsResult> {
  if (!isTwilioConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Twilio environment variables are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER."
      );
    }

    console.log("🧪 DEV SMS SIMULATION (Twilio not configured — development only)");
    console.log(`To: ${toE164}`);
    console.log(`Message: ${body}`);

    return {
      sid: `DEV-SIMULATED-${Date.now()}`,
      status: "simulated",
      simulated: true,
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER as string;

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({ to: toE164, from: fromNumber, body });
    console.log(
      `✅ Twilio SMS sent to ${toE164}: SID=${message.sid} status=${message.status}`
    );
    return { sid: message.sid, status: message.status, simulated: false };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`❌ Twilio SMS send failed for ${toE164}:`, detail);
    throw error;
  }
}

/**
 * Sends the "We Can Bearly Wait" invitation SMS to the exact phone number
 * provided. `toE164` must already be normalized to E.164 format.
 */
export async function sendInvitationSms(
  toE164: string,
  invitationUrl: string
): Promise<SmsResult> {
  const body =
    `🧸🎀 We Can Bearly Wait! Thank you for RSVPing to our baby shower on ` +
    `${EVENT_DATE_TIME}. View your private invitation here: ${invitationUrl}`;

  return sendSms(toE164, body);
}
