import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { template } from "@/lib/catalog";
import { eventBySlug } from "@/lib/events";
import { longDate, prettyTime } from "@/lib/format";

// Prévia que aparece no WhatsApp quando o link do convite é enviado.
export const alt = "Convite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await eventBySlug(slug);
  const [bg, ink, accent] = template(event?.template ?? "classico").swatch;
  const [display, italic] = await Promise.all([
    readFile(join(process.cwd(), "assets/cormorant-600.woff")),
    readFile(join(process.cwd(), "assets/cormorant-500-italic.woff")),
  ]);
  const title = event?.title ?? "Convite";
  const time = event ? prettyTime(event.event_time) : "";
  const when = event ? `${longDate(event.event_date)}${time ? ` · ${time}` : ""}` : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: bg, padding: 36 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${accent}`,
            color: ink,
            textAlign: "center",
            padding: "0 70px",
          }}
        >
          {event?.headline ? (
            <div style={{ fontFamily: "Italic", fontSize: 36, color: ink, opacity: 0.75, marginBottom: 12 }}>{event.headline}</div>
          ) : null}
          <div style={{ fontFamily: "Display", fontSize: title.length > 22 ? 84 : 124, lineHeight: 1.05 }}>{title}</div>
          <div style={{ width: 120, height: 2, background: accent, margin: "30px 0" }} />
          <div style={{ fontFamily: "Display", fontSize: 46 }}>{when}</div>
          <div style={{ fontFamily: "Italic", fontSize: 32, opacity: 0.75, marginTop: 14 }}>Toque para abrir e confirmar presença</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 600, style: "normal" },
        { name: "Italic", data: italic, weight: 500, style: "italic" },
      ],
    },
  );
}
