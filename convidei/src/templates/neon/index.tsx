import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Neon: letreiro aceso numa parede de tijolos pintada de escuro. Motivo-herói: o letreiro do alto (coração, estrela,
// taças, capelo ou raio, conforme o tipo de evento), que interrompe a moldura de tubo. Cada tubo é desenhado em camadas:
// sombra na parede, halo desfocado, vidro colorido, miolo claro e eletrodos nas pontas. Duas cores por paleta:
// "a" (--accent, a dos nomes) e "b" (--seal, a da moldura e do numeral da data).

const r2 = (n: number) => Math.round(n * 100) / 100;

type Tone = "a" | "b";
/** Um tubo: caminho, cor, espessura do vidro, transformação opcional e "luz" (preenchimento tênue de luz dentro da forma). */
type Tube = { d: string; tone: Tone; w?: number; t?: string; spill?: boolean };
/** Faísca: estrela de quatro pontas preenchida. */
type Spark = { x: number; y: number; s: number; tone: Tone };
/** Eletrodo (ponta de tubo): posição e ângulo. */
type Cap = { x: number; y: number; a: number };

const spark = (x: number, y: number, s: number): string => {
  const k = r2(s * 0.15);
  return `M${x} ${r2(y - s)}Q${r2(x + k)} ${r2(y - k)} ${r2(x + s)} ${y}Q${r2(x + k)} ${r2(y + k)} ${x} ${r2(y + s)}Q${r2(x - k)} ${r2(y + k)} ${r2(x - s)} ${y}Q${r2(x - k)} ${r2(y - k)} ${x} ${r2(y - s)}Z`;
};

/** Estrela de cinco pontas com centro em (cx, cy), raio externo R e interno r. */
function star(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = ((-90 + i * 36) * Math.PI) / 180;
    const q = i % 2 === 0 ? R : r;
    pts.push(`${r2(cx + Math.cos(rad) * q)} ${r2(cy + Math.sin(rad) * q)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Um letreiro: todos os tubos e faíscas de um desenho, camada por camada. */
function Sign({ className, w, h, tubes, sparks = [], caps = [], blur = 3.4 }: { className: string; w: number; h: number; tubes: Tube[]; sparks?: Spark[]; caps?: Cap[]; blur?: number }) {
  const u = useUid();
  const glow = `neon-glow-${u}`;
  return (
    <svg className={`neon-sign ${className}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <defs>
        <filter id={glow} filterUnits="userSpaceOnUse" x={-28} y={-28} width={w + 56} height={h + 56}>
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      {/* sombra dos tubos na parede: o letreiro fica afastado dos tijolos */}
      <g className="neon-shadow" transform="translate(1.8 3.4)">
        {tubes.map((t, i) => (
          <path key={i} d={t.d} transform={t.t} strokeWidth={(t.w ?? 3) + 1.2} />
        ))}
      </g>
      {/* halo: a luz que o tubo joga em volta (e, nas formas fechadas, dentro) */}
      <g filter={`url(#${glow})`}>
        {tubes.map((t, i) => (
          <path key={i} className={`neon-halo neon-${t.tone}`} d={t.d} transform={t.t} strokeWidth={(t.w ?? 3) * 3} data-spill={t.spill || undefined} />
        ))}
        {sparks.map((s, i) => (
          <path key={i} className={`neon-halo-fill neon-${s.tone}`} d={spark(s.x, s.y, s.s * 1.25)} />
        ))}
      </g>
      {/* vidro colorido e miolo claro */}
      {tubes.map((t, i) => (
        <g key={i} className={`neon-${t.tone}`} transform={t.t}>
          <path className="neon-glass" d={t.d} strokeWidth={t.w ?? 3} />
          <path className="neon-core" d={t.d} strokeWidth={r2((t.w ?? 3) * 0.42)} />
        </g>
      ))}
      {sparks.map((s, i) => (
        <g key={i} className={`neon-${s.tone}`}>
          <path className="neon-spark" d={spark(s.x, s.y, s.s)} />
          <path className="neon-spark-core" d={spark(s.x, s.y, r2(s.s * 0.62))} />
        </g>
      ))}
      {/* eletrodos: as pontas escuras de onde sai o fio */}
      {caps.map((c, i) => (
        <g key={i} className="neon-cap" transform={`translate(${c.x} ${c.y}) rotate(${c.a})`}>
          <rect x="-2.4" y="-2.3" width="4.8" height="4.6" rx="1.2" />
          <path className="neon-cap-hi" d="M-1.3-1.1h2.6" />
        </g>
      ))}
    </svg>
  );
}

// Coração de um tubo só, aberto embaixo (as duas pontas terminam em eletrodos). Centro em (60, 47).
const HEART = "M56.5 80.5C36 66 21 51 21 34.5C21 22.5 30 14 41.5 14C50 14 57 19 60 27.5C63 19 70 14 78.5 14C90 14 99 22.5 99 34.5C99 51 84 66 63.5 80.5";
const about = (x: number, y: number, s: number, rot = 0) => `translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-60 -47)`;
// Taça de coquetel: a borda fica na origem.
const GLASS = "M-17 0H17L0 21ZM0 21V41M-10 41H10";

/** Letreiro do alto da capa, conforme o tipo de evento. Sem tipo (ou tipo desconhecido): o raio. */
function Marquee({ type }: { type?: string }) {
  if (type === "casamento")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: HEART, tone: "a", w: 3.9, t: about(47, 47, 0.8, -12), spill: true },
          { d: HEART, tone: "b", w: 3.6, t: about(79, 53, 0.62, 13), spill: true },
        ]}
        sparks={[
          { x: 103, y: 15, s: 6.5, tone: "a" },
          { x: 12, y: 80, s: 4.5, tone: "b" },
          { x: 110, y: 84, s: 3.2, tone: "a" },
        ]}
      />
    );
  if (type === "quinze-anos")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: "M42 27L37.5 9L50 18L60 4L70 18L82.5 9L78 27Z", tone: "b", w: 2.6 },
          { d: HEART, tone: "a", w: 4.1, t: about(60, 63, 0.74), spill: true },
        ]}
        sparks={[
          { x: 60, y: 61, s: 6, tone: "b" },
          { x: 16, y: 34, s: 5.5, tone: "a" },
          { x: 104, y: 30, s: 4.5, tone: "b" },
          { x: 100, y: 78, s: 3.4, tone: "a" },
        ]}
        caps={[
          { x: 57.4, y: 87.8, a: 35 },
          { x: 62.6, y: 87.8, a: -35 },
        ]}
      />
    );
  if (type === "cha")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: HEART, tone: "a", w: 3.2, spill: true },
          { d: HEART, tone: "b", w: 4.6, t: about(60, 45, 0.5) },
        ]}
        sparks={[
          { x: 108, y: 18, s: 5.5, tone: "b" },
          { x: 10, y: 70, s: 4, tone: "b" },
        ]}
        caps={[
          { x: 56.5, y: 80.5, a: 35 },
          { x: 63.5, y: 80.5, a: -35 },
        ]}
      />
    );
  if (type === "aniversario")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: star(60, 51, 39, 17.5), tone: "a", w: 3.2, spill: true },
          { d: star(60, 51, 16, 7.2), tone: "b", w: 2.4 },
        ]}
        sparks={[
          { x: 106, y: 20, s: 6, tone: "b" },
          { x: 13, y: 26, s: 4.5, tone: "b" },
          { x: 104, y: 84, s: 3.4, tone: "a" },
        ]}
      />
    );
  if (type === "formatura")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: "M36.5 48.5V65C36.5 75.5 83.5 75.5 83.5 65V48.5", tone: "b", w: 2.7 },
          { d: "M60 21L101 38L60 55L19 38Z", tone: "a", w: 3.2, spill: true },
          { d: "M101 38V63", tone: "b", w: 2.2 },
        ]}
        sparks={[
          { x: 101, y: 72, s: 6.5, tone: "b" },
          { x: 24, y: 14, s: 5.5, tone: "a" },
          { x: 84, y: 9, s: 3.6, tone: "b" },
          { x: 14, y: 70, s: 3.4, tone: "b" },
        ]}
      />
    );
  if (type === "outro")
    return (
      <Sign
        className="neon-marquee"
        w={120}
        h={96}
        tubes={[
          { d: GLASS, tone: "a", w: 3, t: "translate(42 36) rotate(14)", spill: true },
          { d: GLASS, tone: "b", w: 3, t: "translate(78 36) rotate(-14)", spill: true },
          { d: "M-7.6 6.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0", tone: "b", w: 1.8, t: "translate(42 36) rotate(14)" },
          { d: "M2.4 6.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0", tone: "a", w: 1.8, t: "translate(78 36) rotate(-14)" },
        ]}
        sparks={[
          { x: 60, y: 17, s: 7.5, tone: "a" },
          { x: 45, y: 9, s: 3.6, tone: "b" },
          { x: 76, y: 7, s: 4.4, tone: "b" },
        ]}
      />
    );
  return (
    <Sign
      className="neon-marquee"
      w={120}
      h={96}
      tubes={[
        { d: "M27.1 67A38 38 0 0 1 28.9 26.2", tone: "b", w: 2.5 },
        { d: "M92.9 29A38 38 0 0 1 91.1 69.8", tone: "b", w: 2.5 },
        { d: "M70 8L36 52H57L47 88L86 40H64L70 8Z", tone: "a", w: 3.2, spill: true },
      ]}
      sparks={[
        { x: 104, y: 14, s: 5.5, tone: "b" },
        { x: 14, y: 84, s: 4.2, tone: "a" },
      ]}
      caps={[
        { x: 27.1, y: 67, a: 60 },
        { x: 28.9, y: 26.2, a: -55 },
        { x: 92.9, y: 29, a: 60 },
        { x: 91.1, y: 69.8, a: -55 },
      ]}
    />
  );
}

/** Divisor: dois tubos retos e uma faísca no meio. */
function Rule() {
  return (
    <Sign
      className="neon-rule"
      w={140}
      h={18}
      blur={2.6}
      tubes={[
        { d: "M8 9H50", tone: "b", w: 2.4 },
        { d: "M90 9H132", tone: "b", w: 2.4 },
      ]}
      sparks={[
        { x: 70, y: 9, s: 7.5, tone: "a" },
        { x: 58.5, y: 9, s: 2.6, tone: "b" },
        { x: 81.5, y: 9, s: 2.6, tone: "b" },
      ]}
      caps={[
        { x: 5.5, y: 9, a: 0 },
        { x: 134.5, y: 9, a: 0 },
      ]}
    />
  );
}

/** Parede de tijolos pintados: quatro fiadas que se repetem, cada tijolo com um tom (a tinta nunca cobre igual). */
function Wall({ id }: { id: string }) {
  const bw = 58;
  const bh = 24;
  const m = 2.6; // junta
  const tones = [0.62, 0.92, 0.74, 1, 0.84, 0.56, 0.96, 0.7, 1, 0.66, 0.88, 0.76, 0.7, 0.98, 0.6, 0.86];
  const bricks: { x: number; y: number; o: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const o = tones[row * 4 + col];
      const x = col * bw + (row % 2 ? bw / 2 : 0);
      bricks.push({ x, y: row * bh, o });
      if (x + bw > 4 * bw) bricks.push({ x: x - 4 * bw, y: row * bh, o });
    }
  }
  return (
    <svg className="neon-wall" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width={4 * bw} height={4 * bh} patternUnits="userSpaceOnUse">
          {bricks.map((b, i) => (
            <g key={i} opacity={b.o}>
              <rect x={r2(b.x + m / 2)} y={r2(b.y + m / 2)} width={bw - m} height={bh - m} rx="1.4" fill="currentColor" />
              {/* aresta de cima pega um fio de luz; a de baixo fica na sombra */}
              <path className="neon-brick-hi" d={`M${r2(b.x + m / 2 + 1.5)} ${r2(b.y + m / 2 + 0.6)}h${bw - m - 3}`} />
              <path className="neon-brick-lo" d={`M${r2(b.x + m / 2 + 1.5)} ${r2(b.y + bh - m / 2 - 0.6)}h${bw - m - 3}`} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// Miniaturas do forro (caixa de ~20px, centro na origem).
const MINI_BOLT = "M2.5-10.5L-6.5 1.5H-.5L-2.5 10.5L6.5-1.5H.5Z";
const MINI_HEART = "M0 8.5C-6.4 3.8-9.5.2-9.5-3.6C-9.5-6.8-7.2-9-4.4-9C-2.4-9-.8-7.8 0-5.9C.8-7.8 2.4-9 4.4-9C7.2-9 9.5-6.8 9.5-3.6C9.5.2 6.4 3.8 0 8.5Z";

/** Forro do envelope: chuva de letreirinhos (raio, estrela, coração, faísca) nas duas cores, sobre o tom escuro do forro. */
function Liner({ id }: { id: string }) {
  const items: { d: string; tone: Tone; t: string; fill?: boolean }[] = [
    { d: MINI_BOLT, tone: "a", t: "translate(17 19) rotate(14)" },
    { d: star(0, 0, 10, 4.4), tone: "b", t: "translate(53 15) rotate(-10)" },
    { d: MINI_HEART, tone: "b", t: "translate(19 55) rotate(-14)" },
    { d: star(0, 0, 10, 4.4), tone: "a", t: "translate(55 53) rotate(16)" },
    { d: spark(36, 36, 5), tone: "a", t: "", fill: true },
    { d: spark(0, 0, 3.6), tone: "b", t: "", fill: true },
    { d: spark(72, 0, 3.6), tone: "b", t: "", fill: true },
    { d: spark(0, 72, 3.6), tone: "b", t: "", fill: true },
    { d: spark(72, 72, 3.6), tone: "b", t: "", fill: true },
  ];
  return (
    <svg className="neon-liner" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          {items.map((it, i) =>
            it.fill ? (
              <g key={i} className={`neon-${it.tone}`}>
                <path className="neon-mini-halo-fill" d={it.d} />
                <path className="neon-spark-core" d={it.d} />
              </g>
            ) : (
              <g key={i} className={`neon-${it.tone}`} transform={it.t} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path className="neon-mini-halo" d={it.d} strokeWidth="6.5" />
                <path className="neon-mini-halo" d={it.d} strokeWidth="3.6" />
                <path className="neon-glass" d={it.d} strokeWidth="1.9" />
                <path className="neon-core" d={it.d} strokeWidth="0.8" />
              </g>
            ),
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  const u = useUid();
  if (slot === "top") return <Marquee type={eventType} />;
  if (slot === "divider") return <Rule />;
  if (slot === "backdrop") return <Wall id={`neon-wall-${u}`} />;
  if (slot === "liner") return <Liner id={`neon-liner-${u}`} />;
  return null;
}

export const def: TemplateDef = {
  id: "neon",
  name: "Neon",
  description: "Letreiro de neon aceso sobre parede de tijolos",
  premium: true,
  suits: ["aniversario", "quinze-anos", "formatura", "outro"],
  palettes: [
    { id: "rosa", name: "Rosa-choque e ciano", vars: { bg: "#0B090F", paper: "#17131D", ink: "#F7F3FA", soft: "#BDB5C9", accent: "#FF4FA3", line: "#3B3347", btnInk: "#1F0713", seal: "#2FE3F0", sealInk: "#052A30", liner: "#0E2630" } },
    { id: "roxo", name: "Roxo e amarelo", vars: { bg: "#0B0913", paper: "#181327", ink: "#F6F2FC", soft: "#BBB3CE", accent: "#B57BFF", line: "#3A3152", btnInk: "#170A2E", seal: "#FFD93D", sealInk: "#2E2400", liner: "#241843" } },
    { id: "limao", name: "Verde-limão e magenta", vars: { bg: "#080B09", paper: "#131A15", ink: "#F3F8F1", soft: "#B4C2B6", accent: "#B8FF3A", line: "#2F3D33", btnInk: "#111C02", seal: "#FF45C8", sealInk: "#300524", liner: "#30102B" } },
    { id: "laranja", name: "Laranja e azul", vars: { bg: "#090A11", paper: "#141724", ink: "#F5F4F8", soft: "#B7BACB", accent: "#FF8B3D", line: "#333850", btnInk: "#220E00", seal: "#49A6FF", sealInk: "#041B36", liner: "#10203E" } },
    { id: "branco", name: "Branco quente", vars: { bg: "#0C0A08", paper: "#1A1714", ink: "#FAF4EA", soft: "#C4B9A9", accent: "#FFE2B0", line: "#40392F", btnInk: "#241A0B", seal: "#FFA23A", sealInk: "#2B1600", liner: "#3A2A16" } },
  ],
  Art,
};
