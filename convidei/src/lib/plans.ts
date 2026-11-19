// Regras do plano grátis e do upgrade. Preço provisório: ajuste aqui.
export const FREE_GUEST_LIMIT = 30;
export const PREMIUM_PRICE = "R$ 79";
export const PREMIUM_PRICE_NOTE = "pagamento único por evento";

export type Plan = "free" | "premium";

export function isPremium(plan: string): boolean {
  return plan === "premium";
}

export function guestLimit(plan: string): number | null {
  return isPremium(plan) ? null : FREE_GUEST_LIMIT;
}
