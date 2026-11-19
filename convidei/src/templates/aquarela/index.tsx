import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";

// Aquarela: manchas pintadas no canto de cima e no canto de baixo do cartão, sangrando para fora do papel,
// com ramos de folhas em traço fino por cima. O texto fica em área limpa, no meio.
// Os filtros (feTurbulence + feDisplacementMap) são estáticos: o SVG é rasterizado uma vez e nunca anima.

const A: CSSProperties = { fill: "var(--accent)" }; // pigmento principal
const B: CSSProperties = { fill: "var(--seal)" }; // pigmento mais escuro
const MULTIPLY: CSSProperties = { mixBlendMode: "multiply" };
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Borda irregular, grão do pigmento e acúmulo de tinta na beirada (o que faz parecer pintura, e não degradê). */
function WashFilter({ id, seed, warp = 44 }: { id: string; seed: number; warp?: number }) {
  return (
    <filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves={3} seed={seed} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={warp} xChannelSelector="R" yChannelSelector="G" result="shape" />
      <feTurbulence type="fractalNoise" baseFrequency="0.085" numOctaves={2} seed={seed + 5} result="tooth" />
      <feDisplacementMap in="shape" in2="tooth" scale={7} xChannelSelector="G" yChannelSelector="R" result="edge" />
      <feGaussianBlur in="edge" stdDeviation={0.6} result="wet" />
      <feGaussianBlur in="edge" stdDeviation={5} result="inner" />
      <feComposite in="wet" in2="inner" operator="arithmetic" k1={0} k2={1.9} k3={-1.05} k4={0} result="pooled" />
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={4} seed={seed + 11} result="noise" />
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 0.08" result="grain" />
      <feComposite in="pooled" in2="grain" operator="in" />
    </filter>
  );
}

const LEAF = "M0 0C7-8.5 19-9 28 0C19 8.5 7 8 0 0Z";
type Pt = [number, number];
type Stem = [Pt, Pt, Pt, Pt];
type LeafAt = { x: number; y: number; rot: number; s: number };

/** Folhas alternadas ao longo de uma haste (curva de Bézier cúbica), diminuindo em direção à ponta. */
function leavesAlong(p: Stem, count: number, size: number): LeafAt[] {
  const at = (t: number, k: 0 | 1) => (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k];
  const out: LeafAt[] = [];
  for (let i = 0; i <= count; i++) {
    const t = 0.16 + (0.84 * i) / count;
    const e = 0.01;
    const t2 = Math.min(1, t + e);
    const angle = (Math.atan2(at(t2, 1) - at(t - e, 1), at(t2, 0) - at(t - e, 0)) * 180) / Math.PI;
    const tip = i === count;
    const side = i % 2 === 0 ? -1 : 1;
    out.push({ x: r1(at(t, 0)), y: r1(at(t, 1)), rot: r1(tip ? angle : angle + side * (46 + (i % 3) * 6)), s: Math.round(size * (1 - 0.42 * t) * 100) / 100 });
  }
  return out;
}

type SprigDef = { stem: Stem; count: number; size: number };
const stemPath = (p: Stem) => `M${p[0][0]} ${p[0][1]}C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;
const leafTransform = (l: LeafAt) => `translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`;

/** A cor das folhas: entra no grupo filtrado, por baixo do traço. */
function SprigPaint({ sprig, tone }: { sprig: SprigDef; tone: CSSProperties }) {
  return (
    <g style={tone} fillOpacity={0.62}>
      {leavesAlong(sprig.stem, sprig.count, sprig.size).map((l, i) => (
        <path key={i} d={LEAF} transform={leafTransform(l)} />
      ))}
    </g>
  );
}

/** O desenho a traço, levemente deslocado da cor (como em aquarela com nanquim). */
function SprigLine({ sprig, shift = [2, -1.5] }: { sprig: SprigDef; shift?: Pt }) {
  return (
    <g transform={`translate(${shift[0]} ${shift[1]})`}>
      <path d={stemPath(sprig.stem)} />
      {leavesAlong(sprig.stem, sprig.count, sprig.size).map((l, i) => (
        <g key={i} transform={leafTransform(l)}>
          <path d={LEAF} vectorEffect="non-scaling-stroke" />
          <path d="M1 0C9-1 17-.6 23 0" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
}

const lineStyle: CSSProperties = { stroke: "color-mix(in srgb, var(--seal) 62%, var(--ink))" };

// ───── Canto de cima (esquerda): a mancha-herói ─────
const TOP_MAIN: SprigDef = { stem: [[-6, 16], [40, 18], [94, 32], [134, 68]], count: 4, size: 1.45 };
const TOP_SMALL: SprigDef = { stem: [[168, -6], [192, 10], [232, 20], [278, 16]], count: 3, size: 1.0 };

function TopWash() {
  return (
    <svg viewBox="0 0 440 220" width="100%" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      <defs>
        <WashFilter id="aquarela-wash-top" seed={7} />
        <linearGradient id="aquarela-fade-top" x1="200" y1="0" x2="450" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.34} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.1} />
        </linearGradient>
        <radialGradient id="aquarela-pool-top" cx="40" cy="20" r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.26} />
          <stop offset="0.7" style={{ stopColor: "var(--accent)" }} stopOpacity={0.42} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <g filter="url(#aquarela-wash-top)">
        {/* véu claro que escorre para a direita */}
        <path d="M196-50H490V44C452 62 414 40 372 52C330 64 298 38 256 34C226 30 204-6 196-50Z" fill="url(#aquarela-fade-top)" />
        {/* mancha principal */}
        <path d="M-50-50H262C270 4 238 36 198 50C160 64 150 94 112 106C74 118 30 106-50 118Z" fill="url(#aquarela-pool-top)" style={MULTIPLY} />
        {/* segunda cor, por cima, no canto */}
        <path d="M-50-50H132C138-4 110 28 80 42C52 56 30 86-50 96Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.3} />
        <ellipse cx="300" cy="30" rx="44" ry="20" style={{ ...B, ...MULTIPLY }} fillOpacity={0.16} />
        {/* folhas pintadas */}
        <g style={MULTIPLY}>
          <SprigPaint sprig={TOP_MAIN} tone={B} />
          <SprigPaint sprig={TOP_SMALL} tone={A} />
        </g>
      </g>
      {/* respingos: fora do filtro, para caírem sempre no mesmo lugar (longe do texto) */}
      <g style={A} fillOpacity={0.55}>
        <ellipse cx="238" cy="84" rx="3" ry="2.5" transform="rotate(-24 238 84)" />
        <circle cx="262" cy="70" r="1.3" />
        <circle cx="216" cy="100" r="1.5" />
        <ellipse cx="336" cy="74" rx="2" ry="1.6" transform="rotate(18 336 74)" />
      </g>
      <g fill="none" strokeWidth={0.85} strokeLinecap="round" strokeLinejoin="round" style={lineStyle} opacity={0.72}>
        <SprigLine sprig={TOP_MAIN} />
        <SprigLine sprig={TOP_SMALL} shift={[1.5, 2]} />
      </g>
    </svg>
  );
}

// ───── Canto de baixo (direita): eco menor da mancha de cima ─────
const BOT_MAIN: SprigDef = { stem: [[446, 140], [404, 136], [356, 122], [318, 92]], count: 3, size: 1.35 };

function BottomWash() {
  return (
    <svg viewBox="0 0 440 160" width="100%" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <defs>
        <WashFilter id="aquarela-wash-bottom" seed={23} warp={38} />
        <radialGradient id="aquarela-pool-bottom" cx="420" cy="150" r="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.28} />
          <stop offset="0.75" style={{ stopColor: "var(--accent)" }} stopOpacity={0.42} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.48} />
        </radialGradient>
      </defs>
      <g filter="url(#aquarela-wash-bottom)">
        <path d="M490 210H196C202 180 232 168 264 160C298 152 310 126 342 114C376 102 412 106 490 78Z" fill="url(#aquarela-pool-bottom)" />
        <path d="M490 210H330C334 184 358 172 386 164C414 156 440 142 490 132Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.3} />
        <path d="M70 210C80 190 112 184 142 188C162 190 176 200 180 210Z" style={A} fillOpacity={0.16} />
        <g style={MULTIPLY}>
          <SprigPaint sprig={BOT_MAIN} tone={B} />
        </g>
      </g>
      <g style={A} fillOpacity={0.55}>
        <ellipse cx="266" cy="136" rx="2.6" ry="2.1" transform="rotate(-20 266 136)" />
        <circle cx="240" cy="148" r="1.4" />
        <circle cx="292" cy="120" r="1.3" />
      </g>
      <g fill="none" strokeWidth={0.85} strokeLinecap="round" strokeLinejoin="round" style={lineStyle} opacity={0.72}>
        <SprigLine sprig={BOT_MAIN} shift={[-2, -1.5]} />
      </g>
    </svg>
  );
}

// ───── Divisor: um raminho a traço, o único detalhe além das manchas ─────
function Twig() {
  const half = (
    <>
      <path d="M48 8C38 8 28 8 6 8" />
      <path d="M34 8C30 3.5 24 2.6 20 4.6C23.5 8 29.5 9 34 8Z" />
      <path d="M22 8C18 12.2 12.6 12.8 9 11C12 7.8 17.6 7 22 8Z" />
    </>
  );
  return (
    <svg viewBox="0 0 112 16" width="100" height="14.3" fill="none" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" style={lineStyle} aria-hidden="true">
      {half}
      <g transform="translate(112 0) scale(-1 1)">{half}</g>
      <circle cx="56" cy="8" r="1.7" style={A} stroke="none" />
    </svg>
  );
}

// ───── Forro do envelope: aguada inteira, mais escura no alto ─────
const LINER_L: SprigDef = { stem: [[-4, 20], [40, 26], [92, 44], [134, 84]], count: 6, size: 0.92 };
const LINER_R: SprigDef = { stem: [[354, 20], [310, 26], [258, 44], [216, 84]], count: 6, size: 0.92 };

function Liner() {
  return (
    <svg viewBox="0 0 350 250" width="100%" height="100%" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <WashFilter id="aquarela-wash-liner" seed={41} warp={36} />
      </defs>
      <g filter="url(#aquarela-wash-liner)">
        <path d="M-40-40H390V52C340 86 300 60 262 84C228 106 204 150 172 152C142 154 126 108 92 88C56 68 14 84-40 54Z" style={A} fillOpacity={0.5} />
        <path d="M-40-40H170C176-8 150 14 118 22C84 30 40 26-40 44Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.34} />
        <path d="M390-40H214C210-4 238 18 270 24C306 30 350 22 390 40Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.26} />
        <g style={MULTIPLY}>
          <SprigPaint sprig={LINER_L} tone={B} />
          <SprigPaint sprig={LINER_R} tone={B} />
        </g>
      </g>
      <g fill="none" strokeWidth={0.85} strokeLinecap="round" strokeLinejoin="round" style={lineStyle} opacity={0.7}>
        <SprigLine sprig={LINER_L} />
        <SprigLine sprig={LINER_R} shift={[-2, -1.5]} />
      </g>
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <TopWash />;
  if (slot === "divider") return <Twig />;
  if (slot === "bottom") return <BottomWash />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "aquarela",
  name: "Aquarela",
  description: "Manchas de aquarela, ramos a traço e nomes em caligrafia",
  premium: true,
  suits: ["casamento", "cha", "quinze-anos"],
  palettes: [
    { id: "rosa", name: "Rosa seco e malva", vars: { bg: "#F2E7E4", paper: "#FFFBF8", ink: "#4A3541", soft: "#7B5E6B", accent: "#CF8892", line: "#EBD5D5", btnInk: "#FFFFFF", seal: "#9B6F8D", sealInk: "#F9E8E8", liner: "#EDD5D7" } },
    { id: "azul", name: "Azul sereno", vars: { bg: "#E3E9EE", paper: "#FBFCFB", ink: "#2F3E4E", soft: "#566879", accent: "#8FAAC3", line: "#D3DEE8", btnInk: "#FFFFFF", seal: "#5F7A96", sealInk: "#EEF3F7", liner: "#CCD9E5" } },
    { id: "salvia", name: "Sálvia", vars: { bg: "#E6EADF", paper: "#FCFBF5", ink: "#35402F", soft: "#5E6A54", accent: "#9FB291", line: "#D7DFCC", btnInk: "#FFFFFF", seal: "#6F8563", sealInk: "#F1F4EA", liner: "#D4DDC7" } },
    { id: "pessego", name: "Pêssego", vars: { bg: "#F6E8DD", paper: "#FFFAF4", ink: "#4E372D", soft: "#805F4F", accent: "#E6A785", line: "#F1D8C7", btnInk: "#FFFFFF", seal: "#C57F64", sealInk: "#FCEEE3", liner: "#F4D7C4" } },
  ],
  Art,
};
