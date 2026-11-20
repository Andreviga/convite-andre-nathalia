"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { WaxSeal } from "./WaxSeal";

const AUTO_OPEN_MS = 4500;
const ANIMATION_MS = 1900;

/**
 * Envelope com lacre que cobre o convite na primeira visita. É só uma capa: o convite inteiro já está na página.
 * Abre com um toque em qualquer lugar da tela, e sozinho depois de alguns segundos, para ninguém ficar preso.
 * Enquanto está na frente, o resto do convite (os irmãos de .env) fica inerte: sem foco de teclado e fora do leitor de tela.
 */
export function Envelope({ storageKey, guestName, initials, liner, sealEdge = true }: { storageKey: string; guestName?: string; initials: string[]; liner?: ReactNode; sealEdge?: boolean }) {
  const [state, setState] = useState<"closed" | "opening" | "gone">("closed");
  const [ready, setReady] = useState(false);
  // Abriu nesta visita (diferente de "já tinha aberto antes"): é o que dispara a entrada do texto da capa.
  const [opened, setOpened] = useState(false);
  const timers = useRef<number[]>([]);
  const root = useRef<HTMLDivElement>(null);

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
    setOpened(true);
  }

  // Antes da primeira pintura: quem já abriu nesta visita não vê o envelope (na carga direta, o script do <head> já pôs
  // env-seen em <html>; na navegação sem recarregar, é aqui que se decide). A classe de uma página anterior não vale para esta.
  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(storageKey) === "1";
    } catch {
      seen = false;
    }
    document.documentElement.classList.toggle("env-seen", seen);
    if (seen) setState("gone");
    else timers.current.push(window.setTimeout(open, AUTO_OPEN_MS));
    setReady(true);
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Barra fixa embaixo (a da demonstração de modelo): mede a altura de verdade, com o painel aberto ou não, e publica em
  // --env-bar, para o conjunto se centrar na área livre e o botão nunca ficar atrás dela.
  useLayoutEffect(() => {
    const env = root.current;
    const bar = document.querySelector<HTMLElement>(".demo-bar");
    if (!env || !bar || state === "gone") return;
    const update = () => {
      let top = bar.getBoundingClientRect().top;
      bar.querySelectorAll<HTMLElement>("details[open] > :not(summary)").forEach((el) => {
        const box = el.getBoundingClientRect();
        if (box.height > 0) top = Math.min(top, box.top);
      });
      const height = Math.max(0, Math.round(document.documentElement.clientHeight - top));
      env.style.setProperty("--env-bar", `${height}px`);
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(bar);
    bar.querySelectorAll("details > :not(summary)").forEach((el) => observer?.observe(el));
    bar.addEventListener("toggle", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      bar.removeEventListener("toggle", update, true);
      window.removeEventListener("resize", update);
      env.style.removeProperty("--env-bar");
    };
  }, [state === "gone"]);

  // Convite inerte enquanto o envelope cobre a tela; ao sair, o foco vai para o conteúdo.
  useEffect(() => {
    const env = root.current;
    const parent = env?.parentElement;
    if (!env || !parent || !ready) return;
    const siblings = Array.from(parent.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== env && el.tagName !== "SCRIPT");
    if (state !== "gone") {
      siblings.forEach((el) => {
        if (!el.hasAttribute("inert")) {
          el.setAttribute("inert", "");
          el.dataset.envInert = "1";
        }
      });
      return;
    }
    siblings.forEach((el) => {
      if (el.dataset.envInert) {
        el.removeAttribute("inert");
        delete el.dataset.envInert;
      }
    });
    if (!opened) return;
    // Só leva o foco se ele estava no envelope (ou em lugar nenhum): não rouba de quem já está em outro controle da página.
    const active = document.activeElement;
    if (active && active !== document.body && !env.contains(active)) return;
    const target = parent.querySelector<HTMLElement>("main h1") ?? parent.querySelector<HTMLElement>("main");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.dataset.envFocus = "1";
    target.focus({ preventScroll: true });
  }, [state, ready, opened]);

  // Se o envelope sair da árvore (troca de página), nada fica inerte para trás.
  useEffect(() => {
    const parent = root.current?.parentElement;
    return () => {
      parent?.querySelectorAll<HTMLElement>(":scope > [data-env-inert]").forEach((el) => {
        el.removeAttribute("inert");
        delete el.dataset.envInert;
      });
    };
  }, []);

  const label = guestName ? `Um convite para ${guestName}. Toque para abrir.` : "Chegou um convite para você. Toque para abrir.";

  return (
    <div ref={root} className="env" data-state={state} data-ready={ready} data-opened={opened}>
        <button type="button" className="env-hit" onClick={open} aria-label={label}>
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
            {/* Ordem das camadas (de trás para a frente) com o envelope aberto: fundo, aba aberta, cartão, sombra do bolso, frente. */}
            <span className="env-card">
              <span className="env-card-line" />
            </span>
            <span className="env-shade" />
            <span className="env-front" />
            <span className="env-flap">
              <span className="env-flap-face" />
              {/* avesso da aba: o forro aparece quando ela se abre */}
              <span className="env-liner">{liner}</span>
            </span>
            <span className="env-seal">
              <WaxSeal initials={initials} edge={sealEdge} />
            </span>
          </span>
          <span className="env-cta">Toque para abrir</span>
        </button>
      </div>
  );
}
