export type RsvpStatus = "pending" | "yes" | "no";

export const peopleText = (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`;

/** O que o convidado lê (e o leitor de tela anuncia) depois de responder. */
export function answerText(status: RsvpStatus, people: number, maxPeople: number): { title: string; line: string } {
  if (status === "yes") {
    return {
      title: maxPeople > 1 ? `Presença confirmada: ${peopleText(Math.max(people, 1))}` : "Presença confirmada",
      line: maxPeople > 1 && people > 1 ? "Que alegria! Esperamos vocês." : "Que alegria! Esperamos você.",
    };
  }
  return { title: "Resposta registrada", line: "Você avisou que não poderá ir. Que pena! Obrigado por avisar." };
}
