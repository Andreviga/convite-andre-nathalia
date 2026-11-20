import type { CSSProperties } from "react";
import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Catedral: o texto do convite fica dentro de um arco ogival de fio duplo, com a rosácea no fecho do arco,
// florões nos tímpanos (os cantos entre o arco e a moldura) e colunas finas que descem até a base do cartão.
// A cabeça do arco (slot "top") e a base (slot "bottom") são SVG na largura do cartão; as colunas entre elas são
// fios desenhados no CSS, nas mesmas posições (unidade --cat-u = largura da moldura / 340).

const r2 = (n: number) => Math.round(n * 100) / 100;

// ───── Geometria do arco (viewBox de 340 de largura) ─────
const W = 340;
const X0 = 7; // fio de fora da coluna esquerda
const X1 = W - X0;
const CX = W / 2;
const SPAN = X1 - X0;
const R = SPAN * 0.8; // raio menor que o vão: arco ogival rebaixado (o equilátero ficaria alto demais para o cartão)
const OFF = R - SPAN / 2; // distância do centro de cada arco ao eixo
const APEX = 3;
const SPRING = r2(APEX + Math.sqrt(R * R - OFF * OFF)); // linha de imposta (onde o arco nasce das colunas)
const GAP = 6; // distância entre os dois fios do arco e das colunas
const HEAD_H = 264; // altura da viewBox do topo: a imposta, o capitel e um trecho das colunas
const ROSE_R = 40;
// A rosácea encosta (com 3 de folga) no fio de dentro dos dois arcos.
const ROSE_Y = r2(SPRING - Math.sqrt((R - GAP - 3 - ROSE_R) ** 2 - OFF * OFF));

/** Arco paralelo ao de fora, recuado `d` para dentro, com as colunas até `foot`. */
function arch(d: number, foot: number): string {
  const r = R - d;
  const top = r2(SPRING - Math.sqrt(r * r - OFF * OFF));
  return `M${X0 + d} ${foot}V${SPRING}A${r2(r)} ${r2(r)} 0 0 1 ${CX} ${top}A${r2(r)} ${r2(r)} 0 0 1 ${X1 - d} ${SPRING}V${foot}`;
}

/** Tímpano: o canto entre a moldura reta e o arco (lado esquerdo; o direito é espelhado). */
const SPANDREL = `M0 0H${CX}V${APEX}A${r2(R)} ${r2(R)} 0 0 0 ${X0} ${SPRING}H0Z`;

/** Contorno de um florão de `n` lóbulos (trifólio, quadrifólio): arcos de raio `a` que se encontram em cúspides. */
function foil(cx: number, cy: number, a: number, n: number, rot = -90): string {
  const cusp = a * Math.cos(Math.PI / n) + a * Math.sqrt(1 - Math.sin(Math.PI / n) ** 2);
  const at = (deg: number) => {
    const t = (deg * Math.PI) / 180;
    return `${r2(cx + Math.cos(t) * cusp)} ${r2(cy + Math.sin(t) * cusp)}`;
  };
  const step = 360 / n;
  let d = `M${at(rot - step / 2)}`;
  for (let k = 0; k < n; k++) d += `A${r2(a)} ${r2(a)} 0 1 1 ${at(rot + step * k + step / 2)}`;
  return `${d}Z`;
}

const TINT: CSSProperties = { fill: "var(--cat-tint)" };
const GLASS: CSSProperties = { fill: "var(--cat-glass)" };
const FINE: CSSProperties = { stroke: "var(--cat-fine)" };
const HOLE: CSSProperties = { fill: "var(--cat-ground, var(--paper))" };

/** Rosácea: anel duplo, oito pétalas de vitral em gota, botões entre elas e um quadrifólio no miolo. Raio 40, centro em 0,0. */
function Rose() {
  const petal = "M0-11.5C4.6-15.4 8.4-21 8-27.2A8 8 0 1 0-8-27.2C-8.4-21-4.6-15.4 0-11.5Z";
  const eight = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g fill="none" stroke="currentColor">
      <circle r={ROSE_R} style={HOLE} strokeWidth="1.5" />
      <circle r="36.6" strokeWidth="0.55" />
      {eight.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={petal} style={GLASS} strokeWidth="0.9" />
          {/* nervura da pétala e o botão no alto dela */}
          <path d="M0-15.5V-23" strokeWidth="0.5" />
          <circle cy="-27.4" r="2.5" fill="currentColor" stroke="none" />
          {/* entre duas pétalas: gota cheia junto ao anel */}
          <path d="M0-35.6C1.9-33.6 1.7-30.6 0-28.4C-1.7-30.6-1.9-33.6 0-35.6Z" transform="rotate(22.5)" fill="currentColor" stroke="none" />
        </g>
      ))}
      <circle r="10.4" style={HOLE} strokeWidth="1.1" />
      <path d={foil(0, 0, 3.1, 4, 0)} fill="currentColor" stroke="none" />
      <circle r="1.25" style={HOLE} stroke="none" />
    </g>
  );
}

/** Medalhão do tímpano: trifólio dentro de um círculo, com dois botões que diminuem para as pontas do canto. */
function SpandrelArt({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined} fill="none" stroke="currentColor">
      <path d={SPANDREL} style={TINT} stroke="none" />
      <circle cx="38" cy="40" r="24" style={HOLE} strokeWidth="1.2" />
      <circle cx="38" cy="40" r="20.8" strokeWidth="0.5" />
      <path d={foil(38, 41, 6.9, 3)} style={GLASS} strokeWidth="0.9" />
      <circle cx="38" cy="41" r="2.3" fill="currentColor" stroke="none" />
      {/* botões: um para o alto do arco, outro para a imposta */}
      <circle cx="103" cy="16" r="6.4" style={HOLE} strokeWidth="0.9" />
      <path d={foil(103, 16, 1.7, 4, 0)} fill="currentColor" stroke="none" />
      <circle cx="16" cy="112" r="6.4" style={HOLE} strokeWidth="0.9" />
      <path d={foil(16, 112, 1.7, 4, 0)} fill="currentColor" stroke="none" />
      <circle cx="139" cy="9.5" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="163" r="2.1" fill="currentColor" stroke="none" />
    </g>
  );
}

/** Capitel (lado esquerdo): ábaco cheio, cesto em trapézio e o anel do colarinho, sobre os dois fios da coluna. */
function Capital({ flip }: { flip?: boolean }) {
  const y = SPRING;
  const mid = X0 + GAP / 2;
  return (
    <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined} fill="currentColor" stroke="none">
      <path d={`M${mid - 9} ${r2(y - 1.5)}h18v3h-18z`} />
      <path d={`M${mid - 7.4} ${r2(y + 2.6)}h14.8l-2.6 5.4h-9.6z`} style={{ ...HOLE, stroke: "currentColor", strokeWidth: 0.8 }} />
      <path d={`M${mid - 6.2} ${r2(y + 9.6)}h12.4v1.3h-12.4z`} />
    </g>
  );
}

/** Topo do cartão: tímpanos, arco de fio duplo, rosácea e capitéis. */
function Head() {
  return (
    <svg className="catedral-head" viewBox={`0 0 ${W} ${HEAD_H}`} fill="none" stroke="currentColor" aria-hidden="true">
      <SpandrelArt />
      <SpandrelArt flip />
      <path d={arch(0, HEAD_H)} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {/* o fio de dentro tem o mesmo traço e a mesma cor do fio de dentro das colunas, que o CSS desenha */}
      <path d={arch(GAP, HEAD_H)} style={FINE} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
      <g transform={`translate(${CX} ${ROSE_Y})`}>
        <Rose />
      </g>
      {/* dois olhos de trifólio, nos vãos entre a rosácea e o arco */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={foil(CX + s * 61, ROSE_Y + 27, 4.6, 3, s < 0 ? 150 : 30)} style={GLASS} strokeWidth="0.8" />
          <circle cx={CX + s * 61} cy={ROSE_Y + 27} r="1.5" fill="currentColor" stroke="none" />
        </g>
      ))}
      <Capital />
      <Capital flip />
    </svg>
  );
}

/** Pé do cartão: as bases das duas colunas e o degrau de fio duplo, com um florão no eixo. */
function Base() {
  const mid = X0 + GAP / 2;
  const half = (flip: boolean) => (
    <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined}>
      {/* tocos das colunas: fio de fora grosso, fio de dentro fino, como no trecho que o CSS desenha */}
      <path d={`M${X0} 0V9`} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d={`M${X0 + GAP} 0V9`} fill="none" style={FINE} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
      <path d={`M${mid - 6.2} 8.4h12.4v1.3h-12.4z`} fill="currentColor" />
      <path d={`M${mid - 4.8} 11.4h9.6l2.6 5.4h-14.8z`} style={{ ...HOLE, stroke: "currentColor", strokeWidth: 0.8 }} />
      <path d={`M${mid - 9} 18.2h18v3h-18z`} fill="currentColor" />
    </g>
  );
  return (
    <svg className="catedral-base" viewBox={`0 0 ${W} 34`} fill="none" aria-hidden="true">
      {half(false)}
      {half(true)}
      {/* degrau: fio grosso e fio fino, interrompidos pelo florão */}
      <path d={`M${mid + 13} 19.7H${CX - 13}M${CX + 13} 19.7H${W - mid - 13}`} stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d={`M${mid + 13} 25.4H${W - mid - 13}`} style={FINE} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
      <circle cx={CX} cy="19.7" r="8.6" style={HOLE} stroke="currentColor" strokeWidth="1" />
      <path d={foil(CX, 19.7, 2.5, 4, 0)} fill="currentColor" />
      <circle cx={CX} cy="19.7" r="1" style={HOLE} />
      <path d={`M${CX - 20} 19.7l3.2-2.4 3.2 2.4-3.2 2.4zM${CX + 20} 19.7l-3.2-2.4-3.2 2.4 3.2 2.4z`} fill="currentColor" />
    </svg>
  );
}

/** Cruz pátea pequena (braços que se abrem para as pontas), para o filete do casamento. Centro em 0,0. */
function Cross() {
  const arm = "M-.95-1.4C-.95-3.9-1.5-5.6-3.1-7.2H3.1C1.5-5.6.95-3.9.95-1.4Z";
  return (
    <g fill="currentColor">
      <path d={arm} />
      <path d={arm} transform="rotate(90)" />
      <path d={arm} transform="rotate(180) scale(1 1.22)" />
      <path d={arm} transform="rotate(270)" />
      <circle r="1.75" />
    </g>
  );
}

/** Filete: dois fios que afinam para fora, losangos e, no eixo, a cruz (só no casamento) ou um quadrifólio. */
function Rule({ cross }: { cross: boolean }) {
  return (
    <svg className="catedral-rule" viewBox="0 0 168 22" width="168" height="22" fill="currentColor" aria-hidden="true">
      <path d="M0 11L58 10.25V11.75ZM168 11L110 10.25V11.75Z" />
      <path d="M66 11l-3.4-2.7L59.2 11l3.4 2.7zM108.8 11l-3.4-2.7L102 11l3.4 2.7z" />
      <circle cx="71.6" cy="11" r="1.1" />
      <circle cx="96.4" cy="11" r="1.1" />
      <g transform="translate(84 10.2)">
        {cross ? (
          <Cross />
        ) : (
          <>
            <path d={foil(0, 0.8, 3.1, 4, 0)} />
            <circle cy="0.8" r="1.3" style={HOLE} />
          </>
        )}
      </g>
    </svg>
  );
}

/** Trama gótica (losangos de fio fino com um quadrifólio em cada um): fundo da página e forro do envelope. */
function Diaper({ id, size }: { id: string; size: number }) {
  const h = size / 2;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <path d={`M0 ${h}L${h} 0L${size} ${h}L${h} ${size}Z`} fill="none" stroke="currentColor" strokeWidth="1" />
      <path d={foil(h, h, size * 0.085, 4, 0)} fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx={h} cy={h} r={size * 0.03} fill="currentColor" />
      {[[0, 0], [size, 0], [0, size], [size, size]].map(([x, y]) => (
        <path key={`${x}_${y}`} d={`M${x} ${y - size * 0.08}L${x + size * 0.08} ${y}L${x} ${y + size * 0.08}L${x - size * 0.08} ${y}Z`} fill="currentColor" />
      ))}
    </pattern>
  );
}

function Backdrop() {
  const u = useUid();
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <Diaper id={`catedral-bg-${u}`} size={52} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#catedral-bg-${u})`} />
    </svg>
  );
}

/** Forro: a trama e, de pé na aba aberta, a rosácea grande sobre um disco liso (o CSS gira o desenho em 180°). */
function Liner() {
  const u = useUid();
  return (
    <svg className="catedral-liner" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">
      <defs>
        <Diaper id={`catedral-liner-${u}`} size={46} />
      </defs>
      <rect width="700" height="500" fill={`url(#catedral-liner-${u})`} />
      <g className="catedral-liner-rose" transform="translate(350 334) scale(1.62)">
        <circle r="46" style={{ fill: "var(--liner)" }} />
        <circle r="44.6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <Rose />
      </g>
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  // A cruz só entra no casamento. "Outro" também serve a jantar, bodas civis e confraternização: ali, como nos demais
  // tipos e quando o tipo não vem, fica o quadrifólio.
  const cross = eventType === "casamento";
  if (slot === "top") return <Head />;
  if (slot === "divider") return <Rule cross={cross} />;
  if (slot === "bottom") return <Base />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "catedral",
  name: "Catedral",
  description: "Arco gótico de fio duplo, rosácea e letras de inscrição",
  premium: true,
  suits: ["casamento", "outro"],
  palettes: [
    { id: "pedra", name: "Pedra e ouro velho", vars: { bg: "#D8D2C6", paper: "#F4F0E7", ink: "#2C2823", soft: "#5E564B", accent: "#836428", line: "#CDC2AC", btnInk: "#F7F3EA", seal: "#8C6B2F", sealInk: "#FBF0D2", liner: "#A88A4C" } },
    { id: "mariano", name: "Azul-mariano e prata", vars: { bg: "#142548", paper: "#1F3767", ink: "#F1F3F7", soft: "#C3CBDA", accent: "#C9D1DE", line: "#4A5F8C", btnInk: "#1F3767", seal: "#B4BCC9", sealInk: "#1F3767", liner: "#BFC7D3" } },
    { id: "bordo", name: "Bordô e ouro", vars: { bg: "#2E0A14", paper: "#4B1422", ink: "#F7ECDB", soft: "#DBC3B8", accent: "#DDBB76", line: "#7A4B40", btnInk: "#4B1422", seal: "#9C7A2E", sealInk: "#FBEFC8", liner: "#C9A860" } },
    { id: "sacristia", name: "Verde-sacristia e marfim", vars: { bg: "#D9DDCF", paper: "#F6F1E3", ink: "#1F3A2D", soft: "#4F6355", accent: "#3F6A50", line: "#C5CDB7", btnInk: "#F6F1E3", seal: "#2C5540", sealInk: "#F1E6C8", liner: "#2F5843" } },
    { id: "ceu", name: "Marfim e azul-mariano", vars: { bg: "#D6DCE6", paper: "#F5F4EE", ink: "#1E3260", soft: "#505F7E", accent: "#56698C", line: "#C2CBDA", btnInk: "#FFFFFF", seal: "#27448A", sealInk: "#E9EEF6", liner: "#27448A" } },
  ],
  Art,
};
