import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { eventType } from "@/lib/catalog";
import { q } from "@/lib/db";
import { longDate } from "@/lib/format";
import { isPremium } from "@/lib/plans";

type Card = { id: string; title: string; type: string; event_date: string; plan: string; invites: number; yes: number; people: number };

export default async function Panel() {
  const user = await requireUser();
  const events = await q<Card>(
    `select e.id, e.title, e.type, e.event_date, e.plan,
            count(g.id)::int as invites,
            count(g.id) filter (where g.status = 'yes')::int as yes,
            coalesce(sum(g.people_count) filter (where g.status = 'yes'), 0)::int as people
     from events e left join guests g on g.event_id = e.id
     where e.user_id = $1 group by e.id order by e.event_date desc, e.created_at desc`,
    [user.id],
  );

  return (
    <>
      <div className="dash-head">
        <div>
          <p className="muted">Olá, {user.name.split(" ")[0]}</p>
          <h1 className="page-title">Meus convites</h1>
        </div>
        {events.length ? (
          <Link href="/painel/novo" className="btn btn-primary">
            Novo convite
          </Link>
        ) : null}
      </div>

      {events.length ? (
        <div className="event-list">
          {events.map((event) => (
            <Link key={event.id} href={`/painel/${event.id}`} className="event-card">
              <span className="tag">{eventType(event.type).label}</span> {isPremium(event.plan) ? <span className="tag tag-premium">Premium</span> : null}
              <h2>{event.title}</h2>
              <p className="meta">{longDate(event.event_date)}</p>
              <div className="nums">
                <span>
                  <strong>{event.invites}</strong>convites
                </span>
                <span>
                  <strong>{event.yes}</strong>confirmaram
                </span>
                <span>
                  <strong>{event.people}</strong>pessoas
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Você ainda não criou nenhum convite</h2>
          <p>Leva poucos minutos: escolha o tipo de festa, preencha os dados e pronto.</p>
          <Link href="/painel/novo" className="btn btn-primary btn-lg">
            Criar meu primeiro convite
          </Link>
        </div>
      )}
    </>
  );
}
