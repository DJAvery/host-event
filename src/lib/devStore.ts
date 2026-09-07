import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { RsvpRow } from "./supabaseAdmin";

/**
 * DEVELOPMENT ONLY: a tiny JSON-file-backed RSVP store used when Supabase
 * isn't configured yet, so the full guest flow can still be tested locally.
 * Stored under .next/cache (already git-ignored) rather than the project
 * source tree, so writes never trigger the dev server's file watcher.
 */
const STORE_PATH = path.join(process.cwd(), ".next", "cache", "dev-rsvps-store.json");

function readAll(): RsvpRow[] {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as RsvpRow[];
  } catch {
    return [];
  }
}

function writeAll(rows: RsvpRow[]): void {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(rows, null, 2), "utf-8");
}

export function devInsertRsvp(input: {
  eventId: string;
  fullName: string;
  phone: string;
  rsvpStatus: "yes" | "no";
  message?: string;
  smsOptIn?: boolean;
}): RsvpRow {
  const rows = readAll();
  const row: RsvpRow = {
    id: randomUUID(),
    event_id: input.eventId,
    full_name: input.fullName,
    phone: input.phone,
    rsvp_status: input.rsvpStatus,
    message: input.message ?? null,
    sms_opt_in: input.smsOptIn ?? true,
    created_at: new Date().toISOString(),
    sms_status: "sent",
    sms_message_sid: null,
    sms_error: null,
  };
  rows.push(row);
  writeAll(rows);
  return row;
}

export function devFindRecentDuplicate(
  eventId: string,
  phone: string,
  sinceISO: string
): boolean {
  return readAll().some(
    (row) => row.event_id === eventId && row.phone === phone && row.created_at >= sinceISO
  );
}

export function devUpdateSmsResult(
  id: string,
  patch: {
    sms_status: "sent" | "failed" | "simulated";
    sms_message_sid?: string | null;
    sms_error?: string | null;
  }
): void {
  const rows = readAll();
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return;
  rows[index] = { ...rows[index], ...patch };
  writeAll(rows);
}

export function devListRsvps(eventId: string): RsvpRow[] {
  return readAll()
    .filter((row) => row.event_id === eventId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
