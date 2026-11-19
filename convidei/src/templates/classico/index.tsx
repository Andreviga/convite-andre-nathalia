import type { ArtProps, TemplateDef } from "../types";

// Clássico: papelaria formal gravada. Eixo central, moldura dupla, nomes em caligrafia copperplate, uma só cor de tinta.

function Flourish({ flip = false }: { flip?: boolean }) {
  const half = "M90 15C74 15 66 5 54 5c-8 0-12 6-8 10 3 3 8 1 7-2M46 15C34 15 22 15 6 15";
  return (
    <svg viewBox="0 0 180 30" width="168" height="28" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <path d={half} />
      <path d={half} transform="translate(180 0) scale(-1 1)" />
      <path d="M90 9.5l5.5 5.5-5.5 5.5-5.5-5.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Rule() {
  return (
    <svg viewBox="0 0 120 10" width="104" height="9" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 5h50M70 5h50" />
      <path d="M60 1.5l3.5 3.5-3.5 3.5-3.5-3.5z" />
    </svg>
  );
}

function Liner() {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id="classico-liner" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0h18" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="9" r="1.1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#classico-liner)" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Flourish />;
  if (slot === "divider") return <Rule />;
  if (slot === "bottom") return <Flourish flip />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "classico",
  name: "Clássico",
  description: "Papel marfim, moldura dupla e nomes em caligrafia",
  premium: false,
  suits: ["casamento", "outro"],
  palettes: [
    { id: "marfim", name: "Marfim e ouro", vars: { bg: "#E9E1D2", paper: "#FBF7EE", ink: "#2B2622", soft: "#665B4E", accent: "#A6864B", line: "#CDBE9F", btnInk: "#FFFFFF", seal: "#7A1F2B", sealInk: "#F1D9B5", liner: "#E8DCC4" } },
    { id: "marinho", name: "Marinho", vars: { bg: "#DCE1E9", paper: "#FAFAF6", ink: "#1B2A41", soft: "#53607A", accent: "#9A8250", line: "#BFC8D6", btnInk: "#FFFFFF", seal: "#1B2A41", sealInk: "#E9D9B0", liner: "#C9D2E0" } },
    { id: "verde", name: "Verde garrafa", vars: { bg: "#E0E5DA", paper: "#FAF8F0", ink: "#2A3A30", soft: "#59685C", accent: "#A6864B", line: "#C4CDBC", btnInk: "#FFFFFF", seal: "#2A3A30", sealInk: "#EADBB4", liner: "#CFD8C6" } },
    { id: "preto", name: "Preto e branco", vars: { bg: "#E6E3DE", paper: "#FCFBF8", ink: "#1C1C1C", soft: "#5C5853", accent: "#77715F", line: "#CFCAC0", btnInk: "#FFFFFF", seal: "#1C1C1C", sealInk: "#EDE6D6", liner: "#D8D4CC" } },
  ],
  Art,
};
