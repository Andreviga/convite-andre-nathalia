import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteGuest } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { AddGuestForm, BulkGuestForm, WhatsAppLink } from "@/components/GuestForms";
import { requireUser } from "@/lib/auth";
import { eventType } from "@/lib/catalog";
import { eventForUser, guestsOf, statsOf, type GuestRow } from "@/lib/events";
import { longDate, prettyTime, whatsappNumber } from "@/lib/format";
import { guestLimit, isPremium } from "@/lib/plans";
import { baseUrl } from "@/lib/url";
import { templateDef } from "@/templates";

const STATUS: Record<GuestRow["status"], { label: string; className: string }> = {
  yes: { label: "Confirmou", className: "tag tag-yes" },
  no: { label: "Não vai", className: "tag tag-no" },
  pending: { label: "Sem resposta", className: "tag tag-wait" },
};

export default async function EventPanel({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string; salvo?: string }> }) {
  const user = await requireUser();
  const event = await eventForUser((await params).id, user.id);
  if (!event) notFound();
  const [guests, origin, flags] = await Promise.all([guestsOf(event.id), baseUrl(), searchParams]);
  const stats = statsOf(guests);
  const limit = guestLimit(event.plan);
  const publicUrl = `${origin}/c/${event.slug}`;
  const time = prettyTime(event.event_time);
  const when = `${longDate(event.event_date)}${time ? `, às ${time}` : ""}`;
  const generalText = `${event.title} — ${when}. Veja o convite${event.open_rsvp ? " e confirme sua presença" : ""}: ${publicUrl}`;

  return (
    <>
      <Link href="/painel" className="crumb">
        ← Meus convites
      </Link>
      <div className="dash-head">
        <div>
          <p>
            <span className="tag">{eventType(event.type).label}</span> {isPremium(event.plan) ? <span className="tag tag-premium">Premium</span> : null}
          </p>
          <h1 className="page-title">{event.title}</h1>
          <p className="muted">{when}</p>
        </div>
        <div className="dash-head-actions">
          <a href={`/c/${event.slug}?previa=1`} target="_blank" rel="noopener noreferrer" className="btn">
            Ver convite
          </a>
          <Link href={`/painel/${event.id}/editar`} className="btn">
            Editar
          </Link>
        </div>
      </div>

      {flags.novo ? (
        <p className="alert alert-ok" role="status" style={{ marginBottom: 16 }}>
          Convite criado. Agora adicione os convidados abaixo e envie o link de cada um pelo WhatsApp.
        </p>
      ) : null}
      {flags.salvo ? (
        <p className="alert alert-ok" role="status" style={{ marginBottom: 16 }}>
          Alterações salvas. Os links já mostram a versão nova.
        </p>
      ) : null}

      {templateDef(event.template).premium && !isPremium(event.plan) ? (
        <p className="alert alert-info" style={{ marginBottom: 16 }}>
          Este convite usa o modelo Premium {templateDef(event.template).name}. No plano grátis, os convidados veem uma faixa de “prévia” no topo.{" "}
          <Link href={`/painel/${event.id}/premium`} className="link">
            Fazer o upgrade
          </Link>{" "}
          ou{" "}
          <Link href={`/painel/${event.id}/editar`} className="link">
            escolher um modelo grátis
          </Link>
          .
        </p>
      ) : null}

      <div className="stats">
        <div className="stat stat-main">
          <strong>{stats.people}</strong>
          <span>pessoas confirmadas</span>
        </div>
        <div className="stat">
          <strong>{stats.invites}</strong>
          <span>convites</span>
        </div>
        <div className="stat">
          <strong>{stats.sent}</strong>
          <span>enviados</span>
        </div>
        <div className="stat">
          <strong>{stats.opened}</strong>
          <span>abertos</span>
        </div>
        <div className="stat">
          <strong>{stats.no}</strong>
          <span>não vão</span>
        </div>
        <div className="stat">
          <strong>{stats.pending}</strong>
          <span>sem resposta</span>
        </div>
      </div>

      <section className="panel">
        <h2>Link geral do convite</h2>
        <p className="panel-lead">
          {event.open_rsvp
            ? "Bom para postar em grupos: quem abrir digita o nome e confirma. Para saber quem abriu, use o link individual de cada convidado, na lista abaixo."
            : "Mostra o convite, mas só confirma presença quem abrir pelo link individual da lista abaixo."}
        </p>
        <div className="share">
          <div className="share-url">{publicUrl}</div>
          <div className="share-actions">
            <CopyButton className="btn btn-sm" value={publicUrl} label="Copiar link" done="Link copiado!" />
            <a className="btn btn-sm btn-wa" href={`https://wa.me/?text=${encodeURIComponent(generalText)}`} target="_blank" rel="noopener noreferrer">
              Compartilhar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Adicionar convidados</h2>
        <p className="panel-lead">Cada convite pode ser para uma pessoa ou para uma família. “Pessoas” é quantos lugares esse convite dá direito.</p>
        <AddGuestForm eventId={event.id} />
        <BulkGuestForm eventId={event.id} />
        {limit !== null ? (
          <div className="quota">
            <div className="quota-bar" role="img" aria-label={`${stats.invites} de ${limit} convites usados`}>
              <i style={{ width: `${Math.min(100, (stats.invites / limit) * 100)}%` }} />
            </div>
            <div className="quota-row">
              <span>
                {stats.invites} de {limit} convites do plano grátis
              </span>
              <Link href={`/painel/${event.id}/premium`} className="link">
                Liberar convites ilimitados
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="list-head">
          <h2>Convidados</h2>
          {guests.length ? (
            <a href={`/painel/${event.id}/exportar`} className="btn btn-sm btn-ghost">
              Baixar planilha
            </a>
          ) : null}
        </div>
        {guests.length ? (
          <ul className="guests">
            {guests.map((guest) => {
              const link = `${publicUrl}/${guest.token}`;
              const number = whatsappNumber(guest.phone);
              const message = `Olá, ${guest.name}! Este é o seu convite para ${event.title}, dia ${when}. Abra para ver os detalhes e confirmar presença: ${link}`;
              return (
                <li key={guest.id} className="guest">
                  <div>
                    <p className="guest-name">{guest.name}</p>
                    <p className="guest-sub">
                      {guest.status === "yes" ? `${guest.people_count} de ${guest.max_people}` : `até ${guest.max_people}`} {guest.max_people === 1 ? "pessoa" : "pessoas"}
                      {guest.source === "open" ? " · confirmou pelo link geral" : ""}
                    </p>
                    {guest.note ? <p className="guest-note">“{guest.note}”</p> : null}
                  </div>
                  <div className="guest-tags">
                    <span className={STATUS[guest.status].className}>{STATUS[guest.status].label}</span>
                    {guest.opened_at ? <span className="tag">Abriu</span> : guest.sent_at ? <span className="tag">Enviado, não abriu</span> : <span className="tag">Não enviado</span>}
                  </div>
                  <div className="guest-actions">
                    <WhatsAppLink eventId={event.id} guestId={guest.id} sent={Boolean(guest.sent_at)} href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} />
                    <CopyButton className="btn btn-sm" value={link} label="Copiar link" done="Copiado!" />
                    <form action={deleteGuest}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <input type="hidden" name="guest_id" value={guest.id} />
                      <ConfirmButton className="btn btn-sm btn-danger" message={`Remover ${guest.name} da lista? O link dessa pessoa para de funcionar.`}>
                        Remover
                      </ConfirmButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">Ninguém na lista ainda. Adicione o primeiro convidado acima.</p>
        )}
      </section>
    </>
  );
}
