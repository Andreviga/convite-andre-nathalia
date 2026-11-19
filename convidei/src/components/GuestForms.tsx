"use client";

import { useActionState } from "react";
import { addGuest, addGuestsBulk, markSent, type FormState } from "@/app/actions";

function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state.ok ? (
        <p className="alert alert-ok" role="status" style={{ marginTop: 10 }}>
          {state.ok}
        </p>
      ) : null}
      {state.error ? (
        <p className="alert alert-error" role="alert" style={{ marginTop: 10 }}>
          {state.error}
        </p>
      ) : null}
    </>
  );
}

export function AddGuestForm({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addGuest, {});
  const v = state.values ?? {};
  return (
    <form action={action}>
      <input type="hidden" name="event_id" value={eventId} />
      <div className="add-guest">
        <label className="field">
          <span>Nome ou família</span>
          <input type="text" name="name" required minLength={2} maxLength={80} placeholder="Família Oliveira" defaultValue={v.name} />
        </label>
        <label className="field">
          <span>Celular com DDD <small>(opcional)</small></span>
          <input type="tel" name="phone" inputMode="tel" maxLength={20} placeholder="11 99999-8888" defaultValue={v.phone} />
        </label>
        <label className="field">
          <span>Pessoas</span>
          <input type="number" name="max_people" min={1} max={20} defaultValue={v.max_people ?? "1"} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Adicionando…" : "Adicionar"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function BulkGuestForm({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addGuestsBulk, {});
  return (
    <details className="bulk">
      <summary>Adicionar vários de uma vez</summary>
      <form action={action} className="stack">
        <input type="hidden" name="event_id" value={eventId} />
        <label className="field">
          <span>Um convite por linha: nome; celular; pessoas</span>
          <textarea name="lines" rows={6} placeholder={"Família Oliveira; 11 99999-8888; 4\nTia Lúcia; 2\nJoão Pedro"} defaultValue={state.values?.lines} />
          <small>Celular e número de pessoas são opcionais. Dá para colar direto de uma planilha.</small>
        </label>
        <div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Adicionando…" : "Adicionar lista"}
          </button>
        </div>
        <Feedback state={state} />
      </form>
    </details>
  );
}

export function WhatsAppLink({ eventId, guestId, href, sent }: { eventId: string; guestId: string; href: string; sent: boolean }) {
  return (
    <a className="btn btn-sm btn-wa" href={href} target="_blank" rel="noopener noreferrer" onClick={() => void markSent(eventId, guestId)}>
      {sent ? "Reenviar no WhatsApp" : "Enviar no WhatsApp"}
    </a>
  );
}
