import { paletteOf, paletteStyle, templateDef } from "@/templates";
import { InviteCover, type CoverData } from "./InviteCover";

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
    </div>
  );
}
