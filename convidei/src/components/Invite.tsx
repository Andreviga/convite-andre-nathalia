import QRCode from "qrcode";
import { BRAND } from "@/lib/brand";
import { rsvpClosed, type EventRow, type GuestRow } from "@/lib/events";
import { calendarMessage, capitalize, eventCalendarTitle, dateBits, googleCalendarUrl, mapsUrl, prettyTime, shortDate, todayBR, uberUrl, wazeUrl } from "@/lib/format";
import type { CSSProperties } from "react";
import { NBSP, splitTitle, titleShape } from "@/lib/names";
import { pixPayload } from "@/lib/pix";
import { isPremium } from "@/lib/plans";
import { OPEN_MAX_PEOPLE } from "@/lib/remember";
import { answerText } from "@/lib/rsvp-text";
import { baseUrl } from "@/lib/url";
import { paletteOf, paletteStyle, templateDef } from "@/templates";
import { CopyButton } from "./CopyButton";
import { Envelope } from "./Envelope";
import { envelopeKey, sealNeedsEdge } from "@/lib/envelope";
import { InviteCover, TitleText } from "./InviteCover";
import { RsvpForm } from "./RsvpForm";
import { StickyRsvp } from "./StickyRsvp";

type Props = {
  event: EventRow;
  guest?: GuestRow | null;
  /** Demonstração: mostra tudo, mas ninguém confirma presença de verdade. */
  preview?: boolean;
  envelope?: boolean;
  /** A pessoa acabou de responder e foi trazida de volta: o foco vai para a confirmação. */
  justAnswered?: boolean;
  /** Abre a confirmação já no modo "mudar minha resposta". */
  changing?: boolean;
};

export async function Invite({ event, guest, preview = false, envelope = true, justAnswered = false, changing = false }: Props) {
  const def = templateDef(event.template);
  const palette = paletteOf(def, event.palette);
  const signNames = splitTitle(event.title);
  const { initials } = signNames;
  const signShape = titleShape(event.title);
  const bits = dateBits(event.event_date);
  const time = prettyTime(event.event_time);
  const today = todayBR();
  const closed = rsvpClosed(event, today);
  const place = [event.venue_name, event.address].filter(Boolean).join(", ");
  const inviteUrl = preview ? undefined : `${await baseUrl()}/c/${event.slug}`;
  const calendar = { title: eventCalendarTitle(event.type, event.title), date: event.event_date, time: event.event_time, location: place, details: calendarMessage(event.title, event.message), url: inviteUrl };
  const calendarUrl = googleCalendarUrl(calendar);
  const pix = event.pix_key ? pixPayload(event.pix_key, event.pix_holder, event.pix_city) : null;
  const qr = pix ? await QRCode.toString(pix, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } }) : null;
  const hasGifts = Boolean(pix || event.gift_links.length || event.gift_message);
  const canRsvp = Boolean(guest) || event.open_rsvp;
  const viaOpenLink = guest?.source === "open";
  const answered = guest && guest.status !== "pending" ? answerText(guest.status, guest.people_count, guest.max_people, viaOpenLink) : null;
  const Art = def.Art;

  return (
    <div className="inv" data-template={def.id} data-envelope={envelope} style={paletteStyle(palette)}>
      <div className="inv-art inv-art-backdrop" aria-hidden="true"><Art slot="backdrop" initials={initials} /></div>
      {envelope ? (
        <Envelope storageKey={event.id === "exemplo" ? envelopeKey("demo", def.id) : envelopeKey("event", event.slug)} sealEdge={sealNeedsEdge(palette.vars.seal, palette.vars.sealInk)} guestName={guest?.name} initials={initials} liner={<Art slot="liner" initials={initials} />} />
      ) : null}

      {def.premium && !isPremium(event.plan) && !preview ? <p className="inv-ribbon">Prévia de modelo Premium · {BRAND}</p> : null}

      <main className="inv-sheet">
        <InviteCover data={event} guestName={guest?.name} today={today} />

        <section className="inv-section" id="detalhes" aria-label="Data e local">
          <p className="inv-kicker">Quando</p>
          <p className="inv-big">
            {capitalize(bits.weekday)}, {Number(bits.day)}{NBSP}de{NBSP}{bits.month} de{NBSP}{bits.year}
          </p>
          {time ? <p className="inv-text">às {time}</p> : null}

          {place ? (
            <>
              <hr className="inv-rule" />
              <p className="inv-kicker">Onde</p>
              {event.venue_name ? <p className="inv-big">{event.venue_name}</p> : null}
              {event.address ? <p className="inv-text">{event.address}</p> : null}
              <div className="inv-stack">
                <a className="inv-btn inv-btn-main" href={mapsUrl(event.venue_name, event.address)} target="_blank" rel="noopener noreferrer">
                  Abrir no Google Maps
                </a>
                <div className="inv-grid-2">
                  <a className="inv-btn" href={wazeUrl(place)} target="_blank" rel="noopener noreferrer">
                    Waze
                  </a>
                  <a className="inv-btn" href={uberUrl(event.venue_name, event.address)} target="_blank" rel="noopener noreferrer">
                    Uber
                  </a>
                </div>
                {event.address ? <CopyButton className="inv-btn inv-btn-quiet" value={event.address} label="Copiar endereço" done="Endereço copiado!" /> : null}
              </div>
            </>
          ) : null}

          {event.dress_code ? (
            <>
              <hr className="inv-rule" />
              <p className="inv-kicker">Traje</p>
              <p className="inv-big">{event.dress_code}</p>
            </>
          ) : null}

          <hr className="inv-rule" />
          <p className="inv-kicker">Para não esquecer</p>
          <div className="inv-grid-2 inv-calendar">
            <a className="inv-btn inv-btn-quiet" href={calendarUrl} target="_blank" rel="noopener noreferrer">
              Google Agenda
            </a>
            <a className="inv-btn inv-btn-quiet" href={preview ? calendarUrl : `/c/${event.slug}/agenda`} target={preview ? "_blank" : undefined} rel="noopener noreferrer">
              Outras agendas
            </a>
          </div>
          <p className="inv-hint inv-calendar-hint">No iPhone ou no Outlook, toque em “Outras agendas”.</p>
        </section>

        {canRsvp ? (
          <section className="inv-section" id="confirmar" aria-labelledby="rsvp-title">
            <p className="inv-kicker">{answered ? "Confirmação" : "Sua resposta"}</p>
            <h2 id="rsvp-title" className="inv-section-title">
              {answered ? "Sua resposta" : "Você vem?"}
            </h2>
            {guest && guest.max_people > 1 && !viaOpenLink && !(closed && answered) ? <p className="inv-hint">Este convite é para até {guest.max_people} pessoas.</p> : null}
            {event.rsvp_deadline && !closed ? <p className="inv-hint">{answered ? "Você pode mudar a resposta até" : "Responda até"} {shortDate(event.rsvp_deadline)}.</p> : null}
            {preview ? (
              <div className="rsvp">
                <div className="rsvp-buttons" aria-hidden="true">
                  <span className="inv-btn inv-btn-main rsvp-yes">Vou comparecer</span>
                  <span className="inv-btn rsvp-no">Não poderei ir</span>
                </div>
                <p className="inv-hint" style={{ textAlign: "center", marginTop: 12 }}>
                  Demonstração: no convite de verdade, um toque aqui já confirma a presença.
                </p>
              </div>
            ) : closed && guest && answered ? (
              /* Prazo encerrado: quem respondeu continua vendo a própria resposta (e o atalho da agenda). */
              <div className="rsvp">
                <div className="rsvp-state" data-status={guest.status}>
                  <p className="rsvp-state-title">{answered.title}</p>
                  <p>{answered.line}</p>
                </div>
                {guest.status === "yes" ? (
                  <a className="inv-btn inv-btn-quiet rsvp-calendar" href={calendarUrl} target="_blank" rel="noopener noreferrer">
                    Salvar na agenda
                  </a>
                ) : null}
                <p className="inv-hint rsvp-closed">O prazo para mudar a resposta terminou. Se precisar, fale com quem convidou você.</p>
              </div>
            ) : closed ? (
              <p className="inv-hint rsvp-closed">O prazo para confirmar terminou. Se precisar, fale com quem convidou você.</p>
            ) : (
              <>
                <RsvpForm
                  slug={event.slug}
                  token={guest?.token}
                  maxPeople={guest?.max_people ?? OPEN_MAX_PEOPLE}
                  initialStatus={guest?.status ?? "pending"}
                  initialPeople={guest?.people_count ?? 0}
                  initialNote={guest?.note ?? ""}
                  calendarUrl={calendarUrl}
                  justAnswered={justAnswered}
                  startEditing={changing}
                  viaOpenLink={viaOpenLink}
                />
                {guest && viaOpenLink && event.open_rsvp ? (
                  <p className="rsvp-links rsvp-other">
                    <a className="inv-link" href={`/c/${event.slug}?novo=1#confirmar`}>
                      Não é {guest.name}? Responder como outra pessoa
                    </a>
                  </p>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {hasGifts ? (
          <section className="inv-section" id="presentes" aria-labelledby="gift-title">
            <p className="inv-kicker">Com carinho</p>
            <h2 id="gift-title" className="inv-section-title">
              Presentes
            </h2>
            {event.gift_message ? <p className="inv-text">{event.gift_message}</p> : null}
            {event.gift_links.length ? (
              <div className="inv-stack">
                {event.gift_links.map((link) => (
                  <a key={link.url} className="inv-btn inv-btn-main" href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
            {pix && qr ? (
              <>
                {event.gift_links.length || event.gift_message ? <hr className="inv-rule" /> : null}
                <div className="inv-pix">
                  <p className="inv-kicker">Presentear com Pix</p>
                  <div className="inv-qr" role="img" aria-label="QR code do Pix" dangerouslySetInnerHTML={{ __html: qr }} />
                  <p className="inv-text">
                    Em nome de <strong>{event.pix_holder}</strong>
                  </p>
                  <p className="inv-hint">Confira esse nome no app do banco antes de confirmar. O valor é você quem escolhe.</p>
                  <CopyButton className="inv-btn inv-btn-main" value={pix} label="Copiar código Pix" done="Código copiado!" />
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {event.extra_info ? (
          <section className="inv-section" aria-labelledby="info-title">
            <p className="inv-kicker">Bom saber</p>
            <h2 id="info-title" className="sr-only">
              Outras informações
            </h2>
            <p className="inv-text">{event.extra_info}</p>
          </section>
        ) : null}

        {/* Fecho: o convite termina assinado, como papelaria, e não num botão. */}
        <footer className="inv-end">
          <div className="inv-section inv-sign">
            <div className="inv-art inv-sign-art" aria-hidden="true"><Art slot="divider" initials={initials} eventType={event.type} /></div>
            <p className="inv-kicker">Esperamos você</p>
            {/* Mesmo cuidado da capa: algarismos em .inv-num, "&" fora da fonte dos nomes e nunca fechando a linha. */}
            <p className="inv-sign-names" style={{ "--longest": signShape.longest } as CSSProperties}>
              {signNames.names.length === 2 ? (
                <>
                  <TitleText text={signNames.names[0]} /> <span className="inv-sign-amp">{signNames.connector ?? "&"}</span>
                  {NBSP}
                  <TitleText text={signNames.names[1]} />
                </>
              ) : (
                <TitleText text={event.title} />
              )}
            </p>
            <p className="inv-sign-date">
              {Number(bits.day)} de {bits.month} de {bits.year}
            </p>
          </div>
          {!isPremium(event.plan) || preview ? (
            <p className="inv-footer">
              <a href="/?ref=convite">
                Convite feito com <strong>{BRAND}</strong>
              </a>
            </p>
          ) : null}
        </footer>
      </main>

      {canRsvp && !closed && !preview ? <StickyRsvp pending={(guest?.status ?? "pending") === "pending"} /> : null}
    </div>
  );
}
