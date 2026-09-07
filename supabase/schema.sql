-- HostBabyShower platform schema.
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Every baby shower/event ("We Can Bearly Wait" is the first one) gets a
-- row in `events`, and every RSVP belongs to exactly one event via
-- `event_id`. Guests from one event can never appear in another event's
-- dashboard because every guest-facing and host-facing query filters by
-- event_id.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  event_name text not null,
  theme text not null,
  date text not null,
  start_time text not null,
  end_time text not null,
  address text not null,
  host_phone_1 text not null,
  host_phone_2 text,
  -- The 4-digit host code is NOT stored here today — it lives in each
  -- event's own HOST_ACCESS_CODE_<SLUG> environment variable (never
  -- exposed to the browser). This column is reserved for a future
  -- migration to DB-managed, hashed host codes.
  host_access_code_hash text,
  parking_message text not null,
  private_message text not null,
  extra_guest_message text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- Note: the `phone` column stores the guest's phone number (E.164 format).
-- sms_status: 'sent' = Twilio actually accepted the message; 'failed' = a
-- real Twilio send was attempted and rejected/errored; 'simulated' = Twilio
-- wasn't configured yet, so no real text was sent (local dev only).
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (slug) on delete cascade,
  full_name text not null,
  phone text not null,
  rsvp_status text not null check (rsvp_status in ('yes', 'no')),
  message text,
  sms_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  sms_status text not null default 'sent' check (sms_status in ('sent', 'failed', 'simulated')),
  sms_message_sid text,
  sms_error text
);

-- If you already created this table before these columns existed, run:
-- alter table public.rsvps add column if not exists event_id text references public.events (slug) on delete cascade;
-- alter table public.rsvps add column if not exists sms_opt_in boolean not null default true;
-- alter table public.rsvps add column if not exists sms_status text not null default 'sent' check (sms_status in ('sent', 'failed', 'simulated'));
-- alter table public.rsvps add column if not exists sms_message_sid text;
-- alter table public.rsvps add column if not exists sms_error text;
-- If you already had the old 2-value check constraint, widen it with:
-- alter table public.rsvps drop constraint if exists rsvps_sms_status_check;
-- alter table public.rsvps add constraint rsvps_sms_status_check check (sms_status in ('sent', 'failed', 'simulated'));

create index if not exists rsvps_event_phone_created_at_idx
  on public.rsvps (event_id, phone, created_at desc);

-- Seed the first event. Its host access code is set via
-- HOST_ACCESS_CODE_WE_CAN_BEARLY_WAIT in .env.local, not in this table.
insert into public.events (
  slug, event_name, theme, date, start_time, end_time, address,
  host_phone_1, host_phone_2, parking_message, private_message, extra_guest_message
)
values (
  'we-can-bearly-wait',
  'We Can Bearly Wait',
  'We Can Bearly Wait',
  'Saturday, October 10, 2026',
  '2:00 PM',
  '4:00 PM',
  '406 Kent Dr' || chr(10) || 'Eufaula, AL 36027',
  '334-695-6676',
  '334-621-9717',
  'Please do not block any driveways when parking.',
  'Please do not send or share this link with anybody else. This is a private invitation.',
  'If you would like to bring someone other than yourself, please talk to the hosts first before inviting or bringing that person.'
)
on conflict (slug) do nothing;

-- Row Level Security is enabled with NO policies, so both tables are only
-- reachable through the Supabase service-role key used by the server-side
-- API routes. The anon/public key (if you ever add one to the frontend)
-- would not be able to read or write these tables.
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
