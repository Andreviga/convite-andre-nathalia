export type EventType = {
  id: string;
  label: string;
  emoji: string;
  titleLabel: string;
  titlePlaceholder: string;
  headline: string;
  message: string;
  template: string;
};

export const EVENT_TYPES: EventType[] = [
  {
    id: "casamento",
    label: "Casamento",
    emoji: "💍",
    titleLabel: "Nomes do casal",
    titlePlaceholder: "André & Nathália",
    headline: "Com a bênção de Deus e de nossas famílias",
    message: "convidam para a celebração de seu casamento",
    template: "classico",
  },
  {
    id: "aniversario",
    label: "Aniversário",
    emoji: "🎂",
    titleLabel: "Nome do aniversariante (ou da festa)",
    titlePlaceholder: "Helena faz 30",
    headline: "Vai ter festa",
    message: "Venha comemorar comigo. Sua presença é o melhor presente (mas o Pix também é bem-vindo).",
    template: "festa",
  },
  {
    id: "quinze-anos",
    label: "15 anos",
    emoji: "👑",
    titleLabel: "Nome da debutante",
    titlePlaceholder: "Maria Clara",
    headline: "Meus 15 anos",
    message: "Tenho a alegria de convidar você para celebrar comigo esta noite tão esperada.",
    template: "debutante",
  },
  {
    id: "cha",
    label: "Chá de bebê ou revelação",
    emoji: "🍼",
    titleLabel: "Nome do chá",
    titlePlaceholder: "Chá do Miguel",
    headline: "Estamos esperando por você",
    message: "Venha celebrar com a gente a chegada do nosso bebê.",
    template: "doce",
  },
  {
    id: "formatura",
    label: "Formatura",
    emoji: "🎓",
    titleLabel: "Nome do formando ou da turma",
    titlePlaceholder: "Formatura de Direito — Turma 2026",
    headline: "Chegou o grande dia",
    message: "Depois de tanta dedicação, quero comemorar esta conquista com quem fez parte dela.",
    template: "moderno",
  },
  {
    id: "outro",
    label: "Outro evento",
    emoji: "✨",
    titleLabel: "Nome do evento",
    titlePlaceholder: "Confraternização da empresa",
    headline: "Você é nosso convidado",
    message: "Será um prazer receber você.",
    template: "classico",
  },
];

export function eventType(id: string): EventType {
  return EVENT_TYPES.find((t) => t.id === id) ?? EVENT_TYPES[EVENT_TYPES.length - 1];
}
