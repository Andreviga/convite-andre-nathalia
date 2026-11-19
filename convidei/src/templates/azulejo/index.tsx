import type { ArtProps, TemplateDef } from "../types";

function Art(_props: ArtProps) {
  return null;
}

export const def: TemplateDef = {
  id: "azulejo",
  name: "Azulejo",
  description: "Azul e branco inspirado em azulejos",
  premium: true,
  suits: ["casamento", "outro"],
  palettes: [
    {
      id: "padrao",
      name: "Padrão",
      vars: { bg: "#EFEAE0", paper: "#FBF8F1", ink: "#2A2622", soft: "#6B6258", accent: "#A8894F", line: "#DDD3C2", btnInk: "#FFFFFF", seal: "#7A1F2B", sealInk: "#F3D9B8", liner: "#E4D9C6" },
    },
  ],
  Art,
};
