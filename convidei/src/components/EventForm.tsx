"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveEvent, type FormState } from "@/app/actions";
import { EVENT_TYPES, TEMPLATES, eventType } from "@/lib/catalog";
import { PIX_KEY_TYPES } from "@/lib/pix";

type Props = { initial: Record<string, string>; eventId?: string; premium: boolean };

export function EventForm({ initial, eventId, premium }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveEvent, {});
  const v = state.values ?? initial;
  const [type, setType] = useState(v.type || "casamento");
  const [tpl, setTpl] = useState(v.template || eventType(type).template);
  const [headline, setHeadline] = useState(v.headline ?? eventType(type).headline);
  const [message, setMessage] = useState(v.message ?? eventType(type).message);
  const current = eventType(type);

  function changeType(next: string) {
    const from = eventType(type);
    const to = eventType(next);
    // Só troca os textos sugeridos se a pessoa ainda não escreveu os dela.
    if (!headline.trim() || headline === from.headline) setHeadline(to.headline);
    if (!message.trim() || message === from.message) setMessage(to.message);
    if (!eventId && tpl === from.template) setTpl(to.template);
    setType(next);
  }

  return (
    <form action={action}>
      {eventId ? <input type="hidden" name="id" value={eventId} /> : null}

      <section className="panel">
        <h2>Que festa é essa?</h2>
        <p className="panel-lead">O tipo define os textos sugeridos. Você pode mudar tudo depois.</p>
        <div className="choice-grid" role="radiogroup" aria-label="Tipo de evento">
          {EVENT_TYPES.map((t) => (
            <label key={t.id} className="choice">
              <input type="radio" name="type" value={t.id} checked={type === t.id} onChange={() => changeType(t.id)} />
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>O que vai escrito no convite</h2>
        <p className="panel-lead">Esses textos aparecem no topo, na ordem abaixo.</p>
        <div className="stack">
          <label className="field">
            <span>Frase de abertura <small>(opcional)</small></span>
            <input type="text" name="headline" maxLength={120} value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </label>
          <label className="field">
            <span>{current.titleLabel}</span>
            <input type="text" name="title" required minLength={2} maxLength={80} placeholder={current.titlePlaceholder} defaultValue={v.title} />
            <small>É o destaque do convite e também o nome que aparece na prévia do WhatsApp.</small>
          </label>
          <label className="field">
            <span>Mensagem <small>(opcional)</small></span>
            <textarea name="message" rows={2} maxLength={600} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Quando e onde</h2>
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="grid-2">
            <label className="field">
              <span>Data</span>
              <input type="date" name="event_date" required defaultValue={v.event_date} />
            </label>
            <label className="field">
              <span>Horário <small>(opcional)</small></span>
              <input type="time" name="event_time" defaultValue={v.event_time} />
            </label>
          </div>
          <label className="field">
            <span>Nome do local <small>(opcional)</small></span>
            <input type="text" name="venue_name" maxLength={100} placeholder="Espaço Villa Jardim" defaultValue={v.venue_name} />
          </label>
          <label className="field">
            <span>Endereço <small>(opcional)</small></span>
            <input type="text" name="address" maxLength={240} placeholder="Rua das Flores, 123 — Centro, São Paulo/SP" defaultValue={v.address} />
            <small>Com o endereço, o convite ganha o botão “Como chegar”.</small>
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Traje <small>(opcional)</small></span>
              <input type="text" name="dress_code" maxLength={80} placeholder="Esporte fino" defaultValue={v.dress_code} />
            </label>
            <label className="field">
              <span>Confirmar presença até <small>(opcional)</small></span>
              <input type="date" name="rsvp_deadline" defaultValue={v.rsvp_deadline} />
            </label>
          </div>
          <label className="field">
            <span>Outras informações <small>(opcional)</small></span>
            <textarea name="extra_info" rows={3} maxLength={800} placeholder="Estacionamento no local. Crianças são bem-vindas." defaultValue={v.extra_info} />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Modelo</h2>
        <p className="panel-lead">O visual do convite. Dá para trocar quando quiser, sem mudar o link.</p>
        <div className="choice-grid" role="radiogroup" aria-label="Modelo do convite">
          {TEMPLATES.map((t) => {
            const locked = t.premium && !premium;
            return (
              <label key={t.id} className="choice tpl">
                <input type="radio" name="template" value={t.id} checked={tpl === t.id} disabled={locked} onChange={() => setTpl(t.id)} />
                <span className="tpl-swatch" style={{ background: t.swatch[0], color: t.swatch[1] }} aria-hidden="true">
                  <span>
                    Aa
                    <i style={{ background: t.swatch[2] }} />
                  </span>
                </span>
                <span className="tpl-name">
                  {t.name}
                  {t.premium ? <span className="tag tag-premium">Premium</span> : null}
                </span>
                <small>{t.description}</small>
              </label>
            );
          })}
        </div>
        {!premium ? (
          <p className="help" style={{ marginTop: 10 }}>
            Os modelos Premium são liberados com o upgrade{eventId ? <> — <Link className="link" href={`/painel/${eventId}/premium`}>ver o Premium</Link></> : ", disponível depois de criar o convite"}.
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h2>Confirmação de presença</h2>
        <label className="check" style={{ marginTop: 12 }}>
          <input type="checkbox" name="open_rsvp" defaultChecked={v.open_rsvp !== "off"} />
          <span>
            Aceitar confirmações pelo link geral
            <br />
            <small className="help">
              Quem abrir o link geral (o que você posta num grupo, por exemplo) digita o nome e confirma. Desmarque se só quem está na sua lista pode
              confirmar, cada um pelo próprio link.
            </small>
          </span>
        </label>
      </section>

      <section className="panel">
        <h2>Presentes <small className="help">(opcional)</small></h2>
        <p className="panel-lead">Links das suas listas e a sua chave Pix. O Pix cai direto na sua conta: o app não cobra taxa nem toca no dinheiro.</p>
        <div className="stack">
          <label className="field">
            <span>Recado sobre presentes</span>
            <textarea name="gift_message" rows={2} maxLength={400} placeholder="Sua presença é o que mais importa. Se quiser nos presentear, deixamos algumas sugestões." defaultValue={v.gift_message} />
          </label>
          <div className="stack" style={{ gap: 8 }}>
            <span className="label">Links de listas de presentes</span>
            {[0, 1, 2].map((i) => (
              <div className="gift-row" key={i}>
                <input type="text" name={`gift_label_${i}`} maxLength={60} placeholder="Nome do botão (ex.: Lista na Camicado)" aria-label={`Nome do link ${i + 1}`} defaultValue={v[`gift_label_${i}`]} />
                <input type="text" name={`gift_url_${i}`} inputMode="url" maxLength={500} placeholder="https://…" aria-label={`Endereço do link ${i + 1}`} defaultValue={v[`gift_url_${i}`]} />
              </div>
            ))}
          </div>
          <div className="grid-2">
            <label className="field">
              <span>Tipo da chave Pix</span>
              <select name="pix_key_type" defaultValue={v.pix_key_type || "cpf"}>
                {PIX_KEY_TYPES.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Chave Pix</span>
              <input type="text" name="pix_key" maxLength={100} autoComplete="off" defaultValue={v.pix_key} />
            </label>
            <label className="field">
              <span>Nome de quem recebe</span>
              <input type="text" name="pix_holder" maxLength={60} placeholder="Como aparece no banco" defaultValue={v.pix_holder} />
            </label>
            <label className="field">
              <span>Cidade de quem recebe</span>
              <input type="text" name="pix_city" maxLength={40} defaultValue={v.pix_city} />
            </label>
          </div>
          <p className="help">Depois de salvar, faça um Pix de teste de R$ 0,01 pelo convite para ter certeza de que a chave está certa.</p>
        </div>
      </section>

      <div className="sticky-save">
        {state.error ? (
          <p className="alert alert-error" role="alert" style={{ marginBottom: 12 }}>
            {state.error}
          </p>
        ) : null}
        <div className="form-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
            {pending ? "Salvando…" : eventId ? "Salvar alterações" : "Criar convite"}
          </button>
          <Link href={eventId ? `/painel/${eventId}` : "/painel"} className="btn btn-ghost">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
