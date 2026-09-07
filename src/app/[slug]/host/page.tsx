import { notFound } from "next/navigation";
import HostLoginForm from "@/components/HostLoginForm";
import { getEventBySlug } from "@/lib/events";

export const metadata = {
  title: "Host Access",
};

export default async function HostLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getEventBySlug(slug)) notFound();

  return <HostLoginForm slug={slug} />;
}
