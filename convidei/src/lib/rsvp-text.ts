export type RsvpStatus = "pending" | "yes" | "no";

export const peopleText = (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`;

/**
 * A resposta fala de mais de uma pessoa? Convite do anfitrião para uma família: sempre. Quem respondeu pelo link geral
 * tem teto de 6 só para poder mudar o número depois: aí vale o último número que a pessoa informou.
 */
export function isGroup(people: number, maxPeople: number, viaOpenLink = false): boolean {
  return maxPeople > 1 && (viaOpenLink ? people > 1 : true);
}

/** O que o convidado lê (e o leitor de tela anuncia) depois de responder. */
export function answerText(status: RsvpStatus, people: number, maxPeople: number, viaOpenLink = false): { title: string; line: string } {
  if (status === "yes") {
    return {
      title: maxPeople > 1 ? `Presença confirmada: ${peopleText(Math.max(people, 1))}` : "Presença confirmada",
      line: maxPeople > 1 && people > 1 ? "Que alegria! Esperamos vocês." : "Que alegria! Esperamos você.",
    };
  }
  const line = isGroup(people, maxPeople, viaOpenLink) ? "Vocês avisaram que não poderão ir. Que pena! Obrigado por avisar." : "Você avisou que não poderá ir. Que pena! Obrigado por avisar.";
  return { title: "Resposta registrada", line };
}
