"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { saveEvent, type FormState } from "@/app/actions";
import { EVENT_TYPES, eventType } from "@/lib/catalog";
import { capitalize, dateBits, isDate, longDate, prettyTime, shortDate } from "@/lib/format";
import { splitTitle } from "@/lib/names";
import { PIX_KEY_TYPES } from "@/lib/pix";
import { PREMIUM_PRICE } from "@/lib/plans";
import { paletteOf, paletteStyle, TEMPLATE_DEFS, templateDef } from "@/templates";
import type { Palette } from "@/templates/types";
import { InviteCover, type CoverData } from "./InviteCover";
import { paletteDot, TemplateThumb } from "./TemplateThumb";

/** Campos do formulário que não têm estado próprio: lidos na hora de abrir a prévia completa. */
type PreviewExtra = { dress_code: string; rsvp_deadline: string; extra_info: string; gift_message: string; gifts: string[]; pix: boolean; pix_holder: string };

const LEAVE = "Sair sem salvar? O que você preencheu neste convite será perdido.";

/** Botão de mentira: na prévia nada é clicável, só mostra como fica. */
function Fake({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`inv-btn ${className}`}>{children}</span>;
}

/**
 * O convite inteiro, rolável, com o que está no formulário agora (ainda não salvo).
 * Usa as mesmas classes do convite de verdade (Invite.tsx), sem as partes que dependem do servidor (links, QR code, respostas).
 */
function FullPreview({ data, palette, today, extra }: { data: CoverData; palette: Palette; today: string; extra: PreviewExtra }) {
  const def = templateDef(data.template);
  const Art = def.Art;
  const { initials } = splitTitle(data.title);
  const bits = isDate(data.event_date) ? dateBits(data.event_date) : null;
  const time = prettyTime(data.event_time);
  const place = [data.venue_name, data.address].filter(Boolean).join(", ");
  const hasGifts = Boolean(extra.gift_message || extra.gifts.length || extra.pix);
  return (
    <div className="inv" data-template={def.id} data-still="true" style={paletteStyle(palette)} aria-hidden="true">
      <div className="inv-art inv-art-backdrop"><Art slot="backdrop" initials={initials} /></div>
      <div className="inv-sheet">
        <InviteCover data={data} today={today} more={false} />

        <section className="inv-section">
          {bits ? (
            <>
              <p className="inv-kicker">Quando</p>
              <p className="inv-big">
                {capitalize(bits.weekday)}, {Number(bits.day)} de {bits.month} de {bits.year}
              </p>
              {time ? <p className="inv-text">às {time}</p> : null}
            </>
          ) : null}
          {place ? (
            <>
              <hr className="inv-rule" />
              <p className="inv-kicker">Onde</p>
              {data.venue_name ? <p className="inv-big">{data.venue_name}</p> : null}
              {data.address ? <p className="inv-text">{data.address}</p> : null}
              <div className="inv-stack">
                <Fake className="inv-btn-main">Abrir no Google Maps</Fake>
                <div className="inv-grid-2">
                  <Fake className="">Waze</Fake>
                  <Fake className="">Uber</Fake>
                </div>
              </div>
            </>
          ) : null}
          {extra.dress_code ? (
            <>
              <hr className="inv-rule" />
              <p className="inv-kicker">Traje</p>
              <p className="inv-big">{extra.dress_code}</p>
            </>
          ) : null}
          <hr className="inv-rule" />
          <p className="inv-kicker">Para não esquecer</p>
          <div className="inv-grid-2 inv-calendar">
            <Fake className="inv-btn-quiet">Google Agenda</Fake>
            <Fake className="inv-btn-quiet">Outras agendas</Fake>
          </div>
        </section>

        <section className="inv-section">
          <p className="inv-kicker">Sua resposta</p>
          <p className="inv-section-title">Você vem?</p>
          {isDate(extra.rsvp_deadline) ? <p className="inv-hint">Responda até {shortDate(extra.rsvp_deadline)}.</p> : null}
          <div className="rsvp">
            <div className="rsvp-buttons">
              <Fake className="inv-btn-main rsvp-yes">Vou comparecer</Fake>
              <Fake className="rsvp-no">Não poderei ir</Fake>
            </div>
          </div>
        </section>

        {hasGifts ? (
          <section className="inv-section">
            <p className="inv-kicker">Com carinho</p>
            <p className="inv-section-title">Presentes</p>
            {extra.gift_message ? <p className="inv-text">{extra.gift_message}</p> : null}
            {extra.gifts.length ? (
              <div className="inv-stack">
                {extra.gifts.map((label, i) => (
                  <Fake key={i} className="inv-btn-main">
                    {label}
                  </Fake>
                ))}
              </div>
            ) : null}
            {extra.pix ? (
              <>
                {extra.gifts.length || extra.gift_message ? <hr className="inv-rule" /> : null}
                <div className="inv-pix">
                  <p className="inv-kicker">Presentear com Pix</p>
                  <div className="inv-qr preview-qr">QR code do Pix</div>
                  {extra.pix_holder ? (
                    <p className="inv-text">
                      Em nome de <strong>{extra.pix_holder}</strong>
                    </p>
                  ) : null}
                  <Fake className="inv-btn-main">Copiar código Pix</Fake>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {extra.extra_info ? (
          <section className="inv-section">
            <p className="inv-kicker">Bom saber</p>
            <p className="inv-text">{extra.extra_info}</p>
          </section>
        ) : null}

        <footer className="inv-end">
          <div className="inv-section inv-sign">
            <div className="inv-art inv-sign-art"><Art slot="divider" initials={initials} eventType={data.type} /></div>
            <p className="inv-kicker">Esperamos você</p>
            <p className="inv-sign-names">{data.title}</p>
            {bits ? (
              <p className="inv-sign-date">
                {Number(bits.day)} de {bits.month} de {bits.year}
              </p>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}

type Props = { initial: Record<string, string>; eventId?: string; premium: boolean; today: string };

export function EventForm({ initial, eventId, premium, today }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveEvent, {});
  const v = state.values ?? initial;
  const [type, setType] = useState(v.type || "casamento");
  const [tpl, setTpl] = useState(v.template || eventType(type).template);
  const [palette, setPalette] = useState(v.palette || "");
  const [pixType, setPixType] = useState(v.pix_key_type || "cpf");
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
  const [extra, setExtra] = useState<PreviewExtra | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Controle de "alterações não salvas" e do botão voltar. Tudo em refs: os ouvintes são registrados uma vez só.
  const flags = useRef({ dirty: false, guard: false, submitting: false, leaving: false, preview: false });
  const current = eventType(type);
  const def = templateDef(tpl);
  const activePalette = paletteOf(def, palette);
  const set = (key: keyof typeof cover) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCover((c) => ({ ...c, [key]: e.target.value }));
  // Na prévia, campos vazios aparecem com um exemplo, para a pessoa ver o desenho completo desde o início.
  const data: CoverData = { ...cover, template: tpl, type, title: cover.title || current.titlePlaceholder, event_date: cover.event_date || `${Number(today.slice(0, 4)) + 1}-09-11` };

  // Chegou a resposta do servidor (erro de validação): o formulário continua com alterações por salvar.
  useEffect(() => {
    flags.current.submitting = false;
  }, [state]);

  useEffect(() => {
    const f = flags.current;
    const unsaved = () => f.dirty && !f.submitting && !f.leaving;
    // Voltar do aparelho/navegador: com a prévia aberta, fecha a prévia; com alterações por salvar, pergunta antes de sair.
    const onPop = (event: PopStateEvent) => {
      const mark = (event.state ?? {}) as { convideiPreview?: boolean; convideiGuard?: boolean };
      if (mark.convideiPreview) {
        f.preview = true; // "avançar" de volta para a prévia
        setShowPreview(true);
        return;
      }
      if (f.preview) {
        f.preview = false;
        setShowPreview(false);
        return;
      }
      if (mark.convideiGuard || !f.guard || !unsaved()) return;
      if (window.confirm(LEAVE)) {
        f.leaving = true;
        window.history.back();
      } else {
        window.history.pushState({ convideiGuard: true }, "");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && f.preview) window.history.back();
    };
    // Fechar a aba, recarregar ou digitar outro endereço.
    const onUnload = (event: BeforeUnloadEvent) => {
      if (unsaved()) event.preventDefault();
    };
    // Links da própria página (Cancelar, "Meus convites", logo): confirma antes de trocar de tela.
    const onClick = (event: MouseEvent) => {
      if (!unsaved() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("target") === "_blank" || (link.getAttribute("href") ?? "").startsWith("#")) return;
      if (window.confirm(LEAVE)) f.leaving = true;
      else {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("click", onClick, true);
    };
  }, []);

  // Com a prévia aberta, a página de trás não rola e o foco vai para o botão de fechar; ao fechar, volta para quem abriu.
  useEffect(() => {
    if (!showPreview) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      root.style.overflow = before;
      openerRef.current?.focus();
    };
  }, [showPreview]);

  /** Primeira alteração: cria uma entrada no histórico para o "voltar" poder perguntar antes de descartar o que foi digitado. */
  function markDirty() {
    const f = flags.current;
    f.dirty = true;
    if (!f.guard) {
      f.guard = true;
      window.history.pushState({ convideiGuard: true }, "");
    }
  }

  function openPreview(event: React.MouseEvent<HTMLElement>) {
    const form = formRef.current;
    const field = (name: string) => {
      const value = form ? new FormData(form).get(name) : "";
      return typeof value === "string" ? value.trim() : "";
    };
    setExtra({
      dress_code: field("dress_code"),
      rsvp_deadline: field("rsvp_deadline"),
      extra_info: field("extra_info"),
      gift_message: field("gift_message"),
      gifts: [0, 1, 2].filter((i) => field(`gift_url_${i}`)).map((i) => field(`gift_label_${i}`) || "Lista de presentes"),
      pix: Boolean(field("pix_key")),
      pix_holder: field("pix_holder"),
    });
    openerRef.current = event.currentTarget;
    flags.current.preview = true;
    // Entrada própria no histórico: o "voltar" do celular fecha a prévia em vez de sair do editor.
    window.history.pushState({ convideiPreview: true }, "");
    setShowPreview(true);
  }

  /** Envia sem deixar o React 19 "resetar" o formulário: depois de um erro, tudo continua como a pessoa deixou. */
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    flags.current.submitting = true;
    startTransition(() => action(formData));
  }

  const pastDate = isDate(cover.event_date) && cover.event_date < today;
  const premiumNotice = def.premium && !premium;

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
      <form ref={formRef} action={action} onSubmit={submit} onChange={markDirty}>
        {eventId ? <input type="hidden" name="id" value={eventId} /> : null}
        {/* O que vale ao salvar é o estado (o mesmo que a prévia mostra), não a marcação dos botões de opção. */}
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="template" value={tpl} />
        <input type="hidden" name="palette" value={activePalette.id} />

        {premiumNotice ? (
          <p className="alert alert-info" style={{ marginBottom: 16 }}>
            <strong>{def.name} é um modelo Premium ({PREMIUM_PRICE} por evento).</strong> Você monta e vê o convite sem pagar; enquanto o evento estiver no plano grátis, os
            convidados veem uma faixa de “prévia” no topo. Se preferir, escolha um modelo grátis na seção “Modelo”.
          </p>
        ) : null}

        <section className="panel">
          <h2>Que festa é essa?</h2>
          <p className="panel-lead">O tipo define os textos sugeridos. Você pode mudar tudo depois.</p>
          <div className="choice-grid" role="radiogroup" aria-label="Tipo de evento">
            {EVENT_TYPES.map((t) => (
              <label key={t.id} className="choice">
                <input type="radio" name="type_pick" value={t.id} checked={type === t.id} onChange={() => changeType(t.id)} />
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
                <input type="date" name="event_date" required value={cover.event_date} onChange={set("event_date")} aria-describedby={pastDate ? "past-date" : undefined} />
                {pastDate ? (
                  <small id="past-date" className="field-warn" role="status">
                    Essa data já passou ({longDate(cover.event_date)}). Confira o dia e o ano.
                  </small>
                ) : null}
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
                <input type="radio" name="template_pick" value={t.id} checked={tpl === t.id} onChange={() => { setTpl(t.id); setPalette(""); }} />
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
                    <input type="radio" name="palette_pick" value={p.id} checked={activePalette.id === p.id} onChange={() => setPalette(p.id)} />
                    <i style={{ background: paletteDot(p) }} aria-hidden="true" />
                    {p.name}
                  </label>
                ))}
              </div>
            </>
          ) : null}
          {premiumNotice ? (
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
                <select name="pix_key_type" value={pixType} onChange={(e) => setPixType(e.target.value)}>
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
        <p className="editor-preview-label">Prévia da capa · modelo {def.name}</p>
        <div className="device">
          <TemplateThumb data={data} palette={activePalette.id} today={today} />
        </div>
        <button type="button" className="btn btn-sm editor-preview-all" onClick={openPreview}>
          Ver o convite inteiro
        </button>
      </aside>

      <button type="button" className="btn preview-fab" onClick={openPreview}>
        Ver prévia
      </button>
      {showPreview && extra ? (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Prévia do convite inteiro">
          <div className="preview-top">
            <span>Prévia · role para ver tudo</span>
            <button ref={closeRef} type="button" className="btn btn-sm preview-close" onClick={() => window.history.back()}>
              Fechar prévia
            </button>
          </div>
          <FullPreview data={data} palette={activePalette} today={today} extra={extra} />
          <p className="preview-end">Fim da prévia. Os botões funcionam no convite de verdade, depois de salvar.</p>
        </div>
      ) : null}
    </div>
  );
}
