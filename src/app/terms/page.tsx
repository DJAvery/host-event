import Link from "next/link";

export const metadata = {
  title: "Terms of Service — HostBabyShower",
  description: "Terms for using a HostBabyShower baby shower event website.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-cream-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brown-500 hover:text-pink-600"
        >
          ← Home
        </Link>

        <h1 className="font-script mt-4 text-4xl text-pink-600 sm:text-5xl">
          Terms of Service
        </h1>

        <div className="mt-8 space-y-6 text-brown-700">
          <p>
            These terms apply to HostBabyShower, a platform built and
            operated by Avery Web Services that hosts private baby shower
            invitation and RSVP websites for individual events.
          </p>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              Private, invitation-only events
            </h2>
            <p className="mt-2">
              Each event on HostBabyShower is private. Event pages and RSVP
              links are intended only for guests the hosts have personally
              invited. HostBabyShower does not maintain a public, searchable
              directory of events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              Host responsibilities
            </h2>
            <p className="mt-2">
              Hosts are responsible for the accuracy of their event details
              (date, time, address, and host contact numbers) and for
              keeping their event&apos;s 4-digit host access code private.
              Hosts should only share the event link with intended guests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              Guest submissions
            </h2>
            <p className="mt-2">
              By submitting an RSVP, a guest confirms the information they
              provide (name, phone number, response, and any message) is
              accurate and that they consent to receive one invitation text
              message related to the event they are RSVPing to.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              SMS messaging terms
            </h2>
            <p className="mt-2">
              Users who opt into SMS by submitting their phone number may
              receive invitation, RSVP, and event-related text messages.
              Message frequency varies. Message and data rates may apply.
              Reply <strong>STOP</strong> at any time to opt out of future
              messages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              No resale of guest data
            </h2>
            <p className="mt-2">
              Guest names and phone numbers collected through a
              HostBabyShower event are used only for that event&apos;s
              invitation delivery and RSVP management, as described in our{" "}
              <Link href="/privacy" className="font-semibold text-pink-600 hover:underline">
                Privacy Policy
              </Link>
              . They are never sold or shared for third-party marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              Service availability
            </h2>
            <p className="mt-2">
              HostBabyShower is provided on an as-is basis. While we aim for
              events to remain reliably available for hosts and their
              guests, Avery Web Services does not guarantee uninterrupted
              service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
