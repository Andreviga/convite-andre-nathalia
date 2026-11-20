import { currentUser } from "@/lib/auth";
import { eventForUser, guestsOf } from "@/lib/events";
import { csvCell } from "@/lib/format";

const STATUS = { yes: "Confirmou", no: "Não vai", pending: "Sem resposta" } as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Entre na sua conta.", { status: 401 });
  const event = await eventForUser((await params).id, user.id);
  if (!event) return new Response("Evento não encontrado.", { status: 404 });
  const rows = [["Nome", "Celular", "Lugares no convite", "Resposta", "Pessoas confirmadas", "Recado", "Enviado", "Abriu"]];
  // "Pessoas confirmadas" só conta quem vai: quem respondeu "não" guarda o último número informado, mas ele não entra na soma (mesma regra de statsOf).
  for (const g of await guestsOf(event.id)) {
    rows.push([g.name, g.phone, String(g.max_people), STATUS[g.status], String(g.status === "yes" ? g.people_count : 0), g.note, g.sent_at ? "Sim" : "Não", g.opened_at ? "Sim" : "Não"]);
  }
  // BOM + ponto e vírgula: abre certo no Excel em português.
  const csv = "﻿" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n") + "\r\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="convidados-${event.slug}.csv"`, "Cache-Control": "no-store" },
  });
}
