import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEvent } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EventForm } from "@/components/EventForm";
import { requireUser } from "@/lib/auth";
import { eventForUser } from "@/lib/events";
import { isPremium } from "@/lib/plans";

export const metadata: Metadata = { title: "Editar convite" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const event = await eventForUser((await params).id, user.id);
  if (!event) notFound();

  const initial: Record<string, string> = {
    type: event.type,
    template: event.template,
    title: event.title,
    headline: event.headline,
    message: event.message,
    event_date: event.event_date,
    event_time: event.event_time,
    venue_name: event.venue_name,
    address: event.address,
    dress_code: event.dress_code,
    rsvp_deadline: event.rsvp_deadline,
    extra_info: event.extra_info,
    gift_message: event.gift_message,
    pix_key_type: event.pix_key_type,
    pix_key: event.pix_key.replace(/^\+55/, ""),
    pix_holder: event.pix_holder,
    pix_city: event.pix_city,
    open_rsvp: event.open_rsvp ? "on" : "off",
  };
  event.gift_links.forEach((link, i) => {
    initial[`gift_label_${i}`] = link.label;
    initial[`gift_url_${i}`] = link.url;
  });

  return (
    <div className="narrow">
      <Link href={`/painel/${event.id}`} className="crumb">
        ← {event.title}
      </Link>
      <div className="dash-head">
        <h1 className="page-title">Editar convite</h1>
      </div>
      <EventForm initial={initial} eventId={event.id} premium={isPremium(event.plan)} />

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Excluir este convite</h2>
        <p className="panel-lead">Apaga o convite, a lista de convidados e todas as respostas. Os links param de funcionar. Não dá para desfazer.</p>
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmButton className="btn btn-danger" message={`Excluir "${event.title}" e todas as respostas? Não dá para desfazer.`}>
            Excluir convite
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
