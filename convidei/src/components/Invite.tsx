import QRCode from "qrcode";
import { BRAND } from "@/lib/brand";
import { rsvpClosed, type EventRow, type GuestRow } from "@/lib/events";
import { dateBits, daysUntil, googleCalendarUrl, mapsUrl, prettyTime, shortDate, todayBR } from "@/lib/format";
import { pixPayload } from "@/lib/pix";
import { isPremium } from "@/lib/plans";
import { CopyButton } from "./CopyButton";
import { Ornament } from "./Ornament";
import { RsvpForm } from "./RsvpForm";

function countdown(days: number): string | null {
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return "É amanhã";
  if (days === 0) return "É hoje";
  return null;
}

export async function Invite({ event, guest, preview = false }: { event: EventRow; guest?: GuestRow | null; preview?: boolean }) {
  const bits = dateBits(event.event_date);
  const time = prettyTime(event.event_time);
  const today = todayBR();
  const left = countdown(daysUntil(event.event_date, today));
  const closed = rsvpClosed(event, today);
  const place = [event.venue_name, event.address].filter(Boolean).join(", ");
  const hasPlace = Boolean(place);
  const calendar = { title: event.title, date: event.event_date, time: event.event_time, location: place, details: event.message };
  const pix = event.pix_key ? pixPayload(event.pix_key, event.pix_holder, event.pix_city) : null;
  const qr = pix ? await QRCode.toString(pix, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } }) : null;
  const hasGifts = Boolean(pix || event.gift_links.length || event.gift_message);
  const canRsvp = Boolean(guest) || event.open_rsvp;

  return (
    <div className="inv" data-template={event.template}>
      <main className="inv-sheet">
        <header className="inv-hero">
          <Ornament template={event.template} position="top" />
          {guest ? <p className="inv-hello">Olá, {guest.name}</p> : null}
          {event.headline ? <p className="inv-headline">{event.headline}</p> : null}
          <h1 className="inv-title">{event.title}</h1>
          {event.message ? <p className="inv-message">{event.message}</p> : null}

          <div className="inv-date" aria-label={`${bits.weekday}, ${bits.day} de ${bits.month} de ${bits.year}${time ? `, às ${time}` : ""}`}>
            <span className="inv-date-side">{bits.weekday}</span>
            <span className="inv-date-main">
              <span className="inv-date-day">{bits.day}</span>
              <span className="inv-date-month">
                {bits.month} · {bits.year}
              </span>
            </span>
            <span className="inv-date-side">{time ? `às ${time}` : " "}</span>
          </div>
          {left ? <p className="inv-countdown">{left}</p> : null}
          <Ornament template={event.template} position="bottom" />
        </header>

        {hasPlace || event.dress_code ? (
          <section className="inv-card" aria-label="Local e informações">
            {hasPlace ? (
              <div className="inv-row">
                <h2>Local</h2>
                {event.venue_name ? <p className="inv-strong">{event.venue_name}</p> : null}
                {event.address ? <p>{event.address}</p> : null}
              </div>
            ) : null}
            {event.dress_code ? (
              <div className="inv-row">
                <h2>Traje</h2>
                <p>{event.dress_code}</p>
              </div>
            ) : null}
            <div className="inv-actions">
              {hasPlace ? (
                <a className="inv-btn" href={mapsUrl(event.venue_name, event.address)} target="_blank" rel="noopener noreferrer">
                  Como chegar
                </a>
              ) : null}
              {event.address ? <CopyButton className="inv-btn" value={event.address} label="Copiar endereço" /> : null}
              <a className="inv-btn" href={googleCalendarUrl(calendar)} target="_blank" rel="noopener noreferrer">
                Google Agenda
              </a>
              <a className="inv-btn" href={`/c/${event.slug}/agenda`}>
                Agenda do iPhone
              </a>
            </div>
          </section>
        ) : (
          <div className="inv-actions inv-actions-solo">
            <a className="inv-btn" href={googleCalendarUrl(calendar)} target="_blank" rel="noopener noreferrer">
              Google Agenda
            </a>
            <a className="inv-btn" href={`/c/${event.slug}/agenda`}>
              Agenda do iPhone
            </a>
          </div>
        )}

        {canRsvp ? (
          <section className="inv-card" id="confirmar" aria-labelledby="rsvp-title">
            <h2 id="rsvp-title" className="inv-section-title">
              Confirme sua presença
            </h2>
            {guest && guest.max_people > 1 ? <p className="inv-hint">Este convite vale para até {guest.max_people} pessoas.</p> : null}
            {event.rsvp_deadline && !closed ? <p className="inv-hint">Responda até {shortDate(event.rsvp_deadline)}.</p> : null}
            {preview ? (
              <p className="inv-hint">Aqui o convidado responde se vai, quantas pessoas e deixa um recado.</p>
            ) : closed ? (
              <p className="inv-hint">O prazo para confirmar terminou. Se precisar, fale com quem convidou você.</p>
            ) : (
              <RsvpForm
                slug={event.slug}
                token={guest?.token}
                maxPeople={guest ? guest.max_people : 6}
                initialStatus={guest?.status ?? "pending"}
                initialPeople={guest?.people_count ?? 1}
                initialNote={guest?.note ?? ""}
              />
            )}
          </section>
        ) : null}

        {hasGifts ? (
          <section className="inv-card" id="presentes" aria-labelledby="gift-title">
            <h2 id="gift-title" className="inv-section-title">
              Presentes
            </h2>
            {event.gift_message ? <p className="inv-text">{event.gift_message}</p> : null}
            {event.gift_links.length ? (
              <div className="inv-gifts">
                {event.gift_links.map((link) => (
                  <a key={link.url} className="inv-btn inv-btn-main" href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
            {pix && qr ? (
              <div className="inv-pix">
                <p className="inv-pix-title">Presentear com Pix</p>
                <div className="inv-qr" role="img" aria-label="QR code do Pix" dangerouslySetInnerHTML={{ __html: qr }} />
                <p className="inv-pix-holder">
                  Em nome de <strong>{event.pix_holder}</strong>
                </p>
                <p className="inv-hint">Confira o nome no app do banco antes de confirmar. O valor é você quem escolhe.</p>
                <CopyButton className="inv-btn inv-btn-main" value={pix} label="Copiar Pix copia e cola" done="Código copiado!" />
              </div>
            ) : null}
          </section>
        ) : null}

        {event.extra_info ? (
          <section className="inv-card" aria-labelledby="info-title">
            <h2 id="info-title" className="inv-section-title">
              Bom saber
            </h2>
            <p className="inv-text">{event.extra_info}</p>
          </section>
        ) : null}

        {!isPremium(event.plan) ? (
          <footer className="inv-footer">
            <a href="/?ref=convite">
              Convite feito com <strong>{BRAND}</strong> · crie o seu grátis
            </a>
          </footer>
        ) : null}
      </main>
    </div>
  );
}
