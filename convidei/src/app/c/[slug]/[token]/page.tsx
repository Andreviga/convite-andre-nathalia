import { notFound } from "next/navigation";
import { Invite } from "@/components/Invite";
import { OpenBeacon } from "@/components/OpenBeacon";
import { eventBySlug, guestByToken, rsvpClosed } from "@/lib/events";
import { todayBR } from "@/lib/format";

type Props = { params: Promise<{ slug: string; token: string }>; searchParams: Promise<{ confirmado?: string; mudar?: string; geral?: string }> };

export default async function PersonalInvite({ params, searchParams }: Props) {
  const { slug, token } = await params;
  const event = await eventBySlug(slug);
  if (!event) notFound();
  const guest = await guestByToken(event.id, token);
  if (!guest) return <UnknownGuest slug={event.slug} title={event.title} open={event.open_rsvp && !rsvpClosed(event, todayBR())} />;
  const search = await searchParams;
  // Acabou de responder (link geral ou formulário sem JavaScript): nada de envelope fechado de novo, direto na confirmação.
  const justAnswered = search.confirmado === "yes" || search.confirmado === "no";
  const changing = search.mudar === "1";
  // Veio do link geral, reconhecido pelo aparelho: o envelope já foi aberto lá, não fecha de novo com outro nome na frente.
  const fromOpenLink = search.geral === "1" && guest.source === "open";
  return (
    <>
      <OpenBeacon slug={event.slug} token={guest.token} />
      <Invite event={event} guest={guest} envelope={!justAnswered && !changing && !fromOpenLink} justAnswered={justAnswered} changing={changing} />
    </>
  );
}

/** O evento existe, mas o código pessoal não (link cortado ou digitado errado): leva ao convite em vez de um beco sem saída. */
function UnknownGuest({ slug, title, open }: { slug: string; title: string; open: boolean }) {
  return (
    <main className="auth">
      <div className="auth-box" style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center", fontSize: 17, lineHeight: 1.5 }}>
        <h1>Não reconhecemos o seu link pessoal</h1>
        <p className="muted">
          Parece que o link chegou incompleto. Mesmo assim você pode ver o convite de <strong>{title}</strong>.
        </p>
        {/* link comum (não <Link>): recarrega a página inteira, com a folha de estilo do convite */}
        <a href={`/c/${slug}`} className="btn btn-primary" style={{ minHeight: 56, width: "100%", fontSize: 18 }}>
          Ver o convite
        </a>
        <p className="muted">
          {open
            ? "Lá você também consegue confirmar presença dizendo o seu nome."
            : "Para confirmar ou ver a sua resposta, peça a quem convidou você que envie o link de novo e toque nele direto na mensagem."}
        </p>
      </div>
    </main>
  );
}
