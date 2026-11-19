import { notFound } from "next/navigation";
import { Invite } from "@/components/Invite";
import { eventBySlug } from "@/lib/events";

export default async function PublicInvite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ previa?: string }> }) {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  if (!event) notFound();
  return <Invite event={event} preview={(await searchParams).previa === "1"} />;
}
