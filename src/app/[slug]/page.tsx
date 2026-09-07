import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImportantInfo from "@/components/ImportantInfo";
import HostsContact from "@/components/HostsContact";
import Footer from "@/components/Footer";
import { getEventBySlug } from "@/lib/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  const title = `${event.eventName} — Baby Shower Invitation & RSVP`;
  const description = `You're invited! Join us for ${event.eventName}. ${event.date}, ${event.startTime}–${event.endTime}. RSVP to receive your private invitation.`;

  return {
    title,
    description,
    alternates: { canonical: `/${event.slug}` },
    openGraph: { title, description, url: `/${event.slug}`, type: "website" },
  };
}

export default async function EventHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <Navbar event={event} />
      <main className="flex-1">
        <Hero event={event} />
        <ImportantInfo event={event} />
        <HostsContact event={event} />
      </main>
      <Footer event={event} />
    </>
  );
}
