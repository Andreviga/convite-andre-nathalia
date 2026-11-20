"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

// Lacre de cera com as iniciais. Cores: var(--seal) e var(--seal-ink). SVG estático (nada de filtros animados).
// A fonte das iniciais vem do modelo: var(--seal-font) (ver .env-seal em invite.css). Seja qual for a fonte e o par de
// iniciais, elas ficam dentro do anel interno: no navegador a tinta do texto é medida (floreios incluídos) e o tamanho e a
// posição são ajustados; antes disso (e sem JavaScript) vale uma estimativa segura para capitais romanas.

// Silhueta de cera: curva fechada (termina onde começa) e inteira dentro da viewBox 0 0 120 120 (de 4,7 a 114,5).
const EDGE =
  "M60 5.9C67.5 7.2 74.9 12.5 81.3 14.4C87.6 16.3 87.4 11.3 92.3 15.6C97.2 19.9 103.2 30.4 106.2 36.4C109.3 42.4 106.8 39.1 108 46.2C109.1 53.4 112.1 64.9 112.1 73C112.2 81.1 111.3 83.2 108.2 87.8C105.2 92.5 103.6 92.4 96.6 96.6C89.5 100.7 78.8 105.5 72.2 109C65.6 112.5 69.4 114.6 62.9 114.4C56.3 114.2 45.4 111.2 38.6 108C31.8 104.8 32.6 101.6 28.1 98.1C23.5 94.6 19.8 96.6 15.3 90.1C10.8 83.6 6 72.1 4.9 64.8C3.8 57.5 7.5 59.5 9.6 52.9C11.7 46.3 12.5 36.6 15.5 31.1C18.4 25.5 19.2 29.1 24.6 24.6C30 20.1 36.2 11.6 43.1 8C50 4.3 52.5 4.6 60 5.9Z";

/** Iniciais sem acento: "É" vira "E", "Â" vira "A" (o lacre é gravado, não escrito). */
function plain(letter: string) {
  return letter.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const CENTER = 60;
/** Raio livre para a tinta das iniciais: anel interno (37 menos o traço) com folga para o contorno das letras. */
const INK_RADIUS = 31;

/** Largura aproximada de uma capital romana, em relação a uma letra média (só para a estimativa do servidor). */
function roughWidth(letter: string) {
  if (/[MW]/i.test(letter)) return 1.4;
  if (/[IJ]/i.test(letter)) return 0.6;
  if (/[GHNOQ]/i.test(letter)) return 1.12;
  return 1;
}

type Fit = { size: number; dx: number; y: number };

/** Mede a tinta do texto (não a caixa de avanço: floreios de fontes caligráficas contam) e devolve tamanho e posição. */
function measure(svg: SVGSVGElement, text: string): Fit | null {
  const el = svg.querySelector<SVGTextElement>(".seal-initials:last-of-type");
  const ctx = document.createElement("canvas").getContext("2d");
  if (!el || !ctx || !text) return null;
  const style = getComputedStyle(el);
  const cap = parseFloat(getComputedStyle(svg).fontSize) || 36; // o tamanho que o modelo pede é o teto
  let size = cap;
  let fit: Fit | null = null;
  // Duas passadas: fontes com tamanho óptico mudam de desenho conforme o corpo.
  for (let pass = 0; pass < 2; pass++) {
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const m = ctx.measureText(text);
    const halfW = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 2;
    const halfH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2;
    const reach = Math.hypot(halfW, halfH); // canto da caixa de tinta, com ela centrada no lacre
    if (!(reach > 0)) return fit;
    const scale = Math.min(cap / size, INK_RADIUS / reach);
    fit = {
      size: size * scale,
      dx: ((m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2) * scale,
      y: CENTER + ((m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2) * scale,
    };
    size = fit.size;
  }
  return fit;
}

export function WaxSeal({ initials, edge = true }: { initials: string[]; /** contorno escuro atrás das iniciais (só quando ajuda o contraste) */ edge?: boolean }) {
  const letters = initials.slice(0, 2).map(plain).filter(Boolean);
  const text = letters.join(letters.length > 1 ? "·" : "");
  const svg = useRef<SVGSVGElement>(null);
  const [fit, setFit] = useState<Fit | null>(null);

  useLayoutEffect(() => {
    const node = svg.current;
    if (!node) return;
    let alive = true;
    const run = () => {
      if (!alive) return;
      const next = measure(node, text);
      setFit((prev) => (prev && next && Math.abs(prev.size - next.size) < 0.05 && Math.abs(prev.dx - next.dx) < 0.05 && Math.abs(prev.y - next.y) < 0.05 ? prev : next));
    };
    run();
    // A fonte do modelo pode chegar depois: mede de novo quando ela carregar.
    const fonts = document.fonts;
    const el = node.querySelector(".seal-initials");
    if (el) {
      const style = getComputedStyle(el);
      fonts?.load(`${style.fontStyle} ${style.fontWeight} 36px ${style.fontFamily}`, text).then(run, () => {});
    }
    fonts?.addEventListener?.("loadingdone", run);
    return () => {
      alive = false;
      fonts?.removeEventListener?.("loadingdone", run);
    };
  }, [text]);

  // Estimativa do servidor (capitais romanas): encolhe pares largos para caberem no anel.
  const units = letters.reduce((sum, l) => sum + roughWidth(l), 0);
  const rough = letters.length > 1 ? Math.min(1, 2.05 / units) : Math.min(1, 1.2 / units);
  const vars: Record<string, string> = fit ? { "--seal-px": `${fit.size.toFixed(2)}px` } : { "--seal-fit": rough.toFixed(2) };
  const style = vars as CSSProperties;
  const place = fit
    ? { x: (CENTER + fit.dx).toFixed(2), y: fit.y.toFixed(2), dominantBaseline: "alphabetic" as const }
    : { x: CENTER, y: CENTER, dominantBaseline: "central" as const };

  return (
    <svg ref={svg} viewBox="0 0 120 120" aria-hidden="true" data-count={letters.length} data-fit={fit ? "measured" : "rough"} style={style}>
      <defs>
        <radialGradient id="seal-light" cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      <path className="seal-wax" d={EDGE} />
      <path className="seal-light" d={EDGE} fill="url(#seal-light)" />
      <circle className="seal-ring" cx="60" cy="60" r="37" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="2.4" />
      <circle className="seal-ring" cx="60" cy="61" r="37" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
      {/* Atrás das iniciais, um contorno num tom escuro da própria cera: só quando a tinta é clara e a cera também (ver sealNeedsEdge). */}
      {edge ? (
        <text className="seal-initials seal-initials-edge" textAnchor="middle" {...place}>
          {text}
        </text>
      ) : null}
      <text className="seal-initials" textAnchor="middle" {...place}>
        {text}
      </text>
    </svg>
  );
}
