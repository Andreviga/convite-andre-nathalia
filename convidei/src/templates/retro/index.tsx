import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Retrô, anos 70: arco-íris terroso em faixas que nasce de um canto, margaridas chapadas, selo recortado e fitas onduladas.
// Tudo em formas preenchidas (nada de traço): as cores saem da paleta pelas variáveis --rt-* do style.css.

const r2 = (n: number) => Math.round(n * 100) / 100;

const C = {
  ink: "var(--ink)",
  paper: "var(--paper)",
  b1: "var(--rt-1)",
  b2: "var(--rt-2)",
  b3: "var(--rt-3)",
  b4: "var(--rt-4)",
  petal: "var(--rt-petal)",
  deep: "var(--rt-deep)",
};

/** Pétala em gota, da origem para cima: comprimento l, meia largura w. */
function petal(l: number, w: number): string {
  return `M0 0C${r2(-w * 0.7)} ${r2(-l * 0.22)} ${r2(-w * 1.25)} ${r2(-l * 0.86)} 0 ${r2(-l)}C${r2(w * 1.25)} ${r2(-l * 0.86)} ${r2(w * 0.7)} ${r2(-l * 0.22)} 0 0Z`;
}

/**
 * Margarida chapada em três camadas: pétalas de trás (mais escuras, defasadas), pétalas da frente e miolo com anel e sementes.
 * `tone="clara"` (pétalas quase brancas) vai sobre as faixas coloridas; `tone="cor"` (pétalas na cor do lacre) vai sobre o papel.
 */
function Daisy({ x, y, r, n = 12, tone = "clara", turn = 0 }: { x: number; y: number; r: number; n?: number; tone?: "clara" | "cor"; turn?: number }) {
  const step = 360 / n;
  const front = petal(r, r * 0.21);
  const back = petal(r * 0.94, r * 0.24);
  const fillFront = tone === "clara" ? C.petal : C.b2;
  const fillBack = tone === "clara" ? C.b4 : C.deep;
  const core = tone === "clara" ? C.b2 : C.b1;
  const seeds = 7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      {Array.from({ length: n }, (_, i) => (
        <path key={`b${i}`} d={back} transform={`rotate(${r2(i * step + step / 2)})`} style={{ fill: fillBack }} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <path key={`f${i}`} d={front} transform={`rotate(${r2(i * step)})`} style={{ fill: fillFront }} />
      ))}
      <circle r={r2(r * 0.34)} style={{ fill: tone === "clara" ? C.deep : C.ink }} />
      <circle r={r2(r * 0.27)} style={{ fill: core }} />
      {Array.from({ length: seeds }, (_, i) => {
        const a = (i / seeds) * Math.PI * 2;
        return <circle key={`s${i}`} cx={r2(Math.cos(a) * r * 0.15)} cy={r2(Math.sin(a) * r * 0.15)} r={r2(r * 0.035)} style={{ fill: tone === "clara" ? C.deep : C.b2 }} />;
      })}
      <circle r={r2(r * 0.05)} style={{ fill: tone === "clara" ? C.deep : C.b2 }} />
    </g>
  );
}

/** Quarto de arco-íris com centro em (cx, cy): faixas de larguras diferentes, da de fora para a de dentro. */
function Bands({ cx, cy, r, half = false }: { cx: number; cy: number; r: number; half?: boolean }) {
  // raio relativo e cor de cada disco; o de cima cobre o de baixo
  const rings: [number, string][] = [
    [1, C.ink],
    [0.972, C.b1],
    [0.79, C.b2],
    [0.635, C.b3],
    [0.505, C.b4],
    [0.4, C.paper],
    [0.365, C.b1],
    [0.2, C.b2],
  ];
  return (
    <g>
      {rings.map(([k, fill]) => (
        <circle key={k} cx={cx} cy={cy} r={r2(r * k)} style={{ fill }} />
      ))}
      {half ? null : <circle cx={cx} cy={cy} r={r2(r * 0.09)} style={{ fill: C.b3 }} />}
    </g>
  );
}

/** Borda recortada (selo de adesivo): n gomos em volta de um raio R. */
function scallop(R: number, n: number): string {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [r2(Math.cos(a) * R), r2(Math.sin(a) * R)];
  });
  const rl = r2(R * Math.sin(Math.PI / n) * 1.04);
  return `M${pts[0][0]} ${pts[0][1]}` + pts.slice(1).concat([pts[0]]).map(([x, y]) => `A${rl} ${rl} 0 0 1 ${x} ${y}`).join("") + "Z";
}

const SHOUT: Record<string, string> = {
  casamento: "Sim!",
  aniversario: "Oba!",
  "quinze-anos": "15!",
  cha: "Chá!",
  formatura: "Viva!",
};

/** Selo recortado, torto de propósito, com uma palavra de festa que muda com o tipo de evento. */
function Sticker({ x, y, eventType }: { x: number; y: number; eventType?: string }) {
  const word = (eventType && SHOUT[eventType]) || "Vem!";
  // corpo por número de letras: a palavra cabe com folga dentro do anel (raio 29,5), sem o "!" encostar nele
  const size = word.length >= 5 ? 18.5 : word.length === 4 ? 21.5 : 25;
  return (
    <g transform={`translate(${x} ${y}) rotate(-11)`}>
      <path d={scallop(37, 16)} transform="translate(2.6 3.6)" style={{ fill: "var(--rt-shadow)" }} />
      <path d={scallop(37, 16)} style={{ fill: C.b1 }} />
      <circle r="32" style={{ fill: C.paper }} />
      <circle r="29.6" style={{ fill: C.b1 }} />
      {/* texto na cor do papel: contrasta com a faixa de fora em qualquer paleta; 1,2 à esquerda compensa a inclinação */}
      <text className="retro-shout" x="-1.2" y={r2(size * 0.33)} textAnchor="middle" fontSize={size} style={{ fill: C.paper }}>
        {word}
      </text>
    </g>
  );
}

/** Topo do cartão: o arco-íris nasce do canto direito, as margaridas pousam na borda dele e o selo ocupa o canto esquerdo. */
function Top({ eventType }: { eventType?: string }) {
  return (
    <svg className="retro-top" viewBox="0 0 360 140" aria-hidden="true">
      <Bands cx={360} cy={0} r={135} />
      <Daisy x={237} y={93} r={26} n={13} tone="cor" turn={8} />
      <Daisy x={281} y={115} r={12.5} n={10} tone="cor" turn={-14} />
      <Daisy x={300} y={52} r={16} n={11} tone="clara" turn={20} />
      <Sticker x={70} y={66} eventType={eventType} />
    </svg>
  );
}

/** Borda de cima ondulada na altura y, em meios períodos de `hp`; a amplitude alterna para a fita não parecer régua. */
function waveTop(y: number, amp: number, hp: number, w: number, lead = 0): string {
  let d = `M${-hp + lead} ${y}`;
  let up = true;
  for (let x = -hp + lead; x < w + hp; x += hp) {
    d += `q${r2(hp / 2)} ${r2((up ? -2 : 2) * amp)} ${hp} 0`;
    up = !up;
  }
  return d;
}

/** Pé do cartão: quatro fitas onduladas de larguras diferentes, sangrando pelas bordas, com uma margarida pousada. */
function Bottom() {
  const u = useUid();
  const w = 360;
  const h = 66;
  const stripes: [number, number, string, number][] = [
    [13, 6, C.b4, 0],
    [24, 6, C.b3, 10],
    [36, 6.5, C.b2, 22],
    [50, 7, C.b1, 36],
  ];
  return (
    <svg className="retro-bottom" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <clipPath id={`retro-foot-${u}`}>
          <rect width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#retro-foot-${u})`}>
        <path d={`${waveTop(9.6, 6, 45, w)}V${h + 4}H${-60}Z`} style={{ fill: C.ink }} />
        {stripes.map(([y, amp, fill, lead]) => (
          <path key={y} d={`${waveTop(y, amp, 45, w, lead)}V${h + 4}H${-60}Z`} style={{ fill }} />
        ))}
        <Daisy x={294} y={37} r={20} n={12} tone="clara" turn={-9} />
        <Daisy x={50} y={52} r={11} n={10} tone="clara" turn={12} />
      </g>
    </svg>
  );
}

/** Divisor (e ornamento da assinatura): fita ondulada em duas cores com uma margarida no meio. */
function Divider() {
  return (
    <svg className="retro-divider" viewBox="0 0 148 30" width="148" height="30" aria-hidden="true">
      <path d="M2 15q9-11 18 0t18 0 18 0v5q-9-11-18 0t-18 0-18 0z" style={{ fill: C.b1 }} />
      <path d="M92 15q9-11 18 0t18 0 18 0v5q-9-11-18 0t-18 0-18 0z" style={{ fill: C.b1 }} />
      <path d="M2 20q9-11 18 0t18 0 18 0v3.4q-9-11-18 0t-18 0-18 0z" style={{ fill: C.b2 }} />
      <path d="M92 20q9-11 18 0t18 0 18 0v3.4q-9-11-18 0t-18 0-18 0z" style={{ fill: C.b2 }} />
      <Daisy x={74} y={15} r={14} n={11} tone="cor" turn={6} />
    </svg>
  );
}

/** Fundo da página: o mesmo arco, enorme e tom sobre tom, num canto de cima e no canto oposto de baixo. */
function Backdrop() {
  const rings = [1, 0.84, 0.7, 0.58, 0.44, 0.33, 0.2];
  return (
    <>
      {(["a", "b"] as const).map((pos) => (
        <svg key={pos} className={`retro-bg retro-bg-${pos}`} viewBox="0 0 100 100" aria-hidden="true">
          {rings.map((k, i) => (
            <circle key={k} cx="0" cy="0" r={r2(100 * k)} className={i % 2 ? "retro-bg-off" : "retro-bg-on"} />
          ))}
        </svg>
      ))}
    </>
  );
}

/** Forro do envelope: sol nascente em faixas, centrado na ponta da aba (o desenho é girado de pé no CSS). */
function Liner() {
  return (
    <svg className="retro-liner" viewBox="0 0 140 100" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <rect width="140" height="100" style={{ fill: C.b4 }} />
      <Bands cx={70} cy={100} r={60} half />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") return <Top eventType={eventType} />;
  if (slot === "divider") return <Divider />;
  if (slot === "bottom") return <Bottom />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "retro",
  name: "Retrô",
  description: "Anos 70: arco-íris terroso, margaridas e letras gordas",
  premium: true,
  suits: ["aniversario", "casamento", "quinze-anos", "cha", "formatura", "outro"],
  palettes: [
    { id: "mostarda", name: "Mostarda e ferrugem", vars: { bg: "#E8B74C", paper: "#FBF2DE", ink: "#3B2314", soft: "#6B4A35", accent: "#B5471F", line: "#E6D2A8", btnInk: "#FBF2DE", seal: "#E3A02B", sealInk: "#3B2314", liner: "#F4D58A" } },
    { id: "rosa", name: "Rosa e laranja", vars: { bg: "#F3B4A6", paper: "#FFF4E6", ink: "#4A2416", soft: "#7A4A3A", accent: "#BE3D62", line: "#F0D3C0", btnInk: "#FFF4E6", seal: "#EE8A2E", sealInk: "#4A2416", liner: "#F8C4BB" } },
    { id: "abacate", name: "Verde-abacate", vars: { bg: "#B4BE6A", paper: "#FAF4DE", ink: "#3A2A14", soft: "#655235", accent: "#5F7226", line: "#E2DDB4", btnInk: "#FAF4DE", seal: "#DDA02E", sealInk: "#3A2A14", liner: "#D9DC97" } },
    { id: "petroleo", name: "Azul-petróleo e pêssego", vars: { bg: "#F2BF9C", paper: "#FFF5E6", ink: "#153F49", soft: "#3F636B", accent: "#1F6C7A", line: "#EED6BE", btnInk: "#FFF5E6", seal: "#EC9163", sealInk: "#153F49", liner: "#F9D6B6" } },
    { id: "cafe", name: "Café e mostarda", vars: { bg: "#2A170C", paper: "#3F2415", ink: "#FBEBD0", soft: "#DCC3A2", accent: "#F0A63A", line: "#6A4630", btnInk: "#3F2415", seal: "#B5471A", sealInk: "#FFF0D6", liner: "#F3D9A8" } },
  ],
  Art,
};
