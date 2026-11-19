// Lista de convidados colada pelo anfitrião: uma linha por convite, "nome; celular; pessoas".

export type NewGuest = { name: string; phone: string; maxPeople: number };

export function peopleCount(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1;
}

const NUMERIC = /^[\d\s().+-]+$/; // telefone ou número de pessoas

/**
 * Separa as células de uma linha. Ponto e vírgula e tabulação (planilha) sempre separam.
 * A vírgula só separa quando o que vem depois dela é telefone ou número ("Maria, 11 97777-6666, 2"),
 * para "Silva, João" continuar sendo um nome.
 */
function cells(line: string): string[] {
  const parts = line.split(/[;\t]/).map((cell) => cell.trim());
  if (parts.length > 1) return parts;
  const byComma = line.split(",").map((cell) => cell.trim());
  if (byComma.length < 2) return parts;
  // Junta de volta as vírgulas que fazem parte do nome; só o final numérico vira célula.
  let tail = byComma.length;
  while (tail > 1 && byComma.length - tail < 2 && NUMERIC.test(byComma[tail - 1])) tail--;
  if (tail === byComma.length) return parts;
  return [byComma.slice(0, tail).join(", "), ...byComma.slice(tail)];
}

/** Devolve null para linha vazia ou sem nome. Aceita "Nome; telefone; pessoas", "Nome; pessoas" e só "Nome". */
export function parseGuestLine(line: string): NewGuest | null {
  const [name = "", second = "", third = ""] = cells(line);
  if (name.length < 2) return null;
  const secondIsCount = /^\d{1,2}$/.test(second);
  return {
    name: name.slice(0, 80),
    phone: secondIsCount ? "" : second.replace(/\D/g, "").slice(0, 15),
    maxPeople: peopleCount(secondIsCount ? second : third),
  };
}
