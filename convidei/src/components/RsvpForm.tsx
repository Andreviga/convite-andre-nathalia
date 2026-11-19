"use client";

import { useActionState, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions";

type Props = {
  slug: string;
  token?: string;
  maxPeople: number;
  initialStatus: "pending" | "yes" | "no";
  initialPeople: number;
  initialNote: string;
};

export function RsvpForm({ slug, token, maxPeople, initialStatus, initialPeople, initialNote }: Props) {
  const [state, action, pending] = useActionState<RsvpState, FormData>(submitRsvp, {});
  const answered = state.saved ?? (initialStatus === "pending" ? undefined : initialStatus);
  const [editing, setEditing] = useState(!answered);
  const [choice, setChoice] = useState<"yes" | "no" | "">(initialStatus === "pending" ? "" : initialStatus);
  const [lastSaved, setLastSaved] = useState(state.saved);

  // Depois de salvar, volta para a tela de resposta registrada.
  if (state.saved !== lastSaved) {
    setLastSaved(state.saved);
    if (state.saved) setEditing(false);
  }

  if (answered && !editing) {
    return (
      <div className="rsvp-done" role="status">
        <p className="rsvp-done-title">{answered === "yes" ? "Presença confirmada" : "Resposta registrada"}</p>
        <p>{answered === "yes" ? "Que alegria! Esperamos você." : "Que pena que você não poderá ir. Obrigado por avisar."}</p>
        <button type="button" className="inv-link" onClick={() => setEditing(true)}>
          Mudar minha resposta
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="rsvp-form">
      <input type="hidden" name="slug" value={slug} />
      {token ? <input type="hidden" name="token" value={token} /> : null}
      <div className="hp" aria-hidden="true">
        <label>
          Não preencha
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {!token ? (
        <>
          <label className="inv-field">
            <span>Seu nome</span>
            <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
          <label className="inv-field">
            <span>Celular (opcional)</span>
            <input name="phone" type="tel" inputMode="tel" maxLength={20} autoComplete="tel" />
          </label>
        </>
      ) : null}

      <fieldset className="rsvp-choice">
        <legend className="sr-only">Você vai?</legend>
        <label className={choice === "yes" ? "is-on" : ""}>
          <input type="radio" name="status" value="yes" required checked={choice === "yes"} onChange={() => setChoice("yes")} />
          Vou sim
        </label>
        <label className={choice === "no" ? "is-on" : ""}>
          <input type="radio" name="status" value="no" checked={choice === "no"} onChange={() => setChoice("no")} />
          Não poderei ir
        </label>
      </fieldset>

      {choice === "yes" && maxPeople > 1 ? (
        <label className="inv-field">
          <span>Quantas pessoas, contando com você?</span>
          <select name="people" defaultValue={String(Math.min(Math.max(initialPeople, 1), maxPeople))}>
            {Array.from({ length: maxPeople }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="people" value="1" />
      )}

      {choice ? (
        <label className="inv-field">
          <span>{choice === "yes" ? "Restrição alimentar ou recado (opcional)" : "Deixe um recado (opcional)"}</span>
          <textarea name="note" rows={2} maxLength={300} defaultValue={initialNote} />
        </label>
      ) : null}

      {state.error ? (
        <p className="inv-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="inv-btn inv-btn-main" disabled={pending || !choice}>
        {pending ? "Enviando…" : "Enviar resposta"}
      </button>
    </form>
  );
}
