import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — HostBabyShower",
  description: "How HostBabyShower collects and uses information for baby shower events.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-6 text-brown-700">
          <p>
            HostBabyShower is a platform, built and operated by Avery Web
            Services, that lets hosts create private baby shower invitation
            and RSVP websites for their own events. This policy describes
            how information is collected and used across HostBabyShower
            event sites generally, rather than any single couple or baby
            shower.
          </p>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              What we collect
            </h2>
            <p className="mt-2">
              When a guest submits an RSVP on a HostBabyShower event page,
              we collect the guest&apos;s full name, mobile phone number,
              RSVP response, and any optional message they choose to enter.
              We also record the date and time of submission and the
              delivery status of the invitation text message.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              How it&apos;s used
            </h2>
            <p className="mt-2">
              HostBabyShower collects RSVP names and mobile phone numbers on
              behalf of the event&apos;s hosts, solely for invitation
              delivery and event-management purposes — such as sending the
              digital invitation by text message and letting hosts view,
              search, and export their own guest list. Names and phone
              numbers are collected only for RSVP and invitation purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              SMS text messaging &amp; consent
            </h2>
            <p className="mt-2">
              By submitting your phone number on an RSVP form, you consent
              to receive SMS text messages related to that event (such as
              your digital invitation). Mobile numbers and SMS consent are
              not sold or shared with third parties for marketing purposes.
              Message frequency varies. Message and data rates may apply.
              Reply <strong>STOP</strong> at any time to opt out of future
              messages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              What we don&apos;t do
            </h2>
            <p className="mt-2">
              We do not sell guest phone numbers or names, and we do not
              share them with third parties for marketing purposes. Guest
              data submitted to one event is only ever visible to that
              event&apos;s hosts through a password-protected (4-digit host
              code) dashboard, and is never shown to guests of a different
              event.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">
              Data retention &amp; access
            </h2>
            <p className="mt-2">
              RSVP data is retained for as long as reasonably needed to
              support the event and its hosts. Event hosts can contact
              Avery Web Services to request correction or deletion of
              guest information collected for their event.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brown-700">Questions</h2>
            <p className="mt-2">
              Questions about this policy or a specific event&apos;s data
              can be directed to that event&apos;s hosts, or to Avery Web
              Services.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
