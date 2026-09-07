import { getSupabaseAdminClient, isSupabaseConfigured, type RsvpRow } from "./supabaseAdmin";
import {
  devFindRecentDuplicate,
  devInsertRsvp,
  devListRsvps,
  devUpdateSmsResult,
} from "./devStore";

/**
 * True when it's safe to use the local JSON dev fallback: Supabase isn't
 * configured AND we're not running a production build. A misconfigured
 * production deployment should fail loudly instead of silently using the
 * dev store.
 */
export function isUsingMockRsvpStore(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
}

function requireRealStore(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

export async function findRecentDuplicate(
  eventId: string,
  phone: string,
  sinceISO: string
): Promise<boolean> {
  if (isUsingMockRsvpStore()) return devFindRecentDuplicate(eventId, phone, sinceISO);

  requireRealStore();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("phone", phone)
    .gte("created_at", sinceISO)
    .limit(1);

  if (error) return false;
  return Boolean(data && data.length > 0);
}

export async function insertRsvp(input: {
  eventId: string;
  fullName: string;
  phone: string;
  rsvpStatus: "yes" | "no";
  message?: string;
  smsOptIn?: boolean;
}): Promise<{ id: string }> {
  if (isUsingMockRsvpStore()) {
    return { id: devInsertRsvp(input).id };
  }

  requireRealStore();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      event_id: input.eventId,
      full_name: input.fullName,
      phone: input.phone,
      rsvp_status: input.rsvpStatus,
      message: input.message ?? null,
      sms_opt_in: input.smsOptIn ?? true,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to insert RSVP.");
  }
  return { id: data.id };
}


export async function updateSmsResult(
  id: string,
  result: {
    status: "sent" | "failed" | "simulated";
    sid?: string | null;
    error?: string | null;
  }
): Promise<void> {
  if (isUsingMockRsvpStore()) {
    devUpdateSmsResult(id, {
      sms_status: result.status,
      sms_message_sid: result.sid ?? null,
      sms_error: result.error ?? null,
    });
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase
    .from("rsvps")
    .update({
      sms_status: result.status,
      sms_message_sid: result.sid ?? null,
      sms_error: result.error ?? null,
    })
    .eq("id", id);
}

export async function listAllRsvps(eventId: string): Promise<RsvpRow[]> {
  if (isUsingMockRsvpStore()) return devListRsvps(eventId);

  requireRealStore();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("rsvps")
    .select(
      "id, event_id, full_name, phone, rsvp_status, message, sms_opt_in, created_at, sms_status, sms_message_sid, sms_error"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
