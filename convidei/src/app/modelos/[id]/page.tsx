import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chooseTemplate } from "@/app/actions";
import { Invite } from "@/components/Invite";
import { paletteDot } from "@/components/TemplateThumb";
import { EVENT_TYPES, eventType } from "@/lib/catalog";
import { isDate } from "@/lib/format";
import { PREMIUM_PRICE } from "@/lib/plans";
import { sampleEvent, sampleGuest } from "@/lib/sample";
import { paletteOf, TEMPLATE_DEFS, templateDef } from "@/templates";
import "../../invite.css";

type Search = Record<"tipo" | "nomes" | "data" | "paleta" | "envelope", string | string[] | undefined>;

/** Parâmetro repetido na URL (?nomes=a&nomes=b) chega como lista: fica o primeiro. */
function first(value: string | string[] | undefined): string {
  const one = Array.isArray(value) ? value[0] : value;
  return typeof one === "string" ? one : "";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const def = templateDef((await params).id);
  return { title: `Modelo ${def.name}`, description: def.description };
}

// Demonstração de um modelo, como o convidado vê: /modelos/classico?tipo=casamento&nomes=Ana+%26+Leo&data=2027-05-08
export default async function TemplateDemo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const { id } = await params;
  if (!TEMPLATE_DEFS.some((t) => t.id === id)) notFound();
  const def = templateDef(id);
  const search = await searchParams;
  const tipo = first(search.tipo);
  const type = EVENT_TYPES.some((t) => t.id === tipo) ? tipo : def.suits[0];
  const palette = paletteOf(def, first(search.paleta));
  const title = first(search.nomes).trim().slice(0, 80);
  // Data impossível (2027-13-45) é descartada aqui: não vai para o convite, para os links nem para o rascunho.
  const date = isDate(first(search.data)) ? first(search.data) : "";
  const envelope = first(search.envelope) !== "0";
  const event = sampleEvent(id, { type, title, date, palette: palette.id });
  const query = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ tipo: type, ...(title ? { nomes: title } : {}), ...(date ? { data: date } : {}), paleta: palette.id, envelope: "0", ...extra });
    return `/modelos/${id}?${p.toString()}`;
  };

  return (
    <>
      <Invite event={event} guest={title ? undefined : sampleGuest()} preview envelope={envelope} />

      <aside className="demo-bar" data-premium={def.premium ? "true" : undefined} aria-label="Usar este modelo">
        <div className="demo-bar-in">
          <div className="demo-row">
            <Link href={`/modelos?tipo=${type}`} className="demo-back" aria-label="Voltar para os modelos">
              ←
            </Link>
            <p className="demo-title">
              <strong>{def.name}</strong>
              <span>{def.premium ? `Premium · ${PREMIUM_PRICE}` : "Grátis"}</span>
            </p>
            {def.palettes.length > 1 ? (
              <div className="demo-palettes" role="group" aria-label="Cores">
                {def.palettes.map((p) => (
                  <Link key={p.id} href={query({ paleta: p.id })} replace scroll={false} className="demo-dot" aria-label={`Cores: ${p.name}`} aria-current={p.id === palette.id ? "true" : undefined} title={p.name} style={{ background: paletteDot(p) }} />
                ))}
              </div>
            ) : null}
          </div>

          {def.premium ? (
            <p className="demo-premium">Monte e veja sem pagar. Até o upgrade (pago uma vez por evento), o convidado vê uma faixa de “prévia” no topo.</p>
          ) : null}

          {/* Fechado por padrão, também depois de "Atualizar": a pessoa quer ver o convite, não o formulário. */}
          <details className="demo-names">
            <summary className="btn">{title ? "Trocar nomes" : "Pôr seus nomes"}</summary>
            <form method="get" action={`/modelos/${id}`} className="demo-form">
              <input type="hidden" name="tipo" value={type} />
              <input type="hidden" name="paleta" value={palette.id} />
              <input type="hidden" name="envelope" value="0" />
              <label className="field">
                <span>{eventType(type).titleLabel}</span>
                <input type="text" name="nomes" maxLength={80} placeholder={eventType(type).titlePlaceholder} defaultValue={title} required />
              </label>
              <label className="field">
                <span>Data</span>
                <input type="date" name="data" defaultValue={date} />
              </label>
              <button type="submit" className="btn">
                Atualizar
              </button>
            </form>
          </details>

          <form action={chooseTemplate} className="demo-use">
            <input type="hidden" name="template" value={id} />
            <input type="hidden" name="palette" value={palette.id} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="event_date" value={date} />
            <button type="submit" className="btn btn-primary demo-cta">
              Usar este modelo
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
