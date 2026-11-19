import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Novo convite" };

export default async function NewEvent() {
  await requireUser();
  return (
    <div className="narrow">
      <Link href="/painel" className="crumb">
        ← Meus convites
      </Link>
      <div className="dash-head">
        <h1 className="page-title">Novo convite</h1>
      </div>
      <EventForm initial={{}} premium={false} />
    </div>
  );
}
