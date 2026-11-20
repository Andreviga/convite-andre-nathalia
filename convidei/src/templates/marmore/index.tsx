import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Mármore: o cartão é uma placa de pedra polida, de cantos chanfrados e borda dourada. Os veios cinzentos e os veios de
// ouro são fitas de espessura variável (desenhadas por curva) deformadas por feTurbulence; os filtros são estáticos.
// Motivo-herói: a gema lapidada em hexágono no alto, que repete o hexágono de fio duplo em volta dos nomes (feito no CSS).

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

const VEIN: CSSProperties = { fill: "var(--mm-vein)" };
const TONE = {
  l: { fill: "var(--foil-l)" } as CSSProperties, // face que recebe a luz
  m: { fill: "var(--foil-m)" } as CSSProperties,
  d: { fill: "var(--foil-d)" } as CSSProperties,
  x: { fill: "var(--foil-x)" } as CSSProperties, // face na sombra
};

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];

function at(c: Curve, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return [a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0], a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1]];
}

/**
 * Fita ao longo de uma curva: fina nas pontas, com a espessura oscilando no caminho (como um veio de pedra, que engrossa
 * e some). Devolve um contorno fechado para preencher, nunca um traço de espessura uniforme.
 */
function ribbon(c: Curve, width: number, phase = 0, steps = 30): string {
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = at(c, t);
    const [x2, y2] = at(c, Math.min(1, t + 0.01));
    const [x1, y1] = at(c, Math.max(0, t - 0.01));
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const taper = Math.pow(Math.sin(Math.PI * t), 0.55);
    const swell = 0.5 + 0.5 * Math.abs(Math.sin(t * 8.3 + phase)) * (0.6 + 0.4 * Math.sin(t * 21 + phase * 2));
    const w = (width * taper * swell) / 2;
    left.push(`${r1(x + nx * w)} ${r1(y + ny * w)}`);
    right.unshift(`${r1(x - nx * w)} ${r1(y - ny * w)}`);
  }
  return `M${left.join("L")}L${right.join("L")}Z`;
}

type Veins = { box: [number, number]; grey: [Curve, number, number][]; faint: [Curve, number, number][]; band: [Curve, number][]; gold: [Curve, number, number][] };

// Placa do cartão (400 × 760): os veios cruzam os cantos e deixam livre a coluna do texto. O veio do alto, à direita, corta
// só o triângulo acima e ao lado do emblema: abaixo da altura da saudação ele já está na margem (x > 370), fora do texto.
const CARD: Veins = {
  box: [400, 760],
  grey: [
    [[[440, 210], [410, 150], [352, 80], [300, -30]], 4.2, 0.4],
    [[[384, 96], [362, 70], [372, 30], [352, -30]], 1.8, 2.1],
    [[[440, 640], [380, 690], [320, 740], [240, 800]], 3.6, 1.2],
    [[[362, 704], [390, 728], [410, 768], [440, 790]], 1.8, 3.3],
    [[[-40, 598], [8, 650], [50, 722], [78, 800]], 2.6, 0.7],
  ],
  faint: [
    [[[-40, 400], [14, 414], [40, 470], [24, 548]], 1.5, 0.9],
    [[[150, -20], [128, 30], [60, 72], [-30, 110]], 1.4, 2.6],
    [[[440, 372], [404, 404], [388, 468], [412, 540]], 1.3, 4.1],
  ],
  band: [
    [[[440, 226], [404, 158], [340, 84], [282, -40]], 34],
    [[[440, 610], [366, 668], [300, 728], [200, 810]], 38],
  ],
  gold: [
    [[[440, 196], [416, 146], [362, 78], [312, -30]], 2.3, 1.7],
    [[[440, 620], [370, 676], [304, 730], [218, 800]], 2.1, 0.2],
    [[[-40, 572], [20, 632], [70, 712], [104, 800]], 1.6, 2.9],
  ],
};

// Forro do envelope (400 × 286): só o triângulo de cima aparece, então os veios se concentram ali.
const LINER: Veins = {
  box: [400, 286],
  grey: [
    [[[-30, 44], [96, 16], [214, 112], [440, 58]], 3.6, 0.8],
    [[[150, -20], [176, 40], [236, 96], [262, 190]], 2.2, 2.4],
    [[[440, 6], [352, 40], [300, 26], [226, -20]], 1.8, 1.1],
  ],
  faint: [
    [[[-30, 110], [70, 96], [132, 150], [210, 200]], 1.4, 3.2],
    [[[60, -20], [70, 20], [40, 60], [-30, 70]], 1.2, 0.3],
  ],
  band: [[[[-30, 66], [100, 40], [220, 134], [440, 82]], 40]],
  gold: [
    [[[-30, 62], [104, 36], [222, 130], [440, 78]], 2.2, 2.0],
    [[[300, -20], [286, 30], [244, 70], [226, 150]], 1.6, 0.6],
  ],
};

/** A pedra: nuvens de tom, veios cinzentos em três intensidades e veios de ouro. */
function Stone({ veins, className }: { veins: Veins; className: string }) {
  const u = useUid();
  const [w, h] = veins.box;
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* nuvens: manchas largas e suaves de tom */}
        <filter id={`marmore-cloud-${u}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.009" numOctaves={4} seed={h === 760 ? 11 : 23} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.7 0 0 0 -1.05" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        {/* deformação: tira a régua das curvas */}
        <filter id={`marmore-warp-${u}`} x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves={2} seed={h === 760 ? 5 : 17} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={30} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`marmore-soft-${u}`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves={2} seed={h === 760 ? 5 : 17} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={30} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <linearGradient id={`marmore-gold-${u}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="96" y2="54" spreadMethod="reflect">
          <stop offset="0" style={{ stopColor: "var(--foil-d)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--foil-l)" }} />
          <stop offset="1" style={{ stopColor: "var(--foil-m)" }} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} style={VEIN} opacity="0.15" filter={`url(#marmore-cloud-${u})`} />
      <g style={VEIN} opacity="0.16" filter={`url(#marmore-soft-${u})`}>
        {veins.band.map(([c, width], i) => <path key={i} d={ribbon(c, width, i, 16)} />)}
      </g>
      <g filter={`url(#marmore-warp-${u})`}>
        <g style={VEIN} opacity="0.34">
          {veins.faint.map(([c, width, phase], i) => <path key={i} d={ribbon(c, width, phase)} />)}
        </g>
        <g style={VEIN} opacity="0.62">
          {veins.grey.map(([c, width, phase], i) => <path key={i} d={ribbon(c, width, phase)} />)}
        </g>
        <g fill={`url(#marmore-gold-${u})`}>
          {veins.gold.map(([c, width, phase], i) => <path key={i} d={ribbon(c, width, phase, 36)} />)}
        </g>
      </g>
    </svg>
  );
}

// ───── Gema lapidada em hexágono (vista de cima): seis facetas em tons diferentes, mesa central e reflexo ─────
function hex(cx: number, cy: number, r: number): Pt[] {
  return [0, 1, 2, 3, 4, 5].map((k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))] as Pt;
  });
}
const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
// luz de cima e da esquerda: a faceta 5 (alto, à esquerda) é a mais clara; a 2 (baixo, à direita), a mais escura
const FACETS: CSSProperties[] = [TONE.m, TONE.d, TONE.x, TONE.d, TONE.m, TONE.l];

function Gem({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const outer = hex(cx, cy, r);
  const mid = hex(cx, cy, r * 0.56);
  const ring = hex(cx, cy, r * 1.2);
  return (
    <g>
      <path d={poly(ring)} fill="none" style={{ stroke: "var(--gold-line)" }} strokeWidth="0.8" />
      {outer.map((p, k) => {
        const q = outer[(k + 1) % 6];
        return <path key={k} d={poly([p, q, mid[(k + 1) % 6], mid[k]])} style={FACETS[k]} />;
      })}
      {/* mesa: duas metades (a de cima mais clara) e um reflexo fino */}
      <path d={poly([mid[5], mid[0], mid[1], mid[2]])} style={TONE.l} />
      <path d={poly([mid[2], mid[3], mid[4], mid[5]])} style={TONE.m} />
      <path d={poly([mid[5], mid[0], [r2(cx + r * 0.1), r2(cy - r * 0.16)], [r2(cx - r * 0.3), r2(cy + r * 0.04)]])} fill="#fff" opacity="0.42" />
      {/* arestas: um fio da cor do papel separa as facetas, como o chanfro da lapidação */}
      <path d={`${poly(outer)}${poly(mid)}${outer.map((p, k) => `M${p[0]} ${p[1]}L${mid[k][0]} ${mid[k][1]}`).join("")}`} fill="none" style={{ stroke: "var(--paper)" }} strokeWidth="0.45" strokeLinejoin="round" opacity="0.7" />
    </g>
  );
}

/** Losango lapidado: quatro faces, cada uma num tom. */
function Lozenge({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <g>
      <path d={`M${cx} ${cy - ry}L${cx - rx} ${cy}L${cx} ${cy}Z`} style={TONE.l} />
      <path d={`M${cx} ${cy - ry}L${cx + rx} ${cy}L${cx} ${cy}Z`} style={TONE.m} />
      <path d={`M${cx} ${cy + ry}L${cx + rx} ${cy}L${cx} ${cy}Z`} style={TONE.x} />
      <path d={`M${cx} ${cy + ry}L${cx - rx} ${cy}L${cx} ${cy}Z`} style={TONE.d} />
    </g>
  );
}

/** Fio que afina: grosso junto ao centro, some na ponta. */
const taper = (x0: number, x1: number, y: number, w = 1.5) => `M${x0} ${r2(y - w / 2)}L${x1} ${r2(y - 0.12)}V${r2(y + 0.12)}L${x0} ${r2(y + w / 2)}Z`;

function star(cx: number, cy: number, r: number): string {
  const k = r * 0.16;
  return `M${cx} ${r2(cy - r)}Q${r2(cx + k)} ${r2(cy - k)} ${r2(cx + r)} ${cy}Q${r2(cx + k)} ${r2(cy + k)} ${cx} ${r2(cy + r)}Q${r2(cx - k)} ${r2(cy + k)} ${r2(cx - r)} ${cy}Q${r2(cx - k)} ${r2(cy - k)} ${cx} ${r2(cy - r)}Z`;
}

/** Alianças entrelaçadas: aros mais grossos embaixo (o furo é deslocado para cima) e um brilhante no alto. */
function Rings({ u }: { u: string }) {
  const ringPath = (cx: number) => `M${cx - 15} 40a15 15 0 1 0 30 0a15 15 0 1 0 -30 0ZM${cx - 12} 39.1a12 12 0 1 1 24 0a12 12 0 1 1 -24 0Z`;
  return (
    <g>
      <defs>
        <linearGradient id={`marmore-ring-${u}`} gradientUnits="userSpaceOnUse" x1="76" y1="24" x2="124" y2="56">
          <stop offset="0" style={{ stopColor: "var(--foil-l)" }} />
          <stop offset="0.42" style={{ stopColor: "var(--foil-m)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--foil-x)" }} />
          <stop offset="1" style={{ stopColor: "var(--foil-m)" }} />
        </linearGradient>
        <clipPath id={`marmore-over-${u}`}>
          <rect x="90" y="20" width="20" height="19" />
        </clipPath>
      </defs>
      <g fill={`url(#marmore-ring-${u})`} fillRule="evenodd" style={{ stroke: "var(--paper)" }} strokeWidth="0.8">
        <path d={ringPath(90)} />
        <path d={ringPath(110)} />
        {/* no cruzamento de cima, o aro da esquerda passa por cima */}
        <path d={ringPath(90)} clipPath={`url(#marmore-over-${u})`} />
      </g>
      {/* reflexo na curva de cada aro */}
      <path d="M78.6 33.4a13.4 13.4 0 0 1 9-6.4M98.6 33.4a13.4 13.4 0 0 1 9-6.4" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <Lozenge cx={100} cy={13} rx={6.2} ry={8.6} />
      <path d={`${star(84, 9, 3.4)}${star(117, 12, 2.6)}`} style={TONE.m} />
    </g>
  );
}

/** Louros da formatura: dois ramos de folhas cheias (clara por fora, escura por dentro) em volta da gema. */
function Laurel() {
  const leaf = "M0 0C2.6-2.9 7.4-3 10.6 0C7.4 2.2 2.8 2.4 0 0Z";
  const side = (mirror: boolean) => {
    const items = [];
    for (let i = 0; i < 6; i++) {
      const a = 112 + i * 25; // 90° é embaixo; sobe pela esquerda até perto do topo
      const rad = (a * Math.PI) / 180;
      const x = r2(100 + 26 * Math.cos(rad));
      const y = r2(38 + 26 * Math.sin(rad));
      const size = r2(1.08 - i * 0.07);
      items.push(<path key={`o${i}`} d={leaf} transform={`translate(${x} ${y}) rotate(${a + 52}) scale(${size})`} style={i % 2 ? TONE.m : TONE.l} />);
      items.push(<path key={`i${i}`} d={leaf} transform={`translate(${x} ${y}) rotate(${a + 128}) scale(${r2(size * 0.82)})`} style={i % 2 ? TONE.x : TONE.d} />);
    }
    return (
      <g transform={mirror ? "translate(200 0) scale(-1 1)" : undefined}>
        <path d="M89 61.6A26 26 0 0 1 87.4 15.2" fill="none" style={{ stroke: "var(--foil-d)" }} strokeWidth="0.9" strokeLinecap="round" />
        {items}
      </g>
    );
  };
  return (
    <g>
      {side(false)}
      {side(true)}
      <Gem cx={100} cy={38} r={13.5} />
      <Lozenge cx={100} cy={65.4} rx={2.6} ry={3.6} />
    </g>
  );
}

/** Emblema do alto do cartão. Muda com o tipo de evento; o padrão é a gema entre dois fios. */
function Emblem({ eventType }: { eventType?: string }) {
  const u = useUid();
  const wide = eventType === "formatura" ? 62 : eventType === "casamento" ? 68 : 66;
  return (
    <svg className="marmore-emblem" viewBox="0 0 200 72" aria-hidden="true">
      {/* fios laterais que afinam, com losango na ponta */}
      <g style={TONE.m}>
        <path d={`${taper(wide, 20, 38)}${taper(200 - wide, 180, 38)}`} />
        <path d={`M${wide + 3} 34.9l2.3 3.1-2.3 3.1-2.3-3.1ZM${197 - wide} 34.9l2.3 3.1-2.3 3.1-2.3-3.1Z`} />
      </g>
      <Lozenge cx={13} cy={38} rx={3.2} ry={4.6} />
      <Lozenge cx={187} cy={38} rx={3.2} ry={4.6} />
      {eventType === "casamento" ? (
        <Rings u={u} />
      ) : eventType === "formatura" ? (
        <Laurel />
      ) : (
        <>
          {eventType === "aniversario" ? (
            <path
              style={TONE.m}
              d={[-150, -130, -110, -90, -70, -50, -30]
                .map((deg, i) => {
                  const a = (deg * Math.PI) / 180;
                  const r0 = 30;
                  const r1x = i % 2 ? 33.5 : 36.5;
                  const n = 0.9;
                  const c = Math.cos(a);
                  const s = Math.sin(a);
                  return `M${r2(100 + c * r0 + s * n)} ${r2(38 + s * r0 - c * n)}L${r2(100 + c * r1x)} ${r2(38 + s * r1x)}L${r2(100 + c * r0 - s * n)} ${r2(38 + s * r0 + c * n)}Z`;
                })
                .join("")}
            />
          ) : null}
          {eventType === "quinze-anos" ? <path style={TONE.m} d={`${star(66, 15, 6)}${star(134, 15, 6)}${star(124, 60, 3.2)}${star(76, 60, 3.2)}`} /> : null}
          <Gem cx={100} cy={38} r={22} />
        </>
      )}
    </svg>
  );
}

/** Fecho do cartão e assinatura da página: losango lapidado entre dois fios que afinam. */
function Mark({ small }: { small?: boolean }) {
  return (
    <svg className={small ? "marmore-mark marmore-mark-small" : "marmore-mark"} viewBox="0 0 160 18" width={small ? 124 : 160} height={small ? 14 : 18} aria-hidden="true">
      <path d={`${taper(66, 6, 9, 1.4)}${taper(94, 154, 9, 1.4)}`} style={TONE.m} />
      <path d="M72 6.6l1.8 2.4-1.8 2.4-1.8-2.4ZM88 6.6l1.8 2.4-1.8 2.4-1.8-2.4Z" style={TONE.m} />
      <Lozenge cx={80} cy={9} rx={4.6} ry={7.2} />
    </svg>
  );
}

/** Fundo da página: colmeia de hexágonos em fio, quase invisível (o mesmo módulo do hexágono dos nomes). */
function Lattice() {
  const u = useUid();
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`marmore-hex-${u}`} width="41.57" height="72" patternUnits="userSpaceOnUse">
          <path d="M0 12L20.78 0L41.57 12M0 12V36M41.57 12V36M0 36L20.78 48L41.57 36M20.78 48V72" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#marmore-hex-${u})`} />
    </svg>
  );
}

function Liner() {
  return (
    <>
      <Stone veins={LINER} className="marmore-liner-stone" />
      {/* dois fios dourados acompanham o corte da aba */}
      <svg className="marmore-liner-rules" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M5.5 0L50 51.6L94.5 0" vectorEffect="non-scaling-stroke" strokeWidth="1.4" />
        <path d="M9.5 0L50 47L90.5 0" vectorEffect="non-scaling-stroke" strokeWidth="0.7" />
      </svg>
    </>
  );
}

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top")
    return (
      <>
        <div className="marmore-slab">
          <div className="marmore-slab-edge" />
          <Stone veins={CARD} className="marmore-stone" />
        </div>
        <Emblem eventType={eventType} />
      </>
    );
  if (slot === "divider") return <Mark />;
  if (slot === "bottom") return <Mark small />;
  if (slot === "backdrop") return <Lattice />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "marmore",
  name: "Mármore",
  description: "Placa de mármore com veios de ouro e hexágono em fio dourado",
  premium: true,
  suits: ["casamento", "quinze-anos", "formatura", "aniversario", "outro"],
  palettes: [
    { id: "carrara", name: "Carrara e ouro", vars: { bg: "#DBD9D4", paper: "#F7F6F3", ink: "#23262B", soft: "#585C64", accent: "#86661F", line: "#CFCBC2", btnInk: "#F7F6F3", seal: "#96732A", sealInk: "#FBEFC9", liner: "#2A2D33" } },
    { id: "nero", name: "Mármore preto e ouro", vars: { bg: "#0B0B0C", paper: "#18181A", ink: "#F2EDE2", soft: "#B8B3A8", accent: "#D2B06A", line: "#45413A", btnInk: "#18181A", seal: "#A07C2E", sealInk: "#FBEFC9", liner: "#ECE8DF" } },
    { id: "malaquita", name: "Malaquita e ouro", vars: { bg: "#06211A", paper: "#0D3A2E", ink: "#F3EEDD", soft: "#B9CBBD", accent: "#D8B76E", line: "#2F6350", btnInk: "#0D3A2E", seal: "#A07C2E", sealInk: "#FBEFC9", liner: "#EFE9DA" } },
    { id: "quartzo", name: "Quartzo rosa e ouro rosé", vars: { bg: "#EAD3CE", paper: "#FAEEEB", ink: "#3B2529", soft: "#74575B", accent: "#9A5B4C", line: "#E3C5BF", btnInk: "#FFF7F4", seal: "#A8685A", sealInk: "#FFEDE2", liner: "#6E3D36" } },
  ],
  Art,
};
