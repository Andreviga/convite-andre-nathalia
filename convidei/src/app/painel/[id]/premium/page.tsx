import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestUpgrade } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { eventForUser } from "@/lib/events";
import { FREE_GUEST_LIMIT, isPremium, PREMIUM_PRICE, PREMIUM_PRICE_NOTE } from "@/lib/plans";

export const metadata: Metadata = { title: "Premium" };

export default async function Premium({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const event = await eventForUser((await params).id, user.id);
  if (!event) notFound();
  const requested = Boolean(event.upgrade_requested_at);

  return (
    <div className="narrow">
      <Link href={`/painel/${event.id}`} className="crumb">
        ← {event.title}
      </Link>
      <div className="dash-head">
        <h1 className="page-title">Premium para este evento</h1>
      </div>

      {isPremium(event.plan) ? (
        <p className="alert alert-ok">Este evento já é Premium: convites ilimitados, todos os modelos e sem o selo do {BRAND}.</p>
      ) : (
        <div className="price price-best">
          <p className="price-value">
            {PREMIUM_PRICE}
            <small>{PREMIUM_PRICE_NOTE}</small>
          </p>
          <ul>
            <li>Convites ilimitados (o plano grátis vai até {FREE_GUEST_LIMIT})</li>
            <li>Modelos exclusivos: Noite e Terracota</li>
            <li>Convite sem o selo “feito com {BRAND}”</li>
            <li>Vale para este evento, sem mensalidade</li>
          </ul>
          {requested ? (
            <p className="alert alert-info" role="status">
              Pedido registrado. O pagamento online ainda está sendo ativado: avisaremos no e-mail {user.email} assim que estiver disponível. Enquanto
              isso, seu convite continua funcionando normalmente no plano grátis.
            </p>
          ) : (
            <>
              <form action={requestUpgrade}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit" className="btn btn-primary btn-lg">
                  Quero o Premium
                </button>
              </form>
              <p className="help">O pagamento online ainda está sendo ativado. Ao clicar, registramos seu interesse e avisamos por e-mail: nada é cobrado agora.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
