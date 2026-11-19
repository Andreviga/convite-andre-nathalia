"use client";

import { useEffect } from "react";
import { markOpened } from "@/app/actions";

// Registra a abertura só quando a página roda de verdade no celular do convidado.
// O robô de prévia do WhatsApp não executa JavaScript, então não conta como "abriu".
export function OpenBeacon({ slug, token }: { slug: string; token: string }) {
  useEffect(() => {
    const key = `convidei:aberto:${slug}:${token}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sem sessionStorage: conta mesmo assim */
    }
    void markOpened(slug, token);
  }, [slug, token]);
  return null;
}
