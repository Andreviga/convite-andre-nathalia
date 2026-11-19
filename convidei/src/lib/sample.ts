import { EVENT_TYPES, TEMPLATES, eventType, template } from "./catalog.ts";
import type { EventRow, GuestRow } from "./events.ts";

// Dados de exemplo para mostrar cada modelo sem precisar de um evento real (galeria e prévias).
const TITLES: Record<string, string> = {
  casamento: "Marina & Rafael",
  aniversario: "Helena faz 30",
  "quinze-anos": "Sofia",
  cha: "Chá do Miguel",
  formatura: "Lucas Andrade",
  outro: "Jantar de fim de ano",
};

function nextYear(month: number, day: number): string {
  const year = new Date().getUTCFullYear() + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function sampleEvent(templateId: string, typeId?: string): EventRow {
  const tpl = template(templateId);
  const type = eventType(typeId ?? EVENT_TYPES.find((t) => t.template === tpl.id)?.id ?? "casamento");
  return {
    id: "exemplo",
    user_id: "exemplo",
    slug: "exemplo",
    type: type.id,
    template: tpl.id,
    title: TITLES[type.id] ?? "Marina & Rafael",
    headline: type.headline,
    message: type.message,
    event_date: nextYear(9, 11),
    event_time: "16:30",
    venue_name: "Espaço Villa Jardim",
    address: "Rua das Flores, 123 — Jardins, São Paulo/SP",
    dress_code: "Esporte fino",
    rsvp_deadline: nextYear(8, 20),
    extra_info: "Estacionamento com manobrista no local.",
    gift_message: "Sua presença é o nosso maior presente. Se quiser nos presentear, deixamos uma sugestão.",
    gift_links: [{ label: "Lista de presentes", url: "https://example.com/" }],
    pix_key_type: "",
    pix_key: "",
    pix_holder: "",
    pix_city: "",
    open_rsvp: true,
    plan: "premium",
    upgrade_requested_at: null,
    created_at: new Date(0),
  };
}

export function sampleGuest(): GuestRow {
  return {
    id: "exemplo", event_id: "exemplo", token: "exemplo", name: "Família Oliveira", phone: "", max_people: 4, status: "pending",
    people_count: 0, note: "", source: "host", sent_at: null, opened_at: null, open_count: 0, responded_at: null, created_at: new Date(0),
  };
}

export const SAMPLE_TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
