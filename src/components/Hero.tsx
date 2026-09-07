import Link from "next/link";
import TeddyBear from "./decorative/TeddyBear";
import FloatingDecorations from "./decorative/FloatingDecorations";
import type { EventConfig } from "@/lib/events";

export default function Hero({ event }: { event: EventConfig }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-cream-50 to-cream-50 px-4 pb-20 pt-14 sm:px-6 sm:pt-20"
    >
      <FloatingDecorations />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <TeddyBear className="h-40 w-40 animate-float-slow drop-shadow-sm sm:h-52 sm:w-52" />

        <p className="mt-6 animate-fade-in-up text-lg font-semibold tracking-wide text-pink-600 sm:text-xl">
          You&apos;re Invited!
        </p>

        <h1 className="font-script mt-2 animate-fade-in-up text-5xl leading-tight text-brown-700 sm:text-7xl">
          {event.eventName}
        </h1>

        <h2 className="mt-3 animate-fade-in-up text-2xl font-bold text-brown-600 sm:text-3xl">
          Baby Shower
        </h2>

        <p className="mt-6 max-w-xl animate-fade-in-up text-balance text-lg text-brown-500 sm:text-xl">
          {event.heroTagline}
        </p>

        <Link
          href={`/${event.slug}/rsvp`}
          className="relative mt-8 inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full bg-pink-500 px-8 text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition-transform hover:scale-105 hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:text-xl"
        >
          <span className="relative z-10">RSVP &amp; GET INVITE</span>
          <span
            aria-hidden="true"
            className="animate-shimmer absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30"
          />
        </Link>
      </div>
    </section>
  );
}
