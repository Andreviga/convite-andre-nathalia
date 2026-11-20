import type { CSSProperties, ReactNode } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Balão: festa infantil em formas chapadas. Bandeirolas penduradas de ponta a ponta no topo do cartão, um buquê de três
// balões preso por um laço logo acima do título, confete geométrico e uma faixa de nuvens fechando o cartão.
// Três cores da paleta fazem o desenho (--accent, --seal e --liner), cada uma com um tom claro tirado do papel.

type Tone = "a" | "s" | "l" | "ta" | "ts";
const TONE: Record<Tone, string> = {
  a: "var(--accent)",
  s: "var(--seal)",
  l: "var(--liner)",
  ta: "color-mix(in srgb, var(--accent) 46%, var(--paper))",
  ts: "color-mix(in srgb, var(--seal) 42%, var(--paper))",
};
const fill = (t: Tone): CSSProperties => ({ fill: TONE[t] });
const STRING: CSSProperties = { stroke: "color-mix(in srgb, var(--ink) 58%, var(--paper))" };
const SHADE: CSSProperties = { fill: "var(--ink)" }; // sombra chapada: a tinta do texto, bem diluída, por cima da cor
const r1 = (n: number) => Math.round(n * 10) / 10;

// ───── Balões ─────
type BalloonKind = "round" | "star" | "heart";
type BalloonDef = { x: number; y: number; s: number; tilt: number; tone: Tone; kind?: BalloonKind };

/** Estrela de cinco pontas; os cantos arredondam com um contorno grosso da mesma cor (balão metalizado). */
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = (Math.PI / 5) * i - Math.PI / 2;
  const r = i % 2 ? 19.5 : 37;
  return `${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r)}`;
}).join("L");

/** Onde o fio sai (o bico do balão), em coordenadas do desenho. */
function knotOf(b: BalloonDef): [number, number] {
  const len = (b.kind === "star" ? 35 : b.kind === "heart" ? 49 : 53) * b.s;
  const a = (b.tilt * Math.PI) / 180;
  return [r1(b.x - Math.sin(a) * len), r1(b.y + Math.cos(a) * len)];
}

function Balloon({ b }: { b: BalloonDef }) {
  const kind = b.kind ?? "round";
  const tone = fill(b.tone);
  return (
    <g transform={`translate(${b.x} ${b.y}) rotate(${b.tilt}) scale(${b.s})`}>
      {kind === "round" ? (
        <>
          <path d="M-6.5 51.5Q0 54.6 6.5 51.5L1.6 42H-1.6Z" style={tone} />
          <path d="M-6.5 51.5Q0 54.6 6.5 51.5L1.6 42H-1.6Z" style={SHADE} fillOpacity={0.16} />
          <path d="M0-44C26-44 38-24 38-4C38 20 18 40 0 44C-18 40-38 20-38-4C-38-24-26-44 0-44Z" style={tone} />
          <path d="M37.6-9C39 18 19 40 0 44C-5 43-10 40.5-14 37C8 38 30 20 33-8C33.4-12 37.2-13 37.6-9Z" style={SHADE} fillOpacity={0.13} />
          <path d="M-27-12C-27-26-18-35-8-37C-5-37.6-4-33.5-7-32.5C-15-30-21-22-22-11C-22.3-7.5-27-8-27-12Z" fill="#fff" fillOpacity={0.62} />
          <circle cx="-24.6" cy="-1" r="2.5" fill="#fff" fillOpacity={0.62} />
        </>
      ) : kind === "heart" ? (
        <>
          <path d="M-6 47.6Q0 50.4 6 47.6L1.6 38H-1.6Z" style={tone} />
          <path d="M-6 47.6Q0 50.4 6 47.6L1.6 38H-1.6Z" style={SHADE} fillOpacity={0.16} />
          <path d="M0 41C-10 31-41 13-41-14C-41-32-28-43-15-43C-6-43-1-37 0-31C1-37 6-43 15-43C28-43 41-32 41-14C41 13 10 31 0 41Z" style={tone} />
          <path d="M40-8C37 14 10 31 0 41C14 27 31 12 34.4-8C35-11.6 40.4-11.6 40-8Z" style={SHADE} fillOpacity={0.13} />
          <path d="M-31-18C-31-28-25-34.4-17-35.6C-14-36-13.4-32-16.4-31.2C-22-29.8-25.6-25-26-18C-26.2-14.6-31-14.6-31-18Z" fill="#fff" fillOpacity={0.62} />
          <circle cx="-27.6" cy="-7.4" r="2.4" fill="#fff" fillOpacity={0.62} />
        </>
      ) : (
        <>
          <path d="M-5.4 34Q0 36.6 5.4 34L1.6 25H-1.6Z" style={tone} />
          <path d="M-5.4 34Q0 36.6 5.4 34L1.6 25H-1.6Z" style={SHADE} fillOpacity={0.16} />
          <path d={`M${STAR}Z`} style={{ ...tone, stroke: TONE[b.tone] }} strokeWidth={11} strokeLinejoin="round" />
          {/* gomos do balão metalizado: dois vincos claros saindo do centro */}
          <path d="M0-37L4.6-3 0 1.6-4.6-3Z" fill="#fff" fillOpacity={0.2} />
          <path d="M35.2-11.4L4.4 3.4 0 1.6 3-4.4Z" style={SHADE} fillOpacity={0.09} />
          <path d="M21.8 30L-2.2 6.4 0 1.6 5.4 3.4Z" style={SHADE} fillOpacity={0.13} />
          <ellipse cx="-17" cy="-12.6" rx="2.6" ry="7.4" transform="rotate(52 -17 -12.6)" fill="#fff" fillOpacity={0.66} />
          <circle cx="-25" cy="-9.6" r="2" fill="#fff" fillOpacity={0.66} />
        </>
      )}
    </g>
  );
}

/** Fio do bico até o ponto onde o buquê é amarrado: uma curva frouxa, nunca reta. */
function Thread({ b, to, bend = 0 }: { b: BalloonDef; to: [number, number]; bend?: number }) {
  const [x, y] = knotOf(b);
  const mx = (x + to[0]) / 2 + bend;
  const my = (y + to[1]) / 2 + Math.abs(bend) * 0.4;
  return <path d={`M${x} ${y}Q${r1(mx)} ${r1(my)} ${to[0]} ${to[1]}`} />;
}

/** Laço que amarra os fios. */
function Bow({ x, y, tone }: { x: number; y: number; tone: Tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-.6 1.4C-3 5.4-4 9-7.4 12.6L-3.4 13.4C-1.6 9.6-.2 6 1 2Z" style={fill(tone)} />
      <path d="M.6 1.4C2.6 5 4.4 8 8 11L4.6 13C2 9.6.2 6-1 2Z" style={fill(tone)} />
      <path d="M-.6 1.4C-3 5.4-4 9-7.4 12.6L-3.4 13.4C-1.6 9.6-.2 6 1 2Z" style={SHADE} fillOpacity={0.14} />
      <path d="M0 0C-5-7.6-13.6-7-13.2-.4C-13.6 6-5 6.6 0 0Z" style={fill(tone)} />
      <path d="M0 0C5-7.6 13.6-7 13.2-.4C13.6 6 5 6.6 0 0Z" style={fill(tone)} />
      <path d="M0 0C-4-1-9-.6-13.2-.4C-13.6 6-5 6.6 0 0Z" style={SHADE} fillOpacity={0.12} />
      <path d="M0 0C4-1 9-.6 13.2-.4C13.6 6 5 6.6 0 0Z" style={SHADE} fillOpacity={0.12} />
      <rect x="-3.1" y="-3.3" width="6.2" height="6.6" rx="2.4" style={fill(tone)} />
      <rect x="-3.1" y="-3.3" width="6.2" height="6.6" rx="2.4" style={SHADE} fillOpacity={0.2} />
    </g>
  );
}

// ───── Confete ─────
type Bit = [kind: "dot" | "bar" | "tri" | "ring" | "spark" | "wave", x: number, y: number, size: number, tone: Tone, rot?: number];

const SPARK = "M0-1C.14-.36.36-.14 1 0C.36.14.14.36 0 1C-.14.36-.36.14-1 0C-.36-.14-.14-.36 0-1Z";

function Confetti({ bits }: { bits: Bit[] }) {
  return (
    <>
      {bits.map(([kind, x, y, size, tone, rot = 0], i) => {
        const at = `translate(${x} ${y}) rotate(${rot})`;
        const c = TONE[tone];
        if (kind === "dot") return <circle key={i} cx={x} cy={y} r={size} style={{ fill: c }} />;
        if (kind === "ring") return <circle key={i} cx={x} cy={y} r={size} fill="none" style={{ stroke: c }} strokeWidth={r1(size * 0.62)} />;
        if (kind === "bar") return <rect key={i} x={-size} y={r1(-size * 0.3)} width={size * 2} height={r1(size * 0.6)} rx={r1(size * 0.3)} transform={at} style={{ fill: c }} />;
        if (kind === "tri") return <path key={i} d={`M0 ${-size}L${r1(size * 0.95)} ${r1(size * 0.72)}H${r1(-size * 0.95)}Z`} transform={at} style={{ fill: c, stroke: c }} strokeWidth={r1(size * 0.5)} strokeLinejoin="round" />;
        if (kind === "spark") return <path key={i} d={SPARK} transform={`${at} scale(${size})`} style={{ fill: c }} />;
        // serpentina: fita mais grossa no meio que nas pontas
        return (
          <path
            key={i}
            d="M-10 1.4C-7.6-4.6-3.6-4.4-1.4-.4C.4 3 3 3.2 4.8-.2C6.4-3.2 8.6-3.6 10.4-1.6C8.6-2 7.4-1 6.2 1.4C3.8 6.4-.6 6.2-3 2C-4.6-1-6.8-1-8.4 2.4C-9 3.6-10.6 3-10 1.4Z"
            transform={`${at} scale(${r1(size / 10)})`}
            style={{ fill: c }}
          />
        );
      })}
    </>
  );
}

// ───── Topo: bandeirolas e buquê ─────
const FLAG_TONES: Tone[] = ["a", "l", "s", "ta", "l", "a", "ts", "l", "s"];
const FLAGS = FLAG_TONES.map((tone, i) => {
  const t = (i + 0.5) / FLAG_TONES.length;
  // barbante: curva de (30, 11) a (360, 11), com a barriga em y = 26 no meio. As pontas ficam para dentro do canto
  // redondo do cartão, presas por duas fitas adesivas: nenhuma bandeirola é cortada pelo canto.
  const x = 30 + 330 * t;
  const y = (1 - t) ** 2 * 11 + 2 * (1 - t) * t * 41 + t * t * 11;
  const rot = (Math.atan2(60 * (1 - 2 * t), 330) * 180) / Math.PI;
  return { tone, x: r1(x), y: r1(y), rot: r1(rot), dot: i % 4 === 1 };
});

type BunchId = "padrao" | "aniversario" | "cha" | "casamento" | "estrela";
const BUNCH: Record<BunchId, BalloonDef[]> = {
  padrao: [
    { x: 147, y: 112, s: 0.66, tilt: -17, tone: "s" },
    { x: 245, y: 108, s: 0.72, tilt: 15, tone: "l" },
    { x: 195, y: 100, s: 0.86, tilt: -2, tone: "a" },
  ],
  aniversario: [
    { x: 146, y: 112, s: 0.66, tilt: -17, tone: "s" },
    { x: 246, y: 108, s: 0.72, tilt: 15, tone: "a" },
    { x: 195, y: 98, s: 0.98, tilt: -4, tone: "l", kind: "star" },
  ],
  cha: [
    { x: 146, y: 112, s: 0.66, tilt: -17, tone: "l" },
    { x: 246, y: 108, s: 0.72, tilt: 15, tone: "s" },
    { x: 195, y: 100, s: 0.84, tilt: -3, tone: "a", kind: "heart" },
  ],
  // casamento: o coração no meio, com as outras duas cores trocadas de lado em relação ao chá
  casamento: [
    { x: 146, y: 112, s: 0.66, tilt: -17, tone: "s" },
    { x: 246, y: 108, s: 0.72, tilt: 15, tone: "l" },
    { x: 195, y: 100, s: 0.84, tilt: -3, tone: "a", kind: "heart" },
  ],
  // quinze anos e formatura: a estrela na cor principal
  estrela: [
    { x: 146, y: 112, s: 0.66, tilt: -17, tone: "l" },
    { x: 246, y: 108, s: 0.72, tilt: 15, tone: "s" },
    { x: 195, y: 98, s: 0.98, tilt: -4, tone: "a", kind: "star" },
  ],
};
const BUNCH_OF: Record<string, BunchId> = { aniversario: "aniversario", cha: "cha", casamento: "casamento", "quinze-anos": "estrela", formatura: "estrela" };

/** Fita adesiva que prende a ponta do barbante ao cartão. */
function Tape({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-11" y="-4.6" width="22" height="9.2" rx="1.2" style={{ fill: "color-mix(in srgb, var(--liner) 62%, var(--paper))" }} fillOpacity={0.92} />
      <rect x="-11" y="-4.6" width="22" height="3.2" rx="1.2" fill="#fff" fillOpacity={0.3} />
      <rect x="-11" y="2.4" width="22" height="2.2" rx="1.1" style={SHADE} fillOpacity={0.08} />
    </g>
  );
}

const TOP_BITS: Bit[] = [
  ["bar", 42, 76, 7, "ta", 38],
  ["dot", 78, 96, 4.6, "l"],
  ["tri", 30, 122, 5, "a", -18],
  ["ring", 100, 136, 4.2, "s"],
  ["spark", 62, 150, 7.5, "l", 12],
  ["wave", 92, 66, 11, "s", -24],
  ["dot", 22, 160, 2.8, "ts"],
  ["dot", 116, 166, 2.6, "a"],
  ["wave", 300, 70, 11, "a", 22],
  ["dot", 338, 92, 4.4, "s"],
  ["tri", 362, 128, 5, "l", 24],
  ["ring", 292, 132, 4.2, "ta"],
  ["spark", 328, 152, 7.5, "a", -8],
  ["bar", 356, 74, 7, "l", -34],
  ["dot", 370, 162, 2.8, "ta"],
  ["dot", 276, 166, 2.6, "l"],
];

function Top({ eventType }: { eventType?: string }) {
  const bunch = BUNCH[BUNCH_OF[eventType ?? ""] ?? "padrao"];
  const tie: [number, number] = [196, 165];
  return (
    <svg className="balao-top" viewBox="0 0 390 184" width="100%" aria-hidden="true">
      {FLAGS.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`}>
          <path d="M-15.5-1H15.5L2.3 28.4Q0 31.8-2.3 28.4Z" style={fill(f.tone)} />
          <path d="M-15.5-1H0V31Q-1.4 30.2-2.3 28.4Z" fill="#fff" fillOpacity={0.24} />
          <path d="M-15.5-1H15.5L13.6 3.2H-13.6Z" style={SHADE} fillOpacity={0.12} />
          {f.dot ? <circle cx="0" cy="11.4" r="3.4" fill="#fff" fillOpacity={0.7} /> : null}
        </g>
      ))}
      <path d="M30 11Q195 41 360 11" fill="none" style={STRING} strokeWidth={1.7} strokeLinecap="round" />
      <Tape x={30} y={11} rot={-34} />
      <Tape x={360} y={11} rot={34} />
      <Confetti bits={TOP_BITS} />
      <g fill="none" style={STRING} strokeWidth={1.3} strokeLinecap="round">
        <Thread b={bunch[0]} to={tie} bend={-9} />
        <Thread b={bunch[1]} to={tie} bend={10} />
        <Thread b={bunch[2]} to={tie} bend={3} />
      </g>
      {bunch.map((b, i) => (
        <Balloon key={i} b={b} />
      ))}
      <Bow x={tie[0]} y={tie[1]} tone={bunch[2].tone === "a" ? "s" : "a"} />
    </svg>
  );
}

// ───── Divisor: uma linha de confete ─────
const DIVIDER_BITS: Bit[] = [
  ["wave", 19, 9, 11, "ts", -4],
  ["dot", 42, 9, 3, "l"],
  ["tri", 55, 9.6, 3.6, "a", -14],
  ["spark", 70, 9, 7.6, "s"],
  ["ring", 85.4, 9, 3.3, "a"],
  ["dot", 98, 9, 3, "l"],
  ["wave", 121, 9, 11, "ta", 6],
];

function Divider() {
  return (
    <svg className="balao-divider" viewBox="0 0 140 18" width="140" height="18" aria-hidden="true">
      <Confetti bits={DIVIDER_BITS} />
    </svg>
  );
}

// ───── Rodapé do cartão: duas camadas de nuvens ─────
const CLOUD_BACK: [number, number, number][] = [[-6, 52, 34], [50, 46, 27], [102, 56, 25], [158, 49, 30], [214, 58, 23], [262, 47, 30], [318, 54, 27], [370, 45, 32], [406, 58, 24]];
const CLOUD_FRONT: [number, number, number][] = [[16, 66, 27], [68, 70, 22], [122, 67, 28], [180, 72, 22], [232, 67, 26], [288, 72, 22], [340, 65, 28], [392, 70, 24]];
const BOTTOM_BITS: Bit[] = [
  ["dot", 96, 16, 3, "a"],
  ["spark", 132, 8, 6, "l"],
  ["dot", 304, 14, 3, "s"],
  ["tri", 262, 8, 3.6, "a", 20],
];

function Clouds() {
  return (
    <svg className="balao-clouds" viewBox="0 2 390 70" width="100%" aria-hidden="true">
      <Confetti bits={BOTTOM_BITS} />
      <g style={{ fill: "color-mix(in srgb, var(--line) 52%, var(--paper))" }}>
        {CLOUD_BACK.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
        <rect x="0" y="54" width="390" height="24" />
      </g>
      <g style={{ fill: "var(--line)" }}>
        {CLOUD_FRONT.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
        <rect x="0" y="68" width="390" height="10" />
      </g>
    </svg>
  );
}

// ───── Fundo da página: confete esparso, quase da cor do fundo ─────
const BACK_BITS: Bit[] = [
  ["bar", 28, 34, 8, "a", 32],
  ["dot", 118, 22, 4.6, "l"],
  ["tri", 196, 48, 5.4, "s", -16],
  ["ring", 72, 104, 4.8, "s"],
  ["spark", 160, 122, 8, "a", 10],
  ["wave", 226, 138, 12, "l", -22],
  ["dot", 24, 168, 3.4, "s"],
  ["bar", 110, 196, 8, "l", -40],
  ["tri", 52, 238, 5.2, "a", 22],
  ["dot", 190, 218, 4.4, "a"],
  ["ring", 236, 250, 4.6, "l"],
  ["spark", 136, 272, 7, "s", -12],
  ["wave", 36, 300, 12, "a", 18],
  ["dot", 214, 300, 3.2, "l"],
];

function Backdrop() {
  const id = `balao-confete-${useUid()}`;
  return (
    <svg className="balao-backdrop" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width="260" height="320" patternUnits="userSpaceOnUse" patternTransform="translate(-34 -10)">
          <Confetti bits={BACK_BITS} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ───── Forro do envelope ─────
// Vale o triângulo de baixo do desenho (com a aba aberta a base fica em y = 250 e o bico em 175, 105): bolinhas claras no
// fundo da cor do forro e três balões subindo no meio.
const LINER_BUNCH: BalloonDef[] = [
  { x: 150, y: 170, s: 0.36, tilt: -16, tone: "s" },
  { x: 201, y: 168, s: 0.38, tilt: 15, tone: "ta" },
  { x: 175, y: 150, s: 0.46, tilt: -2, tone: "a" },
];
const LINER_BITS: Bit[] = [
  ["spark", 118, 196, 6, "a", 10],
  ["bar", 84, 226, 7, "s", -30],
  ["tri", 128, 232, 4.6, "ts", 18],
  ["spark", 234, 198, 6, "s", -10],
  ["bar", 268, 226, 7, "a", 34],
  ["tri", 224, 232, 4.6, "ta", -18],
  ["dot", 40, 242, 3.4, "a"],
  ["dot", 310, 242, 3.4, "s"],
];

function Liner() {
  const id = `balao-forro-${useUid()}`;
  const tie: [number, number] = [176, 252];
  return (
    <svg viewBox="0 0 350 250" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="7" cy="7" r="3" fill="#fff" fillOpacity={0.5} />
          <circle cx="21" cy="21" r="3" fill="#fff" fillOpacity={0.5} />
        </pattern>
      </defs>
      <rect width="350" height="250" fill={`url(#${id})`} />
      <Confetti bits={LINER_BITS} />
      <g fill="none" style={STRING} strokeWidth={1.2} strokeLinecap="round">
        <Thread b={LINER_BUNCH[0]} to={tie} bend={-6} />
        <Thread b={LINER_BUNCH[1]} to={tie} bend={6} />
        <Thread b={LINER_BUNCH[2]} to={tie} bend={2} />
      </g>
      {LINER_BUNCH.map((b, i) => (
        <Balloon key={i} b={b} />
      ))}
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps): ReactNode {
  if (slot === "top") return <Top eventType={eventType} />;
  if (slot === "divider") return <Divider />;
  if (slot === "bottom") return <Clouds />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "balao",
  name: "Balão",
  description: "Balões, bandeirolas e confete: festa infantil alegre e limpa",
  premium: false,
  suits: ["aniversario", "cha", "outro"],
  palettes: [
    { id: "arco-iris", name: "Arco-íris suave", vars: { bg: "#FBEFDD", paper: "#FFFDF7", ink: "#2A3157", soft: "#585F82", accent: "#F2705F", line: "#D9EAF6", btnInk: "#FFFFFF", seal: "#3577BD", sealInk: "#FFFFFF", liner: "#FFD15C" } },
    { id: "ceu", name: "Azul e amarelo", vars: { bg: "#DFECF9", paper: "#FDFEFF", ink: "#1D375C", soft: "#4C6384", accent: "#4F9FEA", line: "#D5E6F7", btnInk: "#FFFFFF", seal: "#2C6DBD", sealInk: "#FFFFFF", liner: "#FFD04D" } },
    { id: "algodao", name: "Rosa e lilás", vars: { bg: "#F8E6F0", paper: "#FFFBFD", ink: "#482C59", soft: "#775A86", accent: "#F27CA8", line: "#EADDF6", btnInk: "#FFFFFF", seal: "#8A5CC4", sealInk: "#FFFFFF", liner: "#FFDC8C" } },
    { id: "pomar", name: "Verde e laranja", vars: { bg: "#EAF3DD", paper: "#FFFEF7", ink: "#22432E", soft: "#506D58", accent: "#FF8B3D", line: "#DCEBCB", btnInk: "#FFFFFF", seal: "#2E8251", sealInk: "#FFFFFF", liner: "#FFD768" } },
    { id: "selva", name: "Selva", vars: { bg: "#ECE4CE", paper: "#FFFBEF", ink: "#2E3C24", soft: "#5C684A", accent: "#5F9C56", line: "#E1E4C4", btnInk: "#FFFFFF", seal: "#A0621F", sealInk: "#FFFFFF", liner: "#EBC467" } },
  ],
  Art,
};
