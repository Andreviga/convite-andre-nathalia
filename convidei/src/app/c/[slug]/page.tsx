import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Invite } from "@/components/Invite";
import { eventBySlug, guestByToken } from "@/lib/events";
import { rememberedTokens, rsvpCookie } from "@/lib/remember";

export default async function PublicInvite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ previa?: string; novo?: string }> }) {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  if (!event) notFound();
  const search = await searchParams;
  // Quem já respondeu pelo link geral neste aparelho volta para o próprio convite (com a resposta), em vez de um formulário em branco.
  if (search.previa !== "1" && search.novo !== "1") {
    // O cookie lembra todos os que responderam neste aparelho; o primeiro da lista é quem respondeu por último.
    // "?geral=1" dispensa o envelope: a pessoa acabou de abri-lo (ou já respondeu) e vai direto ao convite com a resposta.
    for (const token of rememberedTokens((await cookies()).get(rsvpCookie(event.slug))?.value)) {
      const guest = await guestByToken(event.id, token);
      if (guest && guest.source === "open") redirect(`/c/${event.slug}/${guest.token}?geral=1`);
    }
  }
  return <Invite event={event} preview={search.previa === "1"} envelope={search.novo !== "1"} />;
}
