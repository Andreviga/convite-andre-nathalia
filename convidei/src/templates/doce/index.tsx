import type { ArtProps, TemplateDef } from "../types";

// Doce: chá de bebê e revelação com cara de papelaria adulta. Cartão em arco, tipografia serifada macia como protagonista
// e um único motivo: o móbile de berço (lua, nuvem, estrelas) em traço fino, pendurado no alto do arco.
// Duas tintas de ornamento: currentColor (accent) e --doce-b (derivada do forro). Nas paletas de uma cor elas quase se
// confundem; na paleta "Menino ou menina?" viram azul de um lado e rosa do outro.

const B = "var(--doce-b, currentColor)";
const MID = "var(--doce-mid, currentColor)";

/** Estrela de cinco pontas com cantos arredondados pelo traço. */
function star(cx: number, cy: number, r: number, turn = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.5;
    const a = (Math.PI / 5) * i - Math.PI / 2 + turn;
    pts.push(`${(cx + radius * Math.cos(a)).toFixed(2)} ${(cy + radius * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

// Lua crescente centrada em (0,0), raio 15.
const MOON = "M1.11-14.96A15 15 0 1 0 14.24 4.73 12 12 0 1 1 1.11-14.96Z";
// Nuvem centrada em (0,0), cerca de 30 x 18.
const CLOUD = "M-9.5 8.5h19.5a5.6 5.6 0 0 0 .9-11.1 8.2 8.2 0 0 0-15.4-2.6A6.9 6.9 0 0 0-9.5 8.5Z";

function Mobile() {
  return (
    <svg className="doce-mobile" viewBox="0 0 220 96" fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* fio central e haste curva */}
      <g stroke={MID}>
        <path d="M110 0v20" />
        <path d="M28 30Q110 10 192 30" />
        <circle cx="110" cy="20" r="1.6" fill={MID} stroke="none" />
        <path d="M110 20v25" />
      </g>
      {/* lado esquerdo: tinta A */}
      <g stroke="currentColor">
        <path d="M28 30v17M68 21.5v39" />
        <path d={star(28, 57, 9, -0.12)} fill="currentColor" fillOpacity="0.16" />
        <path d={CLOUD} transform="translate(68 72)" fill="currentColor" fillOpacity="0.16" />
        <circle cx="47" cy="45" r="1.1" fill="currentColor" stroke="none" />
      </g>
      {/* centro: a lua */}
      <g transform="translate(109 63) rotate(-18)" stroke={MID}>
        <path d={MOON} fill={MID} fillOpacity="0.18" />
      </g>
      {/* lado direito: tinta B */}
      <g stroke={B}>
        <path d="M152 21.5v42M192 30v14" />
        <path d={star(152, 75, 11, 0.1)} fill={B} fillOpacity="0.16" />
        <path d={star(192, 51, 6.5, 0.2)} fill={B} fillOpacity="0.16" />
        <circle cx="172" cy="54" r="1.1" fill={B} stroke="none" />
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

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Mobile />;
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
