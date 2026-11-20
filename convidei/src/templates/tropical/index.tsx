import type { CSSProperties, ReactNode } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Tropical: cartaz brasileiro. Folhas de costela-de-adão, palmeira e bananeira em formas chapadas e sobrepostas, entrando
// pelos cantos em diagonal (alto à direita, pé à esquerda), com uma flor como acento. O texto fica alinhado à esquerda.
// Os tons saem da paleta (variáveis --tp-* do style.css): três verdes derivados de --liner e a flor em --accent.

const TONE = {
  a: { fill: "var(--tp-a)" }, // folha: tom médio
  b: { fill: "var(--tp-b)" }, // folha: tom fundo
  c: { fill: "var(--tp-c)" }, // folha: tom claro
  d: { fill: "var(--tp-d)" }, // folha: sombra muito clara, atrás de tudo
  f: { fill: "var(--tp-f)" }, // flor
  f2: { fill: "var(--tp-f2)" }, // flor: pétala de trás
  f3: { fill: "var(--tp-f3)" }, // flor: miolo e nervuras
  p: { fill: "var(--tp-pollen)" },
  paper: { fill: "var(--paper)" },
} satisfies Record<string, CSSProperties>;
type Tone = CSSProperties;

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Curva suave (Catmull-Rom) por uma lista de pontos, devolvida como pontos próximos. */
function smooth(pts: Pt[], seg = 8): Pt[] {
  const out: Pt[] = [];
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let j = 0; j < seg; j++) {
      const t = j / seg;
      const k = (n: 0 | 1) => 0.5 * (2 * p1[n] + (-p0[n] + p2[n]) * t + (2 * p0[n] - 5 * p1[n] + 4 * p2[n] - p3[n]) * t * t + (-p0[n] + 3 * p1[n] - 3 * p2[n] + p3[n]) * t * t * t);
      out.push([k(0), k(1)]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ───────── Costela-de-adão ─────────
// Folha em coordenadas próprias: base (onde entra o talo) em 0,0 e ponta em 100,0. Cada metade é um contorno de coração
// com rasgos que entram da borda em direção à nervura central, e furos junto dela (regra evenodd).
const HEART: Pt[] = [[0, 0], [-8, 5], [-15, 17], [-14, 31], [-3, 42], [14, 48], [34, 48], [53, 43.5], [69, 36], [84, 27.5], [98, 18.5], [110, 9.5], [122, 0]];
const HEART_PTS = smooth(HEART, 8);
const heartRaw = (u: number): Pt => {
  const x = Math.max(0, Math.min(1, u)) * (HEART_PTS.length - 1);
  const i = Math.min(HEART_PTS.length - 2, Math.floor(x));
  return lerp(HEART_PTS[i], HEART_PTS[i + 1], x - i);
};
/** De onde, na nervura central, sai a nervura que chega ao ponto p da borda. */
const veinRoot = (p: Pt): Pt => [Math.max(2, Math.min(108, p[0] - p[1] * 0.78)), 0];

type Slit = { u: number; depth: number; gap?: number };
type MonsteraDef = { up: Slit[]; down: Slit[]; holesUp: number[]; holesDown: number[]; squeeze: number };
type MonsteraShape = { blade: string[]; veins: string };

function monsteraHalf(sign: 1 | -1, k: number, slits: Slit[], holes: number[]): { blade: string; veins: string } {
  const Y = (p: Pt): Pt => [p[0], p[1] * sign * k];
  const step = 1 / (HEART_PTS.length - 1);
  const cmds: string[] = [`M0 ${r1(-sign * 0.8)}`];
  const veins: string[] = [];
  const marks = [0, ...slits.map((s) => s.u), 1];
  // borda recortada em lobos: cada lobo abaula para fora no meio e recolhe junto aos rasgos
  const heartAt = (u: number): Pt => {
    const p = heartRaw(u);
    let i = 0;
    while (i < marks.length - 2 && u > marks[i + 1]) i++;
    let f = (u - marks[i]) / (marks[i + 1] - marks[i]);
    if (i === 0) f = 0.5 + 0.5 * f;
    else if (i === marks.length - 2) f = 0.5 * f;
    const root = veinRoot(p);
    const k = 1 + 0.075 * Math.sin(Math.PI * Math.max(0, Math.min(1, f))) - 0.03;
    return [root[0] + (p[0] - root[0]) * k, root[1] + (p[1] - root[1]) * k];
  };
  let from = 0;
  const run = (a: number, b: number) => {
    for (let u = Math.ceil(a / step - 1e-6) * step; u <= b + 1e-6; u += step) cmds.push(`L${pt(Y(heartAt(u)))}`);
  };
  const vein = (u: number, len: number, w: number) => {
    const m = heartAt(u);
    const root = veinRoot(m);
    const end = lerp(root, m, len);
    veins.push(`M${pt(Y([root[0] - w, 0]))}L${pt(Y(end))}L${pt(Y([root[0] + w, 0]))}Z`);
  };
  for (const s of slits) {
    const g = s.gap ?? 0.011;
    const e = 0.022;
    run(from, s.u - g - e);
    const m = heartAt(s.u);
    const pa = heartAt(s.u - g);
    const pb = heartAt(s.u + g);
    const root = veinRoot(m);
    const apex = lerp(m, root, s.depth);
    const len = Math.hypot(root[0] - m[0], root[1] - m[1]) || 1;
    const dir: Pt = [(root[0] - m[0]) / len, (root[1] - m[1]) / len];
    const w = 0.85;
    const side = Math.sign((pa[0] - m[0]) * -dir[1] + (pa[1] - m[1]) * dir[0]) || 1;
    const c1: Pt = [apex[0] - dir[1] * w * side, apex[1] + dir[0] * w * side];
    const c2: Pt = [apex[0] + dir[1] * w * side, apex[1] - dir[0] * w * side];
    const tip: Pt = [apex[0] + dir[0] * w * 2.4, apex[1] + dir[1] * w * 2.4];
    cmds.push(`L${pt(Y(heartAt(s.u - g - e)))}Q${pt(Y(pa))} ${pt(Y(lerp(pa, c1, 0.16)))}L${pt(Y(c1))}Q${pt(Y(tip))} ${pt(Y(c2))}L${pt(Y(lerp(pb, c2, 0.16)))}Q${pt(Y(pb))} ${pt(Y(heartAt(s.u + g + e)))}`);
    from = s.u + g + e;
  }
  run(from, 1);
  cmds.push(`L122 ${r1(-sign * 0.2)}Z`);
  // nervuras: uma por lobo, afinando para a borda
  for (let i = 0; i < marks.length - 1; i++) {
    const mid = i === 0 ? 0.17 : i === marks.length - 2 ? (marks[i] + 1) / 2 - 0.02 : (marks[i] + marks[i + 1]) / 2;
    vein(mid, i === 0 ? 0.7 : 0.8, 0.85);
    // furo oval junto à nervura central, no eixo do lobo
    if (holes.includes(i)) {
      const m = heartAt(mid + 0.035);
      const root = veinRoot(m);
      const c = lerp(root, m, 0.21);
      const len = Math.hypot(m[0] - root[0], m[1] - root[1]) || 1;
      const rx = Math.min(4.6, len * 0.1);
      const d: Pt = [((m[0] - root[0]) / len) * rx, ((m[1] - root[1]) / len) * rx];
      const rot = r1((Math.atan2(d[1] * sign * k, d[0]) * 180) / Math.PI);
      const p1 = Y([c[0] - d[0], c[1] - d[1]]);
      const p2 = Y([c[0] + d[0], c[1] + d[1]]);
      cmds.push(`M${pt(p1)}A${r1(rx)} ${r1(rx * 0.42)} ${rot} 1 0 ${pt(p2)}A${r1(rx)} ${r1(rx * 0.42)} ${rot} 1 0 ${pt(p1)}Z`);
    }
  }
  return { blade: cmds.join(""), veins: veins.join("") };
}

function monstera(def: MonsteraDef): MonsteraShape {
  const up = monsteraHalf(-1, 1, def.up, def.holesUp);
  const down = monsteraHalf(1, def.squeeze, def.down, def.holesDown);
  return { blade: [up.blade, down.blade], veins: `${up.veins}${down.veins}M-1 -1.5L118 0L-1 1.5Z` };
}

const MONSTERA_A = monstera({
  up: [{ u: 0.3, depth: 0.6 }, { u: 0.43, depth: 0.7 }, { u: 0.55, depth: 0.72 }, { u: 0.67, depth: 0.68 }, { u: 0.78, depth: 0.6 }],
  down: [{ u: 0.36, depth: 0.66 }, { u: 0.49, depth: 0.72 }, { u: 0.61, depth: 0.7 }, { u: 0.73, depth: 0.62 }],
  holesUp: [2, 4],
  holesDown: [3],
  squeeze: 0.9,
});
const MONSTERA_B = monstera({
  up: [{ u: 0.34, depth: 0.66 }, { u: 0.48, depth: 0.72 }, { u: 0.62, depth: 0.7 }, { u: 0.75, depth: 0.6 }],
  down: [{ u: 0.29, depth: 0.6 }, { u: 0.42, depth: 0.7 }, { u: 0.54, depth: 0.72 }, { u: 0.66, depth: 0.68 }, { u: 0.77, depth: 0.6 }],
  holesUp: [3],
  holesDown: [2, 4],
  squeeze: 0.94,
});

const place = (x: number, y: number, rot: number, s: number, flip = false) => `translate(${x} ${y}) rotate(${rot}) scale(${s} ${flip ? -s : s})`;

function Monstera({ shape = MONSTERA_A, x, y, rot, s, flip, tone, vein, stalk = 0 }: { shape?: MonsteraShape; x: number; y: number; rot: number; s: number; flip?: boolean; tone: Tone; vein: Tone; stalk?: number }) {
  return (
    <g transform={place(x, y, rot, s, flip)}>
      {stalk ? <path d={`M2 -1.6L${-stalk} -2.4L${-stalk} 2.4L2 1.6Z`} style={vein} /> : null}
      <path d={shape.blade[0]} fillRule="evenodd" style={tone} />
      <path d={shape.blade[1]} fillRule="evenodd" style={tone} />
      <path d={shape.veins} style={vein} />
    </g>
  );
}

// ───────── Folha de bananeira ─────────
// Lâmina comprida (base em 0,0, ponta em 100,0) com rasgos em V na borda e faixas finas de um segundo tom, como nervuras.
function banana(tears: { up: number[]; down: number[] }): { blade: string; ribs: string } {
  const W = 17;
  const half = (t: number) => W * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.94 + 0.03))), 0.62) * (1 - 0.2 * t);
  const side = (sign: 1 | -1, cuts: number[]): string[] => {
    const pts: string[] = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const cut = cuts.find((c) => Math.abs(c - t) < 0.5 / N);
      const x = t * 100;
      if (cut !== undefined) {
        const w = half(t);
        pts.push(`${r1(x - 1.6)} ${r1(sign * half(t - 0.016))}`, `${r1(x - 5.5)} ${r1(sign * w * 0.36)}`, `${r1(x + 1.9)} ${r1(sign * half(t + 0.019) * 0.99)}`);
      } else pts.push(`${r1(x)} ${r1(sign * half(t))}`);
    }
    return pts;
  };
  const blade = `M${side(-1, tears.up).join("L")}L${side(1, tears.down).reverse().join("L")}Z`;
  const ribs: string[] = [];
  for (let i = 1; i < 15; i++) {
    const t = 0.05 + i * 0.061;
    const x = t * 100;
    for (const sign of [-1, 1] as const) {
      if ((sign === -1 ? tears.up : tears.down).some((c) => c > t - 0.01 && c < t + 0.075)) continue;
      const w = half(t + 0.045) * 0.9;
      ribs.push(`M${r1(x)} 0L${r1(x + 4.6)} ${r1(sign * w)}L${r1(x + 6.4)} ${r1(sign * w)}L${r1(x + 1.5)} 0Z`);
    }
  }
  return { blade, ribs: `${ribs.join("")}M-2 -1.7L99 0L-2 1.7Z` };
}
const BANANA_A = banana({ up: [0.3, 0.575, 0.8], down: [0.425, 0.7] });
const BANANA_B = banana({ up: [0.45, 0.725], down: [0.25, 0.55, 0.825] });

function Banana({ shape = BANANA_A, x, y, rot, s, flip, tone, rib }: { shape?: { blade: string; ribs: string }; x: number; y: number; rot: number; s: number; flip?: boolean; tone: Tone; rib: Tone }) {
  return (
    <g transform={place(x, y, rot, s, flip)}>
      <path d={shape.blade} style={tone} />
      <path d={shape.ribs} style={rib} />
    </g>
  );
}

// ───────── Folha de palmeira ─────────
// Haste curva (Bézier cúbica) com folíolos em lâmina dos dois lados: mais abertos e compridos no meio, fechando na ponta.
type Stem = [Pt, Pt, Pt, Pt];
function frond(p: Stem, n: number, len: number, wide = 0.11): { leaves: string; stem: string } {
  const at = (t: number, k: 0 | 1) => (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k];
  const dir = (t: number) => Math.atan2(at(Math.min(1, t + 0.01), 1) - at(Math.max(0, t - 0.01), 1), at(Math.min(1, t + 0.01), 0) - at(Math.max(0, t - 0.01), 0));
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = 0.1 + (0.9 * i) / (n - 1);
    const env = Math.pow(Math.sin(Math.PI * (0.12 + 0.86 * t)), 0.75);
    const open = ((68 - 46 * t) * Math.PI) / 180;
    for (const sign of [-1, 1] as const) {
      const tt = Math.min(1, t + (sign === 1 ? 0.5 / n : 0)); // alternados, não em pares
      const b: Pt = [at(tt, 0), at(tt, 1)];
      const a = dir(tt) + sign * open;
      const l = len * env * (sign === 1 ? 0.94 : 1);
      const tip: Pt = [b[0] + Math.cos(a) * l, b[1] + Math.sin(a) * l];
      // a lâmina encurva para a ponta da haste
      const bend = dir(tt);
      const mid: Pt = [b[0] + Math.cos(a) * l * 0.46 + Math.cos(bend) * l * 0.1, b[1] + Math.sin(a) * l * 0.46 + Math.sin(bend) * l * 0.1];
      const nx = -Math.sin(a) * l * wide;
      const ny = Math.cos(a) * l * wide;
      const c1: Pt = [mid[0] + nx, mid[1] + ny];
      const c2: Pt = [mid[0] - nx, mid[1] - ny];
      const [first, second] = sign === 1 ? [c1, c2] : [c2, c1]; // mesmo sentido de desenho nos dois lados (sem furos na sobreposição)
      out.push(`M${pt(b)}Q${pt(first)} ${pt(tip)}Q${pt(second)} ${pt(b)}Z`);
    }
  }
  // folíolo da ponta
  const a = dir(1);
  const end: Pt = [at(1, 0), at(1, 1)];
  const l = len * 0.5;
  out.push(`M${pt(end)}Q${r1(end[0] + Math.cos(a) * l * 0.5 - Math.sin(a) * l * 0.12)} ${r1(end[1] + Math.sin(a) * l * 0.5 + Math.cos(a) * l * 0.12)} ${r1(end[0] + Math.cos(a) * l)} ${r1(end[1] + Math.sin(a) * l)}Q${r1(end[0] + Math.cos(a) * l * 0.5 + Math.sin(a) * l * 0.12)} ${r1(end[1] + Math.sin(a) * l * 0.5 - Math.cos(a) * l * 0.12)} ${pt(end)}Z`);
  // haste em cunha
  const L: string[] = [];
  const R: string[] = [];
  const N = 18;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const q = dir(t) + Math.PI / 2;
    const hw = 1.9 * (1 - t) + 0.35;
    L.push(`${r1(at(t, 0) + Math.cos(q) * hw)} ${r1(at(t, 1) + Math.sin(q) * hw)}`);
    R.push(`${r1(at(t, 0) - Math.cos(q) * hw)} ${r1(at(t, 1) - Math.sin(q) * hw)}`);
  }
  return { leaves: out.join(""), stem: `M${L.join("L")}L${R.reverse().join("L")}Z` };
}

function Frond({ shape, tone, stem }: { shape: { leaves: string; stem: string }; tone: Tone; stem: Tone }) {
  return (
    <>
      <path d={shape.leaves} style={tone} />
      <path d={shape.stem} style={stem} />
    </>
  );
}

// ───────── Flores ─────────
/** Hibisco: cinco pétalas largas de borda ondulada, nervuras em cunha, miolo escuro e a coluna de estames com pólen. */
const PETAL = "M0 0C1-12 13-24 27-22C34-21 39-15 38-7C42-3 42 5 37 9C40 17 32 25 22 23C10 21 1 11 0 0Z";
const PETAL_VEINS = "M4-.6L31-9L4 .7ZM4-.5L34 0L4 .9ZM4-.2L30 10L4 1.2ZM6-1L22-15L6 0ZM6 .4L21 16L6 1.6Z";
function Hibiscus({ x, y, s, rot = 0 }: { x: number; y: number; s: number; rot?: number }) {
  const petals = [
    { a: 150, k: 0.96, back: true },
    { a: 222, k: 1.02, back: true },
    { a: 6, k: 1, back: false },
    { a: 78, k: 1.05, back: false },
    { a: 296, k: 0.98, back: false },
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {petals.map((p) => (
        <g key={p.a} transform={`rotate(${p.a}) scale(${p.k})`}>
          <path d={PETAL} style={p.back ? TONE.f2 : TONE.f} />
          <path d={PETAL_VEINS} style={TONE.f3} fillOpacity={0.55} />
        </g>
      ))}
      <circle r="6.2" style={TONE.f3} />
      <path d="M-.8-1.6C8-5 17-12 23-22L25.4-20.4C19-9.6 10-2 1 1.8Z" style={TONE.paper} />
      {[[24.5, -22.5, 2.3], [20.5, -19.6, 1.9], [27.5, -18.6, 1.9], [22, -25.6, 1.7], [28, -24, 1.6], [17.8, -15.4, 1.6], [24.6, -15, 1.5]].map(([cx, cy, r]) => (
        <circle key={`${cx}_${cy}`} cx={cx} cy={cy} r={r} style={TONE.p} />
      ))}
    </g>
  );
}

/** Botão de hibisco: cálice de folha e pétalas enroladas. */
function Bud({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-22 .9L0 1.6L0-1.6L-22-.9Z" style={TONE.b} />
      <path d="M6-7C16-12 28-9 34 0C28 9 16 12 6 7C3 3 3-3 6-7Z" style={TONE.f} />
      <path d="M10-1C18-7 27-6 34 0C26-2 18-1 11 3Z" style={TONE.f2} />
      <path d="M-2-5C5-9 13-8 18-3C12-3 9 0 9 0C9 0 12 3 18 4C13 8 5 9-2 5C-4 2-4-2-2-5Z" style={TONE.b} />
    </g>
  );
}

/** Ave-do-paraíso (estrelítzia): bico verde, três sépalas em lâmina e a língua escura. */
function Strelitzia({ x, y, s, rot = 0, flip }: { x: number; y: number; s: number; rot?: number; flip?: boolean }) {
  return (
    <g transform={place(x, y, rot, s, flip)}>
      <path d="M-34 23.4C-18 17 -4 9 6 1.6L8.6 5C-2 13-17 22-32.6 27.6Z" style={TONE.b} />
      <path d="M2 4C14-5 34-9 62-7C46 4 22 12 3 9.6C1 8 .8 5.6 2 4Z" style={TONE.b} />
      <path d="M12 1.5C8-14 10-30 18-44C23-30 23-14 20-.6Z" style={TONE.f} />
      <path d="M20-.8C22-15 30-28 43-36C43-22 36-9 28-2.2Z" style={TONE.f2} />
      <path d="M28-2.4C36-12 48-19 62-21C56-11 46-5 35-3.6Z" style={TONE.f} />
      <path d="M17 .6C24-9 33-16 44-19C40-10 32-3 23-.4Z" style={{ fill: "var(--tp-ink)" }} />
      <path d="M6 5.4C22 3 42-1 60-6.4C42 1.6 22 7 6 7.6Z" style={TONE.a} />
    </g>
  );
}

/** Jasmim-manga: cinco pétalas em cata-vento (para o chá). */
function Plumeria({ x, y, s, rot = 0 }: { x: number; y: number; s: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 0C-3-8 2-17 11-18C17-13 15-4 0 0Z" style={TONE.f} />
          <path d="M0 0C4-3 9-9 11-18C17-13 15-4 0 0Z" style={TONE.f2} />
        </g>
      ))}
      <circle r="3.2" style={TONE.p} />
    </g>
  );
}

/** Folha simples em lâmina, com nervura em cunha (preenche os vãos entre as folhas grandes). */
function Blade({ x, y, rot, s, tone, rib }: { x: number; y: number; rot: number; s: number; tone: Tone; rib: Tone }) {
  return (
    <g transform={place(x, y, rot, s)}>
      <path d="M0 0C9-10 27-11 42 0C27 9 9 9 0 0Z" style={tone} />
      <path d="M0-.9L39 0L0 .9Z" style={rib} />
    </g>
  );
}

const FLOWER_BIRD = new Set(["aniversario", "formatura"]);

// Folhas de palmeira dos dois cantos (calculadas uma vez)
const FROND_TOP_A = frond([[378, 22], [318, 4], [216, 12], [132, 56]], 15, 44);
const FROND_TOP_B = frond([[380, 60], [344, 92], [312, 122], [288, 158]], 10, 33, 0.12);
const FROND_BOT_A = frond([[-10, 96], [50, 92], [128, 96], [206, 112]], 12, 40);
const FROND_BOT_B = frond([[-6, 76], [12, 60], [36, 46], [64, 36]], 9, 28, 0.12);
const FROND_SIGN = frond([[-8, 104], [40, 99], [98, 101], [156, 113]], 11, 34);

/** Canto de cima, à direita: o maço principal. As folhas saem de fora do cartão e descem em diagonal. */
function TopArt({ eventType }: { eventType?: string }) {
  const bird = FLOWER_BIRD.has(eventType ?? "");
  return (
    <svg className="tp-top" viewBox="0 0 360 200" aria-hidden="true">
      <Banana x={380} y={-4} rot={170} s={2.5} tone={TONE.d} rib={TONE.paper} />
      <Frond shape={FROND_TOP_B} tone={TONE.c} stem={TONE.a} />
      <Banana shape={BANANA_B} x={380} y={34} rot={156} s={1.9} tone={TONE.c} rib={TONE.d} />
      <Banana x={384} y={70} rot={124} s={1.26} flip tone={TONE.c} rib={TONE.d} />
      <Frond shape={FROND_TOP_A} tone={TONE.a} stem={TONE.b} />
      <Monstera shape={MONSTERA_B} x={380} y={78} rot={109} s={0.96} tone={TONE.a} vein={TONE.c} stalk={30} />
      <Monstera x={376} y={2} rot={150} s={1.3} tone={TONE.b} vein={TONE.a} stalk={30} />
      {bird ? (
        <>
          <Strelitzia x={286} y={128} s={1.06} rot={204} flip />
          <Bud x={350} y={92} rot={112} s={0.84} />
        </>
      ) : (
        <>
          <Hibiscus x={312} y={42} s={0.92} rot={-18} />
          <Bud x={350} y={96} rot={112} s={0.84} />
        </>
      )}
    </svg>
  );
}

/** Canto de baixo, à esquerda: eco menor do maço de cima, subindo em diagonal. */
function BottomArt({ eventType }: { eventType?: string }) {
  return (
    <svg className="tp-bottom" viewBox="0 0 360 118" aria-hidden="true">
      <Banana shape={BANANA_B} x={-14} y={112} rot={-9} s={2.3} flip tone={TONE.d} rib={TONE.paper} />
      <Frond shape={FROND_BOT_B} tone={TONE.c} stem={TONE.a} />
      <Banana x={-8} y={124} rot={-24} s={1.5} tone={TONE.c} rib={TONE.d} />
      <Frond shape={FROND_BOT_A} tone={TONE.a} stem={TONE.b} />
      <Monstera shape={MONSTERA_B} x={-12} y={124} rot={-41} s={0.84} tone={TONE.b} vein={TONE.a} stalk={20} />
            {eventType === "cha" ? (
        <>
          <Plumeria x={104} y={98} s={0.92} rot={12} />
          <Plumeria x={136} y={110} s={0.66} rot={40} />
          <Plumeria x={74} y={84} s={0.6} rot={-20} />
        </>
      ) : FLOWER_BIRD.has(eventType ?? "") ? (
        <Hibiscus x={100} y={104} s={0.6} rot={30} />
      ) : (
        <Bud x={98} y={106} rot={-24} s={0.92} />
      )}
    </svg>
  );
}

/** Divisor: raminho de três folhas, alinhado à esquerda como o texto. Também assina o fim da página. */
function Sprig() {
  return (
    <svg className="tp-sprig" viewBox="0 0 86 26" width="86" height="26" aria-hidden="true">
      <path d="M0 21.4C14 20.6 30 17.6 44 12.4L44.6 13.9C30.4 19.4 14 22.6 0 23.2Z" style={TONE.b} />
      <Blade x={8} y={21} rot={-58} s={0.42} tone={TONE.a} rib={TONE.c} />
      <Blade x={20} y={19} rot={-46} s={0.5} tone={TONE.b} rib={TONE.a} />
      <Blade x={22} y={20} rot={22} s={0.36} tone={TONE.a} rib={TONE.c} />
      <Blade x={34} y={16} rot={-30} s={0.56} tone={TONE.a} rib={TONE.c} />
      <Blade x={42} y={13.4} rot={-8} s={0.6} tone={TONE.b} rib={TONE.a} />
      <circle cx="74" cy="9.6" r="3.4" style={TONE.f} />
      <circle cx="64.6" cy="11.4" r="2.1" style={TONE.f} />
      <circle cx="82.6" cy="7.6" r="1.5" style={TONE.f} />
    </svg>
  );
}

/** Fecho da página: o maço volta, menor e espelhado, no canto de baixo à direita. Vem junto do raminho (slot divider) e só
    aparece dentro de .inv-sign (style.css). */
function SignArt() {
  return (
    <svg className="tp-sign" viewBox="0 0 220 120" aria-hidden="true">
      <g transform="translate(220 0) scale(-1 1)">
        <Banana shape={BANANA_B} x={-14} y={116} rot={-8} s={1.7} flip tone={TONE.d} rib={TONE.paper} />
        <Banana x={-8} y={126} rot={-27} s={1.2} tone={TONE.c} rib={TONE.d} />
        <Frond shape={FROND_SIGN} tone={TONE.a} stem={TONE.b} />
        <Monstera x={-6} y={130} rot={-74} s={0.62} tone={TONE.a} vein={TONE.c} stalk={20} />
        <Monstera shape={MONSTERA_B} x={-12} y={128} rot={-40} s={0.86} tone={TONE.b} vein={TONE.a} stalk={20} />
        <Hibiscus x={96} y={100} s={0.56} rot={24} />
        <Bud x={132} y={108} rot={-20} s={0.7} />
      </g>
    </svg>
  );
}

/** Fundo da página: duas sombras de folha, tom sobre tom, uma em cada lado. */
function Backdrop() {
  return (
    <>
      <svg className="tp-bg tp-bg-a" viewBox="0 0 200 200" aria-hidden="true">
        <g transform="translate(30 20) rotate(48) scale(1.45)">
          <path d={MONSTERA_A.blade[0]} fillRule="evenodd" fill="currentColor" />
          <path d={MONSTERA_A.blade[1]} fillRule="evenodd" fill="currentColor" />
        </g>
      </svg>
      <svg className="tp-bg tp-bg-b" viewBox="0 0 220 150" aria-hidden="true">
        <path d={frond([[226, 30], [170, 30], [90, 50], [14, 120]], 14, 52).leaves} fill="currentColor" />
      </svg>
    </>
  );
}

/** Forro do envelope: estampa de folhagem cheia, em leque a partir da base, com um hibisco no centro. */
const LINER_FRONDS = [frond([[140, 214], [120, 170], [92, 132], [52, 104]], 11, 34, 0.12), frond([[140, 214], [160, 170], [188, 132], [228, 104]], 11, 34, 0.12), frond([[20, 214], [10, 180], [0, 150], [-14, 126]], 8, 30), frond([[260, 214], [270, 180], [280, 150], [294, 126]], 8, 30)];
function Liner() {
  const u = useUid();
  const id = `tropical-liner-${u}`;
  return (
    <svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect width="280" height="200" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Banana x={140} y={212} rot={-90} s={1.5} tone={TONE.c} rib={TONE.a} />
        <Banana shape={BANANA_B} x={96} y={214} rot={-158} s={1.6} tone={TONE.b} rib={TONE.a} />
        <Banana shape={BANANA_B} x={184} y={214} rot={-22} s={1.6} flip tone={TONE.b} rib={TONE.a} />
        <Banana x={60} y={236} rot={-128} s={1.3} tone={TONE.c} rib={TONE.a} />
        <Banana x={220} y={236} rot={-52} s={1.3} flip tone={TONE.c} rib={TONE.a} />
        {LINER_FRONDS.map((f, i) => (
          <Frond key={i} shape={f} tone={i < 2 ? TONE.paper : TONE.c} stem={TONE.b} />
        ))}
        <Monstera x={140} y={206} rot={-124} s={0.86} tone={TONE.b} vein={TONE.a} />
        <Monstera shape={MONSTERA_B} x={140} y={206} rot={-56} s={0.86} flip tone={TONE.b} vein={TONE.a} />
        <Monstera shape={MONSTERA_B} x={40} y={206} rot={-166} s={0.7} tone={TONE.c} vein={TONE.a} />
        <Monstera x={240} y={206} rot={-14} s={0.7} flip tone={TONE.c} vein={TONE.a} />
        <Hibiscus x={140} y={170} s={0.72} rot={-70} />
        <Bud x={88} y={186} rot={-150} s={0.7} />
        <Bud x={192} y={186} rot={-30} s={0.7} />
      </g>
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps): ReactNode {
  if (slot === "top") return <TopArt eventType={eventType} />;
  if (slot === "bottom") return <BottomArt eventType={eventType} />;
  if (slot === "divider")
    return (
      <>
        <Sprig />
        <SignArt />
      </>
    );
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "tropical",
  name: "Tropical",
  description: "Costela-de-adão, palmeira e hibisco em cartaz, com título forte à esquerda",
  premium: true,
  suits: ["casamento", "aniversario", "cha", "formatura", "outro"],
  palettes: [
    { id: "floresta", name: "Verde-floresta e coral", vars: { bg: "#D3E2CE", paper: "#FCF7EA", ink: "#14382A", soft: "#496052", accent: "#E2553A", line: "#C5D5BC", btnInk: "#FCF7EA", seal: "#D9482F", sealInk: "#FFF3DC", liner: "#3A8C60" } },
    { id: "manga", name: "Verde e amarelo-manga", vars: { bg: "#F6E3A6", paper: "#FFFBEE", ink: "#1C4433", soft: "#50654F", accent: "#EE9B0A", line: "#E6D8A6", btnInk: "#FFFBEE", seal: "#F0A417", sealInk: "#1C4433", liner: "#4E9A56" } },
    { id: "piscina", name: "Azul-piscina e rosa", vars: { bg: "#C9E7EA", paper: "#FFFAF4", ink: "#0E3B47", soft: "#46656F", accent: "#EC5B8C", line: "#BADADF", btnInk: "#FFFAF4", seal: "#DC3F77", sealInk: "#FFF1F5", liner: "#1FA0B2" } },
    { id: "terracota", name: "Terracota e verde-oliva", vars: { bg: "#EAD6BD", paper: "#FBF3E4", ink: "#30341A", soft: "#5C5C3A", accent: "#C8572B", line: "#DCC9A8", btnInk: "#FBF3E4", seal: "#B94E26", sealInk: "#FCEBD2", liner: "#7C8A38" } },
    { id: "noite", name: "Noite na mata", vars: { bg: "#0C261F", paper: "#12362B", ink: "#F7EFDB", soft: "#BFCDBA", accent: "#FF8A5E", line: "#2E5A49", btnInk: "#12362B", seal: "#F26B42", sealInk: "#3A1208", liner: "#2E9068" } },
  ],
  Art,
};
