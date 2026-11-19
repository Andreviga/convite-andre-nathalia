"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveEvent, type FormState } from "@/app/actions";
import { EVENT_TYPES, eventType } from "@/lib/catalog";
import { PIX_KEY_TYPES } from "@/lib/pix";
import { paletteOf, TEMPLATE_DEFS, templateDef } from "@/templates";
import type { CoverData } from "./InviteCover";
import { TemplateThumb } from "./TemplateThumb";

type Props = { initial: Record<string, string>; eventId?: string; premium: boolean; today: string };

export function EventForm({ initial, eventId, premium, today }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveEvent, {});
  const v = state.values ?? initial;
  const [type, setType] = useState(v.type || "casamento");
  const [tpl, setTpl] = useState(v.template || eventType(type).template);
  const [palette, setPalette] = useState(v.palette || "");
  const [cover, setCover] = useState({
    title: v.title ?? "",
    headline: v.headline ?? eventType(type).headline,
    message: v.message ?? eventType(type).message,
    event_date: v.event_date ?? "",
    event_time: v.event_time ?? "",
    venue_name: v.venue_name ?? "",
    address: v.address ?? "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const current = eventType(type);
  const def = templateDef(tpl);
  const activePalette = paletteOf(def, palette);
  const set = (key: keyof typeof cover) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCover((c) => ({ ...c, [key]: e.target.value }));
  // Na prévia, campos vazios aparecem com um exemplo, para a pessoa ver o desenho completo desde o início.
  const data: CoverData = { ...cover, template: tpl, type, title: cover.title || current.titlePlaceholder, event_date: cover.event_date || `${Number(today.slice(0, 4)) + 1}-09-11` };

  function changeType(next: string) {
    const from = eventType(type);
    const to = eventType(next);
    // Só troca os textos sugeridos se a pessoa ainda não escreveu os dela.
    setCover((c) => ({
      ...c,
      headline: !c.headline.trim() || c.headline === from.headline ? to.headline : c.headline,
      message: !c.message.trim() || c.message === from.message ? to.message : c.message,
    }));
    if (!eventId && tpl === from.template) setTpl(to.template);
    setType(next);
  }

  return (
    <div className="editor">
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
          <p className="panel-lead">Vá preenchendo e veja o convite mudar na prévia.</p>
          <div className="stack">
            <label className="field">
              <span>{current.titleLabel}</span>
              <input type="text" name="title" required minLength={2} maxLength={80} placeholder={current.titlePlaceholder} value={cover.title} onChange={set("title")} />
              <small>É o destaque do convite e o nome que aparece na prévia do WhatsApp. Para um casal, use “Nome &amp; Nome”.</small>
            </label>
            <label className="field">
              <span>Frase de abertura <small>(opcional)</small></span>
              <input type="text" name="headline" maxLength={120} value={cover.headline} onChange={set("headline")} />
            </label>
            <label className="field">
              <span>Mensagem <small>(opcional)</small></span>
              <textarea name="message" rows={2} maxLength={600} value={cover.message} onChange={set("message")} />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2>Quando e onde</h2>
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="grid-2">
              <label className="field">
                <span>Data</span>
                <input type="date" name="event_date" required value={cover.event_date} onChange={set("event_date")} />
              </label>
              <label className="field">
                <span>Horário <small>(opcional)</small></span>
                <input type="time" name="event_time" value={cover.event_time} onChange={set("event_time")} />
              </label>
            </div>
            <label className="field">
              <span>Nome do local <small>(opcional)</small></span>
              <input type="text" name="venue_name" maxLength={100} placeholder="Espaço Villa Jardim" value={cover.venue_name} onChange={set("venue_name")} />
            </label>
            <label className="field">
              <span>Endereço <small>(opcional)</small></span>
              <input type="text" name="address" maxLength={240} placeholder="Rua das Flores, 123 — Centro, São Paulo/SP" value={cover.address} onChange={set("address")} />
              <small>Com o endereço, o convite ganha os botões de Google Maps, Waze e Uber.</small>
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
          <p className="panel-lead">As miniaturas já mostram o seu convite. Dá para trocar quando quiser, sem mudar o link.</p>
          <div className="tpl-grid" role="radiogroup" aria-label="Modelo do convite">
            {TEMPLATE_DEFS.map((t) => (
              <label key={t.id} className="tpl-pick">
                <input type="radio" name="template" value={t.id} checked={tpl === t.id} onChange={() => { setTpl(t.id); setPalette(""); }} />
                <TemplateThumb data={{ ...data, template: t.id }} today={today} />
                <span className="tpl-pick-name">
                  {t.name}
                  {t.premium ? <span className="tag tag-premium">Premium</span> : null}
                </span>
              </label>
            ))}
          </div>
          {def.palettes.length > 1 ? (
            <>
              <p className="label" style={{ margin: "18px 0 8px" }}>
                Cores do modelo {def.name}
              </p>
              <div className="swatches" role="radiogroup" aria-label="Cores">
                {def.palettes.map((p) => (
                  <label key={p.id} className="swatch">
                    <input type="radio" name="palette" value={p.id} checked={activePalette.id === p.id} onChange={() => setPalette(p.id)} />
                    <i style={{ background: `linear-gradient(135deg, ${p.vars.paper} 50%, ${p.vars.ink} 50%)` }} aria-hidden="true" />
                    {p.name}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <input type="hidden" name="palette" value={activePalette.id} />
          )}
          {def.premium && !premium ? (
            <p className="alert alert-info" style={{ marginTop: 14 }}>
              {def.name} é um modelo Premium. Você pode montar e ver o convite à vontade; enquanto o evento estiver no plano grátis, ele aparece para os convidados com uma faixa de “prévia”.
              {eventId ? (
                <>
                  {" "}
                  <Link className="link" href={`/painel/${eventId}/premium`}>
                    Ver o Premium
                  </Link>
                </>
              ) : null}
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

      <aside className="editor-preview" aria-label="Prévia do convite">
        <p className="editor-preview-label">Prévia · modelo {def.name}</p>
        <div className="device">
          <TemplateThumb data={data} palette={activePalette.id} today={today} />
        </div>
      </aside>

      <button type="button" className="btn preview-fab" onClick={() => setShowPreview(true)}>
        Ver prévia
      </button>
      {showPreview ? (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Prévia do convite">
          <button type="button" className="btn btn-sm preview-close" onClick={() => setShowPreview(false)}>
            Fechar prévia
          </button>
          <div className="preview-full">
            <TemplateThumb data={data} palette={activePalette.id} today={today} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
