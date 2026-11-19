import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startUpgrade } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { eventForUser } from "@/lib/events";
import { mercadoPagoEnabled } from "@/lib/mercadopago";
import { syncPayment } from "@/lib/payments";
import { FREE_GUEST_LIMIT, isPremium, PREMIUM_PRICE, PREMIUM_PRICE_NOTE } from "@/lib/plans";

export const metadata: Metadata = { title: "Premium" };

type Search = { payment_id?: string; collection_id?: string; status?: string; erro?: string };

export default async function Premium({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const user = await requireUser();
  const { id } = await params;
  const search = await searchParams;
  let event = await eventForUser(id, user.id);
  if (!event) notFound();

  // Volta do checkout: confere o pagamento direto no Mercado Pago, sem esperar o aviso chegar.
  const paymentId = search.payment_id ?? search.collection_id ?? "";
  let checkFailed = false;
  if (mercadoPagoEnabled() && /^\d{1,30}$/.test(paymentId) && !isPremium(event.plan)) {
    try {
      await syncPayment(paymentId, event.id);
      event = (await eventForUser(id, user.id)) ?? event;
    } catch (error) {
      console.error("Falha ao conferir pagamento", error);
      checkFailed = true;
    }
  }

  const online = mercadoPagoEnabled();
  const returned = Boolean(paymentId || search.status);

  return (
    <div className="narrow">
      <Link href={`/painel/${event.id}`} className="crumb">
        ← {event.title}
      </Link>
      <div className="dash-head">
        <h1 className="page-title">Premium para este evento</h1>
      </div>

      {isPremium(event.plan) ? (
        <>
          <p className="alert alert-ok" role="status">
            {returned ? "Pagamento aprovado. " : ""}Este evento é Premium: convites ilimitados, todos os modelos e sem o selo do {BRAND}.
          </p>
          <div className="form-actions">
            <Link href={`/painel/${event.id}/editar`} className="btn btn-primary">
              Escolher um modelo Premium
            </Link>
            <Link href={`/painel/${event.id}`} className="btn">
              Voltar ao painel
            </Link>
          </div>
        </>
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

          {search.erro || checkFailed ? (
            <p className="alert alert-error" role="alert">
              {checkFailed
                ? "Não conseguimos conferir seu pagamento agora. Se ele foi aprovado, o Premium é liberado sozinho em alguns minutos; recarregue esta página."
                : "Não foi possível abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes."}
            </p>
          ) : returned ? (
            <p className="alert alert-info" role="status">
              {search.status === "pending" || search.status === "in_process"
                ? "Seu pagamento está em análise ou aguardando (no Pix e no boleto pode levar alguns minutos). O Premium é liberado sozinho assim que for aprovado."
                : "O pagamento não foi concluído e nada foi cobrado. Você pode tentar de novo."}
            </p>
          ) : null}

          {online ? (
            <>
              <form action={startUpgrade}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit" className="btn btn-primary btn-lg">
                  Pagar {PREMIUM_PRICE} e liberar o Premium
                </button>
              </form>
              <p className="help">Pagamento pelo Mercado Pago: Pix, cartão ou boleto. Você volta para cá ao terminar.</p>
            </>
          ) : event.upgrade_requested_at ? (
            <p className="alert alert-info" role="status">
              Pedido registrado. O pagamento online ainda está sendo ativado: avisaremos no e-mail {user.email} assim que estiver disponível. Enquanto
              isso, seu convite continua funcionando normalmente no plano grátis.
            </p>
          ) : (
            <>
              <form action={startUpgrade}>
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
