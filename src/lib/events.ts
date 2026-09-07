/**
 * The HostBabyShower event registry.
 *
 * This is the in-code stand-in for the future `events` database table.
 * Every event/client site (its theme, date, address, hosts, disclaimers,
 * etc.) is described here by slug. Adding a new client is meant to be as
 * simple as adding one more entry to EVENTS below (plus that event's own
 * HOST_ACCESS_CODE_<SLUG> environment variable) — no page or API code
 * needs to change.
 *
 * IMPORTANT: this file is safe to import from client components. It must
 * NEVER contain secrets (host access codes, Twilio/Supabase credentials).
 * Those live only in environment variables, looked up by slug in
 * src/lib/adminAuth.ts.
 */

export type EventConfig = {
  /** Stable identifier. Used as the RSVP table's event_id today. */
  id: string;
  /** URL segment: hostbabyshower.com/<slug> */
  slug: string;
  /** Displayed as the big script headline, e.g. "We Can Bearly Wait". */
  eventName: string;
  /** Theme name (may differ from eventName for future clients). */
  theme: string;
  /** Short subtitle, e.g. "Celebrating Our Little Girl". */
  familyName: string;
  /** Hero section supporting line. */
  heroTagline: string;
  /** Script-styled closing line shown at the bottom of the digital invitation. */
  closingMessage: string;
  /** Footer script-styled line above "Created by Avery Web Services". */
  footerMessage: string;
  /** Display date, e.g. "Saturday, October 10, 2026". */
  date: string;
  /** Display start time, e.g. "2:00 PM". */
  startTime: string;
  /** Display end time, e.g. "4:00 PM". */
  endTime: string;
  /** Multi-line address; split on "\n" when rendering. */
  address: string;
  hostPhone1: string;
  hostPhone2: string;
  parkingMessage: string;
  privateMessage: string;
  extraGuestMessage: string;
  status: "active" | "inactive";
  createdAt: string;
};

export const EVENTS: Record<string, EventConfig> = {
  "we-can-bearly-wait": {
    id: "we-can-bearly-wait",
    slug: "we-can-bearly-wait",
    eventName: "We Can Bearly Wait",
    theme: "We Can Bearly Wait",
    familyName: "Celebrating Our Little Girl",
    heroTagline: "Help us celebrate our little bundle of joy!",
    closingMessage: "A little girl, a whole lot of love.\nWe can bearly wait! 🧸🎀",
    footerMessage: "Tiny Girl, Big Blessings 🧸🎀",
    date: "Saturday, October 10, 2026",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    address: "406 Kent Dr\nEufaula, AL 36027",
    hostPhone1: "334-695-6676",
    hostPhone2: "334-621-9717",
    parkingMessage: "Please do not block any driveways when parking.",
    privateMessage:
      "Please do not send or share this link with anybody else. This is a private invitation.",
    extraGuestMessage:
      "If you would like to bring someone other than yourself, please talk to the hosts first before inviting or bringing that person.",
    status: "active",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
};

export function getEventBySlug(slug: string): EventConfig | undefined {
  const event = EVENTS[slug];
  return event && event.status === "active" ? event : undefined;
}

export function listActiveEventSlugs(): string[] {
  return Object.values(EVENTS)
    .filter((event) => event.status === "active")
    .map((event) => event.slug);
}
