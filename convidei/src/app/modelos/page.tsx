import type { Metadata } from "next";
import Link from "next/link";
import { TemplateThumb } from "@/components/TemplateThumb";
import { currentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { EVENT_TYPES } from "@/lib/catalog";
import { todayBR } from "@/lib/format";
import { sampleEvent } from "@/lib/sample";
import { TEMPLATE_DEFS } from "@/templates";
import "../invite.css";

export const metadata: Metadata = {
  title: "Modelos de convite",
  description: "Escolha um modelo de convite digital, veja com os seus nomes e envie pelo WhatsApp com confirmação de presença.",
};

export default async function Gallery({ searchParams }: { searchParams: Promise<{ tipo?: string | string[] }> }) {
  const raw = (await searchParams).tipo;
  const tipo = Array.isArray(raw) ? raw[0] : raw;
  const type = EVENT_TYPES.find((t) => t.id === tipo);
  const user = await currentUser();
  const today = todayBR();
  // Com um tipo escolhido, os modelos pensados para ele ficam numa seção própria; os outros continuam disponíveis logo abaixo.
  const suited = type ? TEMPLATE_DEFS.filter((def) => def.suits.includes(type.id)) : [];
  const others = type ? TEMPLATE_DEFS.filter((def) => !def.suits.includes(type.id)) : TEMPLATE_DEFS;
  const card = (def: (typeof TEMPLATE_DEFS)[number]) => {
    const typeId = type?.id ?? def.suits[0];
    return (
      <li key={def.id}>
        <Link href={`/modelos/${def.id}?tipo=${typeId}`} className="gallery-card">
          <TemplateThumb data={sampleEvent(def.id, { type: typeId })} today={today} />
          <span className="gallery-name">
            {def.name}
            {def.premium ? <span className="tag tag-premium">Premium</span> : <span className="tag">Grátis</span>}
          </span>
          <span className="gallery-desc">{def.description}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      <header className="wrap top">
        <Link href="/" className="logo">
          {BRAND}
          <span>.</span>
        </Link>
        <nav aria-label="Conta">
          <Link href={user ? "/painel" : "/entrar"} className="btn btn-sm btn-ghost">
            {user ? "Meus convites" : "Entrar"}
          </Link>
        </nav>
      </header>
      <main className="wrap gallery">
        <h1 className="page-title">Escolha um modelo</h1>
        <p className="section-lead">Toque em um modelo para abrir o convite como o seu convidado vai ver. Depois é só colocar os seus nomes.</p>
        <nav className="chips" aria-label="Tipo de evento">
          <Link href="/modelos" className="chip" aria-current={!type ? "true" : undefined}>
            Todos
          </Link>
          {EVENT_TYPES.map((t) => (
            <Link key={t.id} href={`/modelos?tipo=${t.id}`} className="chip" aria-current={type?.id === t.id ? "true" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
        {type && suited.length ? (
          <>
            <h2 className="gallery-heading">
              Indicados para {type.label.toLowerCase()} <span>{suited.length === 1 ? "1 modelo" : `${suited.length} modelos`}</span>
            </h2>
            <ul className="gallery-grid">{suited.map(card)}</ul>
            <h2 className="gallery-heading gallery-heading-rest">
              Outros modelos <span>servem para qualquer festa</span>
            </h2>
          </>
        ) : null}
        <ul className="gallery-grid">{others.map(card)}</ul>
      </main>
    </>
  );
}
