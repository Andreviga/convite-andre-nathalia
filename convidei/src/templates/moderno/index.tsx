import type { ArtProps, TemplateDef } from "../types";

// Moderno: minimalista tipográfico. Sem script e sem ornamento figurativo: composição à esquerda, nomes em serifa leve
// e grande, apoio em sem serifa de caixa alta espaçada. O único elemento gráfico é o fio (no bloco da data).

/** Forro do envelope: grade de pequenas cruzes de registro, em traço fino. */
function Liner() {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id="moderno-liner" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M5.5 3v5M3 5.5h5M16.5 14v5M14 16.5h5" fill="none" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#moderno-liner)" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "moderno",
  name: "Moderno",
  description: "Só tipografia: nomes grandes, fios finos e muito respiro",
  premium: false,
  suits: ["formatura", "outro", "casamento"],
  palettes: [
    { id: "papel", name: "Branco e preto", vars: { bg: "#E3E0D8", paper: "#FBFAF7", ink: "#161616", soft: "#5E5B56", accent: "#8A8377", line: "#D9D5CC", btnInk: "#FBFAF7", seal: "#161616", sealInk: "#EDE9DF", liner: "#DEDAD1" } },
    { id: "areia", name: "Areia", vars: { bg: "#E0D6C6", paper: "#F3ECE0", ink: "#2B2620", soft: "#65594B", accent: "#9A8262", line: "#D6C9B4", btnInk: "#F7F2E9", seal: "#7A5F42", sealInk: "#F6EEDF", liner: "#D8C9B0" } },
    { id: "grafite", name: "Grafite", vars: { bg: "#17181A", paper: "#232528", ink: "#F1EEE7", soft: "#B7B2A8", accent: "#C9B8A0", line: "#44474C", btnInk: "#1A1B1D", seal: "#C2B096", sealInk: "#2A2622", liner: "#303338" } },
    { id: "azul", name: "Azul acinzentado", vars: { bg: "#D3DAE1", paper: "#F4F6F8", ink: "#1E2935", soft: "#52606E", accent: "#6F8496", line: "#C9D2DA", btnInk: "#FFFFFF", seal: "#3B4B5C", sealInk: "#E4EAF0", liner: "#C2CDD8" } },
  ],
  Art,
};
