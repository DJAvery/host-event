import type { EventConfig } from "@/lib/events";
import { normalizePhoneToE164 } from "@/lib/phone";

export default function HostsContact({ event }: { event: EventConfig }) {
  const hosts = [event.hostPhone1, event.hostPhone2].filter(Boolean);

  return (
    <section
      id="contact"
      className="relative bg-blush-100 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span aria-hidden="true" className="text-4xl">
          💌
        </span>
        <h2 className="mt-2 text-3xl font-bold text-brown-700 sm:text-4xl">
          Hosts Contact
        </h2>
        <p className="mt-3 text-lg text-brown-500">
          Questions about the shower? Reach out anytime!
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hosts.map((number) => (
            <a
              key={number}
              href={`tel:${normalizePhoneToE164(number) ?? number}`}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-lg font-bold text-pink-600 shadow-md shadow-pink-200 transition-transform hover:scale-105 hover:bg-pink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:w-auto"
              aria-label={`Call host at ${number}`}
            >
              <span aria-hidden="true">📞</span>
              {number}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
