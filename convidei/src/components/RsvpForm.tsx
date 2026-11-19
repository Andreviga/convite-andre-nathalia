"use client";

import { useActionState, useState, useTransition } from "react";
import { quickRsvp, saveRsvpDetails, submitRsvp, type RsvpState } from "@/app/actions";

type Status = "pending" | "yes" | "no";
type Props = { slug: string; token?: string; maxPeople: number; initialStatus: Status; initialPeople: number; initialNote: string; calendarUrl: string };

function announce() {
  window.dispatchEvent(new Event("convidei:respondeu"));
}

/** Convidado com link individual: um toque grava a resposta. Os detalhes (pessoas, recado) vêm depois e são opcionais. */
function PersonalRsvp({ slug, token, maxPeople, initialStatus, initialPeople, initialNote, calendarUrl }: Props & { token: string }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [editing, setEditing] = useState(initialStatus === "pending");
  const [error, setError] = useState("");
  const [sending, startSending] = useTransition();
  const [details, saveDetails, savingDetails] = useActionState<RsvpState, FormData>(saveRsvpDetails, {});

  function answer(next: "yes" | "no") {
    setError("");
    startSending(async () => {
      const result = await quickRsvp(slug, token, next);
      if (result.error) return setError(result.error);
      setStatus(next);
      setEditing(false);
      announce();
    });
  }

  if (editing) {
    return (
      <div className="rsvp">
        <div className="rsvp-buttons">
          <button type="button" className="inv-btn inv-btn-main rsvp-yes" disabled={sending} onClick={() => answer("yes")}>
            Vou comparecer
          </button>
          <button type="button" className="inv-btn rsvp-no" disabled={sending} onClick={() => answer("no")}>
            Não poderei ir
          </button>
        </div>
        {error ? (
          <p className="inv-error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rsvp">
      <div className="rsvp-state" role="status">
        <p className="rsvp-state-title">{status === "yes" ? "Presença confirmada" : "Resposta registrada"}</p>
        <p>{status === "yes" ? "Que alegria! Esperamos você." : "Que pena que você não poderá ir. Obrigado por avisar."}</p>
      </div>

      <form action={saveDetails} className="rsvp-details">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="token" value={token} />
        {status === "yes" && maxPeople > 1 ? (
          <label className="inv-field">
            Quantas pessoas, contando com você?
            <select name="people" defaultValue={String(Math.min(Math.max(initialPeople, 1), maxPeople))}>
              {Array.from({ length: maxPeople }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? "pessoa" : "pessoas"}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="inv-field">
          {status === "yes" ? "Restrição alimentar ou recado (opcional)" : "Deixe um recado (opcional)"}
          <textarea name="note" rows={2} maxLength={300} defaultValue={initialNote} />
        </label>
        {details.error ? (
          <p className="inv-error" role="alert">
            {details.error}
          </p>
        ) : null}
        <button type="submit" className="inv-btn" disabled={savingDetails}>
          {savingDetails ? "Salvando…" : "Salvar"}
        </button>
        {details.saved ? (
          <p className="inv-saved" role="status">
            Salvo. Obrigado!
          </p>
        ) : null}
      </form>

      {status === "yes" ? (
        <a className="inv-btn inv-btn-quiet" style={{ marginTop: 10 }} href={calendarUrl} target="_blank" rel="noopener noreferrer">
          Salvar na agenda
        </a>
      ) : null}
      <p style={{ textAlign: "center", marginTop: 6 }}>
        <button type="button" className="inv-link" onClick={() => setEditing(true)}>
          Mudar minha resposta
        </button>
      </p>
    </div>
  );
}

/** Link geral (sem convite individual): a pessoa diz o nome e responde. */
function OpenRsvp({ slug }: { slug: string }) {
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
      <label className="inv-field">
        Quantas pessoas, contando com você?
        <select name="people" defaultValue="1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "pessoa" : "pessoas"}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="inv-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="rsvp-buttons">
        <button type="submit" name="status" value="yes" className="inv-btn inv-btn-main rsvp-yes" disabled={pending}>
          Vou comparecer
        </button>
        <button type="submit" name="status" value="no" className="inv-btn rsvp-no" disabled={pending}>
          Não poderei ir
        </button>
      </div>
    </form>
  );
}

export function RsvpForm(props: Props) {
  return props.token ? <PersonalRsvp {...props} token={props.token} /> : <OpenRsvp slug={props.slug} />;
}
