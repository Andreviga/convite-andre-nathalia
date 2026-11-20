import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Anjo: batizado, primeira comunhão e chá de bebê. Céu em aguada com nuvens brancas no alto do cartão, pomba (ou asas de
// anjo com auréola) em traço dourado de pena, raminhos de oliveira e um fio dourado acompanhando os cantos arredondados.
// Tudo é desenhado por código: as penas, os ramos e os traços são formas preenchidas, que engrossam e afinam como pena.
// Os filtros (feGaussianBlur, feTurbulence) são estáticos: o SVG é rasterizado uma vez e nunca anima.

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const RAD = Math.PI / 180;

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];
const bez = (c: Cubic, t: number, k: 0 | 1) => (1 - t) ** 3 * c[0][k] + 3 * (1 - t) ** 2 * t * c[1][k] + 3 * (1 - t) * t * t * c[2][k] + t ** 3 * c[3][k];
const dirOf = (c: Cubic, t: number) => Math.atan2(bez(c, Math.min(1, t + 0.01), 1) - bez(c, Math.max(0, t - 0.01), 1), bez(c, Math.min(1, t + 0.01), 0) - bez(c, Math.max(0, t - 0.01), 0));

/** Traço de pena: contorno preenchido de largura variável ao longo de uma curva (fino nas pontas, cheio no meio). */
function pen(c: Cubic, w0: number, wm: number, w1: number, n = 20): string {
  const a: string[] = [];
  const b: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = dirOf(c, t) + Math.PI / 2;
    const hw = (lerp(w0, w1, t) + (wm - (w0 + w1) / 2) * Math.sin(Math.PI * t)) / 2;
    a.push(`${r2(bez(c, t, 0) + Math.cos(ang) * hw)} ${r2(bez(c, t, 1) + Math.sin(ang) * hw)}`);
    b.push(`${r2(bez(c, t, 0) - Math.cos(ang) * hw)} ${r2(bez(c, t, 1) - Math.sin(ang) * hw)}`);
  }
  return `M${a.join("L")}L${b.reverse().join("L")}Z`;
}

// ───── Penas e asas ─────
type Feather = { x: number; y: number; rot: number; body: string; edge: string; rib: string };

/** Uma pena (base em 0,0, ponta em +x): corpo, o lado de baixo engrossado (sombra do traço) e a nervura. */
function feather(x: number, y: number, rot: number, L: number, h: number): Feather {
  const p = (a: number, b: number) => `${r1(L * a)} ${r1(h * b)}`;
  return {
    x: r1(x),
    y: r1(y),
    rot: r1(rot),
    body: `M0 0C${p(0.22, -1)} ${p(0.74, -1.08)} ${p(0.96, -0.42)}Q${p(1.03, 0.02)} ${p(0.95, 0.42)}C${p(0.74, 1)} ${p(0.24, 0.82)} 0 0Z`,
    edge: `M${p(0.14, 0.34)}C${p(0.34, 0.88)} ${p(0.74, 1.02)} ${p(0.95, 0.42)}C${p(0.76, 0.76)} ${p(0.36, 0.6)} ${p(0.14, 0.34)}Z`,
    rib: `M${p(0.16, 0)}C${p(0.4, -0.12)} ${p(0.68, -0.08)} ${p(0.88, 0)}`,
  };
}

type WingSpec = { arc: Cubic; from: number; to: number; long: [number, number]; rows: [number, number, number] };
type Wing = { rows: Feather[][]; edge: string; curl: string };

/** Asa direita (raiz em 0,0): três fileiras de penas presas ao arco de cima, das compridas (na ponta) às miúdas (no ombro). */
function buildWing({ arc, from, to, long, rows }: WingSpec): Wing {
  const row = (n: number, t0: number, t1: number, len: (t: number) => number, fat: number, turn: number, drop: number) => {
    const out: Feather[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const t = lerp(t0, t1, n === 1 ? 0 : i / (n - 1));
      const L = len(t);
      const nrm = dirOf(arc, t) + Math.PI / 2;
      out.push(feather(bez(arc, t, 0) + Math.cos(nrm) * drop, bez(arc, t, 1) + Math.sin(nrm) * drop, lerp(from, to, t) + turn, L, L * fat + 1));
    }
    return out;
  };
  const [a, b, c] = rows;
  return {
    rows: [
      row(a, 0.16, 1, (t) => lerp(long[0], long[1], t ** 1.15) * (t > 0.93 ? 0.86 : 1), 0.115, 0, 1.5),
      row(b, 0.1, 0.94, (t) => lerp(long[0] * 0.52, long[1] * 0.46, t), 0.17, 6, 1),
      row(c, 0.08, 0.86, (t) => lerp(long[0] * 0.3, long[1] * 0.2, t), 0.26, 10, 0.4),
    ],
    edge: pen(arc, 0.9, 2.3, 0.5, 26),
    curl: pen([[arc[0][0] + 0.4, arc[0][1] - 0.5], [arc[0][0] - 5.5, arc[0][1] + 6], [arc[0][0] - 1, arc[0][1] + 13], [arc[0][0] + 4.5, arc[0][1] + 8.5]], 0.9, 1.5, 0.3, 12),
  };
}

// asa de anjo: arco alto, penas que descem e abrem para fora
const ANGEL_WING = buildWing({ arc: [[0, 0], [5, -30], [38, -52], [80, -44]], from: 102, to: 44, long: [22, 60], rows: [10, 8, 7] });
// asa da pomba: erguida em V, mais curta e mais aberta que a do anjo
const DOVE_WING = buildWing({ arc: [[0, 0], [7, -17], [27, -35], [55, -41]], from: 104, to: -8, long: [16, 37], rows: [9, 7, 6] });
const TAIL: Feather[] = [-40, 40, -20, 20, 0].map((a) => feather(Math.sin(a * RAD) * 3, -10, -90 + a, 22 - Math.abs(a) * 0.1, 3.8));

const PEARL: CSSProperties = { fill: "color-mix(in srgb, var(--paper) 45%, #fff)" }; // branco das penas e das nuvens
const SKY: CSSProperties = { fill: "var(--liner)" }; // pigmento do céu

function FeatherShape({ f, gold }: { f: Feather; gold: string }) {
  return (
    <g transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`}>
      <path d={f.body} style={PEARL} stroke={gold} strokeWidth="0.55" strokeLinejoin="round" />
      <path d={f.edge} fill={gold} />
      <path d={f.rib} fill="none" stroke={gold} strokeWidth="0.4" strokeLinecap="round" opacity="0.75" />
    </g>
  );
}

function WingShape({ wing, gold, transform }: { wing: Wing; gold: string; transform: string }) {
  return (
    <g transform={transform}>
      {wing.rows.map((row, i) => (
        <g key={i}>{row.map((f, j) => <FeatherShape key={j} f={f} gold={gold} />)}</g>
      ))}
      <path d={wing.edge} fill={gold} />
      <path d={wing.curl} fill={gold} />
    </g>
  );
}

/** Auréola: elipse em traço de pena (mais cheia embaixo, quase um fio em cima), com um segundo fio por dentro. */
function Halo({ cx, cy, rx, ry, gold }: { cx: number; cy: number; rx: number; ry: number; gold: string }) {
  const ring = (ax: number, ay: number, dy: number) => `M${r1(cx - ax)} ${r1(cy + dy)}a${ax} ${ay} 0 1 0 ${ax * 2} 0a${ax} ${ay} 0 1 0 ${-ax * 2} 0Z`;
  return (
    <g fill={gold}>
      <path fillRule="evenodd" d={`${ring(rx, ry, 0)}${ring(rx - 0.9, ry - 1.25, -0.55)}`} />
      <path fillRule="evenodd" d={`${ring(rx - 2.6, ry - 1.9, -0.2)}${ring(rx - 2.95, ry - 2.25, -0.2)}`} opacity="0.7" />
    </g>
  );
}

/** Centelha de quatro pontas. */
const spark = (x: number, y: number, r: number) => {
  const k = r2(r * 0.16);
  return `M${x} ${r2(y - r)}Q${r2(x + k)} ${r2(y - k)} ${r2(x + r)} ${y}Q${r2(x + k)} ${r2(y + k)} ${x} ${r2(y + r)}Q${r2(x - k)} ${r2(y + k)} ${r2(x - r)} ${y}Q${r2(x - k)} ${r2(y - k)} ${x} ${r2(y - r)}Z`;
};

// resplendor atrás da pomba: raios finos em cunha, longos e curtos alternados
const RAYS = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * Math.PI * 2 + 0.098;
  const r0 = 27;
  const r1x = i % 2 ? 41 : 52;
  const w = i % 2 ? 0.011 : 0.016;
  const pt = (r: number, d: number) => `${r1(Math.cos(a + d) * r)} ${r1(Math.sin(a + d) * r)}`;
  return `M${pt(r0, -w)}L${pt(r1x, 0)}L${pt(r0, w)}Z`;
}).join("");

/** Pomba descendo, asas erguidas em V e cauda em leque no alto; a cabeça, pequena, vem de perfil (bico curto, um ponto de olho). */
function Dove({ gold }: { gold: string }) {
  return (
    <g>
      <path d={RAYS} fill={gold} opacity="0.5" transform="translate(0 -4)" />
      {TAIL.map((f, i) => <FeatherShape key={i} f={f} gold={gold} />)}
      <WingShape wing={DOVE_WING} gold={gold} transform="translate(5.5 -3)" />
      <WingShape wing={DOVE_WING} gold={gold} transform="translate(-5.5 -3) scale(-1 1)" />
      {/* corpo e cabeça num contorno só: peito cheio, pescoço marcado, cabeça redonda voltada para a esquerda */}
      <path d="M0.5 -14C-7.5 -13 -11.6 -4 -10.1 3.5C-9.3 7.6 -6.7 9.6 -6 11.7C-8.1 13.5 -8.5 17.7 -6.1 20.1C-3.5 22.7 1.6 22.3 3.6 19.1C5.1 16.7 4.7 13.7 3.5 11.9C5.5 9.7 9.1 7.3 10.1 3C11.7 -4 7.6 -13.2 0.5 -14Z" style={PEARL} stroke={gold} strokeWidth="0.55" strokeLinejoin="round" />
      {/* o lado direito do peito e da cabeça engrossado, como sombra de pena */}
      <path d="M10.2 2.7C9.1 7.4 5.5 9.8 3.6 11.9C4.4 9.3 7.5 7.2 8.8 3Z" fill={gold} />
      <path d="M4.3 14.2C5 17.2 3.6 20.6 0.2 21.7C2.2 20.2 3.4 17.6 3.2 14.6Z" fill={gold} />
      {/* bico e olho */}
      <path d="M-7.6 16.6L-13.2 20.2L-6.3 20.1Z" fill={gold} stroke={gold} strokeWidth="0.3" strokeLinejoin="round" />
      <circle cx="-3.3" cy="16.3" r="0.85" fill={gold} />
      {/* penugem do peito */}
      <path d="M-4.6 -6.6q2.3 2.4 4.6 0q2.3 2.4 4.6 0M-6.6 -1.2q2.2 2.3 4.4 0q2.2 2.3 4.4 0q2.2 2.3 4.4 0M-4.4 4q2.2 2.2 4.4 0q2.2 2.2 4.4 0" fill="none" stroke={gold} strokeWidth="0.4" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}

/** Par de asas de anjo com a auréola suspensa entre elas. */
function AngelWings({ gold }: { gold: string }) {
  return (
    <g>
      <WingShape wing={ANGEL_WING} gold={gold} transform="translate(8 0)" />
      <WingShape wing={ANGEL_WING} gold={gold} transform="translate(-8 0) scale(-1 1)" />
      <Halo cx={0} cy={-49} rx={15} ry={4.8} gold={gold} />
      <path d={`${spark(0, -22, 5.4)}${spark(0, 2, 2.6)}${spark(0, 15, 1.5)}`} fill={gold} />
    </g>
  );
}

function GoldDef({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="-70" y1="-60" x2="70" y2="60">
      <stop offset="0" style={{ stopColor: "color-mix(in srgb, var(--accent) 86%, var(--ink))" }} />
      <stop offset="0.42" style={{ stopColor: "color-mix(in srgb, var(--accent) 78%, #fff)" }} />
      <stop offset="0.6" style={{ stopColor: "var(--accent)" }} />
      <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--accent) 80%, var(--ink))" }} />
    </linearGradient>
  );
}

// ───── Nuvens ─────
// Cada nuvem é um punhado de círculos fundidos pelo desfoque; por baixo, a mesma forma no pigmento do céu faz a sombra.
type Puff = [number, number, number];
const CLOUD_A: Puff[] = [[-44, 4, 13], [-26, -6, 19], [-2, -14, 24], [24, -8, 20], [44, 2, 15], [60, 7, 10], [8, 6, 20], [-20, 8, 16]];
const CLOUD_B: Puff[] = [[-34, 5, 12], [-16, -5, 18], [8, -10, 21], [30, -2, 16], [46, 6, 10], [4, 7, 17]];
const CLOUD_C: Puff[] = [[-22, 3, 10], [-6, -5, 14], [12, -2, 12], [26, 4, 8], [2, 5, 12]];

type CloudSpec = { puffs: Puff[]; x: number; y: number; s?: number; flip?: boolean; shadow?: number };

/** Um grupo de nuvens: todas as sombras passam por um só desfoque e todos os brancos por outro (dois filtros por grupo). */
function Clouds({ list, blur, shade }: { list: CloudSpec[]; blur: string; shade: string }) {
  const at = ({ x, y, s = 1, flip = false }: CloudSpec) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
  return (
    <>
      <g style={SKY} filter={`url(#${shade})`}>
        {list.map((c, k) => (
          <g key={k} transform={`${at(c)} translate(2 7)`} opacity={c.shadow ?? 0.5}>
            {c.puffs.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
          </g>
        ))}
      </g>
      <g style={PEARL} filter={`url(#${blur})`}>
        {list.map((c, k) => {
          const xs = c.puffs.map((p) => p[0]);
          return (
            <g key={k} transform={at(c)}>
              {c.puffs.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
              <rect x={Math.min(...xs) - 4} y="2" width={Math.max(...xs) - Math.min(...xs) + 8} height="16" rx="8" />
            </g>
          );
        })}
      </g>
    </>
  );
}

function CloudFilters({ u }: { u: string }) {
  return (
    <>
      {/* aguada: beirada irregular e desfocada, com grão de pigmento */}
      <filter id={`${u}-wash`} x="-10%" y="-20%" width="120%" height="150%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={34} xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation={9} />
      </filter>
      <filter id={`${u}-puff`} x="-20%" y="-30%" width="140%" height="160%">
        <feGaussianBlur stdDeviation={3.2} />
      </filter>
      <filter id={`${u}-shade`} x="-20%" y="-30%" width="140%" height="170%">
        <feGaussianBlur stdDeviation={6.5} />
      </filter>
    </>
  );
}

/** Alto do cartão: céu em aguada, nuvens brancas na borda de baixo e, no meio, a pomba (ou as asas) em ouro. */
function TopArt({ wings }: { wings: boolean }) {
  const u = `anjo-${useUid()}`;
  const gold = `url(#${u}-gold)`;
  const c = { blur: `${u}-puff`, shade: `${u}-shade` };
  return (
    <svg viewBox="0 0 400 240" width="400" height="240" fill="none" aria-hidden="true">
      <defs>
        <CloudFilters u={u} />
        <GoldDef id={`${u}-gold`} />
      </defs>
      <g filter={`url(#${u}-wash)`} style={SKY}>
        <path d="M-40 -40H440V128C398 150 356 122 310 138C262 154 226 136 182 146C132 158 84 130 -40 150Z" opacity="0.62" />
        <ellipse cx="46" cy="6" rx="150" ry="52" opacity="0.38" />
        <ellipse cx="372" cy="14" rx="130" ry="50" opacity="0.3" />
      </g>
      {/* nuvens: pequenas no alto, grandes embaixo, onde o céu se desfaz no papel */}
      <Clouds {...c} list={[
        { puffs: CLOUD_C, x: 62, y: 50, s: 0.9, shadow: 0.4 },
        { puffs: CLOUD_C, x: 338, y: 62, s: 1.05, flip: true, shadow: 0.4 },
        { puffs: CLOUD_B, x: 318, y: 132, s: 1.25 },
        { puffs: CLOUD_A, x: 74, y: 140, s: 1.2, flip: true },
      ]} />
      <Clouds {...c} list={[
        { puffs: CLOUD_A, x: 206, y: 166, s: 1.35, shadow: 0.16 },
        { puffs: CLOUD_B, x: 388, y: 172, s: 1.1, flip: true, shadow: 0.12 },
        { puffs: CLOUD_C, x: 2, y: 176, s: 1.4, shadow: 0.12 },
      ]} />
      {/* centelhas de ouro espalhadas no céu */}
      <path fill={gold} d={`${spark(110, 34, 4.2)}${spark(296, 28, 3.4)}${spark(134, 92, 2.4)}${spark(274, 98, 2.8)}${spark(40, 96, 2.2)}${spark(362, 104, 2)}${spark(200, 14, 2)}`} />
      <g transform={wings ? "translate(200 104) scale(1.04)" : "translate(200 92) scale(1.3)"}>{wings ? <AngelWings gold={gold} /> : <Dove gold={gold} />}</g>
    </svg>
  );
}

/** Pé do cartão: o céu volta num degradê contínuo e três nuvens inteiras, com sombra, pousam no fio de ouro. */
function BottomArt() {
  const u = `anjo-${useUid()}`;
  const gold = `url(#${u}-gold)`;
  const c = { blur: `${u}-puff`, shade: `${u}-shade` };
  return (
    <svg viewBox="0 0 400 110" width="400" height="110" fill="none" aria-hidden="true">
      <defs>
        <filter id={`${u}-puff`} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation={3.2} />
        </filter>
        <filter id={`${u}-shade`} x="-10%" y="-30%" width="120%" height="170%">
          <feGaussianBlur stdDeviation={6.5} />
        </filter>
        <GoldDef id={`${u}-gold`} />
        <linearGradient id={`${u}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="110">
          <stop offset="0.1" style={{ stopColor: "var(--liner)", stopOpacity: 0 }} />
          <stop offset="0.5" style={{ stopColor: "var(--liner)", stopOpacity: 0.36 }} />
          <stop offset="1" style={{ stopColor: "var(--liner)", stopOpacity: 0.68 }} />
        </linearGradient>
      </defs>
      <rect width="400" height="110" fill={`url(#${u}-sky)`} />
      <Clouds {...c} list={[
        { puffs: CLOUD_C, x: 132, y: 62, s: 0.72, flip: true, shadow: 0.45 },
        { puffs: CLOUD_C, x: 282, y: 58, s: 0.62, shadow: 0.45 },
      ]} />
      <Clouds {...c} list={[
        { puffs: CLOUD_A, x: 66, y: 96, s: 1.12, shadow: 0.5 },
        { puffs: CLOUD_B, x: 338, y: 94, s: 1.18, flip: true, shadow: 0.5 },
        { puffs: CLOUD_C, x: 206, y: 104, s: 1.5, shadow: 0.42 },
      ]} />
      <path fill={gold} d={`${spark(52, 44, 2.2)}${spark(350, 40, 2.6)}${spark(206, 72, 1.8)}`} />
    </svg>
  );
}

// ───── Oliveira ─────
type Sprig = { stem: string; leaves: { x: number; y: number; rot: number; d: string; rib: string; solid: boolean }[]; olives: { x: number; y: number; rot: number; stalk: string }[] };

function buildSprig(c: Cubic, count: number, size: number, olivesAt: number[] = []): Sprig {
  const leaves: Sprig["leaves"] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (0.82 * (i + 0.5)) / count;
    const side = i % 2 ? 1 : -1;
    const L = size * (1 - 0.34 * t) * (i % 3 === 1 ? 0.88 : 1);
    const h = L * 0.17;
    leaves.push({
      x: r1(bez(c, t, 0)),
      y: r1(bez(c, t, 1)),
      rot: r1(dirOf(c, t) / RAD + side * (34 + (i % 3) * 6)),
      d: `M0 0C${r1(L * 0.3)} ${r1(-h * 1.15)} ${r1(L * 0.72)} ${r1(-h)} ${r1(L)} 0C${r1(L * 0.7)} ${r1(h * 0.78)} ${r1(L * 0.3)} ${r1(h * 0.7)} 0 0Z`,
      rib: `M${r1(L * 0.14)} 0L${r1(L * 0.84)} 0`,
      solid: i % 3 !== 2,
    });
  }
  // folha da ponta
  const Lt = size * 0.62;
  leaves.push({ x: r1(bez(c, 1, 0)), y: r1(bez(c, 1, 1)), rot: r1(dirOf(c, 1) / RAD), d: `M0 0C${r1(Lt * 0.3)} ${r1(-Lt * 0.19)} ${r1(Lt * 0.72)} ${r1(-Lt * 0.16)} ${r1(Lt)} 0C${r1(Lt * 0.7)} ${r1(Lt * 0.13)} ${r1(Lt * 0.3)} ${r1(Lt * 0.12)} 0 0Z`, rib: "", solid: true });
  const olives = olivesAt.map((t, i) => {
    const side = i % 2 ? -1 : 1;
    const a = dirOf(c, t) + side * 1.25;
    const len = size * 0.42;
    const x0 = bez(c, t, 0);
    const y0 = bez(c, t, 1);
    return { x: r1(x0 + Math.cos(a) * len), y: r1(y0 + Math.sin(a) * len), rot: r1(a / RAD), stalk: `M${r1(x0)} ${r1(y0)}L${r1(x0 + Math.cos(a) * len * 0.7)} ${r1(y0 + Math.sin(a) * len * 0.7)}` };
  });
  return { stem: pen(c, 1.5, 1.1, 0.35, 18), leaves, olives };
}

function SprigShape({ sprig, gold, size, transform }: { sprig: Sprig; gold: string; size: number; transform?: string }) {
  return (
    <g transform={transform}>
      <path d={sprig.stem} fill={gold} />
      {sprig.olives.map((o, i) => (
        <g key={i}>
          <path d={o.stalk} stroke={gold} strokeWidth="0.55" strokeLinecap="round" />
          <ellipse cx={o.x} cy={o.y} rx={r1(size * 0.2)} ry={r1(size * 0.14)} transform={`rotate(${o.rot} ${o.x} ${o.y})`} fill={gold} />
        </g>
      ))}
      {sprig.leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
          {l.solid ? <path d={l.d} fill={gold} /> : <path d={l.d} style={{ fill: "color-mix(in srgb, var(--accent) 26%, var(--paper))" }} stroke={gold} strokeWidth="0.6" strokeLinejoin="round" />}
          {l.solid || !l.rib ? null : <path d={l.rib} stroke={gold} strokeWidth="0.4" strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
}

const TWIG = buildSprig([[14, 15], [34, 9], [58, 19], [88, 11]], 7, 15, [0.3, 0.62]);

/** Divisor e assinatura: dois raminhos de oliveira que se encontram numa centelha (três, quando o topo é a pomba). */
function Divider({ wings }: { wings: boolean }) {
  const u = `anjo-${useUid()}`;
  const gold = `url(#${u}-gold)`;
  return (
    <svg viewBox="-100 0 200 28" width="200" height="28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-gold`} gradientUnits="userSpaceOnUse" x1="-100" y1="0" x2="100" y2="28">
          <stop offset="0" style={{ stopColor: "color-mix(in srgb, var(--accent) 86%, var(--ink))" }} />
          <stop offset="0.5" style={{ stopColor: "color-mix(in srgb, var(--accent) 82%, #fff)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--accent) 86%, var(--ink))" }} />
        </linearGradient>
      </defs>
      <SprigShape sprig={TWIG} gold={gold} size={15} />
      <SprigShape sprig={TWIG} gold={gold} size={15} transform="scale(-1 1)" />
      <path d={wings ? spark(0, 14, 7) : `${spark(0, 14, 6)}${spark(-9.5, 14, 2.2)}${spark(9.5, 14, 2.2)}`} fill={gold} />
    </svg>
  );
}

/** Forro do envelope: o mesmo céu, com nuvens e as asas pequenas (só o triângulo de baixo aparece; ver style.css). */
function Liner() {
  const u = `anjo-${useUid()}`;
  const gold = `url(#${u}-gold)`;
  const c = { blur: `${u}-puff`, shade: `${u}-shade` };
  return (
    <svg viewBox="0 0 280 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <defs>
        <CloudFilters u={u} />
        <GoldDef id={`${u}-gold`} />
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.3" style={{ stopColor: "color-mix(in srgb, var(--liner) 82%, var(--ink))" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--liner) 70%, #fff)" }} />
        </linearGradient>
      </defs>
      <rect width="280" height="200" fill={`url(#${u}-sky)`} />
      <Clouds {...c} list={[
        { puffs: CLOUD_A, x: 46, y: 188, s: 0.95, shadow: 0.7 },
        { puffs: CLOUD_B, x: 238, y: 186, s: 1, flip: true, shadow: 0.7 },
        { puffs: CLOUD_C, x: 142, y: 198, s: 1.2, shadow: 0.6 },
        { puffs: CLOUD_C, x: 86, y: 156, s: 0.5, flip: true, shadow: 0.6 },
        { puffs: CLOUD_C, x: 196, y: 158, s: 0.46, shadow: 0.6 },
      ]} />
      {/* as asas ficam na parte do triângulo que sobra acima do cartão; as centelhas, dos lados */}
      <path style={PEARL} d={`${spark(140, 101, 2.6)}${spark(104, 140, 2.4)}${spark(177, 137, 2.8)}${spark(66, 172, 2.2)}${spark(216, 170, 2)}${spark(122, 162, 1.4)}${spark(160, 164, 1.4)}`} />
      <g transform="translate(140 133) scale(0.37)"><AngelWings gold={gold} /></g>
    </svg>
  );
}

// A pomba com resplendor é símbolo religioso: fica no batizado e na primeira comunhão ("outro") e no casamento.
// Nos outros tipos (e quando o tipo não vem) o topo são as asas com a auréola.
const DOVE_FOR = new Set(["outro", "casamento"]);

function Art({ slot, eventType }: ArtProps) {
  const wings = !DOVE_FOR.has(eventType ?? "");
  if (slot === "top") return <TopArt wings={wings} />;
  if (slot === "divider") return <Divider wings={wings} />;
  if (slot === "bottom") return <BottomArt />;
  if (slot === "liner") return <Liner />;
  return null; // o fundo da página (nuvens largas e desfocadas) é feito em CSS
}

export const def: TemplateDef = {
  id: "anjo",
  name: "Anjo",
  description: "Céu em aquarela, pomba e asas em fio de ouro",
  premium: true,
  suits: ["cha", "outro", "aniversario"],
  palettes: [
    { id: "ceu", name: "Azul-céu e ouro", vars: { bg: "#e4edf5", paper: "#fdfcf9", ink: "#2b3a4f", soft: "#56667b", accent: "#b89450", line: "#dbe4ec", btnInk: "#ffffff", seal: "#c6a45c", sealInk: "#43330e", liner: "#b9d3ea" } },
    { id: "rosa", name: "Rosa-bebê e ouro", vars: { bg: "#f7e8ea", paper: "#fffcfa", ink: "#4a3237", soft: "#77585f", accent: "#bb9453", line: "#f0dddf", btnInk: "#ffffff", seal: "#c9a45e", sealInk: "#47330f", liner: "#f2c6cd" } },
    { id: "salvia", name: "Branco e sálvia", vars: { bg: "#e9eee4", paper: "#fdfdf9", ink: "#313e2d", soft: "#59674f", accent: "#7c9870", line: "#dde4d5", btnInk: "#ffffff", seal: "#6f8a66", sealInk: "#ffffff", liner: "#c9d9bf" } },
    { id: "lavanda", name: "Lavanda e prata", vars: { bg: "#ebe8f4", paper: "#fdfcfe", ink: "#383350", soft: "#625c7c", accent: "#7c80a0", line: "#e1deed", btnInk: "#ffffff", seal: "#a9adbd", sealInk: "#2d2a42", liner: "#cfc8ea" } },
    { id: "perola", name: "Pérola e champanhe", vars: { bg: "#f1ebe1", paper: "#fffdf8", ink: "#3f372b", soft: "#6b6152", accent: "#b6965c", line: "#e8dfd0", btnInk: "#ffffff", seal: "#c4a668", sealInk: "#44350f", liner: "#e6d3b3" } },
  ],
  Art,
};
