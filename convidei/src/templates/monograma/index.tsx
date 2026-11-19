import type { ArtProps, TemplateDef } from "../types";

// Monograma: papelaria de família. O herói é um brasão gravado com as iniciais (medalhão oval de fio duplo abraçado por
// dois ramos de louro). O resto é contido: uma só tinta, Cormorant em itálico e versalete, e o mesmo monograma repetido
// no forro do envelope e como assinatura no fim da página.

const SERIF = "var(--f-serif), 'Cormorant Garamond', Georgia, serif";
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Folha de louro: amêndoa de comprimento l, apontando para +x a partir da origem. */
function leafPath(l: number): string {
  const w = l * 0.27;
  return `M0 0C${r1(l * 0.28)} ${r1(-w)} ${r1(l * 0.72)} ${r1(-w * 0.82)} ${r1(l)} 0C${r1(l * 0.72)} ${r1(w * 0.82)} ${r1(l * 0.28)} ${r1(w)} 0 0Z`;
}

type Leaf = { x: number; y: number; rot: number; l: number };

/** Um ramo (lado esquerdo) sobre uma elipse: pares de folhas que diminuem até a ponta. O outro lado é o espelho. */
function branch(cx: number, cy: number, rx: number, ry: number, from: number, to: number, pairs: number, big: number, small: number) {
  const leaves: Leaf[] = [];
  const at = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), tan: (Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180) / Math.PI };
  };
  for (let i = 0; i < pairs; i++) {
    const t = i / (pairs - 1);
    const p = at(from + (to - from) * (0.06 + t * 0.9));
    const l = big + (small - big) * t;
    leaves.push({ x: p.x, y: p.y, rot: p.tan + 34, l }, { x: p.x, y: p.y, rot: p.tan - 34, l: l * 0.92 });
  }
  const tip = at(to);
  leaves.push({ x: tip.x, y: tip.y, rot: tip.tan, l: small });
  const a = at(from - 17); // o talo passa do eixo e cruza o do outro lado
  const stem = `M${r1(a.x)} ${r1(a.y)}A${rx} ${ry} 0 0 1 ${r1(tip.x)} ${r1(tip.y)}`;
  return { leaves, stem };
}

const WREATH = branch(100, 99, 72, 78, 100, 238, 9, 20, 11);
const WREATH_SMALL = branch(100, 99, 71, 77, 99, 236, 6, 21, 13);

function Wreath({ small = false }: { small?: boolean }) {
  const { leaves, stem } = small ? WREATH_SMALL : WREATH;
  const half = (
    <>
      <path d={stem} fill="none" stroke="currentColor" strokeWidth={small ? 1.6 : 1.1} strokeLinecap="round" />
      {leaves.map((leaf, i) => (
        <path key={i} d={leafPath(leaf.l)} transform={`translate(${r1(leaf.x)} ${r1(leaf.y)}) rotate(${r1(leaf.rot)})`} fill="currentColor" />
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

/** As iniciais: uma letra grande, ou duas em capitais romanas separadas por um ponto. */
function Letters({ initials, size = 1 }: { initials: string[]; size?: number }) {
  const [a, b] = initials;
  if (!a) return <path d="M100 91l8 8-8 8-8-8z" fill="currentColor" />;
  const style = { fontFamily: SERIF, fill: "currentColor" } as const;
  if (!b) {
    return (
      <text x="100" y={99 + 21 * size} textAnchor="middle" fontSize={62 * size} fontWeight={500} style={style}>
        {a}
      </text>
    );
  }
  // um só texto centrado: o par fica equilibrado mesmo com letras de larguras muito diferentes (I e W, J e C)
  const fs = 39 * size;
  return (
    <text x="100" y={99 + fs * 0.33} textAnchor="middle" fontSize={fs} fontWeight={500} style={style}>
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
        <path d="M100 173.4l3.4 3.6-3.4 3.6-3.4-3.6z" fill="currentColor" />
        {/* remate no alto, entre as pontas dos ramos */}
        <path d="M100 22.5l4 5-4 5-4-5z" fill="currentColor" />
        <circle cx="100" cy="13.5" r="1.3" fill="currentColor" />
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
    <svg className="mg-divider" viewBox="0 0 132 12" width="132" height="12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M2 6h44M86 6h44" />
      <g fill="currentColor" stroke="none">
        <path d={leafPath(13)} transform="translate(63 6) rotate(180)" />
        <path d={leafPath(13)} transform="translate(69 6)" />
        <circle cx="66" cy="6" r="1.2" />
      </g>
    </svg>
  );
}

/** Forro do envelope: o monograma repetido em meia-queda, como papel de forro estampado. */
function Liner({ initials }: { initials: string[] }) {
  const text = initials.slice(0, 2).join("");
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="monograma-liner" width="46" height="54" patternUnits="userSpaceOnUse">
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
      <rect width="100%" height="100%" fill="url(#monograma-liner)" />
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
    { id: "ouro", name: "Ouro velho", vars: { bg: "#EDE6D6", paper: "#FAF7F0", ink: "#59441A", soft: "#75613A", accent: "#A8894F", line: "#DDD0B2", btnInk: "#FAF7F0", seal: "#9A7B3C", sealInk: "#FBF1D6", liner: "#B39A62" } },
  ],
  Art,
};
