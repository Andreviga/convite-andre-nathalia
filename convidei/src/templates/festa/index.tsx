import type { ArtProps, TemplateDef } from "../types";

// Festa: pôster de aniversário impresso em duas cores. Um bloco de cor chapada com um meio-sol e um leque de faixas,
// título em Fraunces grande (primeira linha em itálico) e texto alinhado à esquerda, como capa de revista.
// As cores das formas vêm do CSS (classes festa-*), para acompanhar a paleta.

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Leque de faixas que irradia de um centro e sangra para fora do quadro (o mesmo desenho do forro do envelope). */
function burst(cx: number, cy: number, radius: number, count: number, dir: 1 | -1): string {
  let d = "";
  for (let i = 0; i < count; i += 2) {
    const a0 = (Math.PI * i) / count;
    const a1 = (Math.PI * (i + 1)) / count;
    d += `M${cx} ${cy}L${r1(cx + Math.cos(a0) * radius)} ${r1(cy + dir * Math.sin(a0) * radius)}L${r1(cx + Math.cos(a1) * radius)} ${r1(cy + dir * Math.sin(a1) * radius)}Z`;
  }
  return d;
}

/** Brilho de quatro pontas, chapado, com os lados côncavos. */
function spark(x: number, y: number, s: number): string {
  const k = r1(s * 0.16);
  return `M${x} ${y - s}Q${x + k} ${y - k} ${x + s} ${y}Q${x + k} ${y + k} ${x} ${y + s}Q${x - k} ${y + k} ${x - s} ${y}Q${x - k} ${y - k} ${x} ${y - s}Z`;
}

/** Motivo-herói: bloco de cor que sangra até a borda do cartão. O meio-sol nasce na linha do papel, fora do centro,
    e as faixas atravessam o bloco inteiro; três brilhos de tamanhos diferentes equilibram o lado esquerdo. */
function Sunrise() {
  return (
    <svg className="festa-sunrise" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect className="festa-field" width="400" height="160" />
      <path className="festa-burst" d={burst(292, 160, 480, 15, -1)} />
      <circle className="festa-sun" cx="292" cy="160" r="78" />
      <path className="festa-star" d={spark(62, 84, 21) + spark(108, 122, 9) + spark(34, 128, 6)} />
    </svg>
  );
}

/** Forro do envelope: o mesmo sol, visto de cima, irradiando do alto da aba. */
function Liner() {
  return (
    <svg className="festa-liner" width="100%" height="100%" viewBox="0 0 400 286" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path className="festa-liner-rays" d={burst(200, 0, 420, 18, 1)} />
      <circle className="festa-liner-sun" cx="200" cy="0" r="46" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Sunrise />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "festa",
  name: "Festa",
  description: "Pôster em cor chapada, sol em leque e título de revista",
  premium: false,
  suits: ["aniversario", "outro"],
  palettes: [
    { id: "terracota", name: "Terracota e creme", vars: { bg: "#8E3A22", paper: "#F7ECD8", ink: "#33190F", soft: "#77503C", accent: "#D2673C", line: "#E2CDB0", btnInk: "#FBF1E0", seal: "#C4532D", sealInk: "#FBE9CF", liner: "#F3D9B4" } },
    { id: "chiclete", name: "Rosa-chiclete e vinho", vars: { bg: "#5B1030", paper: "#FCE1E9", ink: "#4A0C26", soft: "#8A3F5A", accent: "#EE6FA0", line: "#F3BFD0", btnInk: "#FFE9F0", seal: "#D94A85", sealInk: "#FFE4EE", liner: "#F9C6D8" } },
    { id: "garrafa", name: "Verde-garrafa e mostarda", vars: { bg: "#1D3A2D", paper: "#F5EDD6", ink: "#1A3226", soft: "#56684F", accent: "#DDA63A", line: "#DDD3B0", btnInk: "#F8F0DA", seal: "#C68F25", sealInk: "#1D3A2D", liner: "#EFD9A0" } },
    { id: "cobalto", name: "Azul-cobalto e pêssego", vars: { bg: "#1C36A8", paper: "#FCEBDD", ink: "#14277E", soft: "#5A5F9A", accent: "#F5A57C", line: "#F1D2BC", btnInk: "#FFF1E6", seal: "#F08F62", sealInk: "#14277E", liner: "#F9D3BC" } },
    { id: "preto", name: "Preto e dourado", vars: { bg: "#151310", paper: "#F5EDDA", ink: "#1B1915", soft: "#6A6252", accent: "#C9A14A", line: "#DDD0B2", btnInk: "#F5EDDA", seal: "#B78F3A", sealInk: "#1B1915", liner: "#E9D7A6" } },
  ],
  Art,
};
