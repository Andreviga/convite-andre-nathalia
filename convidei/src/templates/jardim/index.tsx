import type { ReactNode } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Jardim: moldura botânica de jardim inglês. Peônias, rosas de jardim e folhagem pintadas em camadas (guache: formas cheias,
// do tom claro ao escuro), com um ramo fino que sobe por um fio em volta do cartão. Os quatro cantos têm buquês de tamanhos
// diferentes, que entram no papel; o texto fica no respiro do meio.
// Cores: as flores vêm de --accent e --seal, a folhagem de --soft (ver as variáveis --jd-* no style.css).
// Tudo é calculado uma vez, com sorteio fixo: o desenho é irregular como pintura, mas idêntico no servidor e no navegador.

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const RAD = Math.PI / 180;

function dice(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9) >>> 0;
    return ((s ^ (s >>> 13)) >>> 0) / 4294967296;
  };
}

// ───── Pétalas (base em 0,0; ponta em 0,-1) ─────
const PETALS = [
  // 0: larga, de borda ondulada (peônia)
  "M0 0C-.34-.06-.6-.4-.5-.74C-.44-.94-.26-1.02-.14-.93C-.08-1.03.1-1.04.16-.94C.3-1.03.48-.9.52-.7C.58-.38.3-.06 0 0Z",
  // 1: redonda, com um vinco na ponta (rosa)
  "M0 0C-.3-.1-.52-.5-.4-.8C-.32-1-.12-1.03 0-.95C.12-1.04.32-1 .42-.8C.52-.5.28-.1 0 0Z",
  // 2: em concha, miúda (miolo)
  "M0 0C-.26-.12-.4-.5-.3-.8C-.2-1 .2-1 .3-.8C.4-.5.26-.12 0 0Z",
  // 3: larga e assimétrica, dobrada de um lado
  "M0 0C-.3-.04-.56-.34-.52-.66C-.48-.9-.3-1-.12-.96C0-1.06.22-1.02.36-.86C.56-.62.4-.12 0 0Z",
];

type Petal = { k: number; a: number; off: number; w: number; l: number; g: "o" | "m" | "i" };
type Dot = { x: number; y: number; r: number };
type Bloom = { petals: Petal[]; dots: Dot[] };

/** Peônia vista de cima: pétalas de guarda largas e claras, miolo cheio e mais escuro, estames no centro. */
function buildPeony(seed: number): Bloom {
  const rnd = dice(seed);
  const petals: Petal[] = [];
  const ring = (n: number, l: number, w: number, off: number, g: Petal["g"], kinds: number[], turn: number) => {
    // ordem intercalada: as pétalas se sobrepõem de modo irregular, não em catavento
    const order = Array.from({ length: n }, (_, i) => (i * 2) % n + (n % 2 === 0 && i >= n / 2 ? 1 : 0));
    for (const i of order) {
      petals.push({ k: kinds[Math.floor(rnd() * kinds.length)], a: r1(turn + (360 / n) * (i + (rnd() - 0.5) * 0.5)), off: r3(off * (0.6 + rnd() * 0.8)), w: r3(w * (0.88 + rnd() * 0.26)), l: r3(l * (0.9 + rnd() * 0.2)), g });
    }
  };
  ring(6, 1, 1.12, 0.02, "o", [0, 3], rnd() * 60);
  ring(7, 0.78, 0.86, 0.03, "o", [0, 3], rnd() * 50);
  ring(7, 0.57, 0.66, 0.04, "m", [0, 1, 3], rnd() * 50);
  ring(6, 0.38, 0.46, 0.03, "m", [1, 2], rnd() * 60);
  ring(5, 0.24, 0.3, 0.01, "i", [2], rnd() * 70);
  const dots: Dot[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i * 137.5 + rnd() * 20) * RAD;
    const d = 0.025 + 0.012 * i;
    dots.push({ x: r3(Math.cos(a) * d), y: r3(Math.sin(a) * d), r: r3(0.022 + rnd() * 0.012) });
  }
  return { petals, dots };
}

type Arc = { d: string; t: number };
type Rose = { outer: Petal[]; arcs: Arc[] };

/** Rosa de jardim (em roseta): pétalas redondas por fora e, por dentro, crescentes claros em espiral sobre um miolo escuro. */
function buildRose(seed: number): Rose {
  const rnd = dice(seed);
  const outer: Petal[] = [];
  const t0 = rnd() * 72;
  for (const i of [0, 2, 4, 1, 3]) outer.push({ k: 1, a: r1(t0 + 72 * (i + (rnd() - 0.5) * 0.3)), off: 0, w: r3(1.12 + rnd() * 0.14), l: r3(0.95 + rnd() * 0.1), g: "o" });
  const t1 = t0 + 36;
  for (const i of [0, 2, 4, 1, 3]) outer.push({ k: 1, a: r1(t1 + 72 * (i + (rnd() - 0.5) * 0.3)), off: 0, w: r3(1 + rnd() * 0.12), l: r3(0.78 + rnd() * 0.06), g: "m" });
  const arcs: Arc[] = [];
  const rings: [number, number, number, number][] = [
    [0.57, 3, 112, 0],
    [0.45, 3, 108, 1],
    [0.335, 3, 104, 0],
    [0.23, 2, 150, 1],
    [0.13, 2, 140, 0],
  ];
  let turn = rnd() * 120;
  for (const [r, n, span, t] of rings) {
    turn += 360 / n / 2 + 14;
    for (let j = 0; j < n; j++) {
      const a0 = (turn + (360 / n) * j + (rnd() - 0.5) * 12) * RAD;
      const a1 = a0 + (span + (rnd() - 0.5) * 14) * RAD;
      const rr = r * (0.97 + rnd() * 0.06);
      const flat = rr * 1.5;
      arcs.push({ d: `M${r3(Math.cos(a0) * rr)} ${r3(Math.sin(a0) * rr)}A${r3(rr)} ${r3(rr)} 0 0 1 ${r3(Math.cos(a1) * rr)} ${r3(Math.sin(a1) * rr)}A${r3(flat)} ${r3(flat)} 0 0 0 ${r3(Math.cos(a0) * rr)} ${r3(Math.sin(a0) * rr)}Z`, t });
    }
  }
  return { outer, arcs };
}

const petalTransform = (p: Petal) => `rotate(${p.a}) translate(0 ${-p.off}) scale(${p.w} ${p.l})`;

const PEONIES = [buildPeony(4), buildPeony(19), buildPeony(31)];
const ROSES = [buildRose(2), buildRose(9), buildRose(17), buildRose(26)];

type At = { x: number; y: number; r: number; rot?: number; v?: number; sq?: number };

function PeonyAt({ u, x, y, r, rot = 0, v = 0, sq = 0.92 }: At & { u: string }) {
  const b = PEONIES[v % PEONIES.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r} ${r2(r * sq)})`} className="jd-edge">
      {b.petals.map((p, i) => (
        <path key={i} d={PETALS[p.k]} transform={petalTransform(p)} fill={`url(#jardim-${p.g}-${u})`} />
      ))}
      <circle r="0.1" className="jd-p5" stroke="none" opacity="0.55" />
      {b.dots.map((d, i) => (
        <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} className="jd-pollen" stroke="none" />
      ))}
    </g>
  );
}

function RoseAt({ u, x, y, r, rot = 0, v = 0, sq = 0.94 }: At & { u: string }) {
  const b = ROSES[v % ROSES.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r} ${r2(r * sq)})`}>
      <g className="jd-edge">
        {b.outer.map((p, i) => (
          <path key={i} d={PETALS[p.k]} transform={petalTransform(p)} fill={`url(#jardim-${p.g}-${u})`} />
        ))}
      </g>
      <circle r="0.6" className="jd-p4" />
      <circle r="0.36" className="jd-p5" opacity="0.5" />
      {b.arcs.map((a, i) => (
        <path key={`a${i}`} d={a.d} className={a.t ? "jd-p3" : "jd-p2"} />
      ))}
      <circle r="0.045" className="jd-p5" />
    </g>
  );
}

/** Florzinha de cinco pétalas, de preenchimento (flor-de-cera). */
function Blossom({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      <g className="jd-edge jd-p1">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-0.56" rx="0.4" ry="0.48" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="0.2" className="jd-pollen" />
    </g>
  );
}

/** Botão fechado, de lado: três pétalas sobrepostas e o cálice verde. Aponta para cima (0,-1). */
function Bud({ u, x, y, s, rot }: { u: string; x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 .1C-.52-.1-.5-.82 0-1.32C.5-.82.52-.1 0 .1Z" fill={`url(#jardim-m-${u})`} transform="scale(1 1)" />
      <path d="M0 .1C-.52-.1-.5-.82 0-1.32C-.2-.84-.22-.3 0 .1Z" className="jd-p2" />
      <path d="M.08-1.22C.5-.76.5-.1 0 .1C.3-.22.3-.8.08-1.22Z" className="jd-p4" opacity="0.8" />
      <path d="M0 .2C-.32.12-.54-.2-.56-.56C-.32-.38-.1-.22 0 .2ZM0 .2C.32.12.54-.2.56-.56C.32-.38.1-.22 0 .2Z" className="jd-l3" />
      <path d="M-.12.16C-.07-.12 0-.34 0-.6C.03-.34.09-.12.12.16Z" className="jd-l4" />
      <ellipse cx="0" cy=".2" rx=".17" ry=".13" className="jd-l3" />
    </g>
  );
}

// ───── Folhas ─────
// Base em 0,0 e ponta em +x (comprimento 1). Cada folha tem a forma cheia, a metade em sombra e a nervura clara.
const LEAF_SHAPES = [
  { full: "M0 0C.16-.3.6-.36 1 0C.62.32.2.3 0 0Z", shade: "M0 0C.16-.3.6-.36 1 0C.66-.05.32-.03 0 0Z", rib: "M.05 0Q.5-.05.95 0" }, // oval
  { full: "M0 0C.2-.2.64-.24 1 0C.64.2.22.2 0 0Z", shade: "M0 0C.2-.2.64-.24 1 0C.66-.03.32-.02 0 0Z", rib: "M.05 0Q.5-.03.95 0" }, // estreita
  { full: "M0 0C.1-.32.5-.46.98-.12C.7.24.24.3 0 0Z", shade: "M0 0C.1-.32.5-.46.98-.12C.66-.1.3-.06 0 0Z", rib: "M.05 0Q.5-.1.93-.11" }, // curvada
];
const VEINS = "M.26-.02L.38-.16M.46-.03L.6-.17M.66-.03L.78-.13M.3 0L.42.12M.5-.01L.64.13M.7-.02L.8.08";

type Leaf = { x: number; y: number; rot: number; len: number; w?: number; k?: number; t?: number; flip?: boolean };
type Pt = [number, number];
type SprigDef = { stem: [Pt, Pt, Pt, Pt]; n: number; len: number; seed: number; t?: number; thick?: number; tip?: boolean; open?: number };
type Sprig = { stem: string; leaves: Leaf[]; t: number; end: { x: number; y: number; rot: number } };

function buildSprig({ stem: p, n, len, seed, t = 1, thick = 1.5, tip = true, open = 46 }: SprigDef): Sprig {
  const rnd = dice(seed);
  const at = (s: number, k: 0 | 1) => (1 - s) ** 3 * p[0][k] + 3 * (1 - s) ** 2 * s * p[1][k] + 3 * (1 - s) * s * s * p[2][k] + s ** 3 * p[3][k];
  const dir = (s: number) => Math.atan2(at(Math.min(1, s + 0.01), 1) - at(Math.max(0, s - 0.01), 1), at(Math.min(1, s + 0.01), 0) - at(Math.max(0, s - 0.01), 0));
  const N = 18;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const a = dir(s) + Math.PI / 2;
    const hw = (thick * (1 - s) + 0.4 * s) / 2;
    left.push(`${r1(at(s, 0) + Math.cos(a) * hw)} ${r1(at(s, 1) + Math.sin(a) * hw)}`);
    right.push(`${r1(at(s, 0) - Math.cos(a) * hw)} ${r1(at(s, 1) - Math.sin(a) * hw)}`);
  }
  const leaves: Leaf[] = [];
  let side = rnd() < 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const s = 0.12 + (0.8 * (i + 0.5 + (rnd() - 0.5) * 0.4)) / n;
    side = -side;
    leaves.push({ x: r1(at(s, 0)), y: r1(at(s, 1)), rot: r1(dir(s) / RAD + side * (open + rnd() * 18)), len: r1(len * (1 - 0.34 * s) * (0.88 + rnd() * 0.24)), k: Math.floor(rnd() * 3), t, flip: side < 0, w: r2(0.9 + rnd() * 0.25) });
  }
  if (tip) leaves.push({ x: r1(at(1, 0)), y: r1(at(1, 1)), rot: r1(dir(1) / RAD + (rnd() - 0.5) * 16), len: r1(len * 0.72), k: 1, t, w: 1 });
  return { stem: `M${left.join("L")}L${right.reverse().join("L")}Z`, leaves, t, end: { x: r1(at(1, 0)), y: r1(at(1, 1)), rot: r1(dir(1) / RAD + 90) } };
}

// tons: 0 = folha clara, ao fundo; 1 = média; 2 = escura, à frente
const LEAF_FILL = ["jd-l1", "jd-l2", "jd-l3"];
const LEAF_SHADE = ["jd-l2", "jd-l3", "jd-l4"];
const LEAF_RIB = ["jd-rib-d", "jd-rib", "jd-rib"];

function LeafAt({ x, y, rot, len, w = 1, k = 0, t = 1, flip = false }: Leaf) {
  const s = LEAF_SHAPES[k % LEAF_SHAPES.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${len} ${r2(len * w * (flip ? -1 : 1))})`}>
      <path d={s.full} className={LEAF_FILL[t]} />
      <path d={s.shade} className={LEAF_SHADE[t]} />
      <path d={s.rib} className={LEAF_RIB[t]} />
      {len > 17 ? <path d={VEINS} className={`${LEAF_RIB[t]} jd-vein`} /> : null}
    </g>
  );
}

function SprigAt({ sprig }: { sprig: Sprig }) {
  return (
    <g>
      <path d={sprig.stem} className={sprig.t === 0 ? "jd-l2" : "jd-l4"} />
      {sprig.leaves.map((l, i) => (
        <LeafAt key={i} {...l} />
      ))}
    </g>
  );
}

/** Folhas que saem de trás de uma flor, em leque. */
function fan(cx: number, cy: number, r: number, items: [number, number, number?, number?][], seed: number): Leaf[] {
  const rnd = dice(seed);
  return items.map(([deg, len, t = 2, k]) => ({ x: r1(cx + Math.cos(deg * RAD) * r * 0.55), y: r1(cy + Math.sin(deg * RAD) * r * 0.55), rot: deg, len, t, k: k ?? Math.floor(rnd() * 3), w: r2(0.95 + rnd() * 0.3), flip: rnd() < 0.5 }));
}

function Grads({ u }: { u: string }) {
  // degradês no espaço da pétala (da base à ponta): giram e encolhem junto com cada pétala
  const g = (id: string, a: string, b: string, c: string, mid: number) => (
    <linearGradient id={`jardim-${id}-${u}`} gradientUnits="userSpaceOnUse" x1="0" y1="0.02" x2="0" y2="-1">
      <stop offset="0" className={a} />
      <stop offset={mid} className={b} />
      <stop offset="1" className={c} />
    </linearGradient>
  );
  return (
    <defs>
      {g("o", "jd-s3", "jd-s2", "jd-s1", 0.5)}
      {g("m", "jd-s4", "jd-s3", "jd-s2", 0.55)}
      {g("i", "jd-s5", "jd-s4", "jd-s3", 0.6)}
    </defs>
  );
}

type Scene = { back: Sprig[]; leaves: Leaf[]; front: Sprig[]; draw: (u: string) => ReactNode };

function SceneAt({ scene, u }: { scene: Scene; u: string }) {
  return (
    <>
      {scene.back.map((s, i) => (
        <SprigAt key={`b${i}`} sprig={s} />
      ))}
      {scene.front.map((s, i) => (
        <SprigAt key={`f${i}`} sprig={s} />
      ))}
      {scene.leaves.map((l, i) => (
        <LeafAt key={`l${i}`} {...l} />
      ))}
      {scene.draw(u)}
    </>
  );
}

// ───── Canto de cima, à esquerda: o buquê principal (peônia, duas rosas, botões) ─────
const TL_BUD_A = buildSprig({ stem: [[196, 46], [220, 30], [244, 26], [262, 38]], n: 2, len: 20, seed: 5, t: 2, tip: false, thick: 1.6 });
const TL_BUD_B = buildSprig({ stem: [[34, 170], [22, 196], [20, 222], [32, 246]], n: 2, len: 19, seed: 8, t: 2, tip: false, thick: 1.6 });
const TL: Scene = {
  back: [
    buildSprig({ stem: [[150, 30], [210, 4], [270, 6], [322, 22]], n: 6, len: 27, seed: 3, t: 0, thick: 1.4 }),
    buildSprig({ stem: [[30, 150], [6, 204], [8, 262], [24, 318]], n: 6, len: 27, seed: 12, t: 0, thick: 1.4 }),
    buildSprig({ stem: [[128, 112], [150, 128], [170, 132], [190, 124]], n: 3, len: 19, seed: 21, t: 0, thick: 1.2 }),
  ],
  front: [TL_BUD_A, TL_BUD_B],
  leaves: [
    ...fan(84, 84, 58, [[-152, 40, 1], [118, 44, 2], [62, 46, 2], [24, 40, 1], [-62, 38, 1], [150, 38, 1]], 2),
    ...fan(176, 50, 36, [[-34, 38, 2], [12, 42, 2], [58, 34, 1], [-100, 30, 1]], 6),
    ...fan(36, 150, 24, [[84, 36, 2], [116, 30, 1], [100, 24, 2], [170, 22, 1]], 9),
  ],
  draw: (u) => (
    <>
      <Bud u={u} x={TL_BUD_A.end.x} y={TL_BUD_A.end.y} s={11} rot={TL_BUD_A.end.rot} />
      <Bud u={u} x={TL_BUD_B.end.x} y={TL_BUD_B.end.y} s={10.5} rot={TL_BUD_B.end.rot} />
      <RoseAt u={u} x={176} y={50} r={35} v={0} rot={10} />
      <RoseAt u={u} x={36} y={150} r={24} v={1} rot={-20} />
      <PeonyAt u={u} x={86} y={86} r={60} v={0} rot={-18} />
      <Blossom x={152} y={108} r={9} rot={10} />
      <Blossom x={70} y={160} r={7} rot={40} />
      <Blossom x={224} y={74} r={7.5} rot={-12} />
    </>
  ),
};

// ───── Canto de cima, à direita: uma rosa e um botão ─────
const TR_BUD = buildSprig({ stem: [[362, 70], [376, 92], [378, 114], [368, 134]], n: 2, len: 17, seed: 15, t: 2, tip: false, thick: 1.5 });
const TR: Scene = {
  back: [buildSprig({ stem: [[340, 40], [316, 22], [292, 22], [272, 32]], n: 3, len: 22, seed: 27, t: 0, thick: 1.2 })],
  front: [TR_BUD],
  leaves: fan(354, 44, 30, [[168, 36, 2], [128, 32, 1], [84, 34, 2], [-150, 26, 1], [40, 24, 1]], 14),
  draw: (u) => (
    <>
      <Bud u={u} x={TR_BUD.end.x} y={TR_BUD.end.y} s={9.5} rot={TR_BUD.end.rot} />
      <RoseAt u={u} x={354} y={44} r={29} v={2} rot={40} />
      <Blossom x={318} y={66} r={7.5} rot={20} />
    </>
  ),
};

const CORNER_SCALE = 0.87;

function TopArt() {
  const u = useUid();
  return (
    <>
      <VineFrame u={u} />
      <svg className="jd-corner jd-corner-top" viewBox="0 0 400 330" aria-hidden="true">
        <Grads u={u} />
        {/* os buquês são compostos em 400 de largura e reduzidos em direção ao próprio canto: sobra mais respiro para o texto */}
        <g transform={`translate(400 0) scale(${CORNER_SCALE}) translate(-400 0)`}>
          <SceneAt scene={TR} u={u} />
        </g>
        <g transform={`scale(${CORNER_SCALE})`}>
          <SceneAt scene={TL} u={u} />
        </g>
      </svg>
    </>
  );
}

// ───── Canto de baixo, à direita: segundo buquê (peônia e duas rosas), mais largo que alto ─────
const BR_BUD = buildSprig({ stem: [[226, 222], [204, 212], [184, 214], [168, 228]], n: 2, len: 19, seed: 33, t: 2, tip: false, thick: 1.6 });
const BR: Scene = {
  back: [
    buildSprig({ stem: [[270, 236], [226, 256], [176, 254], [128, 240]], n: 6, len: 26, seed: 41, t: 0, thick: 1.4 }),
    buildSprig({ stem: [[374, 150], [396, 108], [392, 62], [378, 20]], n: 5, len: 26, seed: 44, t: 0, thick: 1.4 }),
    buildSprig({ stem: [[290, 160], [262, 150], [240, 152], [222, 164]], n: 3, len: 20, seed: 47, t: 0, thick: 1.2 }),
  ],
  front: [BR_BUD],
  leaves: [
    ...fan(322, 196, 52, [[-126, 42, 2], [-164, 38, 1], [152, 40, 2], [-52, 40, 1], [96, 36, 1]], 22),
    ...fan(250, 226, 30, [[-160, 36, 2], [160, 34, 1], [-116, 30, 1], [108, 26, 2]], 25),
    ...fan(372, 124, 25, [[-110, 34, 2], [-140, 26, 1], [-64, 28, 2], [-88, 24, 1]], 28),
  ],
  draw: (u) => (
    <>
      <Bud u={u} x={BR_BUD.end.x} y={BR_BUD.end.y} s={10.5} rot={BR_BUD.end.rot} />
      <RoseAt u={u} x={372} y={126} r={24} v={3} rot={-30} />
      <RoseAt u={u} x={250} y={226} r={30} v={1} rot={64} />
      <PeonyAt u={u} x={324} y={198} r={54} v={1} rot={36} />
      <Blossom x={282} y={170} r={8.5} rot={30} />
      <Blossom x={206} y={238} r={7.5} rot={-10} />
      <Blossom x={350} y={96} r={7} rot={5} />
    </>
  ),
};

// ───── Canto de baixo, à esquerda: uma rosa pequena com folhagem que sobe ─────
const BL_BUD = buildSprig({ stem: [[60, 224], [84, 216], [104, 220], [118, 234]], n: 2, len: 17, seed: 52, t: 2, tip: false, thick: 1.5 });
const BL: Scene = {
  back: [buildSprig({ stem: [[30, 200], [12, 172], [12, 142], [24, 114]], n: 4, len: 23, seed: 55, t: 0, thick: 1.3 })],
  front: [BL_BUD],
  leaves: fan(42, 222, 28, [[-58, 36, 2], [-112, 32, 1], [-14, 30, 1], [20, 26, 2], [-160, 24, 1]], 31),
  draw: (u) => (
    <>
      <Bud u={u} x={BL_BUD.end.x} y={BL_BUD.end.y} s={9} rot={BL_BUD.end.rot} />
      <RoseAt u={u} x={42} y={222} r={27} v={0} rot={-50} />
      <Blossom x={78} y={196} r={7} rot={15} />
    </>
  ),
};

function BottomArt() {
  const u = useUid();
  return (
    <svg className="jd-corner jd-corner-bottom" viewBox="0 0 400 260" aria-hidden="true">
      <Grads u={u} />
      <g transform={`translate(0 260) scale(${CORNER_SCALE}) translate(0 -260)`}>
        <SceneAt scene={BL} u={u} />
      </g>
      <g transform={`translate(400 260) scale(${CORNER_SCALE}) translate(-400 -260)`}>
        <SceneAt scene={BR} u={u} />
      </g>
    </svg>
  );
}

// ───── Moldura: um ramo que sobe em volta do cartão, nos quatro lados ─────
// O ladrilho tem 24 x 288 e emenda em cima e embaixo; os cantos ficam sob os buquês. O ramo ondula em passos desiguais, com
// folhas de tamanhos e ângulos sorteados e um botão aqui e ali: não é uma cercadura repetida de 96 em 96.
const VINE_H = 288;
type Vine = { d: string; leaves: Leaf[]; buds: { x: number; y: number; r: number; dx: number; dy: number }[] };

function buildVine(seed: number): Vine {
  const rnd = dice(seed);
  const stops = [0, 44, 98, 136, 192, 238, VINE_H];
  let d = "M12 0";
  const leaves: Leaf[] = [];
  const buds: Vine["buds"] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const y0 = stops[i];
    const h = stops[i + 1] - y0;
    // a barriga de cada trecho é proporcional à altura dele: as emendas saem sem quina
    const c = (i % 2 ? -1 : 1) * h * 0.085;
    const side = c > 0 ? 1 : -1;
    d += `C${r1(12 + c)} ${r1(y0 + h / 3)} ${r1(12 + c)} ${r1(y0 + (h * 2) / 3)} 12 ${y0 + h}`;
    const at = (t: number): Pt => [12 + 3 * t * (1 - t) * c, y0 + h * (t * (1 - t) * (1 - t) + 2 * (1 - t) * t * t + t * t * t)];
    const n = h > 50 ? 3 : 2;
    for (let j = 0; j < n; j++) {
      const [x, y] = at(0.16 + (0.7 * (j + 0.3 + rnd() * 0.4)) / n);
      const up = rnd() < 0.7;
      const open = up ? -(34 + rnd() * 38) : 36 + rnd() * 34;
      const rot = side > 0 ? open : 180 - open;
      let len = 8 + rnd() * 6.5;
      const reach = Math.abs(Math.cos(rot * RAD));
      const room = side > 0 ? 22.4 - x : x - 1.6;
      if (reach * len > room) len = room / reach;
      leaves.push({ x: r1(x), y: r1(y), rot: r1(rot), len: r1(len), k: Math.floor(rnd() * 3), t: rnd() < 0.32 ? 0 : 1, flip: rnd() < 0.5, w: r2(0.9 + rnd() * 0.3) });
    }
    if (i === 1 || i === 4) {
      // botão: nasce do lado de dentro da curva, numa hastezinha
      const [x, y] = at(0.42 + rnd() * 0.2);
      const reach = 3.4 + rnd() * 1.6;
      buds.push({ x: r1(x), y: r1(y), r: r2(1.5 + rnd() * 0.6), dx: r1(-side * reach), dy: r1(-(1.5 + rnd() * 2)) });
    }
  }
  return { d, leaves, buds };
}

const VINE = buildVine(7);

function VineTile() {
  return (
    <>
      <path d={VINE.d} className="jd-tendril" />
      {VINE.buds.map((b, i) => (
        <g key={`b${i}`}>
          <path d={`M${b.x} ${b.y}l${b.dx} ${b.dy}`} className="jd-tendril" />
          <circle cx={r1(b.x + b.dx)} cy={r1(b.y + b.dy)} r={b.r} className="jd-p3" />
          <circle cx={r1(b.x + b.dx - b.r * 0.25)} cy={r1(b.y + b.dy - b.r * 0.3)} r={r2(b.r * 0.55)} className="jd-p2" />
        </g>
      ))}
      {VINE.leaves.map((l, i) => (
        <LeafAt key={i} {...l} />
      ))}
    </>
  );
}

function VineFrame({ u }: { u: string }) {
  return (
    <>
      <svg className="jd-vine jd-vine-v jd-vine-l" width="24" height="100%" aria-hidden="true">
        <defs>
          <pattern id={`jardim-vine-v-${u}`} width="24" height={VINE_H} patternUnits="userSpaceOnUse">
            <VineTile />
          </pattern>
          <pattern id={`jardim-vine-h-${u}`} width={VINE_H} height="24" patternUnits="userSpaceOnUse">
            <g transform="matrix(0 1 1 0 0 0)">
              <VineTile />
            </g>
          </pattern>
        </defs>
        <rect width="24" height="100%" fill={`url(#jardim-vine-v-${u})`} />
      </svg>
      <svg className="jd-vine jd-vine-v jd-vine-r" width="24" height="100%" aria-hidden="true">
        <rect width="24" height="100%" fill={`url(#jardim-vine-v-${u})`} transform="translate(24 0) scale(-1 1)" />
      </svg>
      <svg className="jd-vine jd-vine-h jd-vine-t" width="100%" height="24" aria-hidden="true">
        <rect width="100%" height="24" fill={`url(#jardim-vine-h-${u})`} />
      </svg>
      <svg className="jd-vine jd-vine-h jd-vine-b" width="100%" height="24" aria-hidden="true">
        <rect width="100%" height="24" fill={`url(#jardim-vine-h-${u})`} transform="translate(0 24) scale(1 -1)" />
      </svg>
    </>
  );
}

// ───── Divisor: uma rosa miúda entre dois raminhos (chá: três florzinhas; quinze anos: rosa entre dois botões) ─────
const DIV_L = buildSprig({ stem: [[66, 17], [50, 13], [34, 19], [14, 15]], n: 4, len: 13, seed: 61, t: 1, thick: 1.1, open: 38 });
const DIV_R = buildSprig({ stem: [[94, 17], [110, 21], [126, 14], [146, 17]], n: 4, len: 13, seed: 64, t: 1, thick: 1.1, open: 38 });

function Divider({ eventType }: { eventType?: string }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 160 34" width="150" height="32" aria-hidden="true">
      <Grads u={u} />
      <SprigAt sprig={DIV_L} />
      <SprigAt sprig={DIV_R} />
      {eventType === "cha" ? (
        <>
          <Blossom x={66} y={18} r={6} rot={20} />
          <Blossom x={94} y={18} r={6} rot={-10} />
          <Blossom x={80} y={15} r={8.5} />
        </>
      ) : eventType === "quinze-anos" ? (
        <>
          <Bud u={u} x={62} y={19} s={6.5} rot={-64} />
          <Bud u={u} x={98} y={19} s={6.5} rot={64} />
          <RoseAt u={u} x={80} y={17} r={11.5} v={2} />
        </>
      ) : (
        <>
          <LeafAt x={72} y={19} rot={152} len={13} t={2} k={0} />
          <LeafAt x={88} y={19} rot={28} len={13} t={2} k={0} flip />
          <RoseAt u={u} x={80} y={17} r={12} v={1} />
        </>
      )}
    </svg>
  );
}

// ───── Forro do envelope: um canteiro de rosas e peônias ─────
// Vale a parte de baixo do desenho: com a aba aberta, o triângulo visível tem a base em y=250 e o bico em (175, 105).
const LINER: Scene = {
  back: [
    buildSprig({ stem: [[160, 160], [162, 144], [168, 128], [175, 114]], n: 3, len: 17, seed: 71, t: 1, thick: 1.3 }),
    buildSprig({ stem: [[120, 214], [96, 196], [72, 196], [46, 212]], n: 4, len: 24, seed: 74, t: 0, thick: 1.3 }),
    buildSprig({ stem: [[232, 214], [256, 194], [282, 196], [306, 214]], n: 4, len: 24, seed: 77, t: 0, thick: 1.3 }),
  ],
  front: [],
  leaves: [
    ...fan(175, 184, 42, [[-64, 38, 2], [-116, 38, 2], [-150, 34, 1], [-30, 34, 1], [-90, 34, 1], [160, 34, 2], [20, 34, 2]], 81),
    ...fan(98, 234, 32, [[-110, 36, 2], [-150, 34, 1], [-60, 30, 1], [178, 30, 2]], 84),
    ...fan(254, 234, 32, [[-70, 36, 2], [-28, 34, 1], [-120, 30, 1], [2, 30, 2]], 87),
    ...fan(30, 246, 26, [[-70, 30, 2], [-120, 28, 1]], 90),
    ...fan(322, 246, 26, [[-110, 30, 2], [-58, 28, 1]], 93),
  ],
  draw: (u) => (
    <>
      <RoseAt u={u} x={30} y={246} r={25} v={3} rot={20} />
      <RoseAt u={u} x={322} y={246} r={25} v={2} rot={-40} />
      <RoseAt u={u} x={98} y={234} r={31} v={0} rot={-12} />
      <RoseAt u={u} x={254} y={234} r={31} v={1} rot={50} />
      <PeonyAt u={u} x={175} y={186} r={42} v={2} rot={8} />
      <Blossom x={128} y={170} r={8} rot={12} />
      <Blossom x={224} y={168} r={8} rot={-20} />
      <Blossom x={62} y={214} r={7} />
      <Blossom x={290} y={214} r={7} rot={30} />
      <Blossom x={180} y={132} r={6} rot={8} />
    </>
  ),
};

function Liner() {
  const u = useUid();
  return (
    <svg viewBox="0 0 350 250" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <Grads u={u} />
      <SceneAt scene={LINER} u={u} />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") return <TopArt />;
  if (slot === "divider") return <Divider eventType={eventType} />;
  if (slot === "bottom") return <BottomArt />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "jardim",
  name: "Jardim",
  description: "Moldura de peônias e rosas de jardim, nomes em caligrafia formal",
  premium: true,
  suits: ["casamento", "quinze-anos", "cha", "outro"],
  palettes: [
    { id: "rosa-antigo", name: "Rosa antigo", vars: { bg: "#EFE4D8", paper: "#FBF5EA", ink: "#43322E", soft: "#5A6850", accent: "#CB8A8F", line: "#E4D5C3", btnInk: "#FFF9F0", seal: "#9A5360", sealInk: "#FCEEE6", liner: "#F4E3DB" } },
    { id: "pessego-salvia", name: "Pêssego e sálvia", vars: { bg: "#EDE6D4", paper: "#FCF6E9", ink: "#3D392B", soft: "#5B694D", accent: "#E2A07B", line: "#E3D8C0", btnInk: "#FFF9EE", seal: "#B26A4A", sealInk: "#FFF6EA", liner: "#F7E6D4" } },
    { id: "hortensia", name: "Azul porcelana", vars: { bg: "#E4E6E3", paper: "#FBF7EC", ink: "#2E394B", soft: "#55664F", accent: "#8EA2CD", line: "#DCDDD2", btnInk: "#FBF8F0", seal: "#586CA0", sealInk: "#F2F4FB", liner: "#E4E9F3" } },
    { id: "vinho-outonal", name: "Vinho outonal", vars: { bg: "#E9DCCD", paper: "#FAF3E5", ink: "#3A2325", soft: "#67603C", accent: "#A9485B", line: "#E2D2BD", btnInk: "#FBF3E6", seal: "#792636", sealInk: "#F7E4D1", liner: "#EFDDD3" } },
  ],
  Art,
};
