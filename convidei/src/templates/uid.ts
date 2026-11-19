import { useId } from "react";

/**
 * Sufixo único por instância para ids de SVG (<pattern>, <linearGradient>, <filter>...).
 * O mesmo modelo aparece várias vezes na mesma página (miniaturas, prévia, capa e assinatura), cada vez com uma paleta;
 * com ids repetidos, url(#id) aponta sempre para a primeira ocorrência do documento e pega as cores erradas.
 */
export function useUid(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}
