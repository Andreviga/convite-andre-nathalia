import { cache } from "react";
import { one, q } from "./db";

export type GiftLink = { label: string; url: string };

export type EventRow = {
  id: string;
  user_id: string;
  slug: string;
  type: string;
  template: string;
  title: string;
  headline: string;
  message: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  address: string;
  dress_code: string;
  rsvp_deadline: string;
  extra_info: string;
  gift_message: string;
  gift_links: GiftLink[];
  pix_key_type: string;
  pix_key: string;
  pix_holder: string;
  pix_city: string;
  open_rsvp: boolean;
  plan: string;
  upgrade_requested_at: Date | null;
  created_at: Date;
};

export type GuestRow = {
  id: string;
  event_id: string;
  token: string;
  name: string;
  phone: string;
  max_people: number;
  status: "pending" | "yes" | "no";
  people_count: number;
  note: string;
  source: "host" | "open";
  sent_at: Date | null;
  opened_at: Date | null;
  open_count: number;
  responded_at: Date | null;
  created_at: Date;
};

export const eventBySlug = cache((slug: string) => one<EventRow>("select * from events where slug = $1", [slug]));

export function eventForUser(id: string, userId: string) {
  return one<EventRow>("select * from events where id = $1 and user_id = $2", [id, userId]);
}

export function guestByToken(eventId: string, token: string) {
  return one<GuestRow>("select * from guests where event_id = $1 and token = $2", [eventId, token]);
}

export function guestsOf(eventId: string) {
  return q<GuestRow>("select * from guests where event_id = $1 order by created_at, name", [eventId]);
}

export async function guestCount(eventId: string): Promise<number> {
  const row = await one<{ n: number }>("select count(*)::int as n from guests where event_id = $1", [eventId]);
  return row?.n ?? 0;
}

export type Stats = { invites: number; sent: number; opened: number; yes: number; no: number; pending: number; people: number };

export function statsOf(guests: GuestRow[]): Stats {
  const stats: Stats = { invites: guests.length, sent: 0, opened: 0, yes: 0, no: 0, pending: 0, people: 0 };
  for (const g of guests) {
    if (g.sent_at) stats.sent++;
    if (g.opened_at) stats.opened++;
    if (g.status === "yes") {
      stats.yes++;
      stats.people += g.people_count;
    } else if (g.status === "no") stats.no++;
    else stats.pending++;
  }
  return stats;
}

export function rsvpClosed(event: Pick<EventRow, "rsvp_deadline" | "event_date">, today: string): boolean {
  return today > (event.rsvp_deadline || event.event_date);
}
