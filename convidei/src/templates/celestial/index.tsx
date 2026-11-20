import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Celestial: carta do céu impressa em metal sobre papel noturno. Motivo-herói: o arco zodiacal que abraça os nomes
// (domo em cima, horizonte embaixo). Coadjuvantes: as fases da lua no topo, a carta de constelações em tom sobre tom
// no papel e a moldura de cantos côncavos com uma estrela em cada um.

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Estrela de quatro pontas com lados côncavos, centrada em (x, y). rx/ry são as pontas; k (0..1) é a cintura. */
function star4(x: number, y: number, ry: number, rx = ry, k = 0.16): string {
  const a = r2(rx * k);
  const b = r2(ry * k);
  return `M${r2(x)} ${r2(y - ry)}Q${r2(x + a)} ${r2(y - b)} ${r2(x + rx)} ${r2(y)}Q${r2(x + a)} ${r2(y + b)} ${r2(x)} ${r2(y + ry)}Q${r2(x - a)} ${r2(y + b)} ${r2(x - rx)} ${r2(y)}Q${r2(x - a)} ${r2(y - b)} ${r2(x)} ${r2(y - ry)}Z`;
}

/** Paradas do metal: saem das variáveis --cel-foil-* do CSS, que derivam da paleta. */
function Foil({ id, x1 = 0, x2 }: { id: string; x1?: number; x2: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1="0" x2={x2} y2="0">
      <stop offset="0" style={{ stopColor: "var(--cel-foil-d)" }} />
      <stop offset="0.28" style={{ stopColor: "var(--cel-foil-m)" }} />
      <stop offset="0.5" style={{ stopColor: "var(--cel-foil-l)" }} />
      <stop offset="0.72" style={{ stopColor: "var(--cel-foil-m)" }} />
      <stop offset="1" style={{ stopColor: "var(--cel-foil-d)" }} />
    </linearGradient>
  );
}

/* ───────── Carta do céu (tom sobre tom): constelações traçadas, com o fio parando antes de cada estrela ───────── */
type Star = [x: number, y: number, mag: 1 | 2 | 3];
type Figure = { at: [number, number]; stars: Star[]; edges: [number, number][] };

const FIGURES: Figure[] = [
  // Cassiopeia
  { at: [16, 20], stars: [[0, 14, 2], [15, 30, 3], [30, 16, 2], [46, 32, 2], [60, 10, 3]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  // Ursa Maior (o Carro)
  { at: [104, 84], stars: [[0, 22, 2], [4, 40, 2], [24, 42, 3], [30, 24, 2], [46, 15, 2], [62, 10, 3], [78, 0, 2]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]] },
  // Cisne (a Cruz do Norte)
  { at: [22, 150], stars: [[36, 0, 3], [31, 21, 2], [26, 43, 2], [20, 66, 3], [2, 31, 2], [59, 12, 2]], edges: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]] },
  // Coroa Boreal
  { at: [122, 190], stars: [[0, 0, 2], [4, 16, 2], [16, 27, 3], [32, 29, 2], [46, 20, 2], [52, 4, 2]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
];
const DUST: Star[] = [
  [96, 14, 1], [128, 40, 2], [176, 22, 1], [150, 62, 1], [60, 78, 1], [22, 104, 2], [84, 122, 1], [188, 138, 1], [108, 158, 1],
  [150, 172, 1], [10, 236, 1], [92, 232, 2], [190, 236, 1], [70, 252, 1], [6, 66, 1], [194, 76, 1], [142, 248, 1], [48, 136, 1],
];
const MAG = { 1: 0.9, 2: 2.3, 3: 3.5 } as const;

function chartPaths(): { lines: string; stars: string; dots: Star[] } {
  const lines: string[] = [];
  const stars: string[] = [];
  const dots: Star[] = [];
  const put = ([x, y, m]: Star) => (m === 1 ? dots.push([x, y, m]) : stars.push(star4(x, y, MAG[m], MAG[m] * 0.82, 0.2)));
  for (const fig of FIGURES) {
    const abs = fig.stars.map(([x, y, m]) => [x + fig.at[0], y + fig.at[1], m] as Star);
    abs.forEach(put);
    for (const [i, j] of fig.edges) {
      const [x1, y1, m1] = abs[i];
      const [x2, y2, m2] = abs[j];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const g1 = (MAG[m1] + 1.6) / len;
      const g2 = (MAG[m2] + 1.6) / len;
      lines.push(`M${r2(x1 + (x2 - x1) * g1)} ${r2(y1 + (y2 - y1) * g1)}L${r2(x2 - (x2 - x1) * g2)} ${r2(y2 - (y2 - y1) * g2)}`);
    }
  }
  DUST.forEach(put);
  return { lines: lines.join(""), stars: stars.join(""), dots };
}
const CHART = chartPaths();

function Chart({ id, scale, className }: { id: string; scale: number; className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width="200" height="260" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <path d={CHART.lines} fill="none" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
          <path d={CHART.stars} fill="currentColor" />
          {CHART.dots.map(([x, y]) => (
            <circle key={`${x}_${y}`} cx={x} cy={y} r="0.9" fill="currentColor" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ───────── Fases da lua ───────── */
/** Parte iluminada (lado direito) de uma lua de raio r com fração iluminada k (0..1). */
function lit(cx: number, cy: number, r: number, k: number): string {
  const rx = r2(r * Math.abs(1 - 2 * k));
  return `M${cx} ${r2(cy - r)}A${r} ${r} 0 0 1 ${cx} ${r2(cy + r)}A${rx} ${r} 0 0 ${k < 0.5 ? 0 : 1} ${cx} ${r2(cy - r)}Z`;
}

function Moons({ className = "cel-moons" }: { className?: string }) {
  const u = useUid();
  const foil = `url(#cel-foil-moons-${u})`;
  const cy = 17;
  // do centro para fora: cheia, gibosa, quarto, crescente fina
  const side: { dx: number; r: number; k: number }[] = [
    { dx: 29, r: 7.2, k: 0.78 },
    { dx: 51.5, r: 6, k: 0.5 },
    { dx: 70.5, r: 5, k: 0.2 },
  ];
  return (
    <svg className={className} viewBox="0 0 200 34" fill="none" aria-hidden="true">
      <defs>
        <Foil id={`cel-foil-moons-${u}`} x1={8} x2={192} />
      </defs>
      {/* lua cheia: halo pontilhado, disco e mares */}
      <circle cx="100" cy={cy} r="14.4" stroke={foil} strokeWidth="0.7" strokeDasharray="0.1 3.67" strokeLinecap="round" />
      <circle cx="100" cy={cy} r="10.6" fill={foil} />
      <g className="cel-maria">
        <circle cx="96.2" cy="13.4" r="2.9" />
        <circle cx="103.6" cy="19.6" r="3.6" />
        <circle cx="103.2" cy="11.2" r="1.3" />
        <circle cx="95.4" cy="21.4" r="1.5" />
      </g>
      {side.map(({ dx, r, k }) => (
        <g key={dx}>
          {/* esquerda: crescendo, iluminada do lado de dentro */}
          <circle cx={100 - dx} cy={cy} r={r} stroke={foil} strokeWidth="0.6" opacity="0.55" />
          <path d={lit(100 - dx, cy, r, k)} fill={foil} />
          {/* direita: minguando (espelho) */}
          <g transform="translate(200 0) scale(-1 1)">
            <circle cx={100 - dx} cy={cy} r={r} stroke={foil} strokeWidth="0.6" opacity="0.55" />
            <path d={lit(100 - dx, cy, r, k)} fill={foil} />
          </g>
        </g>
      ))}
      <path d={star4(12, cy, 4.6, 3.4) + star4(188, cy, 4.6, 3.4)} fill={foil} />
      <path d="M21 17h0M179 17h0" stroke={foil} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── Arco zodiacal ───────── */
// Signos em traço de pena, numa caixa de 9 × 9 centrada na origem.
const SIGNS: Record<string, { d: string; dots?: [number, number, number][] }> = {
  aries: { d: "M-4 -1.4C-4 -4.6-.5-4.6 0-1.2V4.2M4-1.4C4-4.6.5-4.6 0-1.2" },
  touro: { d: "M-3.7-4.2C-2.7-1.2 2.7-1.2 3.7-4.2M2.5 1.5A2.5 2.5 0 1 1-2.5 1.5A2.5 2.5 0 1 1 2.5 1.5" },
  gemeos: { d: "M-3.6-4.1C-1.3-3 1.3-3 3.6-4.1M-3.6 4.1C-1.3 3 1.3 3 3.6 4.1M-1.5-3.2V3.2M1.5-3.2V3.2" },
  cancer: { d: "M-4-1.1C-2.4-4.3 2.4-4 4-2.5M4 1.1C2.4 4.3-2.4 4-4 2.5", dots: [[-2.5, -0.7, 1.35], [2.5, 0.7, 1.35]] },
  leao: { d: "M-.9 1.2A1.55 1.55 0 1 1-4 1.2A1.55 1.55 0 1 1-.9 1.2M-1.2.3C-2.9-2.2-1.7-4.2.4-4.2C2.7-4.2 3.3-1.9 2.3.3C1.4 2.2 1.9 4.1 4.1 3.5" },
  virgem: { d: "M-4.3-3.5C-3.4-3.7-3.1-3.1-3.1-2.1V3M-3.1-2.1C-3.1-4.3-.9-4.3-.9-2.1V3M-.9-2.1C-.9-4.3 1.3-4.3 1.3-2.1V2.1C1.3 3.5 2.3 4.2 3.4 4.2M1.3-.7C2.9-2.2 4.5-1.1 4.1.6C3.7 2.3 1.9 3.5.3 4.2" },
  libra: { d: "M-4.1 3.7H4.1M-4.1 1.1H-1.7C-3.5-.5-2.4-3.8 0-3.8S3.5-.5 1.7 1.1H4.1" },
  escorpiao: { d: "M-4.3-3.5C-3.4-3.7-3.1-3.1-3.1-2.1V3M-3.1-2.1C-3.1-4.3-.9-4.3-.9-2.1V3M-.9-2.1C-.9-4.3 1.3-4.3 1.3-2.1V1.9C1.3 3.5 2.5 3.9 4.2 2.7M2.7 1.7L4.3 2.6L3.7 4.3" },
  sagitario: { d: "M-3.7 3.7L3.7-3.7M.2-3.7H3.7V-.2M-2.9-.7L.7 2.9" },
  capricornio: { d: "M-4.3-3.5L-2.3 1.5C-2.3-1.7-1.3-3.7.1-3.7C1.3-3.7 1.4-2.1 1.4-.5V2C1.4 3.4.3 4.2-.9 4.2M4.3 1.5A1.45 1.45 0 1 1 1.4 1.5A1.45 1.45 0 1 1 4.3 1.5" },
  aquario: { d: "M-4.2-1.1L-2.1-2.9 0-1.1 2.1-2.9 4.2-1.1M-4.2 2.9L-2.1 1.1 0 2.9 2.1 1.1 4.2 2.9" },
  peixes: { d: "M-3.3-4.1C-1.4-1.6-1.4 1.6-3.3 4.1M3.3-4.1C1.4-1.6 1.4 1.6 3.3 4.1M-3.5 0H3.5" },
};
// Os doze, na ordem do ano: Áries a Virgem à esquerda, Libra a Peixes à direita; a casa do meio é da estrela do zênite.
const DOME_SIGNS = ["aries", "touro", "gemeos", "cancer", "leao", "virgem", "", "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"];
const ZENITH = DOME_SIGNS.indexOf("");

const ARC = { cx: 150, rOut: 262, rIn: 247.5, half: 31, top: 13 };
const ARC_CY = ARC.top + ARC.rOut;
const onArc = (r: number, deg: number): [number, number] => [r2(ARC.cx + r * Math.sin(rad(deg))), r2(ARC_CY - r * Math.cos(rad(deg)))];
const arcPath = (r: number, from: number, to: number) => {
  const [x1, y1] = onArc(r, from);
  const [x2, y2] = onArc(r, to);
  return `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`;
};
const radial = (deg: number, r0: number, r1: number) => {
  const [x1, y1] = onArc(r0, deg);
  const [x2, y2] = onArc(r1, deg);
  return `M${x1} ${y1}L${x2} ${y2}`;
};

/** Domo: faixa do zodíaco com escala de graus por fora, casas com os signos e a estrela-guia no zênite. */
function Dome({ eventType }: { eventType?: string }) {
  const u = useUid();
  const foil = `url(#cel-foil-dome-${u})`;
  const { rOut, rIn, half } = ARC;
  const cells = DOME_SIGNS.length;
  const step = (2 * half) / cells;
  const ticks: string[] = [];
  for (let a = -half + 1; a <= half - 1 + 0.001; a += 2) {
    if (Math.abs(a) < 3.5) continue; // abre espaço para a estrela do zênite
    ticks.push(radial(a, rOut + 3, rOut + (Math.round(a) % 10 === 0 ? 7.5 : 5.2)));
  }
  const walls: string[] = [];
  for (let i = 0; i <= cells; i++) {
    if (i === ZENITH || i === ZENITH + 1) continue;
    walls.push(radial(-half + i * step, rIn, rOut));
  }
  const [zx, zy] = onArc((rOut + rIn) / 2, 0);
  const [ex, ey] = onArc((rOut + rIn) / 2, half + 2.2);
  // debutante: a estrela-guia ganha duas companheiras, que coroam a faixa por fora
  const trio = eventType === "quinze-anos";
  return (
    <svg className="cel-dome" viewBox={`0 0 300 ${r2(ARC_CY - rIn * Math.cos(rad(half)) + 6)}`} fill="none" aria-hidden="true">
      <defs>
        <Foil id={`cel-foil-dome-${u}`} x1={10} x2={290} />
      </defs>
      <path d={ticks.join("")} stroke={foil} strokeWidth="0.55" opacity="0.8" />
      <path d={arcPath(rOut, -half, half)} stroke={foil} strokeWidth="1.5" strokeLinecap="round" />
      <path d={arcPath(rIn, -half, half)} stroke={foil} strokeWidth="0.7" strokeLinecap="round" />
      <path d={walls.join("")} stroke={foil} strokeWidth="0.7" />
      {DOME_SIGNS.map((name, i) => {
        if (!name) return null;
        const a = -half + (i + 0.5) * step;
        const [x, y] = onArc((rOut + rIn) / 2, a);
        const sign = SIGNS[name];
        return (
          <g key={name} transform={`translate(${x} ${y}) rotate(${r2(a)}) scale(0.94)`} stroke={foil} strokeWidth="0.95" strokeLinecap="round" strokeLinejoin="round">
            <path d={sign.d} />
            {sign.dots?.map(([dx, dy, r]) => <circle key={`${dx}`} cx={dx} cy={dy} r={r} />)}
          </g>
        );
      })}
      {/* remates das pontas */}
      <path d={star4(ex, ey, 4.2, 3.2) + star4(300 - ex, ey, 4.2, 3.2)} fill={foil} />
      {/* zênite: a estrela recorta a faixa (contorno na cor do papel) e ganha um miolo claro */}
      <g className="cel-zenith">
        <path className="cel-cut" d={star4(zx, zy, 13, 8.2, 0.17)} />
        <path d={star4(zx, zy, 13, 8.2, 0.17)} fill={foil} />
        <path className="cel-glint" d={star4(zx, zy, 5.4, 3.2, 0.2)} />
        {trio ? <path d={star4(zx - 12.5, zy - 12.4, 5, 3.5) + star4(zx + 12.5, zy - 12.4, 5, 3.5)} fill={foil} /> : null}
      </g>
    </svg>
  );
}

/** Horizonte: o arco de baixo, mais leve (fio duplo e escala por dentro), que fecha a lente em volta dos nomes. */
function Horizon() {
  const u = useUid();
  const foil = `url(#cel-foil-hor-${u})`;
  const { rOut, half } = ARC;
  const rIn = rOut - 5;
  const ticks: string[] = [];
  for (let a = -half + 3; a <= half - 3 + 0.001; a += 2) {
    if (Math.abs(a) < 6.5) continue;
    ticks.push(radial(a, rIn - 2.6, rIn - (Math.round(a) % 10 === 0 ? 6.4 : 4.4)));
  }
  const [zx, zy] = onArc(rOut - 2.5, 0);
  const [ex, ey] = onArc(rOut - 2.5, half + 2.2);
  const h = r2(ey + 5);
  return (
    <svg className="cel-horizon" viewBox={`0 0 300 ${h}`} fill="none" aria-hidden="true">
      <defs>
        <Foil id={`cel-foil-hor-${u}`} x1={10} x2={290} />
      </defs>
      {/* o mesmo arco do domo, de ponta-cabeça */}
      <g transform={`translate(0 ${h}) scale(1 -1)`}>
        <path d={ticks.join("")} stroke={foil} strokeWidth="0.55" opacity="0.8" />
        <path d={arcPath(rOut, -half, -4.4) + arcPath(rOut, 4.4, half)} stroke={foil} strokeWidth="1.3" strokeLinecap="round" />
        <path d={arcPath(rIn, -half, -5.2) + arcPath(rIn, 5.2, half)} stroke={foil} strokeWidth="0.6" strokeLinecap="round" />
        <path d={star4(ex, ey, 3.6, 2.8) + star4(300 - ex, ey, 3.6, 2.8)} fill={foil} />
        <path d={star4(zx, zy, 8.6, 5.6, 0.18) + star4(zx - 12.5, zy + 0.5, 4, 2.8) + star4(zx + 12.5, zy + 0.5, 4, 2.8)} fill={foil} />
      </g>
    </svg>
  );
}

/* ───────── Moldura: canto côncavo com estrela (desenhado para o canto superior esquerdo; os outros são espelhados no CSS) ───────── */
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg className={`cel-corner cel-corner-${pos}`} viewBox="0 0 34 34" width="34" height="34" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M28.5.5A28 28 0 0 1 .5 28.5" strokeWidth="1" />
      <path d="M32.24 4.5A32 32 0 0 1 4.5 32.24" strokeWidth="0.6" opacity="0.7" />
      <path d={star4(9.4, 9.4, 6.4, 6.4, 0.18)} fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ───────── Emblema do pé do cartão: muda com o tipo de evento ───────── */
function Emblem({ eventType }: { eventType?: string }) {
  const u = useUid();
  const foil = `url(#cel-foil-emb-${u})`;
  const cx = 45;
  const cy = 24;
  const rays = (r0: number, r1: (i: number) => number, n: number, from = 0, to = 360) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = rad(from + ((to - from) * i) / (to === 360 && from === 0 ? n : n - 1));
      out.push(`M${r2(cx + Math.sin(a) * r0)} ${r2(cy - Math.cos(a) * r0)}L${r2(cx + Math.sin(a) * r1(i))} ${r2(cy - Math.cos(a) * r1(i))}`);
    }
    return out.join("");
  };
  let body;
  if (eventType === "casamento") {
    // sol e lua: o crescente abraça o disco do sol
    body = (
      <>
        <path d={rays(13.5, (i) => (i % 2 ? 17 : 20.5), 24)} stroke={foil} strokeWidth="0.8" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="10.4" fill={foil} />
        <path className="cel-shade" d={`M${cx + 2.2} ${cy - 10.2}A10.4 10.4 0 0 1 ${cx + 2.2} ${cy + 10.2}A12.6 12.6 0 0 0 ${cx + 2.2} ${cy - 10.2}Z`} />
        <path d={`M${cx + 2.2} ${cy - 10.2}A12.6 12.6 0 0 1 ${cx + 2.2} ${cy + 10.2}`} stroke={foil} strokeWidth="0.6" />
        <path className="cel-glint" d={star4(cx - 3.4, cy, 4.2, 3)} />
      </>
    );
  } else if (eventType === "aniversario") {
    // uma volta ao sol: disco, raios alternados e a órbita com um planeta
    body = (
      <>
        <path d={rays(9.5, (i) => (i % 2 ? 13 : 16.5), 16)} stroke={foil} strokeWidth="0.9" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6.6" fill={foil} />
        <ellipse cx={cx} cy={cy} rx="30" ry="8.4" stroke={foil} strokeWidth="0.6" transform={`rotate(-12 ${cx} ${cy})`} strokeDasharray="38 13 200" />
        <circle cx={cx + 28.4} cy={cy - 8.4} r="2.3" fill={foil} />
      </>
    );
  } else if (eventType === "quinze-anos") {
    // estrela-guia de oito pontas, com duas companheiras
    body = (
      <>
        <path d={star4(cx, cy, 10.5, 10.5, 0.3)} fill={foil} transform={`rotate(45 ${cx} ${cy})`} opacity="0.75" />
        <path d={star4(cx, cy, 20, 13, 0.14)} fill={foil} />
        <path className="cel-glint" d={star4(cx, cy, 7, 4.4, 0.2)} />
        <path d={star4(cx - 24, cy + 6, 5.2, 3.8) + star4(cx + 24, cy + 6, 5.2, 3.8) + star4(cx - 15, cy - 12, 3, 2.3) + star4(cx + 15, cy - 12, 3, 2.3)} fill={foil} />
      </>
    );
  } else {
    // lua crescente inclinada, em glória de raios, com a estrela na concavidade (o mesmo motivo do forro do envelope)
    const R = 13.6;
    const d = 5.4;
    const r = 10.9;
    const tx = (d * d + R * R - r * r) / (2 * d);
    const ty = Math.sqrt(R * R - tx * tx);
    const moon = `M${r2(cx + tx)} ${r2(cy - ty)}A${R} ${R} 0 1 0 ${r2(cx + tx)} ${r2(cy + ty)}A${r} ${r} 0 1 1 ${r2(cx + tx)} ${r2(cy - ty)}Z`;
    body = (
      <>
        <path d={rays(18.4, (i) => (i % 2 ? 20.6 : 23.4), 28)} stroke={foil} strokeWidth="0.8" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="16.2" stroke={foil} strokeWidth="0.7" strokeDasharray="0.1 3.39" strokeLinecap="round" />
        <path d={moon} fill={foil} transform={`rotate(-32 ${cx} ${cy})`} />
        <path d={star4(cx + 5, cy - 3.1, 6.2, 4.4, 0.17)} fill={foil} />
        <path d={star4(cx - 30, cy, 4.2, 3.2) + star4(cx + 30, cy, 4.2, 3.2)} fill={foil} />
        <path d={`M${cx - 38} ${cy}h0M${cx + 38} ${cy}h0`} stroke={foil} strokeWidth="1.3" strokeLinecap="round" />
      </>
    );
  }
  return (
    <svg className="cel-emblem" viewBox="0 0 90 48" width="90" height="48" fill="none" aria-hidden="true">
      <defs>
        <Foil id={`cel-foil-emb-${u}`} x1={8} x2={82} />
      </defs>
      {body}
    </svg>
  );
}

/* ───────── Forro do envelope: lua crescente em glória de raios, sobre céu estrelado ─────────
   O CSS gira o desenho em 180°, então a parte visível é o triângulo de baixo (0 100%, 100% 100%, 50% 42%). */
function Liner() {
  const cx = 140;
  const cy = 136;
  const beams: string[] = [];
  for (let i = 0; i < 36; i++) {
    const a = rad(i * 10);
    const long = i % 2 === 0;
    const r0 = 31;
    const r1 = long ? 250 : 58;
    const w = long ? 1.15 : 0.55; // meia abertura em graus: raio em cunha, fino na origem
    const p = (r: number, d: number) => `${r2(cx + Math.sin(a + rad(d)) * r)} ${r2(cy - Math.cos(a + rad(d)) * r)}`;
    beams.push(`M${p(r0, 0)}L${p(r1, -w)}L${p(r1, w)}Z`);
  }
  const sky: [number, number, number][] = [
    [140, 99, 3.4], [100, 122, 3], [180, 122, 3], [84, 160, 4.6], [196, 160, 4.6], [52, 178, 3], [228, 178, 3],
    [108, 184, 2.6], [172, 184, 2.6], [24, 190, 3.6], [256, 190, 3.6], [118, 174, 1.8], [162, 174, 1.8], [66, 190, 2], [214, 190, 2],
  ];
  return (
    <svg viewBox="0 0 280 200" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d={beams.join("")} fill="currentColor" opacity="0.34" />
      <circle cx={cx} cy={cy} r="26.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="0.1 3.7" strokeLinecap="round" />
      <circle className="cel-liner-disc" cx={cx} cy={cy} r="22.5" />
      {/* crescente deitado, pontas para cima, e a estrela no colo */}
      <path d={`M${cx - 18.6} ${cy - 5}A19.4 19.4 0 1 0 ${cx + 18.6} ${cy - 5}A20.6 16 0 0 1 ${cx - 18.6} ${cy - 5}Z`} fill="currentColor" />
      <path d={star4(cx, cy - 9.5, 9, 6, 0.17)} fill="currentColor" />
      <path d={sky.map(([x, y, r]) => star4(x, y, r, r * 0.76, 0.18)).join("")} fill="currentColor" />
      {/* filete que acompanha as duas bordas da aba */}
      <path d="M-6 204L140 87.5L286 204" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  const u = useUid();
  if (slot === "top")
    return (
      <>
        <Chart id={`cel-chart-paper-${u}`} scale={0.92} className="cel-chart" />
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Moons />
        <Dome eventType={eventType} />
      </>
    );
  // O divisor também assina o fecho da página: lá, em vez do horizonte, entram as fases da lua (o CSS escolhe).
  if (slot === "divider")
    return (
      <>
        <Horizon />
        <Moons className="cel-moons cel-sign-moons" />
      </>
    );
  if (slot === "bottom")
    return (
      <>
        <Emblem eventType={eventType} />
        <Corner pos="bl" />
        <Corner pos="br" />
      </>
    );
  if (slot === "backdrop") return <Chart id={`cel-chart-bg-${u}`} scale={1.5} />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "celestial",
  name: "Celestial",
  description: "Céu noturno com fases da lua, constelações e arco zodiacal em dourado",
  premium: true,
  suits: ["casamento", "quinze-anos", "aniversario", "outro"],
  palettes: [
    { id: "indigo", name: "Índigo e ouro", vars: { bg: "#0D0E34", paper: "#1F2060", ink: "#F5EEDD", soft: "#C0BEDA", accent: "#DFC07A", line: "#484A8C", btnInk: "#1F2060", seal: "#CDAA5A", sealInk: "#1E1F58", liner: "#3336A0" } },
    { id: "prata", name: "Preto e prata", vars: { bg: "#08090B", paper: "#15171B", ink: "#F4EFE5", soft: "#B4B7BE", accent: "#AAB4C6", line: "#43474F", btnInk: "#15171B", seal: "#A7B0C0", sealInk: "#17191D", liner: "#2C3038" } },
    { id: "ameixa", name: "Ameixa e cobre", vars: { bg: "#1C0A1B", paper: "#32122F", ink: "#F7EADF", soft: "#D2BBC9", accent: "#DB9A72", line: "#643A5C", btnInk: "#32122F", seal: "#B9774F", sealInk: "#2A0F27", liner: "#5A2052" } },
    { id: "petroleo", name: "Verde-petróleo e ouro", vars: { bg: "#051B21", paper: "#0B2F38", ink: "#F2ECDB", soft: "#B4C6C4", accent: "#D8B66C", line: "#2F5560", btnInk: "#0B2F38", seal: "#C7A452", sealInk: "#0A2B33", liner: "#12505E" } },
    { id: "marfim", name: "Marfim e azul-noite", vars: { bg: "#E2DAC7", paper: "#F8F2E3", ink: "#1A2050", soft: "#494E6F", accent: "#75561A", line: "#CFC09A", btnInk: "#F8F2E3", seal: "#1A2050", sealInk: "#E7CF95", liner: "#1A2050" } },
  ],
  Art,
};
