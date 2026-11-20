import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Jornal: a primeira página de um jornal antigo. Cabeçalho em gótico com vinheta gravada, linha de edição entre fios
// duplos, o nome como manchete, o recado em duas colunas com capitular e a data num box de "Serviço".
// Os textos decorativos (nome do jornal, edição, previsão do tempo) mudam com o tipo de evento e são aria-hidden.

const r2 = (n: number) => Math.round(n * 100) / 100;

/** `short`: nome da edição no cartão estreito (celular de 320px), onde a linha de edição inteira não cabe a 11px. */
type Edition = { paper: string; edition: string; short?: string; weather: string };

const EDITIONS: Record<string, Edition> = {
  casamento: { paper: "Gazeta do Grande Dia", edition: "Edição extraordinária", short: "Edição extra", weather: "céu limpo, com chuva de arroz no fim da tarde." },
  aniversario: { paper: "Diário da Festa", edition: "Edição de aniversário", short: "Edição festiva", weather: "clima de festa, com pancadas de parabéns à noite." },
  "quinze-anos": { paper: "Correio dos Quinze", edition: "Edição de gala", weather: "noite estrelada, com valsa no começo da madrugada." },
  cha: { paper: "Folha da Boa Nova", edition: "Edição da tarde", weather: "tarde amena, com grande chance de fofura." },
  formatura: { paper: "Tribuna do Canudo", edition: "Edição de colação", weather: "chuva de capelos e de aplausos em toda a região." },
  outro: { paper: "Gazeta do Grande Dia", edition: "Edição especial", weather: "tempo bom, com alegria em toda a região." },
};

const editionOf = (eventType?: string): Edition => EDITIONS[eventType ?? ""] ?? EDITIONS.outro;

/** Raios da vinheta: cunhas que afinam para fora, alternando comprido e curto, com centro em (cx, cy). */
function rays(cx: number, cy: number): string {
  const out: string[] = [];
  for (let a = 12, i = 0; a <= 168.01; a += 9.75, i++) {
    const long = i % 2 === 0;
    const r0 = 17.5;
    const r1 = long ? 29.5 : 24;
    const w0 = long ? 2.1 : 1.5; // meia-abertura, em graus, na base
    const w1 = 0.25;
    const pt = (deg: number, r: number) => `${r2(cx + Math.cos((deg * Math.PI) / 180) * r)} ${r2(cy - Math.sin((deg * Math.PI) / 180) * r)}`;
    out.push(`M${pt(a - w0, r0)}L${pt(a - w1, r1)}L${pt(a + w1, r1)}L${pt(a + w0, r0)}Z`);
  }
  return out.join("");
}

const ring = (cx: number, cy: number) =>
  `M${cx - 7.5} ${cy}a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0zM${cx - 5.5} ${cy - 0.55}a5.5 5.5 0 1 1 11 0a5.5 5.5 0 1 1-11 0z`;

/** Figura central da vinheta, em xilogravura: silhueta cheia com cortes na cor do papel. Cabe num círculo de raio 13 em (48, 24). */
function Motif({ eventType, u }: { eventType?: string; u: string }) {
  const paper = { stroke: "var(--paper)", fill: "none", strokeLinecap: "round" as const };
  if (eventType === "casamento") {
    const a = ring(43.4, 25.5);
    const b = ring(52.6, 25.5);
    return (
      <g fillRule="evenodd">
        <clipPath id={`jornal-ring-${u}`}>
          <rect x="30" y="25.5" width="36" height="14" />
        </clipPath>
        <circle cx="43.4" cy="25.2" r="6.5" {...paper} strokeWidth="4.4" />
        <path d={a} />
        <circle cx="52.6" cy="25.2" r="6.5" {...paper} strokeWidth="4.4" />
        <path d={b} />
        <g clipPath={`url(#jornal-ring-${u})`}>
          <circle cx="43.4" cy="25.2" r="6.5" {...paper} strokeWidth="4.4" />
          <path d={a} />
        </g>
        {/* brilhante sobre a aliança da direita */}
        <path d="M52.6 12.2l2.5 2.6-2.5 3.4-2.5-3.4z" stroke="var(--paper)" strokeWidth="0.9" paintOrder="stroke" />
      </g>
    );
  }
  if (eventType === "aniversario") {
    return (
      <g>
        <path d="M35 32.6h26q-1.8 2.6-13 2.6t-13-2.6z" />
        <path d="M38 25.4h20v6.4h-20zM41.6 19.6h12.8v5h-12.8z" />
        <path d="M38 27.6q1.67 1.9 3.33 0t3.34 0 3.33 0 3.33 0 3.34 0 3.33 0M41.6 21.5q1.6 1.7 3.2 0t3.2 0 3.2 0 3.2 0" {...paper} strokeWidth="0.9" />
        <path d="M43.9 15.4h1.3v3.6h-1.3zM47.35 14.6h1.3v4.4h-1.3zM50.8 15.4h1.3v3.6h-1.3z" />
        <path d="M44.55 11.2c1.2 1.4 1.2 2.5 0 3.3-1.2-.8-1.2-1.9 0-3.3zM48 10.2c1.3 1.5 1.3 2.7 0 3.5-1.3-.8-1.3-2 0-3.5zM51.45 11.2c1.2 1.4 1.2 2.5 0 3.3-1.2-.8-1.2-1.9 0-3.3z" />
      </g>
    );
  }
  if (eventType === "cha") {
    return (
      <g>
        <path d="M34 32.4h27q-2 2.9-13.5 2.9T34 32.4z" />
        <path d="M38.2 20.4h18.6c0 6.8-3.3 10.9-9.3 10.9s-9.3-4.1-9.3-10.9z" />
        <path d="M56.2 21.6c4.6-.7 5.9 2 4.9 4.5-.9 2.2-3.5 3.3-6.3 3.1l.6-1.7c1.9.1 3.4-.6 4-2 .6-1.5-.3-2.7-3.1-2.3z" />
        <path d="M40.6 23.3h13.8" {...paper} strokeWidth="0.9" />
        <path d="M44.4 18c-1.9-1.8 1.7-3.4-.1-5.8 2.9 2-.5 3.8.1 5.8zM50.6 18c-1.9-1.8 1.7-3.4-.1-5.8 2.9 2-.5 3.8.1 5.8z" />
      </g>
    );
  }
  if (eventType === "formatura") {
    return (
      <g>
        <path d="M48 12.6l14 5.4-14 5.4-14-5.4z" />
        <path d="M40.2 21.9v5.6c0 1.9 3.5 3.4 7.8 3.4s7.8-1.5 7.8-3.4v-5.6L48 24.9z" />
        <path d="M48 18l10.4 1.5v6.6" fill="none" stroke="var(--paper)" strokeWidth="2.4" />
        <path d="M48 18l10.4 1.5v6.6" fill="none" stroke="currentColor" strokeWidth="0.9" />
        <path d="M57.5 25.6h1.8l.9 5.4h-3.6z" stroke="var(--paper)" strokeWidth="0.8" paintOrder="stroke" />
        <circle cx="48" cy="18" r="1.3" stroke="var(--paper)" strokeWidth="0.7" />
      </g>
    );
  }
  if (eventType === "quinze-anos") {
    return (
      <g>
        <path d="M37.6 29.6l-2.4-11.4 6.3 5.2 6.5-9.8 6.5 9.8 6.3-5.2-2.4 11.4z" />
        <path d="M37.8 31h20.4v2.6H37.8z" />
        <circle cx="35.2" cy="17.4" r="1.5" />
        <circle cx="48" cy="12.6" r="1.7" />
        <circle cx="60.8" cy="17.4" r="1.5" />
        <path d="M48 20.6l1.9 2.6-1.9 2.6-1.9-2.6z" fill="var(--paper)" />
      </g>
    );
  }
  // padrão: sol nascente
  return (
    <g>
      <path d="M37.5 34a10.5 10.5 0 0 1 21 0z" />
      <path d="M41.3 34a6.7 6.7 0 0 1 13.4 0" {...paper} strokeWidth="0.9" />
      <path d="M45 34a3 3 0 0 1 6 0" {...paper} strokeWidth="0.9" />
    </g>
  );
}

/** Vinheta do cabeçalho: raios, a figura do evento e um fio que engrossa no meio. */
function Emblem({ eventType }: { eventType?: string }) {
  const u = useUid();
  return (
    <svg className="jornal-emblem" viewBox="0 0 96 40" width="96" height="40" fill="currentColor" aria-hidden="true">
      <path d={rays(48, 34)} />
      <Motif eventType={eventType} u={u} />
      <path d="M4 37.2Q26 35.5 48 35.9Q70 35.5 92 37.2Q70 38.9 48 38.5Q26 38.9 4 37.2Z" />
    </svg>
  );
}

/** Fio inglês: dois fusos que engrossam no meio, com estrela e losangos ao centro. */
function Rule() {
  return (
    <svg className="jornal-rule" viewBox="0 0 180 14" width="180" height="14" fill="currentColor" aria-hidden="true">
      <path d="M2 7Q40 4.9 70 7Q40 9.1 2 7ZM178 7Q140 4.9 110 7Q140 9.1 178 7Z" />
      <path d="M77 4.6l1.9 2.4-1.9 2.4-1.9-2.4zM103 4.6l1.9 2.4-1.9 2.4-1.9-2.4z" />
      <path d="M90 .6l1.62 4.17 4.47.25-3.47 2.83 1.14 4.33L90 9.75l-3.76 2.43 1.14-4.33-3.47-2.83 4.47-.25z" />
    </svg>
  );
}

/** Ícone da previsão do tempo: sol com raios em cunha atrás de uma nuvem cheia. */
function Weather() {
  return (
    <svg className="jornal-weather-icon" viewBox="0 0 34 26" width="34" height="26" fill="currentColor" aria-hidden="true">
      <path d="M21 4.2a6.3 6.3 0 0 1 5.9 8.6 6 6 0 0 0-3.6-1.5 7.6 7.6 0 0 0-6.6-5A6.3 6.3 0 0 1 21 4.2z" />
      <path d="M20.5.4h1l-.2 2.5h-.6zM28.6 2.8l.8.6-1.7 1.9-.5-.4zM32.9 9.6l.1 1-2.5.3-.1-.6zM12.9 3.4l.8-.6 1.4 2.1-.5.4zM31.3 16.3l-.6.8-2-1.5.4-.5z" />
      <path d="M7.8 24.5a5.3 5.3 0 0 1-.6-10.56 7 7 0 0 1 13.56-1.24 5.9 5.9 0 0 1 1.74 11.8z" />
      <path d="M8.5 20.8h13" stroke="var(--paper)" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Retícula de fundo: pontos em 45° que crescem para os cantos, como a sombra de um clichê. */
function Halftone({ u }: { u: string }) {
  const dots = (id: string, r: number) => (
    <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="4.5" cy="4.5" r={r} fill="currentColor" />
    </pattern>
  );
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        {dots(`jornal-dots-a-${u}`, 1)}
        {dots(`jornal-dots-b-${u}`, 2)}
        {dots(`jornal-dots-c-${u}`, 3)}
        <linearGradient id={`jornal-fade-b-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#000" />
          <stop offset="0.7" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id={`jornal-fade-c-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.14" stopColor="#000" />
          <stop offset="0.86" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`jornal-mask-b-${u}`} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#jornal-fade-b-${u})`} />
        </mask>
        <mask id={`jornal-mask-c-${u}`} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#jornal-fade-c-${u})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#jornal-dots-a-${u})`} />
      <rect width="100%" height="100%" fill={`url(#jornal-dots-b-${u})`} mask={`url(#jornal-mask-b-${u})`} />
      <rect width="100%" height="100%" fill={`url(#jornal-dots-c-${u})`} mask={`url(#jornal-mask-c-${u})`} />
    </svg>
  );
}

/** Forro do envelope: folha de jornal em viés. Colunas de texto, títulos, um clichê reticulado e um anúncio em moldura. */
function Newsprint({ u }: { u: string }) {
  // linhas de "texto": largura de cada linha de uma coluna de 40 unidades (a última de cada parágrafo é curta)
  const para = (x: number, y: number, widths: number[]) =>
    widths.map((w, i) => `M${x} ${r2(y + i * 3.4)}h${w}`).join("");
  const col1 = para(4, 21, [40, 40, 40, 40, 26]) + para(4, 42, [36, 40, 40, 40, 40, 40, 18]) + para(4, 96, [40, 40, 40, 31]);
  const col2 = para(52, 47, [40, 40, 40, 40, 40, 22]) + para(52, 71.4, [36, 40, 40, 40, 40, 40, 40, 28]) + para(52, 102.6, [40, 40, 14]);
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`jornal-tone-${u}`} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="1.2" cy="1.2" r="0.72" fill="currentColor" />
        </pattern>
        <pattern id={`jornal-sheet-${u}`} width="96" height="116" patternUnits="userSpaceOnUse" patternTransform="rotate(-14) scale(1.05)">
          {/* fios da página */}
          <path d="M0 2.5h96M0 4.5h96" stroke="currentColor" strokeWidth="0.5" />
          <path d="M48 8v106" stroke="currentColor" strokeWidth="0.35" />
          {/* coluna 1: título em duas linhas, texto, anúncio em moldura */}
          <path d="M4 10.5h40M4 15.5h29" stroke="currentColor" strokeWidth="3" />
          <path d={col1} stroke="currentColor" strokeWidth="1.15" />
          <rect x="4.6" y="68.6" width="38.8" height="22.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect x="6.6" y="70.6" width="34.8" height="18.8" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M12 76h24M15 81.5h18" stroke="currentColor" strokeWidth="2.2" />
          <path d="M18 86h12" stroke="currentColor" strokeWidth="1" />
          {/* coluna 2: clichê reticulado com legenda, texto */}
          <rect x="52" y="9" width="40" height="29" fill={`url(#jornal-tone-${u})`} />
          <path d="M52 38l12-13 8 7 7-10 13 16z" fill="currentColor" opacity="0.55" />
          <circle cx="82" cy="16" r="3.4" fill="currentColor" opacity="0.55" />
          <path d="M56 41.8h32" stroke="currentColor" strokeWidth="0.8" />
          <path d={col2} stroke="currentColor" strokeWidth="1.15" />
          <path d="M52 66.5h40" stroke="currentColor" strokeWidth="0.4" />
          <path d="M52 98h40" stroke="currentColor" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#jornal-sheet-${u})`} />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  const u = useUid();
  const ed = editionOf(eventType);
  if (slot === "top")
    return (
      <div className="jornal-mast" aria-hidden="true">
        <div className="jornal-ears">
          <span className="jornal-ear">Ano I</span>
          <Emblem eventType={eventType} />
          <span className="jornal-ear">N.º 1</span>
        </div>
        <div className="jornal-title" data-len={ed.paper.length > 18 ? "long" : "short"}>{ed.paper}</div>
        <div className="jornal-edition">
          <span className="jornal-edition-name" data-short={ed.short ? "true" : undefined}>
            <span>{ed.edition}</span>
            {ed.short ? <span>{ed.short}</span> : null}
          </span>
          <span className="jornal-edition-star" />
          <span>Preço: um abraço</span>
        </div>
        <div className="jornal-extra">
          <span>Extra!</span>
        </div>
      </div>
    );
  if (slot === "divider") return <Rule />;
  if (slot === "bottom")
    return (
      <div className="jornal-weather" aria-hidden="true">
        <Weather />
        <div className="jornal-weather-text">
          <b>Tempo</b>
          {ed.weather.charAt(0).toUpperCase() + ed.weather.slice(1)}
        </div>
      </div>
    );
  if (slot === "backdrop") return <Halftone u={u} />;
  if (slot === "liner") return <Newsprint u={u} />;
  return null;
}

export const def: TemplateDef = {
  id: "jornal",
  name: "Jornal",
  description: "Primeira página de jornal antigo: o convite vira manchete",
  premium: true,
  suits: ["casamento", "aniversario", "quinze-anos", "cha", "formatura", "outro"],
  palettes: [
    { id: "papel", name: "Papel-jornal e preto", vars: { bg: "#D5CEBC", paper: "#F2ECDB", ink: "#1B1A17", soft: "#57514A", accent: "#9E2B20", line: "#BDB49F", btnInk: "#F2ECDB", seal: "#9E2B20", sealInk: "#F7EBD3", liner: "#E7DFCB" } },
    { id: "sepia", name: "Sépia", vars: { bg: "#D3BF9C", paper: "#F0E3C8", ink: "#35210F", soft: "#6A4E33", accent: "#8A4A1C", line: "#C8B189", btnInk: "#F0E3C8", seal: "#5C3416", sealInk: "#F2DFB9", liner: "#E3D0AA" } },
    { id: "salmao", name: "Rosa-salmão", vars: { bg: "#EBC6AE", paper: "#FBE4D3", ink: "#211A1B", soft: "#644E49", accent: "#0E5A66", line: "#E0BCA6", btnInk: "#FBE4D3", seal: "#0E5A66", sealInk: "#FBE8DA", liner: "#F4D0BA" } },
    { id: "noite", name: "Azul-noite invertido", vars: { bg: "#0A111F", paper: "#131C2F", ink: "#F1EBDA", soft: "#B9BBBE", accent: "#E3C378", line: "#3B4763", btnInk: "#131C2F", seal: "#C7A24B", sealInk: "#1B2236", liner: "#22314F" } },
  ],
  Art,
};
