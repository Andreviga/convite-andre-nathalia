import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Invite } from "@/components/Invite";
import { eventBySlug, guestByToken } from "@/lib/events";
import { rsvpCookie } from "@/lib/remember";

export default async function PublicInvite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ previa?: string; novo?: string }> }) {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  if (!event) notFound();
  const search = await searchParams;
  // Quem já respondeu pelo link geral neste aparelho volta para o próprio convite (com a resposta), em vez de um formulário em branco.
  if (search.previa !== "1" && search.novo !== "1") {
    const remembered = (await cookies()).get(rsvpCookie(event.slug))?.value;
    const guest = remembered ? await guestByToken(event.id, remembered.slice(0, 16)) : null;
    if (guest) redirect(`/c/${event.slug}/${guest.token}`);
  }
  return <Invite event={event} preview={search.previa === "1"} envelope={search.novo !== "1"} />;
}
