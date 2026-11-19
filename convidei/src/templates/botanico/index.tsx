import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";

// Botânico: ramos de eucalipto e oliveira em traço fino, em dois cantos opostos do cartão (nunca espelhados).
// As folhas são geradas por uma função determinística (mesma saída no servidor e no cliente), com pequenas
// irregularidades de tamanho e ângulo para parecerem desenhadas à mão. O traço usa a cor de destaque da paleta;
// as azeitonas usam a cor do lacre.

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];
type Kind = "euc" | "oliva";
type Stem = {
  curve: Curve;
  kind: Kind;
  count: number;
  size: number;
  seed: number;
  from?: number;
  /** nós (oliveira) que ganham uma azeitona */
  berries?: number[];
  /** folhas que faltam, como "nó:lado" (lado -1 ou 1): quebra a simetria e abre espaço para outro ramo ou para uma azeitona */
  skip?: string[];
};
type Leaf = { outline: string; veins: string; tint: string | null };
type Berry = { stalk: string; cx: number; cy: number; rx: number; ry: number; turn: number };
type Sprig = { stem: { d: string; width: number }[]; leaves: Leaf[]; berries: Berry[] };

const r1 = (n: number) => Math.round(n * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;
const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

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

/** Divide a curva em `t` (de Casteljau). */
function split([p0, p1, p2, p3]: Curve, t: number): [Curve, Curve] {
  const a = mix(p0, p1, t), b = mix(p1, p2, t), c = mix(p2, p3, t);
  const d = mix(a, b, t), e = mix(b, c, t);
  const f = mix(d, e, t);
  return [[p0, a, d, f], [f, e, c, p3]];
}

/** O caule em trechos de espessura decrescente: grosso onde nasce, fino na ponta, como traço de pena. */
function stemParts(curve: Curve, base: number, tip: number, parts = 4): { d: string; width: number }[] {
  const out: { d: string; width: number }[] = [];
  let rest = curve;
  for (let i = 0; i < parts; i++) {
    const [head, tail] = i === parts - 1 ? [rest, rest] : split(rest, 1 / (parts - i));
    rest = tail;
    const [a, b, c, d] = head;
    out.push({
      d: `M${r1(a[0])} ${r1(a[1])}C${r1(b[0])} ${r1(b[1])} ${r1(c[0])} ${r1(c[1])} ${r1(d[0])} ${r1(d[1])}`,
      width: r1(base + ((tip - base) * i) / (parts - 1)),
    });
  }
  return out;
}

/**
 * Uma folha em três camadas: contorno (com o pecíolo), nervuras (traço mais fino) e meia folha de aguada
 * (o lado de baixo da nervura central, como sombra de aquarela). `width` é a meia largura dos pontos de controle.
 */
function leafParts(bx: number, by: number, angle: number, length: number, width: number, petiole: number, up: number, down: number, bend: number, side = 0): Leaf {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const P = (x: number, y: number) => `${r1(bx + x * c - y * s)} ${r1(by + x * s + y * c)}`;
  const x0 = petiole;
  const x1 = petiole + length;
  const lower = `C${P(x0 + length * 0.8, width * down * 0.82 + bend)} ${P(x0 + length * 0.24, width * down)} ${P(x0, 0)}`;
  const upper = `C${P(x0 + length * 0.2, -width * up)} ${P(x0 + length * 0.78, -width * up * 0.9 + bend)} ${P(x1, bend)}`;
  // nervura central: a mesma curva que limita a aguada, parando um pouco antes da ponta
  const mid = (t: number): [number, number] => [x0 + length * (t * (1 - t) + t * t), 2 * t * (1 - t) * bend * 0.28 + t * t * bend];
  const stop = 0.9;
  let veins = `M${P(x0, 0)}Q${P(x0 + length * 0.5 * stop, bend * 0.28 * stop)} ${P(...mid(stop))}`;
  // nervuras laterais (só nas folhas largas): curtas, curvadas para a ponta
  for (let n = 0; n < side; n++) {
    for (const [dir, shift, wide] of [[-1, 0, up], [1, 0.08, down]] as const) {
      const u = 0.24 + (n * 0.5) / Math.max(1, side) + shift;
      const [mx, my] = mid(u);
      const v = u + 0.2;
      const edge = 0.5 * wide * width * Math.sin(Math.PI * Math.min(1, v + 0.05)) ** 0.8;
      veins += `M${P(mx, my)}Q${P(x0 + length * (u + 0.07), my + dir * edge * 0.62)} ${P(x0 + length * v, my + dir * edge)}`;
    }
  }
  return {
    outline: `M${P(0, 0)}L${P(x0, 0)}${upper}${lower}`,
    veins,
    tint: `M${P(x0, 0)}Q${P(x0 + length * 0.5, bend * 0.28)} ${P(x1, bend)}${lower}Z`,
  };
}

/** Folha num traço só (contorno e nervura), para o divisor e o forro. */
function leaf(...args: [number, number, number, number, number, number, number, number, number]): string {
  const { outline, veins } = leafParts(...args);
  return outline + veins;
}

function sprig({ curve, kind, count, size, seed, from = 0.1, berries = [], skip = [] }: Stem): Sprig {
  const rand = rng(seed);
  const jitter = (amount: number) => (rand() - 0.5) * 2 * amount;
  const out: Sprig = { stem: stemParts(curve, kind === "euc" ? 1.75 : 1.55, 0.95), leaves: [], berries: [] };
  const add = (item: Leaf, wash: boolean) => out.leaves.push(wash ? item : { ...item, tint: null });

  for (let i = 0; i < count; i++) {
    const t = from + ((1 - from) * (i + 0.35)) / count;
    const taper = 1 - (kind === "euc" ? 0.5 : 0.32) * t;
    if (kind === "euc") {
      // eucalipto: folhas arredondadas em pares opostos, cada uma com seu tamanho e sua inclinação
      for (const side of [-1, 1]) {
        const p = at(curve, Math.min(0.97, t + jitter(0.02)));
        const length = size * taper * (0.74 + rand() * 0.46);
        const spread = rad(58 - 20 * t + jitter(18));
        const item = leafParts(p.x, p.y, p.angle + side * spread, length, length * (0.48 + rand() * 0.1), length * 0.12, 0.9 + rand() * 0.25, 0.9 + rand() * 0.25, jitter(length * 0.07), length > 21 ? 2 : length > 15 ? 1 : 0);
        const wash = rand() < 0.62;
        if (!skip.includes(`${i}:${side}`)) add(item, wash);
      }
    } else {
      // oliveira: folhas estreitas e alternadas, levemente curvadas
      const side = i % 2 === 0 ? -1 : 1;
      const p = at(curve, t);
      const length = size * taper * (0.85 + rand() * 0.3);
      const spread = rad(40 - 10 * t + jitter(9));
      const item = leafParts(p.x, p.y, p.angle + side * spread, length, length * 0.18, length * 0.08, 1, 1, side * length * (0.06 + rand() * 0.08));
      const wash = rand() < 0.45;
      if (!skip.includes(`${i}:${side}`)) add(item, wash);
      if (berries.includes(i)) {
        // azeitona: sai do nó pelo lado oposto ao da folha, num cabinho curvo, e pende com o próprio peso
        const a = p.angle - side * rad(64 + jitter(8));
        const reach = size * 0.26;
        const kx = p.x + Math.cos(a) * reach * 0.62;
        const ky = p.y + Math.sin(a) * reach * 0.62;
        const ex = kx + Math.cos(a) * reach * 0.22;
        const ey = ky + Math.sin(a) * reach * 0.22 + reach * 0.5;
        const hang = Math.atan2(ey - ky, ex - kx);
        const ry = size * (0.17 + rand() * 0.02);
        out.berries.push({
          stalk: `M${r1(p.x)} ${r1(p.y)}Q${r1(kx)} ${r1(ky)} ${r1(ex)} ${r1(ey)}`,
          cx: r1(ex + Math.cos(hang) * ry * 0.92),
          cy: r1(ey + Math.sin(hang) * ry * 0.92),
          rx: r1(ry * 0.7),
          ry: r1(ry),
          turn: Math.round((hang * 180) / Math.PI - 90),
        });
      }
    }
  }
  // folha da ponta, na direção do ramo
  const tip = at(curve, 1);
  const tipLength = size * (kind === "euc" ? 0.5 : 0.72);
  add(leafParts(tip.x, tip.y, tip.angle + rad(jitter(10)), tipLength, tipLength * (kind === "euc" ? 0.46 : 0.18), 0, 1, 1, 0, kind === "euc" ? 1 : 0), kind === "euc");
  return out;
}

const delay = (step: number): CSSProperties => ({ "--d": step } as CSSProperties);

function Branches({ stems, viewBox, className }: { stems: Stem[]; viewBox: string; className: string }) {
  const sprigs = stems.map(sprig);
  return (
    <svg className={`bot-branch ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {sprigs.map((item, index) => {
        const step = index * 5;
        return (
          <g key={index}>
            {item.leaves.map((part, n) => (
              <g key={n}>
                <path className="bot-draw bot-leaf" d={part.outline} pathLength={1} style={delay(step + 2 + n * 0.8)} />
                {/* aguada: meia folha na segunda tinta, por dentro do contorno */}
                {part.tint && <path className="bot-fade bot-tint" d={part.tint} />}
                <path className="bot-fade bot-vein" d={part.veins} />
              </g>
            ))}
            {item.stem.map((part, n) => (
              <path key={n} className="bot-draw" d={part.d} pathLength={1} strokeWidth={part.width} style={delay(step + n * 2.5)} />
            ))}
            {item.berries.map((berry, n) => (
              <g key={n} className="bot-fade bot-berry">
                <path d={berry.stalk} />
                <ellipse cx={berry.cx} cy={berry.cy} rx={berry.rx} ry={berry.ry} transform={`rotate(${berry.turn} ${berry.cx} ${berry.cy})`} />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// Canto superior esquerdo: o motivo principal. Um ramo de eucalipto que atravessa o topo e um de oliveira que desce
// pelo espaço deixado pela folha que falta no primeiro par.
const TOP: Stem[] = [
  { curve: [[-12, 50], [60, 20], [162, 24], [266, 78]], kind: "euc", count: 8, size: 36, seed: 7, from: 0.05, skip: ["0:1"] },
  { curve: [[-8, 58], [16, 80], [31, 106], [23, 138]], kind: "oliva", count: 7, size: 27, seed: 23, from: 0.24, berries: [2, 5], skip: ["3:1", "6:-1"] },
];
// Canto inferior direito: resposta menor, com outro desenho (não é o espelho do topo).
const BOTTOM: Stem[] = [
  { curve: [[236, 100], [186, 122], [124, 118], [62, 92]], kind: "oliva", count: 9, size: 27, seed: 41, from: 0.1, berries: [1, 5], skip: ["4:-1"] },
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
