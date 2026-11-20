import { cookies } from "next/headers";

export const DRAFT_COOKIE = "convidei_rascunho";
/** O rascunho da galeria vale pouco tempo: é só a ponte entre "Usar este modelo" e o editor. */
/**
 * Marca na URL de quem acabou de sair da galeria ("Usar este modelo"). O editor só usa o rascunho quando ela está presente:
 * um "Novo convite" aberto pelo painel começa sempre em branco, mesmo com o cookie ainda válido.
 */
export const DRAFT_PARAM = "rascunho";
export const DRAFT_MAX_AGE = 60 * 60; // segundos

const FIELDS = ["template", "palette", "type", "title", "event_date"] as const;
export type Draft = Partial<Record<(typeof FIELDS)[number], string>>;

/** Valor do cookie. `seen` marca que o rascunho já levou a pessoa ao editor uma vez (não redireciona de novo no login). */
export function draftCookie(draft: Draft, at: number, seen: boolean): string {
  return JSON.stringify({ ...draft, at, seen });
}

export const draftCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: DRAFT_MAX_AGE };

/** Lê o cookie do rascunho; devolve null se não existe, está malformado ou venceu. */
export function parseDraft(raw: string | undefined, now = Date.now()): { draft: Draft; at: number; seen: boolean } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const at = typeof parsed.at === "number" ? parsed.at : 0;
    if (!at || now - at > DRAFT_MAX_AGE * 1000 || at > now + 60_000) return null;
    const draft: Draft = {};
    for (const key of FIELDS) {
      if (typeof parsed[key] === "string" && parsed[key]) draft[key] = (parsed[key] as string).slice(0, 80);
    }
    return { draft, at, seen: parsed.seen === true };
  } catch {
    return null;
  }
}

/** Modelo e dados escolhidos na galeria antes de criar a conta. */
export async function readDraft(): Promise<Record<string, string>> {
  return { ...(parseDraft((await cookies()).get(DRAFT_COOKIE)?.value)?.draft ?? {}) };
}

/**
 * Chamado nas actions de login/cadastro: diz se há um rascunho novo que ainda não levou a pessoa ao editor
 * e, nesse caso, já o marca como usado. Assim o login seguinte cai no painel, não num "Novo convite" antigo.
 */
export async function takeDraft(): Promise<boolean> {
  const jar = await cookies();
  const found = parseDraft(jar.get(DRAFT_COOKIE)?.value);
  if (!found) {
    if (jar.has(DRAFT_COOKIE)) jar.delete(DRAFT_COOKIE);
    return false;
  }
  if (found.seen) return false;
  jar.set(DRAFT_COOKIE, draftCookie(found.draft, found.at, true), { ...draftCookieOptions, maxAge: Math.max(60, DRAFT_MAX_AGE - Math.round((Date.now() - found.at) / 1000)) });
  return true;
}
