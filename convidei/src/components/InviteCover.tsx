import { dateBits, daysUntil, isDate, prettyTime } from "@/lib/format";
import { splitTitle } from "@/lib/names";
import { templateDef } from "@/templates";
import { Monogram } from "./Monogram";

export type CoverData = {
  template: string;
  title: string;
  headline: string;
  message: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  address: string;
};

function countdown(days: number): string | null {
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return "É amanhã";
  if (days === 0) return "É hoje";
  return null;
}

/**
 * A capa do convite (o "cartão"). Componente puro: serve no servidor, na prévia ao vivo do editor e nas miniaturas.
 * A estrutura é a mesma para todos os modelos; cada um muda fontes, cores e ornamentos pelo CSS e pelo Art.
 */
export function InviteCover({ data, guestName, today, more = true }: { data: CoverData; guestName?: string; today: string; more?: boolean }) {
  const def = templateDef(data.template);
  const title = data.title.trim() || "Seu nome aqui";
  const { names, connector, initials } = splitTitle(title);
  const hasDate = isDate(data.event_date);
  const bits = hasDate ? dateBits(data.event_date) : null;
  const time = prettyTime(data.event_time);
  const left = hasDate ? countdown(daysUntil(data.event_date, today)) : null;
  const place = data.venue_name || data.address;
  const Art = def.Art;

  return (
    <header className="inv-cover">
      <div className="inv-paper">
        <div className="inv-art inv-art-top"><Art slot="top" initials={initials} /></div>
        <div className="inv-monogram"><Monogram initials={initials} /></div>
        {guestName ? (
          <p className="inv-hello">
            Olá, <strong>{guestName}</strong>
          </p>
        ) : null}
        {data.headline ? <p className="inv-headline">{data.headline}</p> : null}
        <h1 className="inv-names" data-count={names.length} data-long={title.length > 16}>
          {names.length === 2 ? (
            <>
              <span className="inv-name">{names[0]}</span>
              <span className="inv-amp">{connector}</span>
              <span className="inv-name">{names[1]}</span>
            </>
          ) : (
            <span className="inv-name">{title}</span>
          )}
        </h1>
        {data.message ? <p className="inv-message">{data.message}</p> : null}
        <div className="inv-art inv-art-divider"><Art slot="divider" initials={initials} /></div>
        {bits ? (
          <>
            <div className="inv-date" aria-hidden="true">
              <span className="inv-date-side">{bits.weekday.replace("-feira", "")}</span>
              <span className="inv-date-main">
                <span className="inv-date-day">{bits.day}</span>
                <span className="inv-date-month">
                  {bits.month} · {bits.year}
                </span>
              </span>
              <span className="inv-date-side">{time ? `às ${time}` : " "}</span>
            </div>
            <p className="inv-dateline">
              <span className="sr-only">Data: </span>
              {bits.weekday}, {Number(bits.day)} de {bits.month} de {bits.year}
              {time ? `, às ${time}` : ""}
            </p>
          </>
        ) : null}
        {place ? <p className="inv-place">{place}</p> : null}
        {left ? <p className="inv-countdown">{left}</p> : null}
        <div className="inv-art inv-art-bottom"><Art slot="bottom" initials={initials} /></div>
      </div>
      {more ? (
        <a className="inv-more" href="#detalhes">
          Detalhes
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M2 5l5 5 5-5" />
          </svg>
        </a>
      ) : null}
    </header>
  );
}
