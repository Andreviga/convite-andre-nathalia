import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Invite } from "@/components/Invite";
import { EVENT_TYPES, TEMPLATES } from "@/lib/catalog";
import { sampleEvent, sampleGuest } from "@/lib/sample";
import "../../invite.css";

export const metadata: Metadata = { title: "Prévia do modelo", robots: { index: false } };

// Prévia de um modelo com dados de exemplo: /modelos/botanico?tipo=casamento
export default async function TemplatePreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string }> }) {
  const { id } = await params;
  if (!TEMPLATES.some((t) => t.id === id)) notFound();
  const { tipo } = await searchParams;
  const type = EVENT_TYPES.some((t) => t.id === tipo) ? tipo : undefined;
  return <Invite event={sampleEvent(id, type)} guest={sampleGuest()} preview />;
}
