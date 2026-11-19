import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";

// Botânico: ramos de eucalipto e oliveira em traço fino, em dois cantos opostos do cartão (nunca espelhados).
// As folhas são geradas por uma função determinística (mesma saída no servidor e no cliente), com pequenas
// irregularidades de tamanho e ângulo para parecerem desenhadas à mão. O traço usa a cor de destaque da paleta;
// as azeitonas usam a cor do lacre.

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];
type Kind = "euc" | "oliva";
type Stem = { curve: Curve; kind: Kind; count: number; size: number; seed: number; from?: number; berries?: number[] };
type Sprig = { stem: string; leaves: string[]; washes: string[]; berries: { stalk: string; cx: number; cy: number; r: number }[] };

const r1 = (n: number) => Math.round(n * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Gerador pseudoaleatório com semente fixa: a "mão" do desenho é sempre a mesma. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function at([p0, p1, p2, p3]: Curve, t: number): { x: number; y: number; angle: number } {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, angle: Math.atan2(dy, dx) };
}

/** Uma folha: pecíolo, contorno assimétrico e nervura central. `width` é a meia largura dos pontos de controle. */
function leaf(bx: number, by: number, angle: number, length: number, width: number, petiole: number, up: number, down: number, bend: number): string {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const P = (x: number, y: number) => `${r1(bx + x * c - y * s)} ${r1(by + x * s + y * c)}`;
  const x0 = petiole;
  const x1 = petiole + length;
  return (
    `M${P(0, 0)}L${P(x0, 0)}` +
    `C${P(x0 + length * 0.2, -width * up)} ${P(x0 + length * 0.78, -width * up * 0.9 + bend)} ${P(x1, bend)}` +
    `C${P(x0 + length * 0.8, width * down * 0.82 + bend)} ${P(x0 + length * 0.24, width * down)} ${P(x0, 0)}` +
    `M${P(x0, 0)}Q${P(x0 + length * 0.4, bend * 0.15)} ${P(x0 + length * 0.72, bend * 0.75)}`
  );
}

function sprig({ curve, kind, count, size, seed, from = 0.1, berries = [] }: Stem): Sprig {
  const rand = rng(seed);
  const jitter = (amount: number) => (rand() - 0.5) * 2 * amount;
  const [p0, p1, p2, p3] = curve;
  const out: Sprig = { stem: `M${p0[0]} ${p0[1]}C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`, leaves: [], washes: [], berries: [] };
  const add = (d: string, wash: boolean) => {
    out.leaves.push(d);
    if (wash) out.washes.push(d);
  };

  for (let i = 0; i < count; i++) {
    const t = from + ((1 - from) * (i + 0.35)) / count;
    const taper = 1 - (kind === "euc" ? 0.5 : 0.32) * t;
    if (kind === "euc") {
      // eucalipto: folhas arredondadas em pares opostos, cada uma com seu tamanho
      for (const side of [-1, 1]) {
        const p = at(curve, Math.min(0.97, t + jitter(0.012)));
        const length = size * taper * (0.78 + rand() * 0.42);
        const spread = rad(58 - 20 * t + jitter(11));
        add(leaf(p.x, p.y, p.angle + side * spread, length, length * (0.48 + rand() * 0.1), length * 0.09, 0.9 + rand() * 0.25, 0.9 + rand() * 0.25, jitter(length * 0.06)), rand() < 0.62);
      }
    } else {
      // oliveira: folhas estreitas e alternadas, levemente curvadas
      const side = i % 2 === 0 ? -1 : 1;
      const p = at(curve, t);
      const length = size * taper * (0.85 + rand() * 0.3);
      const spread = rad(40 - 10 * t + jitter(7));
      add(leaf(p.x, p.y, p.angle + side * spread, length, length * 0.17, length * 0.08, 1, 1, side * length * (0.06 + rand() * 0.08)), rand() < 0.4);
      if (berries.includes(i)) {
        const a = p.angle - side * rad(58 + jitter(8));
        const reach = size * 0.36;
        const cx = r1(p.x + Math.cos(a) * reach);
        const cy = r1(p.y + Math.sin(a) * reach);
        out.berries.push({ stalk: `M${r1(p.x)} ${r1(p.y)}L${cx} ${cy}`, cx, cy, r: r1(size * 0.085 + rand() * 0.4) });
      }
    }
  }
  // folha da ponta, na direção do ramo
  const tip = at(curve, 1);
  const tipLength = size * (kind === "euc" ? 0.5 : 0.72);
  add(leaf(tip.x, tip.y, tip.angle + rad(jitter(10)), tipLength, tipLength * (kind === "euc" ? 0.46 : 0.17), 0, 1, 1, 0), kind === "euc");
  return out;
}

const delay = (step: number): CSSProperties => ({ "--d": step } as CSSProperties);

function Branches({ stems, viewBox, className }: { stems: Stem[]; viewBox: string; className: string }) {
  const sprigs = stems.map(sprig);
  return (
    <svg className={`bot-branch ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {sprigs.map((item, index) => {
        const step = index * 5;
        return (
          <g key={index}>
            {item.leaves.map((d, n) => (
              <path key={n} className="bot-draw bot-leaf" d={d} pathLength={1} style={delay(step + 2 + n * 0.8)} />
            ))}
            <path className="bot-draw" d={item.stem} pathLength={1} strokeWidth="1.3" style={delay(step)} />
            {item.berries.map((berry, n) => (
              <g key={n} className="bot-berry">
                <path d={berry.stalk} />
                <circle cx={berry.cx} cy={berry.cy} r={berry.r} />
              </g>
            ))}
          </g>
        );
      })}
      {/* aguada leve, um pouco fora de registro, como em impressão de duas tintas */}
      <g className="bot-wash" fill="currentColor" stroke="none" transform="translate(1.8 1.4)">
        {sprigs.map((item, index) => item.washes.map((d, n) => <path key={`${index}-${n}`} d={d} />))}
      </g>
    </svg>
  );
}

// Canto superior esquerdo: o motivo principal. Um ramo de eucalipto que atravessa o topo e um de oliveira que desce.
const TOP: Stem[] = [
  { curve: [[-12, 50], [60, 20], [162, 24], [266, 78]], kind: "euc", count: 8, size: 36, seed: 7, from: 0.05 },
  { curve: [[-8, 44], [20, 74], [36, 108], [25, 148]], kind: "oliva", count: 8, size: 28, seed: 23, from: 0.2, berries: [3, 6] },
];
// Canto inferior direito: resposta menor, com outro desenho (não é o espelho do topo).
const BOTTOM: Stem[] = [
  { curve: [[236, 100], [186, 122], [124, 118], [62, 92]], kind: "oliva", count: 9, size: 27, seed: 41, from: 0.1, berries: [2, 5] },
  { curve: [[232, 104], [210, 82], [202, 58], [210, 32]], kind: "euc", count: 3, size: 26, seed: 13, from: 0.24 },
];

function Divider() {
  return (
    <svg className="bot-divider" viewBox="0 0 132 18" width="132" height="18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 10h40M90 10h40" opacity="0.7" />
      <path d={leaf(64, 12, rad(-162), 14, 2.7, 1.5, 1, 1, -1.2)} />
      <path d={leaf(68, 12, rad(-18), 14, 2.7, 1.5, 1, 1, 1.2)} />
      <circle className="bot-berry-dot" cx="66" cy="5.2" r="1.9" />
    </svg>
  );
}

function Liner() {
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="botanico-liner" width="46" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
          <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d={leaf(6, 30, rad(-48), 17, 3.2, 2, 1, 1, 1.4)} />
            <path d={leaf(10, 31, rad(-8), 13, 2.6, 2, 1, 1, -1)} />
            <path d={leaf(32, 12, rad(128), 15, 2.9, 2, 1, 1, 1.2)} />
            <path d={leaf(29, 10, rad(172), 11, 2.3, 2, 1, 1, -0.8)} />
          </g>
          <circle cx="36" cy="30" r="1.5" fill="currentColor" />
          <circle cx="13" cy="8" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#botanico-liner)" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Branches stems={TOP} viewBox="0 0 292 172" className="bot-branch-top" />;
  if (slot === "bottom") return <Branches stems={BOTTOM} viewBox="30 10 200 126" className="bot-branch-bottom" />;
  if (slot === "divider") return <Divider />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "botanico",
  name: "Botânico",
  description: "Ramos de eucalipto e oliveira em traço fino",
  premium: false,
  suits: ["casamento", "cha"],
  palettes: [
    { id: "salvia", name: "Sálvia e creme", vars: { bg: "#DFE4D4", paper: "#FBF8EF", ink: "#2F3A2B", soft: "#5A6651", accent: "#7F9572", line: "#D6DCC9", btnInk: "#FFFFFF", seal: "#5F7353", sealInk: "#F4EFDF", liner: "#CCD6BE" } },
    { id: "oliva", name: "Oliva", vars: { bg: "#E5E1CC", paper: "#FAF7EA", ink: "#353A22", soft: "#636745", accent: "#848B55", line: "#D9D6BB", btnInk: "#FFFFFF", seal: "#5F6736", sealInk: "#F3EED6", liner: "#D2D1AC" } },
    { id: "eucalipto", name: "Eucalipto azulado", vars: { bg: "#D9E2E0", paper: "#F8FAF6", ink: "#24393B", soft: "#4F686A", accent: "#6E9595", line: "#CBD8D6", btnInk: "#FFFFFF", seal: "#3F6468", sealInk: "#E9F1EE", liner: "#BDD0CE" } },
    { id: "terracota", name: "Verde e terracota", vars: { bg: "#EEE2D5", paper: "#FCF8F1", ink: "#33402F", soft: "#66604F", accent: "#7C906B", line: "#E4D5C3", btnInk: "#FFFFFF", seal: "#A9573D", sealInk: "#FBEADD", liner: "#E8C8B4" } },
  ],
  Art,
};
