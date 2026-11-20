import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Rústico: casamento no campo. Cartão de papel claro sobre kraft, amarrado com barbante de juta (laço no topo, com dois
// raminhos presos sob o nó) e arrematado embaixo por uma renda de papel recortada (feita no CSS, com máscara).
// Impressão em duas tintas: hastes e folhas num tom neutro escuro; coração e florzinha do divisor na cor de destaque.
// A lavanda é lilás em todas as paletas (--ru-lav, puxado para a tinta do texto), e o barbante e o trigo têm cor de
// palha (variáveis --ru-twine* do CSS).

const r2 = (n: number) => Math.round(n * 100) / 100;
type Pt = { x: number; y: number };

/** Ponto de uma curva quadrática (a, c, b) em t. */
function q(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}
/** Direção da curva em t, em graus. */
function dir(a: Pt, c: Pt, b: Pt, t: number): number {
  const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}
/** Haste: contorno preenchido que afina da base (w0) para a ponta (w1). */
function stem(a: Pt, c: Pt, b: Pt, w0: number, w1: number, t0 = 0, t1 = 1): string {
  const up: string[] = [];
  const down: string[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const p = q(a, c, b, t);
    const ang = ((dir(a, c, b, t) + 90) * Math.PI) / 180;
    const w = (w0 + (w1 - w0) * (i / n)) / 2;
    up.push(`${r2(p.x + Math.cos(ang) * w)} ${r2(p.y + Math.sin(ang) * w)}`);
    down.unshift(`${r2(p.x - Math.cos(ang) * w)} ${r2(p.y - Math.sin(ang) * w)}`);
  }
  return `M${up.join("L")}L${down.join("L")}Z`;
}
/** Gota (botão de flor, grão, folha): nasce na origem e aponta para +x. `belly` é onde fica a parte mais larga (0 a 1). */
function drop(len: number, wid: number, belly = 0.38): string {
  const b = len * belly;
  return `M0 0C${r2(b * 0.4)} ${r2(-wid)} ${r2(b + (len - b) * 0.45)} ${r2(-wid)} ${r2(len)} 0C${r2(b + (len - b) * 0.45)} ${r2(wid)} ${r2(b * 0.4)} ${r2(wid)} 0 0Z`;
}
const at = (p: Pt, deg: number) => `translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(deg)})`;

/** Espiga de lavanda: haste afinada, duas folhas estreitas e verticilos de botões (uma camada de trás, mais clara, e uma da frente). */
function Lavender({ a, c, b, size = 1, flip = 1 }: { a: Pt; c: Pt; b: Pt; size?: number; flip?: 1 | -1 }) {
  const whorls = 11;
  const back = [];
  const front = [];
  const calyx = [];
  for (let i = 0; i < whorls; i++) {
    const k = i / (whorls - 1);
    // os verticilos se aproximam perto da ponta
    const t = 0.5 + 0.48 * (1 - Math.pow(1 - k, 1.2));
    const p = q(a, c, b, t);
    const d = dir(a, c, b, t);
    const len = (6.6 - 3 * k) * size;
    const wid = (2.7 - 1.2 * k) * size;
    const open = 36 - 14 * k; // os botões de baixo abrem mais
    back.push(<path key={`b${i}`} d={drop(len * 1.2, wid * 1.05, 0.5)} transform={at(p, d + (i % 2 ? 9 : -9))} />);
    front.push(<path key={`l${i}`} d={drop(len, wid, 0.52)} transform={at(p, d - open * flip)} />);
    front.push(<path key={`r${i}`} d={drop(len * 0.92, wid, 0.52)} transform={at(p, d + open * flip)} />);
    calyx.push(<path key={`c${i}`} d={drop(len * 0.46, wid * 0.7, 0.5)} transform={at(p, d - open * flip)} />);
    calyx.push(<path key={`d${i}`} d={drop(len * 0.44, wid * 0.7, 0.5)} transform={at(p, d + open * flip)} />);
  }
  const tip = q(a, c, b, 1);
  const leaf1 = q(a, c, b, 0.2);
  const leaf2 = q(a, c, b, 0.31);
  return (
    <g>
      <g className="ru-leaf">
        <path d={drop(21 * size, 2.1 * size, 0.42)} transform={at(leaf1, dir(a, c, b, 0.2) - 27 * flip)} />
        <path d={drop(17 * size, 1.9 * size, 0.42)} transform={at(leaf2, dir(a, c, b, 0.31) + 30 * flip)} />
      </g>
      <path className="ru-stem" d={stem(a, c, b, 1.5 * size, 0.5 * size)} />
      <g className="ru-lav-back">{back}</g>
      <g className="ru-lav">
        {front}
        <path d={drop(5 * size, 1.5 * size)} transform={at(tip, dir(a, c, b, 1))} />
      </g>
      <g className="ru-lav-calyx">{calyx}</g>
    </g>
  );
}

/** Espiga de trigo: grãos alternados com vinco, barbas finas que afinam e um grão na ponta. */
function Wheat({ a, c, b, size = 1, flip = 1 }: { a: Pt; c: Pt; b: Pt; size?: number; flip?: 1 | -1 }) {
  const n = 11;
  const grains = [];
  const creases = [];
  const awns = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const t = 0.5 + 0.47 * k;
    const p = q(a, c, b, t);
    const d = dir(a, c, b, t);
    const side = (i % 2 ? 1 : -1) * flip;
    const len = (11.5 - 3.6 * k) * size;
    const wid = (2.9 - 0.8 * k) * size;
    const ang = d + side * (25 - 7 * k);
    grains.push(<path key={`g${i}`} d={drop(len, wid, 0.45)} transform={at(p, ang)} />);
    creases.push(<path key={`v${i}`} d={`M${r2(len * 0.2)} 0L${r2(len * 0.82)} 0`} transform={at(p, ang)} />);
    // barba: gota muito fina, nasce na ponta do grão e segue quase paralela à haste
    const rad = (ang * Math.PI) / 180;
    const tipPt = { x: p.x + Math.cos(rad) * len * 0.96, y: p.y + Math.sin(rad) * len * 0.96 };
    awns.push(<path key={`a${i}`} d={drop((17 - 5 * k) * size, 0.42 * size, 0.1)} transform={at(tipPt, d + side * (13 - 4 * k))} />);
  }
  const tip = q(a, c, b, 0.985);
  const dt = dir(a, c, b, 1);
  return (
    <g>
      <g className="ru-leaf">
        <path d={drop(26 * size, 2 * size, 0.4)} transform={at(q(a, c, b, 0.24), dir(a, c, b, 0.24) + 24 * flip)} />
      </g>
      <path className="ru-stem" d={stem(a, c, b, 1.5 * size, 0.7 * size)} />
      <g className="ru-awn">
        {awns}
        <path d={drop(15 * size, 0.42 * size, 0.1)} transform={at(q(a, c, b, 1), dt)} />
      </g>
      <g className="ru-grain">
        {grains}
        <path d={drop(8.5 * size, 2.1 * size, 0.45)} transform={at(tip, dt)} />
      </g>
      <g className="ru-crease">{creases}</g>
    </g>
  );
}

/** Barbante de juta: sombra, fio, torção (traços curtos escuros) e brilho das fibras. */
function Twine({ d, w = 4.4, shadow = true }: { d: string; w?: number; shadow?: boolean }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {shadow ? <path className="ru-twine-shadow" d={d} strokeWidth={w + 0.6} transform="translate(0.6 2)" /> : null}
      <path className="ru-twine-edge" d={d} strokeWidth={w + 1} />
      <path className="ru-twine" d={d} strokeWidth={w} />
      <path className="ru-twine-twist" d={d} strokeWidth={w} strokeDasharray="1.1 2.7" strokeLinecap="butt" />
      <path className="ru-twine-light" d={d} strokeWidth={w * 0.3} strokeDasharray="2.6 1.2" strokeLinecap="butt" transform="translate(0 -0.7)" />
    </g>
  );
}

/** Topo do cartão: barbante que dá a volta no papel, laço no centro e dois raminhos presos sob o nó. */
function Top({ eventType }: { eventType?: string }) {
  const u = useUid();
  const wheat = eventType === "aniversario" || eventType === "formatura" || eventType === "outro";
  const Sprig = wheat ? Wheat : Lavender;
  const y = 92;
  const k: Pt = { x: 180, y };
  return (
    <svg className="ru-top" viewBox="0 0 360 132" aria-hidden="true">
      {/* raminhos: dois para cada lado, com a ponta cortada da haste saindo do outro lado do nó */}
      <g className="ru-sprigs">
        <path className="ru-stem" d={stem({ x: 180, y: 93 }, { x: 196, y: 101 }, { x: 213, y: 105 }, 1.5, 1.3)} />
        <path className="ru-stem" d={stem({ x: 180, y: 93 }, { x: 166, y: 102 }, { x: 150, y: 107 }, 1.5, 1.3)} />
        <path className="ru-stem" d={stem({ x: 180, y: 93 }, { x: 190, y: 106 }, { x: 203, y: 114 }, 1.4, 1.2)} />
        <Sprig a={{ x: 182, y: 93 }} c={{ x: 150, y: 46 }} b={{ x: 96, y: 22 }} size={1.08} flip={-1} />
        <Sprig a={{ x: 178, y: 93 }} c={{ x: 212, y: 44 }} b={{ x: 268, y: 26 }} size={1.05} />
        <Sprig a={{ x: 182, y: 94 }} c={{ x: 124, y: 62 }} b={{ x: 44, y: 50 }} size={1.18} flip={-1} />
        <Sprig a={{ x: 178, y: 94 }} c={{ x: 238, y: 66 }} b={{ x: 318, y: 46 }} size={1.18} />
      </g>
      {/* a volta do barbante: cortada rente às bordas do papel, com uma sombra curta onde o fio vira para trás */}
      <defs>
        <clipPath id={`rustico-wrap-${u}`}>
          <rect x="0" y="0" width="360" height="132" />
        </clipPath>
      </defs>
      <g clipPath={`url(#rustico-wrap-${u})`}>
        <Twine d={`M-8 ${y + 1.2}C60 ${y - 0.6} 120 ${y + 0.8} 180 ${y}S300 ${y - 0.8} 368 ${y + 1}`} />
        <g className="ru-twine-turn">
          <rect x="0" y={y - 2.4} width="5" height="7.4" opacity="0.16" />
          <rect x="0" y={y - 2.4} width="2.2" height="7.4" opacity="0.26" />
          <rect x="355" y={y - 2.4} width="5" height="7.4" opacity="0.16" />
          <rect x="357.8" y={y - 2.4} width="2.2" height="7.4" opacity="0.26" />
        </g>
      </g>
      {/* pontas soltas */}
      <Twine d="M178 95C174 108 163 117 156 130" w={4} />
      <Twine d="M182 95C188 107 201 112 209 125" w={4} />
      <g className="ru-fray" fill="none" strokeLinecap="round">
        <path d="M156 130l-2.6 4.6M156 130l0.4 5.2M156 130l3 4.2M209 125l-0.6 5M209 125l2.6 4.6M209 125l4.6 2.8" />
      </g>
      {/* as duas alças do laço */}
      <Twine d="M180 92C166 74 132 66 124 82C117 97 152 104 180 92" w={4.2} />
      <Twine d="M180 92C196 73 230 68 237 84C243 99 208 105 180 92" w={4.2} />
      {/* nó */}
      <g transform={`translate(${k.x} ${k.y})`}>
        <ellipse className="ru-twine-shadow-fill" cx="0.6" cy="2.2" rx="7.4" ry="6.2" />
        <path className="ru-knot" d="M-6.2-4.6C-2.4-6.6 2.6-6.6 6.2-4.4C7.6-1.4 7.6 1.8 6 4.8C2.4 6.6-2.6 6.6-6 4.8C-7.6 1.8-7.6-1.6-6.2-4.6Z" />
        <path className="ru-knot-wrap" d="M-3.4-5.6C-4.6-2 -4.6 2-3.2 5.6M0.2-5.9C-0.8-2-0.8 2 0.4 5.9M3.6-5.4C2.8-2 2.8 2 3.8 5.4" />
        <path className="ru-knot-light" d="M-1.6-5.4C-2.4-2-2.4 1-1.8 3.6M2-5.2C1.3-2 1.3 1 1.8 3.4" />
      </g>
    </svg>
  );
}

/** Raminho de folhas do divisor (metade direita; a esquerda é espelhada). */
function leafBranch(): string {
  const a = { x: 13, y: 11 };
  const c = { x: 36, y: 8.2 };
  const b = { x: 60, y: 11 };
  const parts = [stem(a, c, b, 1.1, 0.4)];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const t = 0.1 + 0.8 * k;
    const p = q(a, c, b, t);
    const d = dir(a, c, b, t) + (i % 2 ? 38 : -38);
    const len = 10.5 - 4.5 * k;
    const rad = (d * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // folha (gota) já transformada para o lugar, para caber num único path
    const pts = [[0, 0], [len * 0.17, -(2.5 - k)], [len * 0.67, -(2.5 - k)], [len, 0], [len * 0.67, 2.5 - k], [len * 0.17, 2.5 - k]].map(([x, y]) => `${r2(p.x + x * cos - y * sin)} ${r2(p.y + x * sin + y * cos)}`);
    parts.push(`M${pts[0]}C${pts[1]} ${pts[2]} ${pts[3]}C${pts[4]} ${pts[5]} ${pts[0]}Z`);
  }
  const tip = q(a, c, b, 1);
  parts.push(`M${r2(tip.x - 1)} ${r2(tip.y)}c2.4-1.9 5.2-1.6 7.2 0.2c-2.2 1.5-5 1.6-7.2-0.2z`);
  return parts.join("");
}
const BRANCH = leafBranch();

/** Divisor: dois raminhos de folhas e, no meio, um coração (casamento, chá) ou uma florzinha de cinco pétalas. */
function Divider({ eventType }: { eventType?: string }) {
  const u = useUid();
  const heart = !eventType || eventType === "casamento" || eventType === "cha";
  return (
    <svg className="ru-divider" viewBox="0 0 132 22" width="132" height="22" aria-hidden="true">
      <g className="ru-leaf">
        <path id={`rustico-branch-${u}`} d={BRANCH} transform="translate(66 0)" />
        <use href={`#rustico-branch-${u}`} transform="translate(132 0) scale(-1 1)" />
      </g>
      {heart ? (
        <path className="ru-bloom" d="M66 17.2C61.6 13.9 58.9 11.3 58.9 8.4C58.9 6.2 60.6 4.7 62.5 4.7C64 4.7 65.3 5.5 66 6.9C66.7 5.5 68 4.7 69.5 4.7C71.4 4.7 73.1 6.2 73.1 8.4C73.1 11.3 70.4 13.9 66 17.2Z" />
      ) : (
        <g transform="translate(66 11)">
          <g className="ru-bloom">
            {[0, 72, 144, 216, 288].map((deg) => (
              <path key={deg} d={drop(6.4, 2.5, 0.62)} transform={`rotate(${deg - 90})`} />
            ))}
          </g>
          <circle className="ru-calyx" r="1.5" />
        </g>
      )}
    </svg>
  );
}

/** Fibras do kraft: fios curtos, claros e escuros, espalhados num azulejo (posições fixas, sem sorteio em tempo de execução). */
function fibres(start: number, size: number, count: number): { light: string; dark: string } {
  let seed = start;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const out = { light: "", dark: "" };
  for (let i = 0; i < count; i++) {
    const x = 14 + rnd() * (size - 28);
    const y = 14 + rnd() * (size - 28);
    const ang = rnd() * Math.PI;
    const len = 7 + rnd() * 17;
    const bend = (rnd() - 0.5) * 7;
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;
    const d = `M${r2(x)} ${r2(y)}q${r2(dx / 2 - (dy / len) * bend)} ${r2(dy / 2 + (dx / len) * bend)} ${r2(dx)} ${r2(dy)}`;
    if (i % 3 === 0) out.light += d;
    else out.dark += d;
  }
  return out;
}
// Dois azulejos de tamanhos sem múltiplo comum próximo (260 e 370): sobrepostos, a grade só se repete a cada 9620px.
const FIBRES_A = fibres(7, 260, 24);
const FIBRES_B = fibres(23, 370, 40);

function Backdrop() {
  const u = useUid();
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`rustico-fibre-a-${u}`} width="260" height="260" patternUnits="userSpaceOnUse">
          <path className="ru-fibre-dark" d={FIBRES_A.dark} fill="none" strokeWidth="0.7" strokeLinecap="round" />
          <path className="ru-fibre-light" d={FIBRES_A.light} fill="none" strokeWidth="0.9" strokeLinecap="round" />
        </pattern>
        <pattern id={`rustico-fibre-b-${u}`} width="370" height="370" x="97" y="151" patternUnits="userSpaceOnUse">
          <path className="ru-fibre-dark" d={FIBRES_B.dark} fill="none" strokeWidth="0.6" strokeLinecap="round" />
          <path className="ru-fibre-light" d={FIBRES_B.light} fill="none" strokeWidth="0.8" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#rustico-fibre-a-${u})`} />
      <rect width="100%" height="100%" fill={`url(#rustico-fibre-b-${u})`} />
    </svg>
  );
}

/** Forro do envelope: tecido xadrez vichy, com a trama marcada por fios finos. */
function Liner() {
  const u = useUid();
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`rustico-vichy-${u}`} width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="11" height="22" fill="currentColor" opacity="0.34" />
          <rect width="22" height="11" fill="currentColor" opacity="0.34" />
          <rect width="11" height="11" fill="currentColor" opacity="0.3" />
          {/* trama: fios finos nos quadros de meio-tom */}
          <path d="M11 1.4h11M11 4.2h11M11 7h11M11 9.8h11M1.4 11v11M4.2 11v11M7 11v11M9.8 11v11" stroke="currentColor" strokeWidth="0.5" opacity="0.4" fill="none" />
          <path d="M0 0.25h22M0 11.25h22" className="ru-vichy-thread" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#rustico-vichy-${u})`} />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") return <Top eventType={eventType} />;
  if (slot === "divider") return <Divider eventType={eventType} />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "rustico",
  name: "Rústico",
  description: "Papel kraft, laço de barbante, raminhos e renda de papel",
  premium: true,
  suits: ["casamento", "cha", "aniversario", "outro"],
  palettes: [
    { id: "kraft", name: "Kraft e branco", vars: { bg: "#CDAF86", paper: "#FBF8F1", ink: "#382C21", soft: "#58483A", accent: "#8A5A2B", line: "#DCCDB4", btnInk: "#FBF8F1", seal: "#8C3B2A", sealInk: "#F8E6CE", liner: "#F4EBDA" } },
    { id: "lavanda", name: "Kraft e lavanda", vars: { bg: "#CBB08A", paper: "#FBF8F6", ink: "#372D3D", soft: "#584C5C", accent: "#765896", line: "#DDD3E0", btnInk: "#FBF8F6", seal: "#6C5190", sealInk: "#F5ECFA", liner: "#EFE7F5" } },
    { id: "musgo", name: "Linho e verde-musgo", vars: { bg: "#D3CAB3", paper: "#F9F6EC", ink: "#2C3323", soft: "#4E553F", accent: "#616C36", line: "#D5D4BC", btnInk: "#F9F6EC", seal: "#56622F", sealInk: "#F3F1DA", liner: "#EEEFDC" } },
    { id: "rosa", name: "Kraft e rosa-seco", vars: { bg: "#CFB290", paper: "#FCF7F3", ink: "#3E2E2A", soft: "#5C4842", accent: "#9C544B", line: "#E6D4CC", btnInk: "#FCF7F3", seal: "#9C544B", sealInk: "#FCEEE7", liner: "#F6E6E0" } },
    { id: "quadro", name: "Quadro-negro e giz", vars: { bg: "#1A2021", paper: "#2E393A", ink: "#F4F1E8", soft: "#CBCBC0", accent: "#E9DBAA", line: "#566060", btnInk: "#222A2B", seal: "#B8935A", sealInk: "#2A2016", liner: "#394445" } },
  ],
  Art,
};
