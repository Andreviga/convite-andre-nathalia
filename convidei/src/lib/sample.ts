import { TEMPLATE_DEFS, templateDef } from "../templates/index";
import { EVENT_TYPES, eventType } from "./catalog.ts";
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

export type SampleOptions = { type?: string; title?: string; date?: string; palette?: string };

export function sampleEvent(templateId: string, options: SampleOptions = {}): EventRow {
  const tpl = templateDef(templateId);
  const known = EVENT_TYPES.some((t) => t.id === options.type);
  const type = eventType(known ? options.type! : (tpl.suits[0] ?? "casamento"));
  return {
    id: "exemplo",
    user_id: "exemplo",
    slug: "exemplo",
    type: type.id,
    template: tpl.id,
    palette: options.palette ?? "",
    title: options.title?.trim() || (TITLES[type.id] ?? "Marina & Rafael"),
    headline: type.headline,
    message: type.message,
    event_date: options.date && /^\d{4}-\d{2}-\d{2}$/.test(options.date) ? options.date : nextYear(9, 11),
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

export const SAMPLE_TEMPLATE_IDS = TEMPLATE_DEFS.map((t) => t.id);
