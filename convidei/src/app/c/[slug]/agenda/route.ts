import { eventBySlug } from "@/lib/events";
import { eventCalendarTitle, icsFile } from "@/lib/format";
import { baseUrl } from "@/lib/url";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  if (!event) return new Response("Convite não encontrado", { status: 404 });
  const body = icsFile({
    uid: event.id,
    title: eventCalendarTitle(event.type, event.title),
    date: event.event_date,
    time: event.event_time,
    location: [event.venue_name, event.address].filter(Boolean).join(", "),
    details: event.message,
    url: `${await baseUrl()}/c/${event.slug}`,
  });
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `inline; filename="${event.slug}.ics"` },
  });
}
