"use client";

import TeddyBear from "./decorative/TeddyBear";
import Bow from "./decorative/Bow";
import Heart from "./decorative/Heart";
import Flower from "./decorative/Flower";
import PawPrint from "./decorative/PawPrint";
import type { EventConfig } from "@/lib/events";

export default function Flyer({ event }: { event: EventConfig }) {
  const addressLines = event.address.split("\n");
  const closingLines = event.closingMessage.split("\n");
  const dayOfWeek = event.date.split(",")[0];
  const monthDayYear = event.date.slice(dayOfWeek.length + 1).trim();

  return (
    <section
      id="invitation"
      className="relative bg-blush-100 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-script text-3xl text-pink-600 sm:text-4xl">
          Your Digital Invitation
        </p>
        <h2 className="mt-2 text-3xl font-bold text-brown-700 sm:text-4xl">
          Save It, Screenshot It, Print It
        </h2>
      </div>

      <div
        id="invitation-flyer"
        className="relative mx-auto mt-10 max-w-xl overflow-hidden rounded-[2rem] border-4 border-double border-pink-300 bg-gradient-to-b from-white via-blush-50 to-blush-100 p-8 text-center shadow-2xl shadow-pink-200 sm:p-12"
      >
        <Bow className="absolute -left-4 -top-4 h-16 w-16 text-pink-400" />
        <Bow className="absolute -right-4 -top-4 h-16 w-16 rotate-12 text-pink-300" />
        <Heart className="absolute bottom-6 left-6 h-8 w-8 text-pink-300" />
        <Flower className="absolute bottom-8 right-8 h-10 w-10 text-pink-200" />
        <PawPrint className="absolute left-10 top-24 h-6 w-6 text-brown-400 opacity-40" />

        <TeddyBear className="mx-auto h-28 w-28" />

        <p className="font-script mt-4 text-4xl text-pink-600 sm:text-5xl">
          {event.eventName}
        </p>

        <p className="mt-6 text-lg text-brown-600">Join us for a</p>
        <h3 className="text-2xl font-bold text-brown-700 sm:text-3xl">
          Baby Shower
        </h3>
        <p className="mt-2 text-lg font-semibold text-pink-600">
          {event.familyName}
        </p>

        <div className="mx-auto mt-6 w-24 border-t-2 border-pink-300" />

        <p className="mt-6 text-xl font-bold text-brown-700">{dayOfWeek}</p>
        <p className="text-lg text-brown-600">{monthDayYear}</p>
        <p className="mt-2 text-lg font-semibold text-brown-600">
          {event.startTime} – {event.endTime}
        </p>

        <address className="mt-4 text-lg not-italic text-brown-600">
          {addressLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < addressLines.length - 1 && <br />}
            </span>
          ))}
        </address>

        <div className="mx-auto mt-6 w-24 border-t-2 border-pink-300" />

        <p className="mt-6 text-base font-bold text-brown-700">
          Hosts Contact:
        </p>
        <p className="text-base text-brown-600">
          {event.hostPhone1}
          {event.hostPhone2 && (
            <>
              <br />
              {event.hostPhone2}
            </>
          )}
        </p>

        <div className="mt-8 space-y-2 rounded-2xl bg-white/60 p-4 text-sm text-brown-600">
          <p>🔒 {event.privateMessage}</p>
          <p>👥 {event.extraGuestMessage}</p>
          <p>🚗 {event.parkingMessage}</p>
        </div>

        <p className="font-script mt-8 text-2xl text-pink-600 sm:text-3xl">
          {closingLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < closingLines.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl justify-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-14 rounded-full bg-pink-500 px-8 text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition-transform hover:scale-105 hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          🖨️ Save or Print Invitation
        </button>
      </div>
    </section>
  );
}
