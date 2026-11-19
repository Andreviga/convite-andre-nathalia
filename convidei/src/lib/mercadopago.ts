import { createHmac, timingSafeEqual } from "node:crypto";
import { BRAND } from "./brand.ts";
import { PREMIUM_PRICE_BRL } from "./plans.ts";

// Integração com o Checkout Pro do Mercado Pago, direto pela API (sem SDK).
// Variáveis: MERCADOPAGO_ACCESS_TOKEN (obrigatória) e MERCADOPAGO_WEBHOOK_SECRET (recomendada).
const API = "https://api.mercadopago.com";

export function mercadoPagoEnabled(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Mercado Pago respondeu ${response.status} em ${path.split("?")[0]}`);
  return (await response.json()) as T;
}

/** Cria a cobrança e devolve o endereço do checkout para onde o anfitrião é enviado. */
export async function createCheckout(event: { id: string; title: string }, payerEmail: string, origin: string): Promise<string> {
  const back = `${origin}/painel/${event.id}/premium`;
  const preference = await call<{ init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `${event.id}-${Date.now()}` },
    body: JSON.stringify({
      items: [{ id: "premium", title: `${BRAND} Premium — ${event.title}`.slice(0, 250), quantity: 1, unit_price: PREMIUM_PRICE_BRL, currency_id: "BRL" }],
      payer: { email: payerEmail },
      external_reference: event.id,
      back_urls: { success: back, pending: back, failure: back },
      // O Mercado Pago só aceita retorno automático e avisos em endereços https públicos.
      ...(origin.startsWith("https://") ? { auto_return: "approved", notification_url: `${origin}/api/mercadopago` } : {}),
      statement_descriptor: BRAND.toUpperCase().slice(0, 13),
    }),
  });
  if (!preference.init_point) throw new Error("Mercado Pago não devolveu o endereço do checkout.");
  return preference.init_point;
}

export type MpPayment = { id: number | string; status: string; external_reference: string | null; transaction_amount: number; currency_id: string };

export function fetchPayment(paymentId: string): Promise<MpPayment> {
  if (!/^\d{1,30}$/.test(paymentId)) throw new Error("Identificador de pagamento inválido.");
  return call<MpPayment>(`/v1/payments/${paymentId}`);
}

/** O que um pagamento significa para o plano do evento. */
export function planEffect(payment: MpPayment): "premium" | "free" | "none" {
  if (payment.status === "approved") {
    return payment.currency_id === "BRL" && payment.transaction_amount >= PREMIUM_PRICE_BRL ? "premium" : "none";
  }
  return payment.status === "refunded" || payment.status === "charged_back" ? "free" : "none";
}

/** Confere a assinatura do aviso (cabeçalho x-signature: "ts=...,v1=..."). */
export function validSignature(secret: string, signature: string | null, requestId: string | null, dataId: string, now = Date.now()): boolean {
  if (!signature) return false;
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=", 2) as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const sentAt = Number(parts.ts) > 1e12 ? Number(parts.ts) : Number(parts.ts) * 1000;
  if (!Number.isFinite(sentAt) || Math.abs(now - sentAt) > 15 * 60 * 1000) return false;
  const manifest = `id:${dataId.toLowerCase()};${requestId ? `request-id:${requestId};` : ""}ts:${parts.ts};`;
  const expected = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"));
  const received = Buffer.from(parts.v1);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
