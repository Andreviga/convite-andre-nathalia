"use client";

import { useEffect, useState } from "react";

/** Botão fixo "Confirmar presença" enquanto o convidado não respondeu e a seção de confirmação não está na tela. */
export function StickyRsvp({ pending }: { pending: boolean }) {
  const [answered, setAnswered] = useState(!pending);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const target = document.getElementById("confirmar");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(target);
    const done = () => setAnswered(true);
    window.addEventListener("convidei:respondeu", done);
    return () => {
      observer.disconnect();
      window.removeEventListener("convidei:respondeu", done);
    };
  }, []);

  const show = !answered && !inView;
  return (
    <div className="inv-sticky" data-show={show} aria-hidden={!show}>
      <a className="inv-btn inv-btn-main" href="#confirmar" tabIndex={show ? 0 : -1}>
        Confirmar presença
      </a>
    </div>
  );
}
