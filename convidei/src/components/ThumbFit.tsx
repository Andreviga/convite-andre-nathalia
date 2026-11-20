"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Faz a capa caber inteira na miniatura. A miniatura é a capa de verdade, reduzida (escala --s); quando o cartão é mais alto
 * que a janela (modelos com muito ornamento, nomes em três linhas, recado comprido), este componente mede a altura real e
 * define --fit (entre 0.6 e 1) no .inv da miniatura, que o CSS (invite.css, "Miniaturas") multiplica na escala. Assim nenhum
 * modelo precisa de regras próprias para "caber na miniatura".
 * Antes de este código rodar (e sem JavaScript) vale o --fit calculado só com CSS a partir de --thumb-h, a altura da capa de
 * exemplo que cada modelo declara: a miniatura já nasce inteira, e aqui só se corrige o que muda com o texto digitado.
 * Vai dentro de .thumb (ver TemplateThumb) e não desenha nada.
 */
export function ThumbFit() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const thumb = ref.current?.closest<HTMLElement>(".thumb");
    const inv = thumb?.querySelector<HTMLElement>(":scope > .inv");
    const cover = thumb?.querySelector<HTMLElement>(".inv-cover");
    const paper = cover?.querySelector<HTMLElement>(".inv-paper");
    if (!thumb || !inv || !cover || !paper) return;
    const fit = () => {
      // mede sempre a partir da escala cheia: há modelo que estica o cartão até o pé da janela, e a medida viria viciada
      inv.style.setProperty("--fit", "1");
      const scale = parseFloat(getComputedStyle(thumb).getPropertyValue("--s")) || 1;
      const available = thumb.clientHeight / scale; // altura da janela, na medida da capa
      const pad = getComputedStyle(cover);
      const needed = paper.offsetHeight + parseFloat(pad.paddingTop) + parseFloat(pad.paddingBottom);
      if (!available || !needed) return;
      inv.style.setProperty("--fit", Math.max(0.6, Math.min(1, available / needed)).toFixed(3));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(paper);
    observer.observe(thumb);
    void document.fonts?.ready.then(fit); // as fontes do modelo chegam depois e mudam a altura
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}
