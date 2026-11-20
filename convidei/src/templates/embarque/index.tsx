import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Embarque: papelaria formal gravada. Eixo central, moldura dupla, nomes em caligrafia copperplate, uma só cor de tinta.

// Floreios desenhados como traço de pena: forma preenchida que engrossa na curva e afina nas pontas, voluta com terminal em gota.
// (Contornos gerados a partir de uma espiral e duas curvas de Bézier com largura variável; metade direita, a esquerda é espelhada.)
const SCROLL_TOP = "M131 10.05L130.3 10.06L129.56 10.2L128.85 10.48L128.19 10.92L127.62 11.5L127.16 12.21L126.85 13.02L126.71 13.91L126.75 14.84L127 15.76L127.45 16.64L128.09 17.43L128.91 18.08L129.88 18.57L130.96 18.85L132.1 18.9L133.27 18.7L134.4 18.25L135.43 17.55L136.32 16.62L137.02 15.5L137.48 14.22L137.66 12.84L137.55 11.42L137.13 10.01L136.4 8.69L135.39 7.52L134.13 6.57L132.66 5.89L131.04 5.52L129.34 5.5L127.64 5.84L126.01 6.55L124.53 7.61L123.27 8.99L122.31 10.63L121.71 12.48L121.5 14.45L121.71 16.47L122.36 18.44L123.42 20.27L124.87 21.86L126.66 23.14L128.71 24.04L130.96 24.5L133 24.61L134.99 24.48L136.96 24.19L138.92 23.74L140.86 23.18L142.8 22.51L144.72 21.77L146.63 20.96L148.54 20.11L150.46 19.24L152.38 18.37L154.32 17.51L156.27 16.69L158.25 15.92L160.26 15.21L162.3 14.58L164.39 14.06L166.53 13.65L168.73 13.38L171.01 13.25L173.02 13.27L175.05 13.41L177.08 13.65L179.14 13.98L181.22 14.39L183.33 14.87L185.47 15.4L187.66 15.97L189.89 16.57L192.18 17.18L194.52 17.79L196.92 18.38L199.38 18.95L201.92 19.48L204.54 19.95L207.24 20.35L210.03 20.68L212.92 20.91L215.9 21.04L219 21.06L219 20.94L215.91 20.83L212.94 20.58L210.09 20.23L207.33 19.77L204.68 19.24L202.11 18.63L199.62 17.98L197.21 17.28L194.86 16.56L192.57 15.82L190.33 15.09L188.13 14.37L185.96 13.67L183.82 13.02L181.69 12.42L179.57 11.89L177.44 11.44L175.31 11.09L173.17 10.86L170.99 10.75L168.54 10.8L166.16 11.02L163.84 11.4L161.59 11.91L159.4 12.54L157.27 13.27L155.2 14.07L153.19 14.93L151.22 15.83L149.29 16.76L147.4 17.68L145.55 18.59L143.71 19.47L141.9 20.3L140.1 21.07L138.31 21.76L136.52 22.36L134.71 22.85L132.88 23.22L131.04 23.5L129 23.1L127.13 22.3L125.5 21.15L124.17 19.71L123.19 18.06L122.59 16.28L122.38 14.45L122.56 12.66L123.09 10.98L123.95 9.48L125.08 8.22L126.41 7.25L127.88 6.6L129.42 6.28L130.96 6.28L132.42 6.6L133.75 7.21L134.9 8.06L135.82 9.1L136.48 10.29L136.87 11.55L136.98 12.83L136.82 14.07L136.42 15.22L135.81 16.23L135.02 17.06L134.1 17.69L133.09 18.1L132.06 18.28L131.04 18.25L130.09 18.01L129.23 17.59L128.5 17.01L127.93 16.32L127.53 15.55L127.3 14.75L127.25 13.94L127.37 13.16L127.64 12.45L128.03 11.83L128.53 11.32L129.1 10.94L129.71 10.69L130.35 10.56L131 10.55Z";
const SCROLL_BOTTOM = "M87.99 12.15L88.53 12.17L89.1 12.1L89.69 11.91L90.25 11.6L90.75 11.16L91.17 10.59L91.48 9.93L91.65 9.18L91.65 8.38L91.49 7.56L91.13 6.76L90.6 6.03L89.89 5.4L89.04 4.92L88.06 4.62L87.01 4.53L85.92 4.67L84.84 5.05L83.84 5.67L82.96 6.52L82.26 7.57L81.78 8.78L81.56 10.11L81.63 11.5L82 12.89L82.67 14.21L83.64 15.39L84.87 16.37L86.32 17.09L87.95 17.5L89.39 17.58L90.77 17.5L92.14 17.29L93.48 16.97L94.81 16.57L96.12 16.09L97.41 15.56L98.7 14.99L99.98 14.39L101.26 13.77L102.54 13.15L103.83 12.55L105.12 11.97L106.44 11.42L107.78 10.92L109.14 10.48L110.54 10.11L111.97 9.83L113.46 9.63L115 9.54L116.57 9.55L118.11 9.64L119.64 9.81L121.15 10.04L122.65 10.33L124.16 10.66L125.67 11.04L127.2 11.45L128.75 11.87L130.33 12.31L131.94 12.74L133.59 13.17L135.29 13.58L137.04 13.95L138.85 14.29L140.72 14.58L142.66 14.8L144.69 14.97L146.8 15.05L149 15.06L149 14.94L146.81 14.85L144.71 14.67L142.71 14.41L140.8 14.07L138.97 13.68L137.2 13.24L135.5 12.76L133.85 12.25L132.24 11.73L130.67 11.19L129.13 10.66L127.6 10.13L126.08 9.62L124.56 9.14L123.04 8.7L121.49 8.31L119.93 7.98L118.33 7.72L116.69 7.55L115 7.46L113.3 7.49L111.65 7.65L110.06 7.92L108.52 8.28L107.04 8.73L105.6 9.25L104.2 9.82L102.85 10.44L101.53 11.08L100.24 11.73L98.98 12.39L97.75 13.03L96.53 13.65L95.33 14.24L94.13 14.78L92.93 15.26L91.73 15.68L90.52 16.03L89.28 16.29L88.05 16.5L86.65 16.17L85.37 15.56L84.28 14.73L83.42 13.71L82.81 12.57L82.47 11.36L82.39 10.15L82.56 8.99L82.96 7.93L83.56 7.01L84.31 6.26L85.17 5.71L86.09 5.36L87.03 5.23L87.94 5.29L88.78 5.53L89.52 5.94L90.13 6.46L90.6 7.08L90.91 7.75L91.06 8.44L91.07 9.12L90.94 9.75L90.69 10.31L90.35 10.79L89.93 11.16L89.47 11.43L88.99 11.6L88.5 11.66L88.01 11.65Z";

function Flourish() {
  const u = useUid();
  return (
    <svg viewBox="0 0 220 28" width="204" height="26" fill="currentColor">
      <g id={`embarque-scroll-top-${u}`}>
        <path d={SCROLL_TOP} />
        <circle cx="131" cy="10.3" r="1.25" />
      </g>
      <use href={`#embarque-scroll-top-${u}`} transform="translate(220 0) scale(-1 1)" />
      <path d="M110 7.5l4.6 6.5-4.6 6.5-4.6-6.5z" />
    </svg>
  );
}

// Rodapé: variante menor, de uma volta só, virada para cima e com um ponto no centro (não é o espelho do topo).
function FlourishSmall() {
  const u = useUid();
  return (
    <svg viewBox="0 0 160 20" width="148" height="18.5" fill="currentColor">
      <g transform="translate(0 20) scale(1 -1)">
        <g id={`embarque-scroll-bottom-${u}`}>
          <path d={SCROLL_BOTTOM} />
          <circle cx="88" cy="11.9" r="1" />
        </g>
        <use href={`#embarque-scroll-bottom-${u}`} transform="translate(160 0) scale(-1 1)" />
        <circle cx="80" cy="12" r="1.6" />
      </g>
    </svg>
  );
}

// Divisor: dois fios que afinam para fora, losango cheio e dois pontos.
function Rule() {
  return (
    <svg viewBox="0 0 132 10" width="118" height="9" fill="currentColor">
      <path d="M2 5L50 4.3v1.4zM130 5L82 4.3v1.4z" />
      <circle cx="56" cy="5" r="0.9" />
      <circle cx="76" cy="5" r="0.9" />
      <path d="M66 0.8l3 4.2-3 4.2-3-4.2z" />
    </svg>
  );
}

// Forro do envelope: treliça de losangos com florão de quatro pétalas, e uma margem de papel com filete junto às bordas da aba.
function Liner() {
  const u = useUid();
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`embarque-liner-${u}`} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 13L13 0l13 13-13 13z" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M13 7.4c2.3 1.8 2.3 3.8 0 5.6-2.3-1.8-2.3-3.8 0-5.6zM13 18.6c-2.3-1.8-2.3-3.8 0-5.6 2.3 1.8 2.3 3.8 0 5.6zM7.4 13c1.8-2.3 3.8-2.3 5.6 0-1.8 2.3-3.8 2.3-5.6 0zM18.6 13c-1.8 2.3-3.8 2.3-5.6 0 1.8-2.3 3.8-2.3 5.6 0z" fill="currentColor" />
          <circle cx="0" cy="0" r="1.2" fill="currentColor" />
          <circle cx="26" cy="0" r="1.2" fill="currentColor" />
          <circle cx="0" cy="26" r="1.2" fill="currentColor" />
          <circle cx="26" cy="26" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#embarque-liner-${u})`} />
      {/* a aba é um triângulo (0,0) (100%,0) (50%,58%): margem de papel e filete acompanhando as duas bordas */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" fill="none">
        <path className="embarque-liner-rule" d="M0 0L50 58L100 0" vectorEffect="non-scaling-stroke" />
        <path className="embarque-liner-edge" d="M0 0L50 58L100 0" vectorEffect="non-scaling-stroke" />
      </svg>
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Flourish />;
  if (slot === "divider") return <Rule />;
  if (slot === "bottom") return <FlourishSmall />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "embarque",
  name: "Embarque",
  description: "Papel marfim, moldura dupla e nomes em caligrafia",
  premium: false,
  suits: ["casamento", "outro"],
  palettes: [
    { id: "marfim", name: "Marfim e ouro", vars: { bg: "#E9E1D2", paper: "#FBF7EE", ink: "#2B2622", soft: "#665B4E", accent: "#A6864B", line: "#CDBE9F", btnInk: "#FFFFFF", seal: "#7A1F2B", sealInk: "#F1D9B5", liner: "#E8DCC4" } },
    { id: "marinho", name: "Marinho", vars: { bg: "#DCE1E9", paper: "#FAFAF6", ink: "#1B2A41", soft: "#53607A", accent: "#9A8250", line: "#BFC8D6", btnInk: "#FFFFFF", seal: "#1B2A41", sealInk: "#E9D9B0", liner: "#C9D2E0" } },
    { id: "verde", name: "Verde garrafa", vars: { bg: "#E0E5DA", paper: "#FAF8F0", ink: "#2A3A30", soft: "#59685C", accent: "#A6864B", line: "#C4CDBC", btnInk: "#FFFFFF", seal: "#2A3A30", sealInk: "#EADBB4", liner: "#CFD8C6" } },
    { id: "preto", name: "Preto e branco", vars: { bg: "#E6E3DE", paper: "#FCFBF8", ink: "#1C1C1C", soft: "#5C5853", accent: "#77715F", line: "#CFCAC0", btnInk: "#FFFFFF", seal: "#1C1C1C", sealInk: "#EDE6D6", liner: "#D8D4CC" } },
  ],
  Art,
};
