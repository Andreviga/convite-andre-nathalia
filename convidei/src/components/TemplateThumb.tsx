import { paletteOf, paletteStyle, templateDef } from "@/templates";
import type { Palette } from "@/templates/types";
import { InviteCover, type CoverData } from "./InviteCover";
import { ThumbFit } from "./ThumbFit";

/**
 * Fundo da bolinha que representa uma paleta: papel, cor de destaque e forro do envelope.
 * (Papel + tinta ficavam quase iguais entre paletas do mesmo modelo; destaque e forro são o que de fato muda.)
 */
export function paletteDot(palette: Palette): string {
  const v = palette.vars;
  return `linear-gradient(135deg, ${v.paper} 0 38%, ${v.accent} 38% 70%, ${v.liner} 70%)`;
}

/** Miniatura fiel: é a própria capa do convite, reduzida. Tamanho controlado pela variável CSS --s (escala). */
export function TemplateThumb({ data, palette, today }: { data: CoverData; palette?: string; today: string }) {
  const def = templateDef(data.template);
  const Art = def.Art;
  return (
    <div className="thumb" aria-hidden="true">
      <div className="inv" data-template={def.id} data-still="true" style={paletteStyle(paletteOf(def, palette))}>
        <div className="inv-art inv-art-backdrop"><Art slot="backdrop" initials={[]} /></div>
        <div className="inv-sheet">
          <InviteCover data={data} today={today} more={false} />
        </div>
      </div>
      <ThumbFit />
    </div>
  );
}
