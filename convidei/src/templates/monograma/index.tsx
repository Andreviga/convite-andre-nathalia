import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Monograma: papelaria de família. O herói é um brasão gravado com as iniciais (medalhão oval de fio duplo abraçado por
// dois ramos de louro). O resto é contido: uma só tinta, Cormorant em itálico e versalete, e o mesmo monograma repetido
// no forro do envelope e como assinatura no fim da página.

const SERIF = "var(--f-serif), 'Cormorant Garamond', Georgia, serif";
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Folha de louro, apontando para +x a partir da origem. Gravada, não carimbada: um lado mais cheio que o outro e a
 * ponta levemente caída para o lado magro. `side` (1 ou -1) escolhe para que lado fica a barriga.
 */
function leafPath(l: number, side: 1 | -1 = 1): string {
  const w = l * 0.36 * side;
  return `M0 0C${r1(l * 0.2)} ${r1(-w)} ${r1(l * 0.66)} ${r1(-w * 0.98)} ${r1(l)} ${r1(w * 0.1)}C${r1(l * 0.74)} ${r1(w * 0.56)} ${r1(l * 0.3)} ${r1(w * 0.66)} 0 0Z`;
}
/** Nervura central da folha (traço na cor do papel, acompanha a curva da ponta). */
function ribPath(l: number, side: 1 | -1 = 1): string {
  const w = l * 0.36 * side;
  return `M${r1(l * 0.14)} ${r1(-w * 0.05)}Q${r1(l * 0.55)} ${r1(-w * 0.2)} ${r1(l * 0.84)} ${r1(w * 0.02)}`;
}

type Leaf = { x: number; y: number; rot: number; l: number; side: 1 | -1 };
type Berry = { x: number; y: number; sx: number; sy: number };

/**
 * Um ramo (lado esquerdo) sobre uma elipse: pares de folhas que diminuem até a ponta, com ângulo e comprimento
 * alternados, bagas entre os pares de baixo e talo que afina. O outro lado é o espelho.
 */
function branch(cx: number, cy: number, rx: number, ry: number, from: number, to: number, pairs: number, big: number, small: number, berries: number[] = []) {
  const leaves: Leaf[] = [];
  const pt = (deg: number, off = 0) => {
    const a = (deg * Math.PI) / 180;
    const tan = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a));
    // normal para fora da elipse (o ramo sobe no sentido dos graus crescentes: fora fica à esquerda da tangente)
    const nx = Math.sin(tan);
    const ny = -Math.cos(tan);
    return { x: cx + rx * Math.cos(a) + nx * off, y: cy + ry * Math.sin(a) + ny * off, tan: (tan * 180) / Math.PI };
  };
  const span = to - from;
  const step = (span * 0.9) / (pairs - 1);
  for (let i = 0; i < pairs; i++) {
    const t = i / (pairs - 1);
    const deg = from + span * 0.06 + step * i;
    const l = (big + (small - big) * t) * (i % 2 ? 0.93 : 1.05);
    const wide = i % 2 ? 42 : 33;
    const out = pt(deg);
    const inn = pt(deg + step * 0.3); // a folha de dentro nasce um pouco acima: par desencontrado, como no ramo de verdade
    leaves.push({ x: out.x, y: out.y, rot: out.tan - wide, l, side: 1 }, { x: inn.x, y: inn.y, rot: inn.tan + (i % 2 ? 31 : 39), l: l * 0.86, side: -1 });
  }
  const tip = pt(to);
  leaves.push({ x: tip.x, y: tip.y, rot: tip.tan - 4, l: small * 1.05, side: 1 });
  const fruit: Berry[] = berries.map((i) => {
    const deg = from + span * 0.06 + step * (i + 0.62);
    const base = pt(deg);
    const b = pt(deg + step * 0.1, 5.2);
    return { x: b.x, y: b.y, sx: base.x, sy: base.y };
  });
  // talo: fita que afina da base à ponta; passa do eixo e cruza o do outro lado
  const N = 26;
  const start = from - 17;
  const edge = (sign: number) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const t = k / N;
      const p = pt(start + (to - start) * t, sign * (0.72 - 0.5 * t));
      return `${r1(p.x)} ${r1(p.y)}`;
    });
  const stem = `M${edge(1).join("L")}L${edge(-1).reverse().join("L")}Z`;
  return { leaves, stem, fruit };
}

const WREATH = branch(100, 99, 68, 75, 100, 238, 9, 21, 12, [0, 2, 4, 6]);
const WREATH_SMALL = branch(100, 99, 71, 77, 99, 236, 6, 23, 14);

function Wreath({ small = false }: { small?: boolean }) {
  const { leaves, stem, fruit } = small ? WREATH_SMALL : WREATH;
  const half = (
    <>
      <path d={stem} fill="currentColor" stroke="currentColor" strokeWidth={small ? 0.9 : 0} strokeLinejoin="round" />
      {fruit.map((b, i) => (
        <g key={`b${i}`}>
          <path d={`M${r1(b.sx)} ${r1(b.sy)}L${r1(b.x)} ${r1(b.y)}`} stroke="currentColor" strokeWidth="0.6" fill="none" />
          <circle cx={r1(b.x)} cy={r1(b.y)} r="1.75" fill="currentColor" />
        </g>
      ))}
      {leaves.map((leaf, i) => (
        <g key={i} transform={`translate(${r1(leaf.x)} ${r1(leaf.y)}) rotate(${r1(leaf.rot)})`}>
          <path d={leafPath(leaf.l, leaf.side)} fill="currentColor" />
          {small ? null : <path className="mg-rib" d={ribPath(leaf.l, leaf.side)} fill="none" strokeWidth="0.45" strokeLinecap="round" />}
        </g>
      ))}
    </>
  );
  return (
    <g>
      {half}
      <g transform="translate(200 0) scale(-1 1)">{half}</g>
    </g>
  );
}

/** Em monograma gravado a inicial vai sem acento: "Â" vira "A", "É" vira "E". */
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
/** J e Q descem da linha de base na Cormorant: sobem um pouco para o conjunto ficar centrado no medalhão. */
const hangs = (s: string) => /[JQ]/.test(s);

/** As iniciais: uma letra grande, ou duas em capitais romanas separadas por um ponto. */
function Letters({ initials, size = 1 }: { initials: string[]; size?: number }) {
  const [a, b] = initials.map(plain);
  if (!a) return <path d="M100 91l8 8-8 8-8-8z" fill="currentColor" />;
  const style = { fontFamily: SERIF, fill: "currentColor" } as const;
  if (!b) {
    return (
      <text x="100" y={99 + (hangs(a) ? 16.5 : 21) * size} textAnchor="middle" fontSize={62 * size} fontWeight={500} style={style}>
        {a}
      </text>
    );
  }
  // um só texto centrado: o par fica equilibrado mesmo com letras de larguras muito diferentes (I e W, J e C)
  const fs = 39 * size;
  return (
    <text x="100" y={99 + fs * (hangs(a + b) ? 0.29 : 0.33)} textAnchor="middle" fontSize={fs} fontWeight={500} style={style}>
      {a}
      <tspan dx={fs * 0.1} opacity="0.8">·</tspan>
      <tspan dx={fs * 0.1}>{b}</tspan>
    </text>
  );
}

/** O brasão do topo: louros, medalhão oval de fio duplo e as iniciais. */
function Crest({ initials }: { initials: string[] }) {
  return (
    <svg className="mg-crest" viewBox="0 0 200 196" role="img" aria-label={initials.length ? `Monograma ${initials.join(" e ")}` : "Monograma"}>
      <g className="mg-crest-leaf">
        <Wreath />
        <ellipse cx="100" cy="99" rx="52" ry="59" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <ellipse cx="100" cy="99" rx="48" ry="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {/* nó na base, onde os ramos se encontram */}
        <path d="M100 170.6l3.4 3.6-3.4 3.6-3.4-3.6z" fill="currentColor" />
        {/* remate no alto, entre as pontas dos ramos */}
        <path d="M100 23.5l4 5-4 5-4-5z" fill="currentColor" />
        <circle cx="100" cy="15" r="1.3" fill="currentColor" />
      </g>
      <g className="mg-crest-ink">
        <Letters initials={initials} />
      </g>
    </svg>
  );
}

/** Fio com um par de folhas no centro. */
function Divider() {
  return (
    <svg className="mg-divider" viewBox="0 0 136 14" width="136" height="14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M2 7h43M91 7h43" />
      <g fill="currentColor" stroke="none">
        <path d={leafPath(15, -1)} transform="translate(63.6 7) rotate(180)" />
        <path d={leafPath(15)} transform="translate(72.4 7)" />
        <circle cx="68" cy="7" r="1.3" />
      </g>
    </svg>
  );
}

/** Forro do envelope: o monograma repetido em meia-queda, como papel de forro estampado. */
function Liner({ initials }: { initials: string[] }) {
  const u = useUid();
  const text = initials.slice(0, 2).map(plain).join("");
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`monograma-liner-${u}`} width="46" height="54" patternUnits="userSpaceOnUse">
          {[
            [11.5, 13.5],
            [34.5, 40.5],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="8.6" ry="10" fill="none" stroke="currentColor" strokeWidth="0.7" />
              {text ? (
                <text x={x} y={y + 3.1} textAnchor="middle" fontSize={text.length > 1 ? 8.6 : 11} fontWeight={600} style={{ fontFamily: SERIF, fill: "currentColor" }}>
                  {text}
                </text>
              ) : (
                <path d={`M${x} ${y - 3}l3 3-3 3-3-3z`} fill="currentColor" />
              )}
            </g>
          ))}
          <path d="M34.5 11.5l2 2-2 2-2-2zM11.5 38.5l2 2-2 2-2-2z" fill="currentColor" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#monograma-liner-${u})`} />
    </svg>
  );
}

/** Assinatura no fim da página: o mesmo monograma, pequeno, fechando o convite. */
function Signature({ initials }: { initials: string[] }) {
  if (!initials.length) return null;
  return (
    <svg className="mg-sign" viewBox="0 0 200 196" aria-hidden="true">
      <Wreath small />
      <Letters initials={initials} size={1.45} />
    </svg>
  );
}

function Art({ slot, initials }: ArtProps) {
  if (slot === "top") return <Crest initials={initials} />;
  if (slot === "divider") return <Divider />;
  if (slot === "liner") return <Liner initials={initials} />;
  if (slot === "backdrop") return <Signature initials={initials} />;
  return null;
}

export const def: TemplateDef = {
  id: "monograma",
  name: "Monograma",
  description: "Brasão de louros com as iniciais, como papelaria de família",
  premium: true,
  suits: ["casamento", "outro"],
  palettes: [
    { id: "verde", name: "Verde garrafa", vars: { bg: "#E2E3D6", paper: "#F7F2E6", ink: "#26382D", soft: "#55645A", accent: "#4D6455", line: "#CCD1BE", btnInk: "#F7F2E6", seal: "#26382D", sealInk: "#E9DDB8", liner: "#2F4436" } },
    { id: "bordo", name: "Bordô", vars: { bg: "#EADFD6", paper: "#F8F1E8", ink: "#5A1A27", soft: "#7B545A", accent: "#84404B", line: "#DDC8C2", btnInk: "#F8F1E8", seal: "#5A1A27", sealInk: "#F0D9B4", liner: "#5A1A27" } },
    { id: "marinho", name: "Marinho", vars: { bg: "#DDE1E6", paper: "#F6F4EE", ink: "#1B2A41", soft: "#55617A", accent: "#47597A", line: "#C3CAD6", btnInk: "#F6F4EE", seal: "#1B2A41", sealInk: "#E6D9B4", liner: "#1B2A41" } },
    { id: "preto", name: "Preto", vars: { bg: "#E4E1DB", paper: "#F8F6F1", ink: "#1C1B1A", soft: "#5E5A55", accent: "#55514C", line: "#CFCBC2", btnInk: "#F8F6F1", seal: "#1C1B1A", sealInk: "#E9E2D2", liner: "#1C1B1A" } },
    { id: "ouro", name: "Ouro velho", vars: { bg: "#EDE6D6", paper: "#FAF7F0", ink: "#59441A", soft: "#75613A", accent: "#8F7238", line: "#DDD0B2", btnInk: "#FAF7F0", seal: "#86692E", sealInk: "#FBF1D6", liner: "#B39A62" } },
  ],
  Art,
};
