import type { EventConfig } from "@/lib/events";

export default function Footer({ event }: { event: EventConfig }) {
  return (
    <footer className="relative bg-brown-700 px-4 py-10 text-center text-cream-100 sm:px-6">
      <p className="font-script text-2xl text-blush-200 sm:text-3xl">
        Thank you for being part of our special day 💕
      </p>
      <p className="mt-3 text-base font-semibold sm:text-lg">
        {event.footerMessage}
      </p>
      <p className="mt-6 text-xs font-medium tracking-wide text-cream-100/60">
        Created by Avery Web Services · Powered by HostBabyShower
      </p>
    </footer>
  );
}
