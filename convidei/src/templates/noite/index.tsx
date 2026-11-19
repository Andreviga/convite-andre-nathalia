import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Noite Déco: hot stamping dourado sobre papel escuro. Motivo-herói: o leque de raios no topo.
// Detalhe especial: a moldura de fio duplo com cantos escalonados. Todo o resto é tipografia.

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Paradas do foil: saem das variáveis --foil-* do CSS, que derivam da paleta. */
function Foil({ id, x2 }: { id: string; x2: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={x2} y2="0">
      <stop offset="0" style={{ stopColor: "var(--foil-d)" }} />
      <stop offset="0.3" style={{ stopColor: "var(--foil-m)" }} />
      <stop offset="0.5" style={{ stopColor: "var(--foil-l)" }} />
      <stop offset="0.7" style={{ stopColor: "var(--foil-m)" }} />
      <stop offset="1" style={{ stopColor: "var(--foil-d)" }} />
    </linearGradient>
  );
}

/** Raios de um leque com centro em (cx, cy), do raio r0 ao raio r1, a cada `step` graus. */
function rays(cx: number, cy: number, r0: number, r1: (i: number) => number, step: number, sign = -1): string {
  const out: string[] = [];
  for (let a = step, i = 1; a < 180; a += step, i++) {
    const rad = (a * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad) * sign;
    out.push(`M${r2(cx + c * r0)} ${r2(cy + s * r0)}L${r2(cx + c * r1(i))} ${r2(cy + s * r1(i))}`);
  }
  return out.join("");
}

/** Canto escalonado da moldura (desenhado para o canto superior esquerdo; os outros são espelhados no CSS). */
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg className={`noite-corner noite-corner-${pos}`} viewBox="0 0 26 26" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M26 .5H18.5V9.5H9.5V18.5H.5V26" />
      <path d="M26 4.5H22.5V13.5H13.5V22.5H4.5V26" />
      <path d="M4.75 1.5l3.25 3.25-3.25 3.25L1.5 4.75z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Fan() {
  const u = useUid();
  const cx = 80;
  const cy = 78;
  return (
    <svg className="noite-fan" viewBox="0 0 160 84" fill="none" stroke={`url(#noite-foil-top-${u})`} strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <defs>
        <Foil id={`noite-foil-top-${u}`} x2={160} />
      </defs>
      {/* raios: todos até o arco duplo; um sim, um não, passam dele */}
      <path d={rays(cx, cy, 17, (i) => (i % 2 === 0 ? 73 : 55.5), 11.25)} />
      <path d={`M${cx - 56} ${cy}A56 56 0 0 1 ${cx + 56} ${cy}`} />
      <path d={`M${cx - 60} ${cy}A60 60 0 0 1 ${cx + 60} ${cy}`} />
      <path d={`M${cx - 17} ${cy}A17 17 0 0 1 ${cx + 17} ${cy}`} />
      <path d={`M${cx - 9} ${cy}A9 9 0 0 1 ${cx + 9} ${cy}z`} fill={`url(#noite-foil-top-${u})`} stroke="none" />
      {/* base: fio duplo em degrau */}
      <path d={`M2 ${cy}H158`} />
      <path d={`M26 ${cy + 4}H134`} />
    </svg>
  );
}

function Divider() {
  const u = useUid();
  return (
    <svg className="noite-divider" viewBox="0 0 132 12" width="132" height="12" fill="none" stroke={`url(#noite-foil-div-${u})`} strokeWidth="1" aria-hidden="true">
      <defs>
        <Foil id={`noite-foil-div-${u}`} x2={132} />
      </defs>
      <path d="M0 6h44M88 6h44" />
      <path d="M66 .8l5.2 5.2-5.2 5.2-5.2-5.2z" />
      <path d="M66 3.7l2.3 2.3-2.3 2.3-2.3-2.3z" fill={`url(#noite-foil-div-${u})`} stroke="none" />
      <path d="M52.5 3.7l2.3 2.3-2.3 2.3-2.3-2.3zM79.5 3.7l2.3 2.3-2.3 2.3-2.3-2.3z" fill={`url(#noite-foil-div-${u})`} stroke="none" />
    </svg>
  );
}

/** Eco do leque, pequeno e invertido, no pé do cartão: mesma construção do topo (raios que param no arco duplo). */
function Foot() {
  const u = useUid();
  const cx = 40;
  const cy = 5;
  return (
    <svg className="noite-foot" viewBox="0 0 80 30" width="80" height="30" fill="none" stroke={`url(#noite-foil-foot-${u})`} strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <defs>
        <Foil id={`noite-foil-foot-${u}`} x2={80} />
      </defs>
      <path d={rays(cx, cy, 7, () => 17.5, 15, 1)} />
      <path d={`M${cx - 18} ${cy}A18 18 0 0 0 ${cx + 18} ${cy}`} />
      <path d={`M${cx - 21.5} ${cy}A21.5 21.5 0 0 0 ${cx + 21.5} ${cy}`} />
      <path d={`M${cx - 7} ${cy}A7 7 0 0 0 ${cx + 7} ${cy}`} />
      <path d={`M${cx - 3.5} ${cy}A3.5 3.5 0 0 0 ${cx + 3.5} ${cy}z`} fill={`url(#noite-foil-foot-${u})`} stroke="none" />
      <path d={`M1 ${cy}H79M14 ${cy - 4}H66`} />
    </svg>
  );
}

/** Escamas Déco (leques sobrepostos). `fill` cobre a fileira de trás; precisa ser a cor do fundo onde o padrão fica. */
function Scales({ id, fill, r }: { id: string; fill: string; r: number }) {
  const centers: [number, number][] = [
    [0, -r / 2], [2 * r, -r / 2], [r, 0], [0, r / 2], [2 * r, r / 2], [r, r], [0, (3 * r) / 2], [2 * r, (3 * r) / 2],
  ];
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width={2 * r} height={r} patternUnits="userSpaceOnUse">
          {centers.map(([x, y]) => (
            <g key={`${x}_${y}`} stroke="currentColor" strokeWidth="1" fill="none">
              <circle cx={x} cy={y} r={r} style={{ fill }} />
              <circle cx={x} cy={y} r={r2(r * 0.72)} />
              <circle cx={x} cy={y} r={r2(r * 0.44)} />
              <circle cx={x} cy={y} r={r2(r * 0.16)} fill="currentColor" stroke="none" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  const u = useUid();
  if (slot === "top")
    return (
      <>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Fan />
      </>
    );
  if (slot === "divider") return <Divider />;
  if (slot === "bottom")
    return (
      <>
        <Foot />
        <Corner pos="bl" />
        <Corner pos="br" />
      </>
    );
  if (slot === "backdrop") return <Scales id={`noite-scales-bg-${u}`} fill="var(--bg)" r={28} />;
  if (slot === "liner") return <Scales id={`noite-scales-liner-${u}`} fill="var(--liner)" r={16} />;
  return null;
}

export const def: TemplateDef = {
  id: "noite",
  name: "Noite Déco",
  description: "Art Déco com dourado em hot stamping sobre fundo escuro",
  premium: true,
  suits: ["casamento", "quinze-anos", "formatura"],
  palettes: [
    { id: "marinho", name: "Azul-marinho e ouro", vars: { bg: "#0A1124", paper: "#131E3B", ink: "#F3EAD7", soft: "#BDB9AE", accent: "#D3B06A", line: "#4D4A44", btnInk: "#131E3B", seal: "#B8923F", sealInk: "#F8E9BC", liner: "#C7A45C" } },
    { id: "preto", name: "Preto e ouro", vars: { bg: "#0C0B0A", paper: "#181614", ink: "#F1E9D8", soft: "#B9B3A6", accent: "#D0AC63", line: "#4A4336", btnInk: "#181614", seal: "#B8923F", sealInk: "#F8E9BC", liner: "#C4A159" } },
    { id: "esmeralda", name: "Verde-esmeralda e ouro", vars: { bg: "#08221B", paper: "#0F3329", ink: "#F2EBD9", soft: "#BCC4B4", accent: "#D6B46C", line: "#4B5A40", btnInk: "#0F3329", seal: "#B8923F", sealInk: "#F8E9BC", liner: "#C9A860" } },
    { id: "bordo", name: "Bordô e ouro", vars: { bg: "#2B0A12", paper: "#47131F", ink: "#F6EBDA", soft: "#D3BDB4", accent: "#DDBB76", line: "#74493E", btnInk: "#47131F", seal: "#BD9844", sealInk: "#F8E9BC", liner: "#CFAD68" } },
    { id: "marfim", name: "Marfim e ouro velho", vars: { bg: "#E4DAC6", paper: "#F7F1E2", ink: "#18213A", soft: "#5A5A60", accent: "#80601F", line: "#CDBB92", btnInk: "#F7F1E2", seal: "#18213A", sealInk: "#E2C788", liner: "#18213A" } },
  ],
  Art,
};
