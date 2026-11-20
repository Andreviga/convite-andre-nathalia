import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { DRAFT_PARAM, readDraft } from "@/lib/draft";
import { todayBR } from "@/lib/format";

export const metadata: Metadata = { title: "Novo convite" };

export default async function NewEvent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await currentUser())) redirect("/criar-conta");
  // O rascunho da galeria só vale para quem chegou por "Usar este modelo"; aberto pelo painel, o convite novo começa em branco.
  const draft = (await searchParams)[DRAFT_PARAM] === "1" ? await readDraft() : {};
  return (
    <div className="wide">
      <Link href="/painel" className="crumb">
        ← Meus convites
      </Link>
      <div className="dash-head">
        <h1 className="page-title">Novo convite</h1>
      </div>
      <EventForm initial={draft} premium={false} today={todayBR()} />
    </div>
  );
}
