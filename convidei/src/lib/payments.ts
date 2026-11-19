import { one, q } from "./db";
import { newId } from "./ids";
import { fetchPayment, planEffect } from "./mercadopago";

/**
 * Busca o pagamento direto no Mercado Pago (nunca confia nos dados que chegam no aviso ou na URL),
 * registra e ajusta o plano do evento. Pode ser chamada várias vezes para o mesmo pagamento.
 */
export async function syncPayment(paymentId: string, expectedEventId?: string): Promise<"premium" | "free" | "none"> {
  const payment = await fetchPayment(paymentId);
  const eventId = payment.external_reference ?? "";
  if (expectedEventId && eventId !== expectedEventId) return "none";
  const event = await one<{ id: string }>("select id from events where id = $1", [eventId]);
  if (!event) return "none";

  await q(
    `insert into payments (id, event_id, provider, provider_payment_id, status, amount)
     values ($1, $2, 'mercadopago', $3, $4, $5)
     on conflict (provider, provider_payment_id) do update set status = excluded.status, amount = excluded.amount, updated_at = now()`,
    [newId(), event.id, String(payment.id), payment.status, payment.transaction_amount],
  );

  const effect = planEffect(payment);
  if (effect === "premium") await q("update events set plan = 'premium' where id = $1", [event.id]);
  if (effect === "free") {
    // Estorno: volta ao grátis só se não houver outro pagamento aprovado para o mesmo evento.
    await q(
      `update events set plan = 'free' where id = $1
       and not exists (select 1 from payments where event_id = $1 and provider = 'mercadopago' and status = 'approved')`,
      [event.id],
    );
  }
  return effect;
}
