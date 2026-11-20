/** Cookie que lembra, neste aparelho, o convite criado ao responder pelo link geral do evento. */
export function rsvpCookie(slug: string): string {
  return `convidei_rsvp_${slug}`;
}

/** Quantas pessoas alguém pode informar ao responder pelo link geral. */
export const OPEN_MAX_PEOPLE = 6;

/** Quantas respostas pelo link geral um mesmo aparelho lembra (celular da família, computador da casa). */
const REMEMBER_MAX = 12;

/**
 * O cookie guarda os códigos dos convites criados pelo link geral neste aparelho, do mais recente para o mais antigo,
 * separados por ponto. Assim, quando duas pessoas respondem no mesmo celular e a primeira volta, ela é reconhecida
 * pelo nome e a resposta é atualizada, em vez de nascer uma segunda linha na lista do anfitrião.
 */
export function rememberedTokens(value: string | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  for (const part of value.slice(0, 400).split(".")) {
    if (/^[a-z0-9]{4,16}$/.test(part)) seen.add(part);
    if (seen.size >= REMEMBER_MAX) break;
  }
  return [...seen];
}

/** Põe o código na frente da lista (é o convite que o link geral reabre) e devolve o valor do cookie. */
export function rememberToken(value: string | undefined, token: string): string {
  return [token, ...rememberedTokens(value).filter((t) => t !== token)].slice(0, REMEMBER_MAX).join(".");
}

/** Mesmo nome, sem ligar para maiúsculas, acentos ou espaços a mais. */
export function sameName(a: string, b: string): boolean {
  const flat = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  return flat(a) === flat(b);
}
