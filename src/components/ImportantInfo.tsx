import type { EventConfig } from "@/lib/events";

export default function ImportantInfo({ event }: { event: EventConfig }) {
  return (
    <section className="relative bg-cream-50 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-brown-700 sm:text-4xl">
          Important Information
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="animate-fade-in-up rounded-3xl border-2 border-pink-200 bg-blush-50 p-6 shadow-md">
            <h3 className="text-lg font-bold text-pink-600">
              🔒 Private Invitation
            </h3>
            <p className="mt-2 text-brown-600">{event.privateMessage}</p>
          </div>

          <div className="animate-fade-in-up rounded-3xl border-2 border-pink-200 bg-blush-50 p-6 shadow-md">
            <h3 className="text-lg font-bold text-pink-600">
              👥 Extra Guests
            </h3>
            <p className="mt-2 text-brown-600">{event.extraGuestMessage}</p>
          </div>

          <div className="animate-fade-in-up rounded-3xl border-2 border-pink-200 bg-blush-50 p-6 shadow-md">
            <h3 className="text-lg font-bold text-pink-600">
              🚗 Parking
            </h3>
            <p className="mt-2 text-brown-600">{event.parkingMessage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
