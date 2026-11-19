"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent, type MouseEvent } from "react";
import { quickRsvp, saveRsvpDetails, submitRsvp, type RsvpState } from "@/app/actions";
import { answerText, peopleText as plural, type RsvpStatus } from "@/lib/rsvp-text";

type Status = RsvpStatus;
type Props = {
  slug: string;
  token?: string;
  maxPeople: number;
  initialStatus: Status;
  initialPeople: number;
  initialNote: string;
  calendarUrl: string;
  /** A pessoa acabou de responder (chegou por redirecionamento): leva o foco para a confirmação. */
  justAnswered?: boolean;
  /** Abre já no modo "mudar minha resposta" (caminho sem JavaScript: ?mudar=1). */
  startEditing?: boolean;
};

/** Recado opcional. Componente à parte (com `key` na resposta) para o aviso de "enviado" não sobreviver à troca de resposta. */
function NoteForm({ slug, token, status, initialNote, onType }: { slug: string; token: string; status: Status; initialNote: string; onType: (text: string) => void }) {
  const [state, save, saving] = useActionState<RsvpState, FormData>(saveRsvpDetails, {});
  return (
    <form action={save} className="rsvp-details">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="token" value={token} />
      <label className="inv-field">
        {status === "yes" ? "Restrição alimentar ou recado (opcional)" : "Deixe um recado (opcional)"}
        <textarea name="note" rows={2} maxLength={300} defaultValue={initialNote} onChange={(event) => onType(event.target.value)} />
      </label>
      {state.error ? (
        <p className="inv-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="inv-btn inv-btn-quiet" disabled={saving}>
        {saving ? "Enviando…" : "Enviar recado"}
      </button>
      <p className="inv-saved" role="status">
        {state.saved && !saving ? "Recado enviado. Obrigado!" : ""}
      </p>
    </form>
  );
}

/**
 * Convidado com link individual. Um toque grava a resposta; quando o convite é para mais de uma pessoa,
 * o próprio botão de confirmar é o número de pessoas (nunca gravamos "1" calado para uma família).
 * É um formulário de verdade: sem JavaScript, os mesmos botões enviam para o servidor.
 */
function PersonalRsvp({ slug, token, maxPeople, initialStatus, initialPeople, initialNote, calendarUrl, justAnswered, startEditing }: Props & { token: string }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [people, setPeople] = useState(initialPeople);
  const [editing, setEditing] = useState(initialStatus === "pending" || Boolean(startEditing));
  const [error, setError] = useState("");
  const [live, setLive] = useState("");
  const [sending, startSending] = useTransition();
  const [posted, post] = useActionState<RsvpState, FormData>(submitRsvp, {});
  const stateRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const note = useRef(initialNote); // o recado digitado não se perde quando a pessoa muda a resposta
  const focusOn = useRef<"state" | "form" | null>(justAnswered && initialStatus !== "pending" ? "state" : null);
  const many = maxPeople > 1;
  const self = `/c/${slug}/${token}`;

  // Depois de responder (ou de pedir para mudar), o foco vai para o que acabou de aparecer: leitor de tela e teclado não perdem o lugar.
  useEffect(() => {
    const target = focusOn.current;
    focusOn.current = null;
    if (target === "state") stateRef.current?.focus();
    if (target === "form") formRef.current?.querySelector<HTMLElement>("button[type=submit]")?.focus();
  }, [editing, status]);

  function answer(next: "yes" | "no", count?: number) {
    setError("");
    startSending(async () => {
      const result = await quickRsvp(slug, token, next, count).catch(() => ({ error: "Não deu para enviar. Confira a internet e toque de novo.", people: undefined }));
      if (result.error) {
        setError(result.error);
        return;
      }
      const saved = result.people ?? count ?? people;
      const text = answerText(next, saved, maxPeople);
      setPeople(saved);
      setStatus(next);
      setEditing(false);
      setLive(`${text.title}. ${text.line}`);
      focusOn.current = "state";
      window.dispatchEvent(new Event("convidei:respondeu"));
    });
  }

  // Com JavaScript, o toque responde na hora, sem recarregar a página. Sem ele, o formulário segue para o servidor.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!button) return;
    event.preventDefault();
    if (button.name === "people") answer("yes", Number(button.value));
    else if (button.value === "yes" || button.value === "no") answer(button.value);
  }

  function toggle(event: MouseEvent, next: boolean) {
    event.preventDefault();
    setError("");
    setLive("");
    focusOn.current = next ? "form" : "state";
    setEditing(next);
  }

  const current = status === "pending" ? null : answerText(status, people, maxPeople);
  const shownError = error || posted.error;

  return (
    <div className="rsvp">
      {/* Região viva sempre montada: o leitor de tela anuncia a confirmação quando o texto muda. */}
      <p className="sr-only" role="status" aria-live="polite">
        {live}
      </p>

      {editing ? (
        <form ref={formRef} action={post} onSubmit={onSubmit} className="rsvp-ask" aria-busy={sending}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="token" value={token} />
          {current ? (
            <p className="rsvp-current">
              Sua resposta atual: <strong>{status === "yes" ? (many ? `vou, ${plural(Math.max(people, 1))}` : "vou comparecer") : many ? "não poderemos ir" : "não poderei ir"}</strong>
            </p>
          ) : null}
          {many ? (
            <fieldset className="rsvp-count">
              <legend>
                <strong>Vamos, sim!</strong> Toque em quantas pessoas vêm, contando com você:
              </legend>
              <div className="rsvp-count-grid" data-n={maxPeople}>
                {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="submit" name="people" value={n} className="inv-btn inv-btn-main rsvp-n" disabled={sending} aria-pressed={status === "yes" && people === n}>
                    <span className="rsvp-n-num">{n}</span>
                    <span className="rsvp-n-word">{n === 1 ? "pessoa" : "pessoas"}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <button type="submit" name="status" value="yes" className="inv-btn inv-btn-main rsvp-yes" disabled={sending} aria-pressed={current ? status === "yes" : undefined}>
              Vou comparecer
            </button>
          )}
          <button type="submit" name="status" value="no" className="inv-btn rsvp-no" disabled={sending} aria-pressed={current ? status === "no" : undefined}>
            {many ? "Não poderemos ir" : "Não poderei ir"}
          </button>
          {shownError ? (
            <p className="inv-error" role="alert">
              {shownError}
            </p>
          ) : null}
          {current ? (
            <p className="rsvp-links">
              <a className="inv-link" href={`${self}#confirmar`} onClick={(event) => toggle(event, false)}>
                Manter minha resposta
              </a>
            </p>
          ) : null}
        </form>
      ) : current ? (
        <>
          <div className="rsvp-state" data-status={status} tabIndex={-1} ref={stateRef}>
            <p className="rsvp-state-title">{current.title}</p>
            <p>{current.line}</p>
          </div>

          <NoteForm key={`${status}-${people}`} slug={slug} token={token} status={status} initialNote={note.current} onType={(text) => (note.current = text)} />

          {status === "yes" ? (
            <a className="inv-btn inv-btn-quiet rsvp-calendar" href={calendarUrl} target="_blank" rel="noopener noreferrer">
              Salvar na agenda
            </a>
          ) : null}
          <p className="rsvp-links">
            <a className="inv-link" href={`${self}?mudar=1#confirmar`} onClick={(event) => toggle(event, true)}>
              {status === "yes" && many ? "Mudar a resposta ou o número de pessoas" : "Mudar minha resposta"}
            </a>
          </p>
        </>
      ) : null}
    </div>
  );
}

/** Link geral (sem convite individual): a pessoa diz o nome, quantos vêm e responde. */
function OpenRsvp({ slug, maxPeople }: { slug: string; maxPeople: number }) {
  const [state, action, pending] = useActionState<RsvpState, FormData>(submitRsvp, {});
  return (
    <form action={action} className="rsvp rsvp-details">
      <input type="hidden" name="slug" value={slug} />
      <div className="hp" aria-hidden="true">
        <label>
          Não preencha
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="inv-field">
        Seu nome
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </label>
      {/* Sem número marcado de saída: quem vem em família precisa dizer quantos são. */}
      <fieldset className="rsvp-count">
        <legend>Se você vem, toque em quantas pessoas, contando com você:</legend>
        <div className="rsvp-radios">
          {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => (
            <label key={n} className="rsvp-radio">
              <input type="radio" name="people" value={n} required />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.error ? (
        <p className="inv-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="rsvp-buttons">
        <button type="submit" name="status" value="yes" className="inv-btn inv-btn-main rsvp-yes" disabled={pending}>
          Vou comparecer
        </button>
        <button type="submit" name="status" value="no" className="inv-btn rsvp-no" disabled={pending} formNoValidate>
          Não poderei ir
        </button>
      </div>
    </form>
  );
}

export function RsvpForm(props: Props) {
  return props.token ? <PersonalRsvp {...props} token={props.token} /> : <OpenRsvp slug={props.slug} maxPeople={props.maxPeople} />;
}
