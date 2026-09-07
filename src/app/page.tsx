import Link from "next/link";
import FloatingDecorations from "@/components/decorative/FloatingDecorations";
import TeddyBear from "@/components/decorative/TeddyBear";

export default function PlatformHomePage() {
  return (
    <>
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-blush-100 via-cream-50 to-cream-50 px-4 py-16 sm:px-6 sm:py-24">
        <FloatingDecorations />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <TeddyBear className="h-28 w-28 animate-float-slow drop-shadow-sm sm:h-36 sm:w-36" />

          <h1 className="font-script mt-4 animate-fade-in-up text-5xl leading-tight text-pink-600 sm:text-7xl">
            HostBabyShower
          </h1>

          <p className="mt-4 animate-fade-in-up text-xl font-semibold text-brown-600 sm:text-2xl">
            Your shower. Your guests. One beautiful place.
          </p>

          <p className="mt-6 max-w-xl animate-fade-in-up text-balance text-lg text-brown-500">
            HostBabyShower is a platform for beautiful, private baby shower
            invitation and RSVP websites — built and hosted by Avery Web
            Services. Each event gets its own private page, RSVP list, and
            host dashboard.
          </p>

          <p className="mt-6 animate-fade-in-up text-brown-500">
            Hosting an event with us? Guests should use the private link
            your hosts shared with you.
          </p>
        </div>
      </main>

      <footer className="relative bg-brown-700 px-4 py-8 text-center text-cream-100 sm:px-6">
        <nav aria-label="Platform" className="flex justify-center gap-6 text-sm font-semibold">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </nav>
        <p className="mt-4 text-xs font-medium tracking-wide text-cream-100/60">
          Created by Avery Web Services · Powered by HostBabyShower
        </p>
      </footer>
    </>
  );
}
