import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { readDraft } from "@/lib/draft";
import { todayBR } from "@/lib/format";

export const metadata: Metadata = { title: "Novo convite" };

export default async function NewEvent() {
  if (!(await currentUser())) redirect("/criar-conta");
  const draft = await readDraft();
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
