import { createClient } from "@supabase/supabase-js";

// TODO — Connect Supabase and add:
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// Until then, src/lib/rsvpStore.ts falls back to a local dev-only JSON store.

/** True once both Supabase environment variables are set. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-only Supabase client using the service-role key.
 *
 * This must NEVER be imported from client components — it is only safe to
 * use inside API routes / server code, since the service-role key bypasses
 * row-level security.
 */
export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type RsvpRow = {
  id: string;
  event_id: string;
  full_name: string;
  phone: string;
  rsvp_status: "yes" | "no";
  message: string | null;
  sms_opt_in: boolean;
  created_at: string;
  sms_status: "sent" | "failed" | "simulated";
  sms_message_sid: string | null;
  sms_error: string | null;
};
