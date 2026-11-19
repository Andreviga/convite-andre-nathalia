"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { WaxSeal } from "./WaxSeal";

const AUTO_OPEN_MS = 4500;
const ANIMATION_MS = 1900;

/**
 * Envelope com lacre que cobre o convite na primeira visita. É só uma capa: o convite inteiro já está na página.
 * Abre com um toque em qualquer lugar da tela, e sozinho depois de alguns segundos, para ninguém ficar preso.
 */
export function Envelope({ storageKey, guestName, initials, liner }: { storageKey: string; guestName?: string; initials: string[]; liner?: ReactNode }) {
  const [state, setState] = useState<"closed" | "opening" | "gone">("closed");
  const [ready, setReady] = useState(false);
  const timers = useRef<number[]>([]);

  function open() {
    setState((current) => {
      if (current !== "closed") return current;
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        /* sem sessionStorage: abre do mesmo jeito */
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timers.current.push(window.setTimeout(() => setState("gone"), reduced ? 250 : ANIMATION_MS));
      return "opening";
    });
  }

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(storageKey) === "1";
    } catch {
      seen = false;
    }
    if (seen) setState("gone");
    else timers.current.push(window.setTimeout(open, AUTO_OPEN_MS));
    setReady(true);
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return (
    <>
      {/* Quem já abriu nesta visita não vê o envelope piscar ao recarregar. */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem(${JSON.stringify(storageKey)})==="1")document.documentElement.classList.add("env-seen")}catch(e){}` }} />
      <div className="env" data-state={state} data-ready={ready}>
        <button type="button" className="env-hit" onClick={open} aria-label="Abrir convite">
          <span className="env-to">
            {guestName ? (
              <>
                Um convite para <strong>{guestName}</strong>
              </>
            ) : (
              <>
                Chegou um <strong>convite para você</strong>
              </>
            )}
          </span>
          <span className="env-body" aria-hidden="true">
            <span className="env-back" />
            <span className="env-liner">{liner}</span>
            <span className="env-card">
              <span className="env-card-line" />
            </span>
            <span className="env-front" />
            <span className="env-flap">
              <span className="env-flap-face" />
            </span>
            <span className="env-seal">
              <WaxSeal initials={initials} />
            </span>
          </span>
          <span className="env-cta">Toque para abrir</span>
        </button>
      </div>
    </>
  );
}
