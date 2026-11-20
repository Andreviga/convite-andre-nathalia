// Envelope de abertura: chave que lembra "já abri" e pequenas contas do lacre.

const PREFIX = "convidei:envelope:";

/**
 * Chave do sessionStorage que lembra que o envelope já foi aberto nesta visita.
 * Convite real: uma por evento (o link geral e o link pessoal são o mesmo envelope: quem confirma pelo geral e cai no
 * pessoal não abre de novo). Demonstração: uma por modelo.
 */
export function envelopeKey(kind: "event" | "demo", id: string) {
  return PREFIX + (kind === "demo" ? "demo:" : "") + id;
}

/**
 * Roda no <head>, antes de a página aparecer: quem já abriu o envelope nesta visita não o vê piscar ao recarregar.
 * Deduz a chave pelo endereço (/c/<slug>/... e /modelos/<id>), igual a envelopeKey. Fica no layout raiz, fora dos
 * componentes cliente: script dentro de componente cliente não roda na navegação e gera aviso do React.
 */
export const ENVELOPE_SEEN_SCRIPT = `try{var m=location.pathname.match(/^\\/(c|modelos)\\/([^\\/]+)/);if(m&&sessionStorage.getItem(${JSON.stringify(PREFIX)}+(m[1]==="c"?"":"demo:")+decodeURIComponent(m[2]))==="1")document.documentElement.classList.add("env-seen")}catch(e){}`;

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * O contorno escuro atrás das iniciais do lacre só ajuda quando a tinta é clara e a cera não é escura o bastante
 * (contraste abaixo de 4,5:1). Com tinta escura sobre cera clara ele tem a cor da própria tinta e embola as letras.
 */
export function sealNeedsEdge(seal: string, ink: string) {
  const wax = luminance(seal);
  const letter = luminance(ink);
  if (wax === null || letter === null) return true;
  if (letter <= wax) return false;
  return (letter + 0.05) / (wax + 0.05) < 4.5;
}
