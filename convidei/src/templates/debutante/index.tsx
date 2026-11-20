import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Debutante: noite de gala. Papel escuro, nome em caligrafia com foil, uma tiara de fio fino como motivo-herói
// e o "15" entre dois brilhos como detalhe. Contorno mais grosso, filigrana mais fina, tudo na cor de destaque da paleta.

/** Brilho de quatro pontas (lados côncavos), centrado em (cx, cy) com raio r. */
function spark(cx: number, cy: number, r: number): string {
  const k = r * 0.16;
  return `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
}

/** Gradiente de foil derivado da paleta: tom base, brilho (puxa para a tinta) e sombra (puxa para o papel). */
function FoilStops() {
  const base = "var(--accent)";
  const hi = "color-mix(in srgb, var(--accent) 40%, var(--ink))";
  const lo = "color-mix(in srgb, var(--accent) 74%, var(--paper))";
  return (
    <>
      <stop offset="0" style={{ stopColor: lo }} />
      <stop offset="0.24" style={{ stopColor: base }} />
      <stop offset="0.46" style={{ stopColor: hi }} />
      <stop offset="0.62" style={{ stopColor: base }} />
      <stop offset="0.82" style={{ stopColor: hi }} />
      <stop offset="1" style={{ stopColor: lo }} />
    </>
  );
}

// Ponto sobre a curva quadrática (p0, c, p1) na posição t.
function onArc(p0: [number, number], c: [number, number], p1: [number, number], t: number): [number, number] {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}
const round = (n: number) => Math.round(n * 100) / 100;

/** Pedra em gota (ponta para cima), com a base apoiada em (cx, y) e altura h. */
function drop(cx: number, y: number, h: number): string {
  const r = h * 0.335;
  const cy = y - r;
  return `M${cx} ${round(y - h)}C${round(cx + r * 0.5)} ${round(y - h * 0.72)} ${round(cx + r)} ${round(cy - r * 0.75)} ${round(cx + r)} ${round(cy)}A${round(r)} ${round(r)} 0 0 1 ${round(cx - r)} ${round(cy)}C${round(cx - r)} ${round(cy - r * 0.75)} ${round(cx - r * 0.5)} ${round(y - h * 0.72)} ${cx} ${round(y - h)}Z`;
}

// Tiara: aro duplo com um festão de contas, cinco arcos em ogiva (contorno mais grosso), filigrana fina por dentro,
// hastes com conta entre os arcos, volutas nas pontas e pedras em gota de tamanhos diferentes, a do centro maior.
function Tiara() {
  const u = useUid();
  // metade esquerda; a direita é o espelho
  const arches =
    "M84 63.6C81 48 96.6 41 100 21" + // meio arco central
    "M56 65.7C54.5 54.5 67.6 49.5 70 34.5C72.4 49.5 85.5 53 84 63.6" + // segundo arco
    "M33 68.9C32 61.5 42.3 57.5 44 47.5C45.7 57.5 57 59.8 56 65.7"; // arco de fora
  const filigree =
    "M70 61.2C66.2 57.4 67 51.6 70 45.6C73 51.6 73.8 57.4 70 61.2Z" + // gota vazada do segundo arco
    "M84 63.6V51.5M56 65.7V58.6" + // hastes entre os arcos
    "M33 68.9C30.4 62.4 25 58.6 21.8 61C19.6 63 21.4 66.2 24.2 65"; // voluta da ponta
  const beads = Array.from({ length: 19 }, (_, i) => onArc([27.5, 73.6], [100, 60], [172.5, 73.6], (i + 0.5) / 19));
  return (
    <svg className="deb-tiara" viewBox="0 0 200 82" width="170" height="69.7" fill="none" stroke={`url(#debutante-foil-${u})`} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={`debutante-foil-${u}`} gradientUnits="userSpaceOnUse" x1="14" y1="6" x2="186" y2="78">
          <FoilStops />
        </linearGradient>
      </defs>
      {/* aro */}
      <path d="M22 77.2Q100 63.4 178 77.2M27 70Q100 56.5 173 70M22 77.2L27 70M178 77.2L173 70" />
      {/* arcos */}
      <path d={arches} />
      <path d={arches} transform="translate(200 0) scale(-1 1)" />
      {/* filigrana */}
      <g strokeWidth="0.7">
        <path d={filigree} />
        <path d={filigree} transform="translate(200 0) scale(-1 1)" />
        <path d="M100 59.4C93.6 54 95 44 100 34.5C105 44 106.4 54 100 59.4Z" />
      </g>
      <g fill={`url(#debutante-foil-${u})`} stroke="none">
        {/* festão de contas dentro do aro: uma maior a cada duas */}
        {beads.map(([x, y], i) => (
          <circle key={i} cx={round(x)} cy={round(y)} r={i === 9 ? 1.9 : i % 2 === 1 ? 1.25 : 0.75} />
        ))}
        {/* pedras */}
        <path d={drop(100, 20.6, 17)} />
        <path d={drop(70, 34.2, 11.5)} />
        <path d={drop(130, 34.2, 11.5)} />
        <path d={drop(44, 47.2, 8)} />
        <path d={drop(156, 47.2, 8)} />
        <circle cx="84" cy="49.6" r="1.9" />
        <circle cx="116" cy="49.6" r="1.9" />
        <circle cx="56" cy="57" r="1.5" />
        <circle cx="144" cy="57" r="1.5" />
        <circle cx="100" cy="47.6" r="1.7" />
        <circle cx="70" cy="54" r="1.1" />
        <circle cx="130" cy="54" r="1.1" />
        <circle cx="44" cy="61.6" r="1" />
        <circle cx="156" cy="61.6" r="1" />
        {/* brilhos em volta */}
        <path d={spark(24, 34, 4.4)} opacity="0.8" />
        <path d={spark(176, 34, 4.4)} opacity="0.8" />
        <path d={spark(42, 17, 2.6)} opacity="0.6" />
        <path d={spark(158, 17, 2.6)} opacity="0.6" />
        <circle cx="12" cy="50" r="0.9" opacity="0.6" />
        <circle cx="188" cy="50" r="0.9" opacity="0.6" />
      </g>
    </svg>
  );
}

// Ornamento neutro (eventos que não são festa de 15 anos): um brilho grande entre brilhos menores, sobre um arco fino.
function Sparkle() {
  const u = useUid();
  return (
    <svg className="deb-sparkle" viewBox="0 0 160 46" width="136" height="39.1" fill="none" stroke={`url(#debutante-foil-${u})`} strokeWidth="0.8" strokeLinecap="round">
      <defs>
        <linearGradient id={`debutante-foil-${u}`} gradientUnits="userSpaceOnUse" x1="10" y1="2" x2="150" y2="44">
          <FoilStops />
        </linearGradient>
      </defs>
      <path d="M34 39Q80 46.5 126 39" />
      <g fill={`url(#debutante-foil-${u})`} stroke="none">
        <path d={spark(80, 18, 16)} />
        <path d={spark(50, 25, 6.5)} opacity="0.9" />
        <path d={spark(110, 25, 6.5)} opacity="0.9" />
        <path d={spark(27, 16, 3.6)} opacity="0.7" />
        <path d={spark(133, 16, 3.6)} opacity="0.7" />
        <path d={spark(62, 7, 2.2)} opacity="0.6" />
        <path d={spark(98, 7, 2.2)} opacity="0.6" />
        <circle cx="12" cy="27" r="0.9" opacity="0.6" />
        <circle cx="148" cy="27" r="0.9" opacity="0.6" />
        <circle cx="80" cy="42.8" r="1.4" />
      </g>
    </svg>
  );
}

// Divisor: o "15" em itálico entre dois brilhos e dois fios que somem nas pontas.
function Fifteen({ show }: { show: boolean }) {
  const u = useUid();
  return (
    <svg className="deb-fifteen" viewBox="0 0 220 26" width="220" height="26" fill="none">
      <defs>
        <linearGradient id={`debutante-rule-l-${u}`} gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="72" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`debutante-rule-r-${u}`} gradientUnits="userSpaceOnUse" x1="148" y1="0" x2="212" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="8" y="12.5" width="64" height="1" fill={`url(#debutante-rule-l-${u})`} />
      <rect x="148" y="12.5" width="64" height="1" fill={`url(#debutante-rule-r-${u})`} />
      <path d={spark(82, 13, 4.2)} fill="currentColor" />
      <path d={spark(138, 13, 4.2)} fill="currentColor" />
{show ? (
        <text x="110" y="20.5" textAnchor="middle" fontSize="23" fontStyle="italic" fontWeight="500" fill="currentColor" style={{ fontFamily: "var(--f-serif), 'Cormorant Garamond', Georgia, serif", fontFeatureSettings: '"lnum" 1' }}>
        15
      </text>
      ) : (
        <path d={spark(110, 13, 5.6)} fill="currentColor" />
      )}
    </svg>
  );
}

// Fundo da página: poucos brilhos espalhados, parados. Dois ladrilhos grandes de períodos diferentes, sobrepostos,
// para a repetição não formar grade em tela larga. A faixa do meio fica limpa (máscara no CSS): é onde há texto.
function Backdrop() {
  const u = useUid();
  return (
    <svg className="deb-sky" width="100%" height="100%">
      <defs>
        <pattern id={`debutante-sky-${u}`} width="610" height="940" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <path d={spark(26, 52, 5)} opacity="0.5" />
            <path d={spark(338, 30, 3)} opacity="0.36" />
            <path d={spark(548, 118, 4.2)} opacity="0.42" />
            <path d={spark(148, 232, 2.6)} opacity="0.32" />
            <path d={spark(452, 316, 2.4)} opacity="0.3" />
            <path d={spark(40, 438, 3.4)} opacity="0.38" />
            <path d={spark(590, 512, 2.6)} opacity="0.34" />
            <path d={spark(262, 598, 4.6)} opacity="0.4" />
            <path d={spark(372, 742, 2.8)} opacity="0.34" />
            <path d={spark(92, 806, 2.4)} opacity="0.3" />
            <path d={spark(506, 884, 3.6)} opacity="0.4" />
            <circle cx="214" cy="96" r="0.9" opacity="0.4" />
            <circle cx="86" cy="330" r="0.8" opacity="0.35" />
            <circle cx="332" cy="456" r="0.9" opacity="0.35" />
            <circle cx="470" cy="644" r="0.8" opacity="0.4" />
            <circle cx="170" cy="702" r="0.9" opacity="0.35" />
          </g>
        </pattern>
        <pattern id={`debutante-sky-b-${u}`} width="437" height="709" patternUnits="userSpaceOnUse" patternTransform="translate(-61 173)">
          <g fill="currentColor">
            <path d={spark(388, 64, 3.2)} opacity="0.36" />
            <path d={spark(118, 150, 2.2)} opacity="0.28" />
            <path d={spark(300, 372, 2.6)} opacity="0.3" />
            <path d={spark(56, 548, 4)} opacity="0.4" />
            <circle cx="232" cy="238" r="0.8" opacity="0.35" />
            <circle cx="410" cy="470" r="0.9" opacity="0.35" />
            <circle cx="176" cy="640" r="0.8" opacity="0.35" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#debutante-sky-${u})`} />
      <rect width="100%" height="100%" fill={`url(#debutante-sky-b-${u})`} />
    </svg>
  );
}

// Forro do envelope: treliça em losango com um brilho em cada cruzamento.
function Liner() {
  const u = useUid();
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`debutante-liner-${u}`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0.5h26M0.5 0v26" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
          <path d={spark(13, 13, 4)} fill="currentColor" transform="rotate(45 13 13)" />
          <circle cx="0.5" cy="0.5" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#debutante-liner-${u})`} />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  // A tiara e o "15" só aparecem em festa de 15 anos (ou quando o tipo não vem); nos outros eventos entram brilhos.
  const fifteen = !eventType || eventType === "quinze-anos";
  if (slot === "top") return fifteen ? <Tiara /> : <Sparkle />;
  if (slot === "divider") return <Fifteen show={fifteen} />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "debutante",
  name: "Debutante",
  description: "Noite de gala: papel escuro, nome em foil e tiara de fio fino",
  premium: false,
  suits: ["quinze-anos"],
  palettes: [
    { id: "ouro", name: "Preto e dourado", vars: { bg: "#0B0A09", paper: "#161412", ink: "#F4EAD5", soft: "#CDB78C", accent: "#D4AE64", line: "#3B3327", btnInk: "#1B160E", seal: "#B8924A", sealInk: "#2A1E08", liner: "#241E15" } },
    { id: "rose", name: "Rosé e nude", vars: { bg: "#EDD9D1", paper: "#FBF1EC", ink: "#4A2526", soft: "#8C5045", accent: "#A4594B", line: "#E2C4B9", btnInk: "#FFF7F3", seal: "#A65C4E", sealInk: "#FCEBE4", liner: "#EBCDC3" } },
    { id: "marsala", name: "Marsala", vars: { bg: "#260A10", paper: "#3D111A", ink: "#F7E8D6", soft: "#E2C49C", accent: "#DDB873", line: "#6B2B36", btnInk: "#2B0C12", seal: "#C39A52", sealInk: "#3A0F17", liner: "#571A26" } },
    { id: "noite", name: "Azul-noite e prata", vars: { bg: "#070B16", paper: "#0F172A", ink: "#EEF1F6", soft: "#B7C0CF", accent: "#C9D0DB", line: "#2C3852", btnInk: "#0D1424", seal: "#AEB7C5", sealInk: "#162036", liner: "#18233D" } },
  ],
  Art,
};
