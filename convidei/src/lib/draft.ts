import { cookies } from "next/headers";

export const DRAFT_COOKIE = "convidei_rascunho";

/** Modelo e dados escolhidos na galeria antes de criar a conta. */
export async function readDraft(): Promise<Record<string, string>> {
  const raw = (await cookies()).get(DRAFT_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const draft: Record<string, string> = {};
    for (const key of ["template", "palette", "type", "title", "event_date"]) {
      if (typeof parsed[key] === "string" && parsed[key]) draft[key] = (parsed[key] as string).slice(0, 80);
    }
    return draft;
  } catch {
    return {};
  }
}
