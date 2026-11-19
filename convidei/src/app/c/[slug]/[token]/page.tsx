import { notFound } from "next/navigation";
import { Invite } from "@/components/Invite";
import { OpenBeacon } from "@/components/OpenBeacon";
import { eventBySlug, guestByToken } from "@/lib/events";

export default async function PersonalInvite({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  const event = await eventBySlug(slug);
  if (!event) notFound();
  const guest = await guestByToken(event.id, token);
  if (!guest) notFound();
  return (
    <>
      <OpenBeacon slug={event.slug} token={guest.token} />
      <Invite event={event} guest={guest} />
    </>
  );
}
