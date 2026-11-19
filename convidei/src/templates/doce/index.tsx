import type { ArtProps, TemplateDef } from "../types";

// Doce: chá de bebê e revelação com cara de papelaria adulta. Cartão em arco, tipografia serifada macia como protagonista
// e um único motivo: o móbile de berço (lua, nuvem, estrelas) em traço fino, pendurado no alto do arco
// (nos outros tipos de evento, o mesmo céu vira uma guirlanda de estrelas, sem haste nem fios).
// Duas tintas de ornamento: currentColor (accent) e --doce-b (derivada do forro). Nas paletas de uma cor elas quase se
// confundem; na paleta "Menino ou menina?" viram azul de um lado e rosa do outro.

const B = "var(--doce-b, currentColor)";
const MID = "var(--doce-mid, currentColor)";

type Pt = [number, number];
const f = (n: number) => n.toFixed(2);
const mix = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** Estrela de cinco pontas, centrada em (cx, cy), com pontas e reentrâncias amaciadas (curvas, não só o traço). */
function star(cx: number, cy: number, r: number, turn = 0): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.56;
    const a = (Math.PI / 5) * i - Math.PI / 2 + turn;
    pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return (
    pts
      .map((p, i) => {
        const k = i % 2 === 0 ? 0.3 : 0.16;
        const a = mix(p, pts[(i + 9) % 10], k);
        const b = mix(p, pts[(i + 1) % 10], k);
        return `${i ? "L" : "M"}${f(a[0])} ${f(a[1])}Q${f(p[0])} ${f(p[1])} ${f(b[0])} ${f(b[1])}`;
      })
      .join("") + "Z"
  );
}
/** A mesma estrela, posicionada pela ponta de cima: é ali que o fio do móbile amarra. */
function hungStar(tipX: number, tipY: number, r: number, turn = 0): string {
  // a ponta amaciada fica 0.3 da aresta abaixo do vértice teórico; o fio vai até o vértice e a curva o encontra
  return star(tipX - r * Math.sin(turn), tipY + r * Math.cos(turn), r, turn);
}

// Lua crescente centrada em (0,0), raio 15. Girada -18°, a ponta de cima fica em (-3.57, -14.57).
const MOON = "M1.11-14.96A15 15 0 1 0 14.24 4.73 12 12 0 1 1 1.11-14.96Z";
// Nuvem de três gomos, centrada em (0,0), cerca de 28 x 17; o alto do gomo maior fica em (4.5, -9.15).
const CLOUD = "M-11 8h22a5.4 5.4 0 0 0 1-10.7 7.6 7.6 0 0 0-13.6-3.4 5 5 0 0 0-7.6 3.6A5.4 5.4 0 0 0-11 8Z";

/** Móbile de berço. Três pesos de traço: haste 1.4, peças 1.15, fios 0.8. Cada fio termina exatamente no alto da sua peça. */
function Mobile() {
  return (
    <svg className="doce-mobile" viewBox="0 0 220 88" fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* fio central (começa abaixo da moldura), argola e haste curva */}
      <g stroke={MID}>
        <path d="M110 1.6V15.6M110 20V43.4" strokeWidth="0.8" />
        <circle cx="110" cy="17.8" r="2.2" strokeWidth="0.9" />
        <path d="M29 30.5Q110 9.5 191 30.5" strokeWidth="1.4" />
      </g>
      {/* lado esquerdo: tinta A */}
      <g stroke="currentColor">
        <path d="M29 30.5V43M65 23.6V58.9" strokeWidth="0.8" />
        <circle cx="29" cy="30.5" r="1.5" fill="currentColor" stroke="none" />
        <path d={hungStar(29, 42.5, 9.5, -0.14)} fill="currentColor" fillOpacity="0.16" />
        <path d={CLOUD} transform="translate(60.5 68)" fill="currentColor" fillOpacity="0.16" />
        <circle cx="46" cy="47" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="87" cy="38" r="0.8" fill="currentColor" stroke="none" />
      </g>
      {/* centro: a lua, pendurada pela ponta de cima */}
      <g transform="translate(113.57 58) rotate(-18)" stroke={MID}>
        <path d={MOON} fill={MID} fillOpacity="0.18" />
      </g>
      {/* lado direito: tinta B */}
      <g stroke={B}>
        <path d="M151 23V60M191 30.5V40" strokeWidth="0.8" />
        <circle cx="191" cy="30.5" r="1.5" fill={B} stroke="none" />
        <path d={hungStar(151, 59, 11.5, 0.1)} fill={B} fillOpacity="0.16" />
        <path d={hungStar(191, 39, 6.8, 0.22)} fill={B} fillOpacity="0.16" />
        <circle cx="173" cy="52" r="1.2" fill={B} stroke="none" />
        <circle cx="131" cy="36" r="0.8" fill={B} stroke="none" />
      </g>
    </svg>
  );
}

/** Para eventos que não são de bebê (casamento, 15 anos, formatura...): o mesmo céu, sem haste nem fios. */
function Garland() {
  return (
    <svg className="doce-mobile doce-garland" viewBox="0 0 220 60" fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g stroke="currentColor">
        <path d={star(40, 43, 5.5, -0.2)} fill="currentColor" fillOpacity="0.16" />
        <path d={star(66, 31, 8, -0.1)} fill="currentColor" fillOpacity="0.16" />
        <circle cx="53" cy="27" r="1" fill="currentColor" stroke="none" />
        <circle cx="86" cy="21" r="1.3" fill="currentColor" stroke="none" />
      </g>
      <g transform="translate(109 30) rotate(-18) scale(0.92)" stroke={MID} strokeWidth="1.25">
        <path d={MOON} fill={MID} fillOpacity="0.18" />
      </g>
      <g stroke={B}>
        <path d={star(154, 31, 8, 0.1)} fill={B} fillOpacity="0.16" />
        <path d={star(180, 43, 5.5, 0.2)} fill={B} fillOpacity="0.16" />
        <circle cx="134" cy="21" r="1.3" fill={B} stroke="none" />
        <circle cx="167" cy="27" r="1" fill={B} stroke="none" />
      </g>
    </svg>
  );
}

function Divider() {
  return (
    <svg className="doce-divider" viewBox="0 0 96 12" width="96" height="12" fill="none" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h26" stroke="currentColor" />
      <path d="M62 6h26" stroke={B} />
      <path d={star(48, 6.3, 5)} stroke={MID} fill={MID} fillOpacity="0.18" />
    </svg>
  );
}

function Liner() {
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="doce-liner" width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <path d={MOON} transform="translate(13 14) scale(0.42) rotate(-18)" fill="currentColor" />
          <path d={star(39, 40, 4.6, 0.15)} fill="currentColor" />
          <circle cx="39" cy="13" r="1.2" fill="currentColor" />
          <circle cx="13" cy="40" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#doce-liner)" />
    </svg>
  );
}

// O móbile de berço só faz sentido em chá e aniversário (e na galeria, onde o tipo pode não vir).
const BABY = new Set(["cha", "aniversario"]);

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") return !eventType || BABY.has(eventType) ? <Mobile /> : <Garland />;
  if (slot === "divider") return <Divider />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "doce",
  name: "Doce",
  description: "Cartão em arco com móbile de lua e estrelas",
  premium: false,
  suits: ["cha", "aniversario"],
  palettes: [
    { id: "salvia", name: "Linho e sálvia", vars: { bg: "#E7E3D6", paper: "#FAF6EC", ink: "#30362D", soft: "#5C6454", accent: "#8C9C80", line: "#D6D8C6", btnInk: "#FFFFFF", seal: "#7E8F71", sealInk: "#F6F2E4", liner: "#CBD4BF" } },
    { id: "nevoa", name: "Azul névoa", vars: { bg: "#DFE4E8", paper: "#F8F7F2", ink: "#2A3642", soft: "#566577", accent: "#8199AD", line: "#CCD5DC", btnInk: "#FFFFFF", seal: "#6E869B", sealInk: "#F3F4F1", liner: "#BCCFDF" } },
    { id: "rosa", name: "Rosa seco", vars: { bg: "#ECDFD8", paper: "#FBF5EF", ink: "#452F2D", soft: "#765854", accent: "#BD8C84", line: "#E3D0C8", btnInk: "#FFFFFF", seal: "#AA746D", sealInk: "#FBEFE8", liner: "#E6CAC3" } },
    { id: "revelacao", name: "Menino ou menina?", vars: { bg: "#E9E5DE", paper: "#FAF7F1", ink: "#33343F", soft: "#5F5F6C", accent: "#8CA3B7", line: "#DAD5CE", btnInk: "#FFFFFF", seal: "#8E8AA0", sealInk: "#F7F3F0", liner: "#E3BFBB" } },
    { id: "mel", name: "Areia e mel", vars: { bg: "#E9E0D1", paper: "#FAF5EA", ink: "#3A332B", soft: "#695D50", accent: "#B39160", line: "#DACEBA", btnInk: "#FFFFFF", seal: "#A98652", sealInk: "#FAF1DE", liner: "#DFD0B3" } },
  ],
  Art,
};
