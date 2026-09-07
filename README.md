# HostBabyShower 🧸🎀 — Multi-Event Baby Shower Invitations & RSVP

HostBabyShower is a reusable platform (by Avery Web Services) for private,
beautiful baby shower invitation and RSVP websites. Each baby shower is an
**event** with its own URL, theme, date/address/hosts, RSVP list, and
private 4-digit host code — completely isolated from every other event.

"We Can Bearly Wait" is the **first event** on the platform, live at
`/we-can-bearly-wait`. Adding a new client (e.g. `/baby-smith`) is meant to
be just: add one entry to [`src/lib/events.ts`](src/lib/events.ts) plus
that event's own `HOST_ACCESS_CODE_<SLUG>` variable — no page or API code
needs to change.

Guests fill out an RSVP form on their event's `/rsvp` page, their response
is saved to a database (scoped to that event only), and they instantly
receive the digital invitation via SMS text message. Each event's hosts
view their own RSVPs — never another event's — on a 4-digit-code-protected
host dashboard, with search, filtering, and CSV export.

Built with **Next.js** (App Router + API routes), **Supabase** (Postgres
database), and **Twilio** (SMS delivery).

---

## 1. Project structure

```
src/
  app/
    page.tsx                  Platform homepage ("HostBabyShower" brand, no event content)
    privacy/page.tsx          Platform-wide privacy policy
    terms/page.tsx            Platform-wide terms of service
    layout.tsx                Fonts + global <html>/<body> shell + platform metadata
    globals.css                Theme colors, animations, print styles
    [slug]/
      page.tsx                Event homepage (Hero, Important Info, Hosts Contact, Footer)
      rsvp/page.tsx           Event RSVP flow (form -> success -> invitation reveal)
      host/
        page.tsx              Event's Host Access 4-digit code screen
        dashboard/page.tsx    Event's protected RSVP dashboard (stats, table, CSV export)
    api/
      events/[slug]/
        rsvp/route.ts               POST: validate + save RSVP + send invitation SMS (for this event)
        host/login/route.ts         POST: check THIS event's host code, set a session cookie scoped to it
        host/logout/route.ts       POST: clear this event's session cookie
        host/session/route.ts      GET: public "am I logged in to this event?" check (no guest data)
        host/rsvps/route.ts        GET: list this event's RSVPs only (requires valid session)
        host/test-sms/route.ts     POST: host-only Twilio wiring test (no DB writes)
  components/                 Hero, Navbar, RsvpFlow, Flyer, ImportantInfo,
                               HostsContact, Footer, HostLoginForm, HostDashboard
                               — every one of these takes the event's data as a prop
    decorative/                Hand-drawn SVG teddy bear, bow, heart, paw, cloud, flower
  lib/
    events.ts                  The event registry (in-code stand-in for an `events` table)
    phone.ts                  US phone number -> E.164 normalization
    validation.ts              Zod schemas + input sanitization
    rateLimit.ts               Basic in-memory rate limiter
    adminAuth.ts                Per-event signed host session cookie (Web Crypto HMAC)
    supabaseAdmin.ts            Server-only Supabase client (service role key)
    twilio.ts                   Twilio SMS sending helpers (sendSms / sendInvitationSms)
  proxy.ts                     Route protection for /<slug>/host/* and /api/events/<slug>/host/*
supabase/
  schema.sql                   SQL to create the `events` and `rsvps` tables (with event_id) in Supabase
.env.example                   All required environment variables (placeholders only)
```

The guest flow per event is: **`/<slug>` → "RSVP & GET INVITE" →
`/<slug>/rsvp` → submit form → success screen → digital invitation revealed
on the same page.** The platform homepage (`/`) never shows any specific
event's content — guests reach an event only through the private link its
hosts share.

**Security note:** Twilio and Supabase credentials are only ever read inside
files under `src/app/api/**` and `src/lib/**`, which run exclusively on the
server. No secret is ever imported into a `"use client"` component or sent
to the browser. Every event's host session cookie is signed with that
event's slug baked into the payload, so a session issued for one event can
never unlock another event's dashboard.

**Local development fallback:** Supabase and Twilio each require you to
create real accounts and credentials (see sections 4–7). Until you add
those to `.env.local`, the site automatically falls back to a **local,
file-backed dev store** for RSVPs ([`src/lib/devStore.ts`](src/lib/devStore.ts),
gitignored under `.next/cache/`) and **simulates SMS sending** (logs
`🧪 DEV SMS SIMULATION` to the terminal instead of texting anyone) — see
[`src/lib/rsvpStore.ts`](src/lib/rsvpStore.ts) and
[`src/lib/twilio.ts`](src/lib/twilio.ts). This lets you test the entire
Home → RSVP → success → invitation flow locally with zero setup. The
host dashboard shows a "🧪 DEVELOPMENT ONLY" banner whenever it's reading
from this fallback instead of a real database. The fallback never runs in
a production build, and is skipped entirely the moment real
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` or
`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_PHONE_NUMBER` values are
present.

---

## 2. Install the project in VS Code

1. Open this folder in VS Code.
2. Open a terminal (`` Ctrl+` ``) and install dependencies:

   ```bash
   npm install
   ```

## 3. Run it locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The invitation page
works immediately; the RSVP form will show a friendly error until you add
real Supabase and Twilio credentials (steps below).

---

## 4. Create the Supabase database

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `rsvps` table with Row Level Security enabled and no public policies —
   it is only reachable using the service-role key from the server.

### RSVP table columns

| Column        | Type        | Notes                                   |
|---------------|-------------|------------------------------------------|
| `id`          | `uuid`      | Primary key, auto-generated              |
| `event_id`    | `text`      | References `events.slug` — every RSVP belongs to exactly one event |
| `full_name`   | `text`      | Guest's full name                        |
| `phone`       | `text`      | Guest's phone number, normalized to E.164 (`+1...`) |
| `rsvp_status` | `text`      | `'yes'` or `'no'`                        |
| `message`     | `text`      | Optional note to the hosts               |
| `sms_opt_in`  | `boolean`   | Defaults `true` — guest is texted the invitation by submitting the form |
| `created_at`  | `timestamptz` | Submission date/time, defaults to `now()` |
| `sms_status`  | `text`      | `'sent'` or `'failed'` — lets hosts see if the invitation text didn't go through |
| `sms_message_sid` | `text`  | Twilio message SID on success, for cross-referencing in the Twilio console |
| `sms_error`   | `text`      | Error detail when `sms_status = 'failed'` |

The schema also creates an `events` table (slug, event_name, theme, date,
start/end time, address, host phone numbers, disclaimers, status) as the
future home for event data once it's fully DB-managed. Today, event content
is served from [`src/lib/events.ts`](src/lib/events.ts) and host codes come
from environment variables — see section 12.

## 5. Connect Supabase to the app

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **`service_role` secret key**.
3. Create a file named `.env.local` in the project root (copy from
   `.env.example`) and fill in:

   ```
   SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   ⚠️ The `service_role` key bypasses Row Level Security — never put it in
   a `NEXT_PUBLIC_*` variable or client component.

---

## 6. Create and configure Twilio

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio).
2. From the Twilio Console dashboard, copy your **Account SID** and
   **Auth Token**.
3. Buy/activate an SMS-capable phone number under **Phone Numbers → Manage
   → Active Numbers**.
4. If your account is a Twilio trial account, verify the guest's phone
   number under **Phone Numbers → Verified Caller IDs** before testing, or
   upgrade the account to send to any number.

## 7. Where to put Twilio environment variables

Add these to the same `.env.local` file:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15555550123
```

Also set the site URL used for page metadata (Open Graph, canonical URL):

```
NEXT_PUBLIC_SITE_URL=https://hostbabyshower.com
```

For local development, override it in your own `.env.local` with
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` for metadata purposes. The SMS
invitation link itself always points at `https://hostbabyshower.com/<slug>/rsvp`
regardless of this variable ([`src/app/api/events/[slug]/rsvp/route.ts`](src/app/api/events/%5Bslug%5D/rsvp/route.ts))
— guests are never texted a `localhost` link, even while you're developing.

Restart `npm run dev` after editing `.env.local` so the new variables load.

---

## 8. How to test sending an invitation to a phone

**Quick Twilio wiring check (no database required):** log in as a host at
`/we-can-bearly-wait/host`, then (while your host session cookie is active)
call:

```
POST /api/events/we-can-bearly-wait/host/test-sms
{ "phone": "555-555-5555" }
```

This normalizes the number, sends a real "Test successful!" text through
your configured Twilio account, and returns the Twilio message SID/status —
without creating any RSVP row. It's protected by that event's host session,
so guests can never trigger it, and a code for one event can't call another
event's test-sms endpoint.

**Full end-to-end guest flow:**
1. Make sure `.env.local` has real Supabase and Twilio values (see above).
2. Run `npm run dev` and open the site at `/we-can-bearly-wait`.
3. Click **RSVP & GET INVITE**, which takes you to `/we-can-bearly-wait/rsvp`.
4. Fill in **your own phone number** in any of these formats:
   `5555555555`, `555-555-5555`, or `(555) 555-5555`.
5. Submit the form. The number you typed is normalized to E.164
   (`+15555555555`) and Twilio sends the invitation text **only to that
   exact number** — the server never uses a hard-coded number.
6. You should receive a text, see the success screen, and the digital
   invitation appears directly beneath it on the same page.

---

## 9. How to access an event's host RSVP dashboard

Hosts never create a username or password — they just enter their event's
private 4-digit code.

1. Set the event's host code and a session-signing secret in `.env.local`:

   ```
   HOST_ACCESS_CODE_WE_CAN_BEARLY_WAIT=2580
   ADMIN_SESSION_SECRET=a-long-random-string
   ```

   Generate a strong random secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   `HOST_ACCESS_CODE_<SLUG>` is never sent to the browser or displayed
   anywhere on the public site — it's only read server-side in
   [`src/lib/adminAuth.ts`](src/lib/adminAuth.ts) to check the code the host
   typed in for that specific event. A future event just adds its own
   `HOST_ACCESS_CODE_<SLUG>` variable — the login page and API code are
   reused as-is, and one event's code never unlocks another event's
   dashboard.
2. Visit `/we-can-bearly-wait/host` (redirects here automatically if you
   visit `/we-can-bearly-wait/host/dashboard` without a session) and enter
   the 4-digit code on the "Host Access 🧸" screen. Typing the 4th digit
   auto-submits, or press **View Guest List**.
3. On success you're redirected to `/we-can-bearly-wait/host/dashboard` and
   stay signed in on that browser for 30 days (a signed, httpOnly,
   `SameSite=Lax` cookie scoped to this event) — refreshing or reopening
   the tab won't ask for the code again until the session expires or you
   log out.
4. You'll see summary cards (total responses, attending, not attending) and
   a guest table with name, phone number, status (✓ Attending /
   ✕ Not Attending), message, and date submitted — for THIS event only.
   If an invitation text failed to send, that row is flagged with an
   "SMS not delivered" badge instead of losing the RSVP.
5. Use the search box to find a guest by name or phone number, the status
   dropdown to filter Attending/Not Attending, and the sort dropdown to
   flip between newest-first and oldest-first.
6. Click **⟳ Refresh** to reload the latest submissions, **⬇ Export CSV**
   to download the currently filtered guest list as a spreadsheet, or
   **🖨 Print Guest List** for a print-friendly view of just the table.
7. Click **Log Out** on the dashboard to end the session immediately on
   that device.
8. Every event's dashboard and API (`/api/events/<slug>/host/*`) are
   protected by `src/proxy.ts`, which checks that event's signed session
   cookie — visiting those URLs without a valid session redirects to
   `/<slug>/host` (or returns `401` for API requests). RSVPs are always
   filtered by `event_id`, so guests from one event can never appear in
   another event's dashboard, and Supabase Row Level Security has no public
   policies, so only the server-side service-role key can read the table.
9. Wrong-code protection: after 5 incorrect codes from the same visitor for
   the same event within 15 minutes, further attempts are temporarily
   blocked with a generic "Too many incorrect attempts" message (never
   revealing whether a guess was close). A correct code immediately clears
   the counter, so hosts are never permanently locked out — only guessers
   are slowed down.

---

## 10. Deploy the website (Vercel)

The platform is built for the production domain **https://hostbabyshower.com**.
This domain does not need to already be connected for the code to be ready
— you configure it in Vercel as part of deployment:

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel project's **Settings → Environment Variables**, add every
   variable from `.env.example` with your real values:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`,
   `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`,
   `HOST_ACCESS_CODE_WE_CAN_BEARLY_WAIT` (and one more per future event),
   `ADMIN_SESSION_SECRET`, and set
   `NEXT_PUBLIC_SITE_URL=https://hostbabyshower.com`.
4. Deploy. Vercel builds and hosts the Next.js app, including the API
   routes, automatically.
5. In Vercel's **Settings → Domains**, add `hostbabyshower.com` and follow
   the DNS instructions Vercel provides (pointing your domain registrar's
   DNS records at Vercel). Once DNS propagates, the site is live at
   `https://hostbabyshower.com`, with each event reachable at
   `https://hostbabyshower.com/<slug>`.

---

## 11. How to change an event's wording later

All guest-facing text for the seed event lives in one place —
[`src/lib/events.ts`](src/lib/events.ts) — plus the shared components that
read from it:

- **Event content (date, address, hosts, disclaimers, taglines, closing message):** [`src/lib/events.ts`](src/lib/events.ts)
- **Hero headline / tagline layout:** [`src/components/Hero.tsx`](src/components/Hero.tsx)
- **RSVP form labels, disclaimer notices, success screen:** [`src/components/RsvpFlow.tsx`](src/components/RsvpFlow.tsx)
- **Digital invitation flyer layout:** [`src/components/Flyer.tsx`](src/components/Flyer.tsx)
- **Private invitation / extra guest / parking notice layout:** [`src/components/ImportantInfo.tsx`](src/components/ImportantInfo.tsx)
- **Host phone number layout:** [`src/components/HostsContact.tsx`](src/components/HostsContact.tsx) and `Flyer.tsx`
- **Footer layout:** [`src/components/Footer.tsx`](src/components/Footer.tsx)
- **SMS invitation text:** [`src/lib/twilio.ts`](src/lib/twilio.ts)

Edit the text directly in these files and save — the dev server hot-reloads
automatically.

---

## 12. Adding a brand-new event/client

This is the whole point of the platform: a new baby shower should never
require copying or rebuilding the codebase.

1. Open [`src/lib/events.ts`](src/lib/events.ts) and add a new entry to the
   `EVENTS` object with a unique `slug` (e.g. `"baby-smith"`) and that
   event's theme, date, times, address, host phone numbers, and
   disclaimers.
2. Add that event's own env var to `.env.local` (and to Vercel once
   deployed): `HOST_ACCESS_CODE_BABY_SMITH=1234` (name derived from the
   slug, screaming-snake-cased).
3. That's it — `/baby-smith`, `/baby-smith/rsvp`, and
   `/baby-smith/host` all work immediately, with their own RSVP list
   (filtered by `event_id` in `rsvps`), their own host code, and their own
   session cookie. No other code changes are required.

---

## Security features implemented

- Twilio and Supabase secrets are read only in server-side files and never
  bundled into client JavaScript.
- All RSVP input is validated and sanitized server-side with Zod
  (`src/lib/validation.ts`), independent of client-side checks.
- Phone numbers are normalized and validated server-side before being used
  anywhere, and the SMS is always sent to that exact normalized number.
- Basic in-memory rate limiting on `/api/events/<slug>/rsvp` (by IP and by
  event + phone number) to slow down abuse. For high-traffic production
  use, swap in a shared store such as Upstash Redis.
- Duplicate double-click submissions from the same phone number within 60
  seconds are detected and treated as already-submitted rather than
  re-sending a text or creating a duplicate row.
- Each event's host access code (`HOST_ACCESS_CODE_<SLUG>`) is only read
  server-side and is never sent to the browser, logged, or displayed on the
  public site. `/<slug>/host` accepts a 4-digit code and locks out further
  attempts from the same visitor for that event for ~15 minutes after 5
  incorrect guesses in a row (`src/lib/rateLimit.ts`), without ever
  indicating how close a guess was.
- Every event's host dashboard is protected by a signed, httpOnly,
  `SameSite=Lax` session cookie (HMAC-SHA256 via the Web Crypto API,
  30-day lifetime, with the event slug baked into the signed payload)
  checked in `src/proxy.ts` before every `/<slug>/host/*` and
  `/api/events/<slug>/host/*` request — a session for one event can never
  unlock another event's dashboard.
- Every RSVP is stored with an `event_id`, and every host-facing query
  filters by it, so guests from one event can never appear in another
  event's dashboard.
- No payment or fee of any kind appears anywhere on the site.
