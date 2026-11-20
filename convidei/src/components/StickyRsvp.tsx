"use client";

import { useEffect, useState } from "react";

/**
 * Botão fixo "Confirmar presença" para quem ainda não respondeu. Só aparece depois que a capa saiu da tela
 * (a primeira tela é do convite, sem nada por cima) e some enquanto a seção de confirmação está visível.
 */
export function StickyRsvp({ pending }: { pending: boolean }) {
  const [answered, setAnswered] = useState(!pending);
  const [coverInView, setCoverInView] = useState(true);
  const [rsvpInView, setRsvpInView] = useState(true);

  useEffect(() => {
    const target = document.getElementById("confirmar");
    const cover = document.querySelector(".inv-cover");
    if (!target || !cover) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === cover) setCoverInView(entry.isIntersecting);
        else setRsvpInView(entry.isIntersecting);
      }
    });
    observer.observe(cover);
    observer.observe(target);
    const done = () => setAnswered(true);
    window.addEventListener("convidei:respondeu", done);
    return () => {
      observer.disconnect();
      window.removeEventListener("convidei:respondeu", done);
    };
  }, []);

  if (answered) return null;
  const show = !coverInView && !rsvpInView;
  return (
    <div className="inv-sticky" data-show={show} aria-hidden={!show}>
      <a className="inv-btn inv-btn-main" href="#confirmar" tabIndex={show ? 0 : -1}>
        Confirmar presença
      </a>
    </div>
  );
}
