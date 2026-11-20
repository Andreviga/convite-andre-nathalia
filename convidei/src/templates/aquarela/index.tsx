import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Aquarela: manchas pintadas no canto de cima e no canto de baixo do cartão, sangrando para fora do papel,
// com ramos de folhas em traço de pena por cima. O texto fica em área limpa, no meio.
// Os filtros (feTurbulence + feDisplacementMap) são estáticos: o SVG é rasterizado uma vez e nunca anima.

const A: CSSProperties = { fill: "var(--accent)" }; // pigmento principal
const B: CSSProperties = { fill: "var(--seal)" }; // pigmento mais escuro
const PEN: CSSProperties = { fill: "color-mix(in srgb, var(--seal) 62%, var(--ink))", stroke: "color-mix(in srgb, var(--seal) 62%, var(--ink))" };
const MULTIPLY: CSSProperties = { mixBlendMode: "multiply" };
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Borda irregular, grão do pigmento e acúmulo de tinta na beirada (o que faz parecer pintura, e não degradê). Só para as manchas. */
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

/** Filtro das folhas pintadas: só treme a beirada e acumula tinta nela. Não desloca a cor para fora do traço. */
function LeafFilter({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="-6%" y="-10%" width="112%" height="120%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={2} seed={seed} result="tooth" />
      <feDisplacementMap in="SourceGraphic" in2="tooth" scale={4.5} xChannelSelector="R" yChannelSelector="G" result="edge" />
      <feGaussianBlur in="edge" stdDeviation={0.5} result="wet" />
      <feGaussianBlur in="edge" stdDeviation={2.4} result="inner" />
      <feComposite in="wet" in2="inner" operator="arithmetic" k1={0} k2={1.55} k3={-0.7} k4={0} />
    </filter>
  );
}

// ───── Ramos ─────
// Quatro desenhos de folha (base em 0,0; ponta para +x): cada um com a beirada de cima, a de baixo e a nervura.
type LeafShape = { up: string; lo: string; rib: string };
const LEAVES: LeafShape[] = [
  { up: "M0 0C6-9.6 19-10 28 0", lo: "C19 9 6 8.4 0 0", rib: "M2 0C9-1 16-.8 22-.2" }, // larga
  { up: "M0 0C8-5.6 21-6 31 0", lo: "C21 5 8 4.6 0 0", rib: "M2 0C10-.6 18-.4 25 0" }, // estreita
  { up: "M0 0C4-9 17-13 28-6", lo: "C23 3 9 6.5 0 0", rib: "M2-.4C9-1.2 18-2.6 24-4.6" }, // curvada
  { up: "M0 0C7-8.6 18-9.4 27-1.2", lo: "C18-2.4 8-1 0 0", rib: "M4 1.2C11 4.4 19 3.6 25 0" }, // dobrada: só meia folha, vista de lado
];
const leafFill = (l: LeafShape) => `${l.up}${l.lo}Z`;

type Pt = [number, number];
type Stem = [Pt, Pt, Pt, Pt];
type SprigDef = { stem: Stem; count: number; size: number; seed: number; berries?: number; bud?: boolean; thick?: number };
type LeafAt = { x: number; y: number; rot: number; s: number; flip: 1 | -1; kind: number; ink: number };
type BerryAt = { stalk: string; cx: number; cy: number; r: number };
type Sprig = { stem: string; leaves: LeafAt[]; berries: BerryAt[] };

/** Sorteio fixo (o mesmo no servidor e no navegador): o ramo é irregular, mas sempre igual. */
function dice(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9) >>> 0;
    return ((s ^ (s >>> 13)) >>> 0) / 4294967296;
  };
}

function buildSprig({ stem: p, count, size, seed, berries = 0, bud = false, thick = 1.5 }: SprigDef): Sprig {
  const rnd = dice(seed);
  const at = (t: number, k: 0 | 1) => (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k];
  const dir = (t: number) => Math.atan2(at(Math.min(1, t + 0.01), 1) - at(Math.max(0, t - 0.01), 1), at(Math.min(1, t + 0.01), 0) - at(Math.max(0, t - 0.01), 0));
  const deg = (a: number) => (a * 180) / Math.PI;

  // haste em cunha: grossa na base, fina na ponta (como traço de pena)
  const N = 26;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = dir(t) + Math.PI / 2;
    const hw = (thick * (1 - t) + 0.45 * t) / 2;
    left.push(`${r2(at(t, 0) + Math.cos(a) * hw)} ${r2(at(t, 1) + Math.sin(a) * hw)}`);
    right.push(`${r2(at(t, 0) - Math.cos(a) * hw)} ${r2(at(t, 1) - Math.sin(a) * hw)}`);
  }
  const stem = `M${left.join("L")}L${right.reverse().join("L")}Z`;

  const leaves: LeafAt[] = [];
  let kind = Math.floor(rnd() * 4);
  let side: 1 | -1 = rnd() < 0.5 ? 1 : -1;
  for (let i = 0; i < count; i++) {
    const t = 0.13 + (0.74 * (i + 0.5 + (rnd() - 0.5) * 0.6)) / count; // espaçamento irregular
    kind = (kind + 1 + Math.floor(rnd() * 3)) % 4; // nunca duas folhas iguais seguidas
    side = rnd() < 0.86 ? (-side as 1 | -1) : side; // quase sempre alternadas
    const open = 38 + rnd() * 26; // abertura da folha em relação à haste
    leaves.push({ x: r1(at(t, 0)), y: r1(at(t, 1)), rot: r1(deg(dir(t)) + side * open), s: r2(size * (1 - 0.4 * t) * (0.84 + rnd() * 0.32)), flip: side, kind, ink: rnd() < 0.16 ? 0 : r2(0.44 + rnd() * 0.3) });
  }
  if (!bud) leaves.push({ x: r1(at(1, 0)), y: r1(at(1, 1)), rot: r1(deg(dir(1)) + (rnd() - 0.5) * 18), s: r2(size * 0.62), flip: 1, kind: 1, ink: 0.6 });

  // bagas: pares de bolinhas em hastes curtas, entre as folhas
  const out: BerryAt[] = [];
  const berry = (t: number, turn: number, len: number, r: number) => {
    const a = dir(t) + turn;
    const x0 = at(t, 0);
    const y0 = at(t, 1);
    const x1 = x0 + Math.cos(a) * len;
    const y1 = y0 + Math.sin(a) * len;
    const bend = dir(t);
    out.push({ stalk: `M${r1(x0)} ${r1(y0)}Q${r1((x0 + x1) / 2 + Math.cos(bend) * len * 0.22)} ${r1((y0 + y1) / 2 + Math.sin(bend) * len * 0.22)} ${r1(x1 - Math.cos(a) * r)} ${r1(y1 - Math.sin(a) * r)}`, cx: r1(x1), cy: r1(y1), r });
  };
  for (let i = 0; i < berries; i++) {
    const t = 0.3 + ((i + rnd() * 0.7) / berries) * 0.5;
    const s = rnd() < 0.5 ? 1 : -1;
    const k = size * (1 - 0.3 * t);
    berry(t, s * (1.05 + rnd() * 0.3), k * (11 + rnd() * 4), r2(k * 2.3));
    berry(t + 0.015, s * (0.5 + rnd() * 0.2), k * (7 + rnd() * 3), r2(k * 1.8));
  }
  if (bud) berry(1, (rnd() - 0.5) * 0.3, 0.1, r2(size * 2.4));
  return { stem, leaves, berries: out };
}

const leafTransform = (l: LeafAt) => `translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s} ${r2(l.s * l.flip)})`;

/** A cor das folhas: fica sob o traço, com filtro próprio e suave (nunca o filtro das manchas, que a jogaria para longe). */
function SprigPaint({ sprig, tone }: { sprig: Sprig; tone: CSSProperties }) {
  return (
    <g style={tone}>
      {sprig.leaves.map((l, i) => (l.ink ? <path key={i} d={leafFill(LEAVES[l.kind])} transform={leafTransform(l)} fillOpacity={l.ink} /> : null))}
      {sprig.berries.map((b, i) => (
        <circle key={`b${i}`} cx={b.cx} cy={b.cy} r={r2(b.r * 1.08)} fillOpacity={0.62} />
      ))}
    </g>
  );
}

/** O desenho a traço, de leve fora do registro da cor (como em aquarela com nanquim). Traço mais grosso de um lado da folha, como pena. */
function SprigLine({ sprig, shift = [1.6, -1.2] }: { sprig: Sprig; shift?: Pt }) {
  return (
    <g transform={`translate(${shift[0]} ${shift[1]})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={sprig.stem} stroke="none" style={{ fill: PEN.fill }} />
      {sprig.leaves.map((l, i) => {
        const shape = LEAVES[l.kind];
        return (
          <g key={i} transform={leafTransform(l)}>
            <path d={leafFill(shape)} strokeWidth={r2(0.55 / l.s)} />
            <path d={shape.up} strokeWidth={r2(1.05 / l.s)} />
            <path d={shape.rib} strokeWidth={r2(0.5 / l.s)} />
          </g>
        );
      })}
      {sprig.berries.map((b, i) => (
        <g key={`b${i}`}>
          <path d={b.stalk} strokeWidth={0.6} />
          <circle cx={b.cx} cy={b.cy} r={b.r} strokeWidth={0.75} />
        </g>
      ))}
    </g>
  );
}

const penStroke: CSSProperties = { stroke: PEN.stroke };

// ───── Canto de cima (esquerda): a mancha-herói ─────
const TOP_MAIN = buildSprig({ stem: [[-8, 13], [38, 13], [92, 24], [138, 56]], count: 5, size: 1.32, seed: 3, berries: 1, thick: 1.7 });
const TOP_SMALL = buildSprig({ stem: [[170, -8], [192, 8], [230, 17], [272, 13]], count: 3, size: 0.96, seed: 11, bud: true, thick: 1.3 });

function TopWash() {
  const u = useUid();
  return (
    <svg viewBox="0 0 440 200" width="100%" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      <defs>
        <WashFilter id={`aquarela-wash-top-${u}`} seed={7} />
        <LeafFilter id={`aquarela-leaf-top-${u}`} seed={3} />
        <linearGradient id={`aquarela-fade-top-${u}`} x1="200" y1="0" x2="450" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.34} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.1} />
        </linearGradient>
        <radialGradient id={`aquarela-pool-top-${u}`} cx="40" cy="20" r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.26} />
          <stop offset="0.7" style={{ stopColor: "var(--accent)" }} stopOpacity={0.42} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <g filter={`url(#aquarela-wash-top-${u})`}>
        {/* véu claro que escorre para a direita */}
        <path d="M196-50H490V40C452 56 414 36 372 46C330 56 298 34 256 30C226 26 204-8 196-50Z" fill={`url(#aquarela-fade-top-${u})`} />
        {/* mancha principal */}
        <path d="M-50-50H258C264 0 232 28 194 40C156 52 142 78 106 88C70 98 30 88-50 100Z" fill={`url(#aquarela-pool-top-${u})`} style={MULTIPLY} />
        {/* segunda cor, por cima, no canto */}
        <path d="M-50-50H128C134-6 106 22 78 34C50 46 30 70-50 78Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.3} />
        <ellipse cx="300" cy="27" rx="44" ry="18" style={{ ...B, ...MULTIPLY }} fillOpacity={0.16} />
      </g>
      {/* folhas pintadas: filtro próprio, no mesmo lugar do traço */}
      <g filter={`url(#aquarela-leaf-top-${u})`} style={MULTIPLY}>
        <SprigPaint sprig={TOP_MAIN} tone={B} />
        <SprigPaint sprig={TOP_SMALL} tone={B} />
      </g>
      {/* respingos: fora do filtro, para caírem sempre no mesmo lugar (longe do texto) */}
      <g style={A} fillOpacity={0.55}>
        <ellipse cx="236" cy="72" rx="3" ry="2.5" transform="rotate(-24 236 72)" />
        <circle cx="260" cy="59" r="1.3" />
        <circle cx="214" cy="87" r="1.5" />
        <ellipse cx="336" cy="64" rx="2" ry="1.6" transform="rotate(18 336 64)" />
      </g>
      <g style={penStroke} opacity={0.78}>
        <SprigLine sprig={TOP_MAIN} />
        <SprigLine sprig={TOP_SMALL} shift={[1.2, 1.6]} />
      </g>
    </svg>
  );
}

// ───── Canto de baixo (direita): eco menor da mancha de cima ─────
const BOT_MAIN = buildSprig({ stem: [[450, 128], [412, 126], [370, 116], [340, 96]], count: 4, size: 1.14, seed: 8, berries: 1, thick: 1.6 });

function BottomWash() {
  const u = useUid();
  return (
    <svg viewBox="0 0 440 140" width="100%" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <defs>
        <WashFilter id={`aquarela-wash-bottom-${u}`} seed={23} warp={38} />
        <LeafFilter id={`aquarela-leaf-bottom-${u}`} seed={17} />
        <radialGradient id={`aquarela-pool-bottom-${u}`} cx="420" cy="130" r="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--accent)" }} stopOpacity={0.28} />
          <stop offset="0.75" style={{ stopColor: "var(--accent)" }} stopOpacity={0.42} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} stopOpacity={0.48} />
        </radialGradient>
      </defs>
      <g filter={`url(#aquarela-wash-bottom-${u})`}>
        <path d="M490 190H206C212 162 240 150 272 143C304 136 316 114 346 104C378 94 414 96 490 72Z" fill={`url(#aquarela-pool-bottom-${u})`} />
        <path d="M490 190H334C338 166 362 154 388 147C414 140 442 128 490 118Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.3} />
        <path d="M80 190C90 172 120 166 148 170C168 172 180 181 184 190Z" style={A} fillOpacity={0.16} />
      </g>
      <g filter={`url(#aquarela-leaf-bottom-${u})`} style={MULTIPLY}>
        <SprigPaint sprig={BOT_MAIN} tone={B} />
      </g>
      <g style={A} fillOpacity={0.55}>
        <ellipse cx="270" cy="120" rx="2.6" ry="2.1" transform="rotate(-20 270 120)" />
        <circle cx="244" cy="131" r="1.4" />
        <circle cx="296" cy="106" r="1.3" />
      </g>
      <g style={penStroke} opacity={0.78}>
        <SprigLine sprig={BOT_MAIN} shift={[-1.6, -1.2]} />
      </g>
    </svg>
  );
}

// ───── Divisor: dois raminhos a traço que saem do centro, cada um com seu desenho ─────
const TWIG_R = buildSprig({ stem: [[86, 13.5], [100, 10.5], [116, 15], [138, 11]], count: 3, size: 0.47, seed: 5, thick: 1.1 });
const TWIG_L = buildSprig({ stem: [[74, 13.5], [60, 16], [44, 11], [22, 14.5]], count: 3, size: 0.47, seed: 14, thick: 1.1 });

function Twig() {
  return (
    <svg viewBox="0 0 160 26" width="136" height="22.1" style={penStroke} aria-hidden="true">
      <SprigLine sprig={TWIG_L} shift={[0, 0]} />
      <SprigLine sprig={TWIG_R} shift={[0, 0]} />
      <circle cx="80" cy="13.5" r="2" style={A} stroke="none" />
    </svg>
  );
}

// ───── Forro do envelope: papel claro à mostra, aguada só nos cantos e um ramo de cada lado ─────
// Vale a área de baixo do desenho: com a aba aberta, o triângulo visível tem a base na borda de baixo (y=250) e o bico em (175, 105).
const LINER_L = buildSprig({ stem: [[30, 262], [66, 240], [108, 212], [146, 172]], count: 5, size: 0.9, seed: 21, berries: 1, thick: 1.5 });
const LINER_R = buildSprig({ stem: [[322, 262], [288, 238], [244, 214], [206, 176]], count: 4, size: 0.9, seed: 30, bud: true, thick: 1.5 });

function Liner() {
  const u = useUid();
  return (
    <svg viewBox="0 0 350 250" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <WashFilter id={`aquarela-wash-liner-${u}`} seed={41} warp={30} />
        <LeafFilter id={`aquarela-leaf-liner-${u}`} seed={29} />
      </defs>
      <g filter={`url(#aquarela-wash-liner-${u})`}>
        <path d="M-40 300V170C0 172 36 190 70 202C104 214 136 228 148 300Z" style={A} fillOpacity={0.34} />
        <path d="M390 300V162C352 170 318 188 284 202C250 216 222 234 208 300Z" style={A} fillOpacity={0.3} />
        <path d="M124 300C134 268 160 250 188 254C212 258 228 276 232 300Z" style={A} fillOpacity={0.14} />
        <path d="M-40 300V216C-6 220 22 238 40 300Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.26} />
        <path d="M390 300V224C364 228 338 250 330 300Z" style={{ ...B, ...MULTIPLY }} fillOpacity={0.2} />
      </g>
      <g filter={`url(#aquarela-leaf-liner-${u})`} style={MULTIPLY}>
        <SprigPaint sprig={LINER_L} tone={B} />
        <SprigPaint sprig={LINER_R} tone={B} />
      </g>
      <g style={A} fillOpacity={0.5}>
        <circle cx="176" cy="150" r="1.6" />
        <ellipse cx="166" cy="196" rx="2.4" ry="1.9" transform="rotate(-20 166 196)" />
        <circle cx="190" cy="214" r="1.2" />
      </g>
      <g style={penStroke} opacity={0.76}>
        <SprigLine sprig={LINER_L} />
        <SprigLine sprig={LINER_R} shift={[-1.6, -1.2]} />
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
    { id: "rosa", name: "Rosa seco e malva", vars: { bg: "#F2E7E4", paper: "#FFFBF8", ink: "#4A3541", soft: "#7B5E6B", accent: "#CF8892", line: "#EBD5D5", btnInk: "#FFFFFF", seal: "#9B6F8D", sealInk: "#F9E8E8", liner: "#F5E6E4" } },
    { id: "azul", name: "Azul sereno", vars: { bg: "#E3E9EE", paper: "#FBFCFB", ink: "#2F3E4E", soft: "#566879", accent: "#8FAAC3", line: "#D3DEE8", btnInk: "#FFFFFF", seal: "#5F7A96", sealInk: "#EEF3F7", liner: "#E2E9EF" } },
    { id: "salvia", name: "Sálvia", vars: { bg: "#E6EADF", paper: "#FCFBF5", ink: "#35402F", soft: "#5E6A54", accent: "#9FB291", line: "#D7DFCC", btnInk: "#FFFFFF", seal: "#6F8563", sealInk: "#F1F4EA", liner: "#E6EADC" } },
    { id: "pessego", name: "Pêssego", vars: { bg: "#F6E8DD", paper: "#FFFAF4", ink: "#4E372D", soft: "#805F4F", accent: "#E6A785", line: "#F1D8C7", btnInk: "#FFFFFF", seal: "#C57F64", sealInk: "#FCEEE3", liner: "#F9E9DD" } },
  ],
  Art,
};
