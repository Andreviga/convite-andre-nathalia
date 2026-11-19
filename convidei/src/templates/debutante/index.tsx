import type { ArtProps, TemplateDef } from "../types";

function Art(_props: ArtProps) {
  return null;
}

export const def: TemplateDef = {
  id: "debutante",
  name: "Debutante",
  description: "Preto e dourado para a noite dos 15 anos",
  premium: false,
  suits: ["quinze-anos"],
  palettes: [
    {
      id: "padrao",
      name: "Padrão",
      vars: { bg: "#EFEAE0", paper: "#FBF8F1", ink: "#2A2622", soft: "#6B6258", accent: "#A8894F", line: "#DDD3C2", btnInk: "#FFFFFF", seal: "#7A1F2B", sealInk: "#F3D9B8", liner: "#E4D9C6" },
    },
  ],
  Art,
};
