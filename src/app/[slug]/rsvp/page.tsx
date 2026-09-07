import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import FloatingDecorations from "@/components/decorative/FloatingDecorations";
import RsvpFlow from "@/components/RsvpFlow";
import { getEventBySlug } from "@/lib/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return {
    title: `RSVP — ${event.eventName}`,
    description: `RSVP for ${event.eventName} and receive your private digital invitation by text.`,
  };
}

export default async function EventRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-blush-100 via-cream-50 to-cream-50 px-4 py-10 sm:px-6 sm:py-16">
      <FloatingDecorations variant="soft" />

      <div className="relative mx-auto max-w-xl">
        <Link
          href={`/${event.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brown-500 hover:text-pink-600"
        >
          ← Back Home
        </Link>
      </div>

      <div className="relative mt-6">
        <RsvpFlow event={event} />
      </div>
    </main>
  );
}
