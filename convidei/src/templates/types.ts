import type { ReactNode } from "react";

/** Cores de um modelo. Viram variáveis CSS (--bg, --paper, ...) no elemento .inv. */
export type PaletteVars = {
  bg: string; // fundo da página, atrás do cartão
  paper: string; // cor do papel do cartão
  ink: string; // texto principal (contraste >= 7:1 com paper)
  soft: string; // texto secundário (contraste >= 4.5:1 com paper)
  accent: string; // ornamentos, filetes, detalhes
  line: string; // fios e bordas discretas
  btnInk: string; // texto sobre botão preenchido com ink
  seal: string; // cor do lacre de cera do envelope
  sealInk: string; // monograma cunhado no lacre
  liner: string; // forro interno do envelope
};

export type Palette = { id: string; name: string; vars: PaletteVars };

export type ArtSlot = "backdrop" | "top" | "divider" | "bottom" | "liner";

export type ArtProps = { slot: ArtSlot; initials: string[] };

export type TemplateDef = {
  id: string;
  name: string;
  /** Uma linha para a galeria, ex.: "Folhagens em traço fino". */
  description: string;
  premium: boolean;
  /** Tipos de evento em que o modelo aparece primeiro na galeria (ids de EVENT_TYPES). */
  suits: string[];
  /** A primeira paleta é a padrão. */
  palettes: Palette[];
  /** Ornamentos em SVG. Devolva null nos espaços que o modelo não usa. Precisa ser um componente puro (sem hooks, sem dados externos). */
  Art: (props: ArtProps) => ReactNode;
};
