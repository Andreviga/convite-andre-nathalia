import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventBySlug } from "@/lib/events";
import { longDate, prettyTime } from "@/lib/format";
import "../../invite.css";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  if (!event) return { title: "Convite não encontrado" };
  const time = prettyTime(event.event_time);
  const where = event.venue_name || event.address;
  const description = [`${longDate(event.event_date)}${time ? `, às ${time}` : ""}`, where, "Toque para ver o convite e confirmar presença."]
    .filter(Boolean)
    .join(" · ");
  return {
    title: { absolute: `${event.title} — Convite` },
    description,
    robots: { index: false, follow: false },
    openGraph: { title: event.title, description, type: "website", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title: event.title, description },
  };
}

export default async function InviteLayout({ params, children }: Props) {
  const { slug } = await params;
  if (!(await eventBySlug(slug))) notFound();
  return children;
}
