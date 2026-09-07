import { notFound } from "next/navigation";
import HostDashboard from "@/components/HostDashboard";
import { getEventBySlug } from "@/lib/events";

export const metadata = {
  title: "Host Dashboard",
};

export default async function HostDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return <HostDashboard slug={slug} eventName={event.eventName} />;
}
