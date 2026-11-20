import { def as classico } from "./classico/index";
import { def as botanico } from "./botanico/index";
import { def as moderno } from "./moderno/index";
import { def as festa } from "./festa/index";
import { def as doce } from "./doce/index";
import { def as debutante } from "./debutante/index";
import { def as noite } from "./noite/index";
import { def as terracota } from "./terracota/index";
import { def as monograma } from "./monograma/index";
import { def as editorial } from "./editorial/index";
import { def as azulejo } from "./azulejo/index";
import { def as aquarela } from "./aquarela/index";
import { def as jardim } from "./jardim/index";
import { def as celestial } from "./celestial/index";
import { def as tropical } from "./tropical/index";
import { def as rustico } from "./rustico/index";
import { def as catedral } from "./catedral/index";
import { def as traco } from "./traco/index";
import { def as marmore } from "./marmore/index";
import { def as neon } from "./neon/index";
import { def as retro } from "./retro/index";
import { def as embarque } from "./embarque/index";
import { def as jornal } from "./jornal/index";
import { def as balao } from "./balao/index";
import { def as anjo } from "./anjo/index";
import type { Palette, TemplateDef } from "./types";

// Ordem da galeria: primeiro os grátis, depois os Premium.
export const TEMPLATE_DEFS: TemplateDef[] = [classico, botanico, moderno, festa, doce, debutante, traco, balao, noite, terracota, monograma, editorial, azulejo, aquarela, jardim, celestial, tropical, rustico, catedral, marmore, neon, retro, embarque, jornal, anjo];

export function templateDef(id: string): TemplateDef {
  return TEMPLATE_DEFS.find((t) => t.id === id) ?? TEMPLATE_DEFS[0];
}

export function paletteOf(def: TemplateDef, paletteId: string | null | undefined): Palette {
  return def.palettes.find((p) => p.id === paletteId) ?? def.palettes[0];
}

/** Variáveis CSS da paleta, para o atributo style do elemento .inv. */
export function paletteStyle(palette: Palette): Record<string, string> {
  const v = palette.vars;
  return {
    "--bg": v.bg, "--paper": v.paper, "--ink": v.ink, "--soft": v.soft, "--accent": v.accent, "--line": v.line,
    "--btn-ink": v.btnInk, "--seal": v.seal, "--seal-ink": v.sealInk, "--liner": v.liner,
  };
}
