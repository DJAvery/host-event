"use client";

import { useRef, useState, type FormEvent } from "react";
import { normalizePhoneToE164 } from "@/lib/phone";
import type { EventConfig } from "@/lib/events";
import Flyer from "./Flyer";

type SubmitState = "idle" | "submitting" | "completed" | "error";
type CompletedKind = "sent" | "simulated" | "sms_failed" | "duplicate";

const COMPLETED_COPY: Record<
  CompletedKind,
  { emoji: string; heading: string; subheading?: string }
> = {
  sent: {
    emoji: "🧸🎀",
    heading: "Thank You! 🧸🎀",
    subheading: "You're RSVP'd!",
  },
  simulated: {
    emoji: "🧸🎀",
    heading: "Thank You! 🧸🎀",
    subheading: "You're RSVP'd!",
  },
  sms_failed: {
    emoji: "🧸",
    heading: "Your RSVP Was Received",
  },
  duplicate: {
    emoji: "💕",
    heading: "You're Already RSVP'd",
  },
};

export default function RsvpFlow({ event }: { event: EventConfig }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"yes" | "no" | "">("");
  const [message, setMessage] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  const [state, setState] = useState<SubmitState>("idle");
  const [completedKind, setCompletedKind] =
    useState<CompletedKind>("sent");
  const [resultMessage, setResultMessage] = useState("");
  const submittingRef = useRef(false);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (submittingRef.current) return;

    if (fullName.trim().length < 2) {
      setState("error");
      setResultMessage("Please enter your full name.");
      return;
    }

    if (!normalizePhoneToE164(phone)) {
      setState("error");
      setResultMessage(
        "Please enter a valid 10-digit US phone number (e.g. (555) 555-5555)."
      );
      return;
    }

    if (rsvpStatus === "") {
      setState("error");
      setResultMessage("Please let us know if you'll be attending.");
      return;
    }

    submittingRef.current = true;
    setState("submitting");
    setResultMessage("");

    try {
      const response = await fetch(`/api/events/${event.slug}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          rsvpStatus,
          message,
          smsOptIn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setResultMessage(
          data.error ?? "Something went wrong. Please try again."
        );
        submittingRef.current = false;
        return;
      }

      const kind: CompletedKind =
        data.status === "simulated" ||
        data.status === "sms_failed" ||
        data.status === "duplicate"
          ? data.status
          : "sent";

      setCompletedKind(kind);
      setResultMessage(data.message ?? "");
      setState("completed");
    } catch {
      setState("error");
      setResultMessage(
        "We couldn't reach the server. Please check your connection and try again."
      );
      submittingRef.current = false;
    }
  }

  if (state === "completed") {
    const copy = COMPLETED_COPY[completedKind];

    return (
      <div>
        <div className="animate-pop-in mx-auto max-w-xl rounded-3xl border border-pink-200 bg-white p-8 text-center shadow-xl shadow-pink-100 sm:p-12">
          <span aria-hidden="true" className="text-5xl">
            {copy.emoji}
          </span>

          <h2 className="mt-4 text-3xl font-bold text-brown-700">
            {copy.heading}
          </h2>

          {copy.subheading && (
            <p className="mt-2 text-xl font-semibold text-pink-600">
              {copy.subheading}
            </p>
          )}

          <p className="mt-4 text-lg text-brown-600">
            {completedKind === "sent"
              ? "Your private invitation has been sent to the phone number you entered."
              : resultMessage}
          </p>

          <a
            href="#invitation"
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-pink-500 px-8 text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition-transform hover:scale-105 hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            View Your Invitation
          </a>
        </div>

        <Flyer event={event} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-0">
      <div className="text-center">
        <h1 className="font-script text-4xl text-pink-600 sm:text-5xl">
          RSVP &amp; Get Your Invite 🧸🎀
        </h1>

        <p className="mt-3 text-brown-500">
          Fill out your information below and we&apos;ll send your private
          baby shower invitation directly to your phone.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 space-y-5 rounded-3xl border border-pink-200 bg-white/90 p-6 shadow-xl shadow-pink-100 sm:p-8"
      >
        <div>
          <label
            htmlFor="fullName"
            className="block text-base font-semibold text-brown-700"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-beige-200 bg-cream-50 px-4 text-lg text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-base font-semibold text-brown-700"
          >
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-beige-200 bg-cream-50 px-4 text-lg text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
            placeholder="(555) 555-5555"
            aria-describedby="phone-hint"
          />

          <p id="phone-hint" className="mt-1 text-sm text-brown-400">
            Your invitation will be texted to this exact number if you opt in
            to SMS below.
          </p>
        </div>

        <fieldset>
          <legend className="block text-base font-semibold text-brown-700">
            Will you be attending?
          </legend>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-beige-200 bg-cream-50 px-4 has-[:checked]:border-pink-400 has-[:checked]:bg-blush-100">
              <input
                type="radio"
                name="rsvpStatus"
                value="yes"
                checked={rsvpStatus === "yes"}
                onChange={() => setRsvpStatus("yes")}
                className="h-5 w-5 accent-pink-500"
                required
              />

              <span className="text-brown-700">
                Yes, I&apos;ll be there!
              </span>
            </label>

            <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-beige-200 bg-cream-50 px-4 has-[:checked]:border-pink-400 has-[:checked]:bg-blush-100">
              <input
                type="radio"
                name="rsvpStatus"
                value="no"
                checked={rsvpStatus === "no"}
                onChange={() => setRsvpStatus("no")}
                className="h-5 w-5 accent-pink-500"
              />

              <span className="text-brown-700">
                Sorry, I can&apos;t make it
              </span>
            </label>
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="message"
            className="block text-base font-semibold text-brown-700"
          >
            Message to the Hosts{" "}
            <span className="font-normal text-brown-400">
              (optional)
            </span>
          </label>

          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-2 w-full rounded-xl border border-beige-200 bg-cream-50 px-4 py-3 text-lg text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
            placeholder="Leave a sweet note for the parents-to-be..."
          />
        </div>

        <div className="rounded-2xl border-2 border-pink-200 bg-blush-50 p-5 text-sm text-brown-600 sm:text-base">
          <ul className="space-y-2">
            <li>
              <span className="font-bold text-pink-600">
                🔒 Private Invitation
              </span>
              <br />
              {event.privateMessage}
            </li>

            <li>
              <span className="font-bold text-pink-600">
                👥 Extra Guests
              </span>
              <br />
              {event.extraGuestMessage}
            </li>

            <li>
              <span className="font-bold text-pink-600">
                🚗 Parking
              </span>
              <br />
              {event.parkingMessage}
            </li>
          </ul>

          <p className="mt-3 font-semibold">
            Hosts:
            <br />
            {event.hostPhone1}

            {event.hostPhone2 && (
              <>
                <br />
                {event.hostPhone2}
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              id="smsOptIn"
              name="smsOptIn"
              checked={smsOptIn}
              onChange={(event) => setSmsOptIn(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-pink-500"
            />

            <span className="text-sm leading-relaxed text-brown-600 sm:text-base">
              I agree to receive SMS messages from HostBabyShower about my
              RSVP, private invitation, reminders, and event updates.
              Message frequency varies. Message and data rates may apply.
              Reply STOP to opt out. Consent is not required to RSVP.
            </span>
          </label>
        </div>

        {state === "error" && (
          <p
            role="alert"
            className="rounded-xl bg-pink-100 px-4 py-3 text-base font-semibold text-pink-700"
          >
            {resultMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="flex min-h-14 w-full items-center justify-center rounded-full bg-pink-500 text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition-transform hover:scale-[1.02] hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          {state === "submitting"
            ? "Sending your invitation…"
            : "SEND MY INVITE 💕"}
        </button>
      </form>
    </div>
  );
}