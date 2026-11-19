import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chooseTemplate } from "@/app/actions";
import { Invite } from "@/components/Invite";
import { EVENT_TYPES, eventType } from "@/lib/catalog";
import { sampleEvent, sampleGuest } from "@/lib/sample";
import { paletteOf, TEMPLATE_DEFS, templateDef } from "@/templates";
import "../../invite.css";

type Search = { tipo?: string; nomes?: string; data?: string; paleta?: string; envelope?: string };

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
  const type = EVENT_TYPES.some((t) => t.id === search.tipo) ? search.tipo! : def.suits[0];
  const palette = paletteOf(def, search.paleta);
  const title = (search.nomes ?? "").trim().slice(0, 80);
  const event = sampleEvent(id, { type, title, date: search.data, palette: palette.id });
  const query = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ tipo: type, ...(title ? { nomes: title } : {}), ...(search.data ? { data: search.data } : {}), paleta: palette.id, envelope: "0", ...extra });
    return `/modelos/${id}?${p.toString()}`;
  };

  return (
    <>
      <Invite event={event} guest={title ? undefined : sampleGuest()} preview envelope={search.envelope !== "0"} />

      <aside className="demo-bar" aria-label="Usar este modelo">
        <div className="demo-bar-in">
          <div className="demo-row">
            <Link href={`/modelos?tipo=${type}`} className="demo-back" aria-label="Voltar para os modelos">
              ←
            </Link>
            <p className="demo-title">
              <strong>{def.name}</strong>
              <span>{def.premium ? "Premium" : "Grátis"}</span>
            </p>
            {def.palettes.length > 1 ? (
              <div className="demo-palettes" role="group" aria-label="Cores">
                {def.palettes.map((p) => (
                  <Link key={p.id} href={query({ paleta: p.id })} replace scroll={false} className="demo-dot" aria-label={`Cores: ${p.name}`} aria-current={p.id === palette.id ? "true" : undefined} style={{ background: `linear-gradient(135deg, ${p.vars.paper} 50%, ${p.vars.ink} 50%)` }} />
                ))}
              </div>
            ) : null}
          </div>

          <details className="demo-names" open={Boolean(title)}>
            <summary>Ver com os seus nomes</summary>
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
                <input type="date" name="data" defaultValue={search.data ?? ""} />
              </label>
              <button type="submit" className="btn">
                Atualizar
              </button>
            </form>
          </details>

          <form action={chooseTemplate}>
            <input type="hidden" name="template" value={id} />
            <input type="hidden" name="palette" value={palette.id} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="event_date" value={search.data ?? ""} />
            <button type="submit" className="btn btn-primary demo-cta">
              Usar este modelo
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
