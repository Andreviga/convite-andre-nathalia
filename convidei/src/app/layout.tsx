import type { Metadata, Viewport } from "next";
import { BRAND, TAGLINE } from "@/lib/brand";
import { ENVELOPE_SEEN_SCRIPT } from "@/lib/envelope";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  title: { default: `${BRAND} — convite digital com confirmação de presença`, template: `%s · ${BRAND}` },
  description: `${TAGLINE} Crie um convite em link que abre igual em qualquer celular, com confirmação de presença, lista de presentes e Pix.`,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf6f0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script abaixo pode pôr a classe env-seen em <html> antes de o React assumir a página.
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Convite com envelope já aberto nesta visita: esconde o envelope antes da primeira pintura (ver lib/envelope.ts). */}
        <script dangerouslySetInnerHTML={{ __html: ENVELOPE_SEEN_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
