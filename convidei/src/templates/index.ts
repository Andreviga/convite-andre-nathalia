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
import type { Palette, TemplateDef } from "./types";

// Ordem da galeria: primeiro os grátis, depois os Premium.
export const TEMPLATE_DEFS: TemplateDef[] = [classico, botanico, moderno, festa, doce, debutante, noite, terracota, monograma, editorial, azulejo, aquarela];

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
