// Regras do plano grátis e do upgrade. Preço provisório: ajuste aqui.
export const FREE_GUEST_LIMIT = 30;
export const PREMIUM_PRICE_BRL = 79; // em reais; é o valor cobrado no Mercado Pago
export const PREMIUM_PRICE = `R$ ${PREMIUM_PRICE_BRL.toLocaleString("pt-BR")}`;
export const PREMIUM_PRICE_NOTE = "pagamento único por evento";

export type Plan = "free" | "premium";

export function isPremium(plan: string): boolean {
  return plan === "premium";
}

export function guestLimit(plan: string): number | null {
  return isPremium(plan) ? null : FREE_GUEST_LIMIT;
}
