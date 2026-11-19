import type { ArtProps, TemplateDef } from "../types";

// Editorial: capa de revista. Nomes enormes em caixa alta, composição assimétrica, fios de ponta a ponta e nenhum ornamento figurativo.
// O único sinal gráfico é o quadradinho de "fim de matéria", que abre o cabeçalho e fecha o cartão.

function Mark({ size = 7 }: { size?: number }) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} aria-hidden="true">
      <rect width="8" height="8" fill="currentColor" />
    </svg>
  );
}

// Forro do envelope: risca de giz, como forro de alfaiataria.
function Liner() {
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="editorial-liner" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
          <path d="M0 0.5h9" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#editorial-liner)" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Mark size={6} />;
  if (slot === "bottom") return <Mark size={9} />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "editorial",
  name: "Editorial",
  description: "Nomes enormes e fios finos, como capa de revista",
  premium: true,
  suits: ["casamento", "aniversario", "formatura"],
  palettes: [
    { id: "nanquim", name: "Papel e nanquim", vars: { bg: "#E7E3DA", paper: "#F6F3EC", ink: "#121211", soft: "#59554E", accent: "#B4391F", line: "#CFC9BC", btnInk: "#F6F3EC", seal: "#121211", sealInk: "#F6F3EC", liner: "#121211" } },
    { id: "invertido", name: "Invertido", vars: { bg: "#070707", paper: "#151514", ink: "#F3EFE6", soft: "#B9B3A7", accent: "#E2674E", line: "#3B3934", btnInk: "#151514", seal: "#F3EFE6", sealInk: "#151514", liner: "#F3EFE6" } },
    { id: "bordo", name: "Bordô", vars: { bg: "#2E0A12", paper: "#4A111D", ink: "#F6EBDD", soft: "#DDBFB5", accent: "#E3A98C", line: "#6E2A36", btnInk: "#4A111D", seal: "#F6EBDD", sealInk: "#4A111D", liner: "#F6EBDD" } },
    { id: "oliva", name: "Verde-oliva", vars: { bg: "#E2E0CF", paper: "#F4F2E6", ink: "#2C3218", soft: "#5A5E44", accent: "#5F6B1E", line: "#CBC9B1", btnInk: "#F4F2E6", seal: "#3F4722", sealInk: "#F4F2E6", liner: "#3F4722" } },
    { id: "azul-tinta", name: "Azul-tinta", vars: { bg: "#DFE2EA", paper: "#F5F4EF", ink: "#14224A", soft: "#4E5878", accent: "#2A49B8", line: "#C5CAD8", btnInk: "#F5F4EF", seal: "#14224A", sealInk: "#F5F4EF", liner: "#14224A" } },
  ],
  Art,
};
