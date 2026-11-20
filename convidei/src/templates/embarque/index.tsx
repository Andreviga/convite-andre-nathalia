import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Embarque: o convite é um cartão de embarque vertical. Faixa de companhia aérea no topo, rota entre as iniciais com o avião
// no meio, campos rotulados (o CSS rotula nomes, data, hora e local), linha picotada com meias-luas recortadas e, abaixo
// dela, o canhoto: portão, assento, classe, código de barras e o carimbo de embarque.

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Textos decorativos por tipo de evento: nome do "voo", destino quando o título tem uma inicial só, e classe do canhoto. */
const FLIGHT: Record<string, { tag: string; dest: string; gate: string }> = {
  casamento: { tag: "Voo do sim", dest: "SIM", gate: "Amor" },
  aniversario: { tag: "Voo da festa", dest: "FESTA", gate: "Festa" },
  "quinze-anos": { tag: "Voo dos quinze", dest: "XV", gate: "Valsa" },
  cha: { tag: "Voo da cegonha", dest: "CHÁ", gate: "Colo" },
  formatura: { tag: "Voo da conquista", dest: "GRAU", gate: "Beca" },
  outro: { tag: "Voo direto", dest: "FESTA", gate: "01" },
};
const flightOf = (eventType?: string) => FLIGHT[eventType ?? ""] ?? FLIGHT.outro;

/**
 * Avião visto de cima, apontando para a direita, numa caixa de 64 × 64. Silhueta cheia em camadas: asas e estabilizadores
 * por baixo, turbinas, fuselagem por cima, e os detalhes (cabine, faixa das janelas) abertos na cor de trás (`cut`).
 */
function Plane({ cut }: { cut: string }) {
  return (
    <>
      {/* asas em flecha */}
      <path d="M41.5 28.4L28.6 4.6c-.5-.9-1.4-1.4-2.4-1.4h-3.4c-.9 0-1.5.9-1.2 1.7l8 23.5zM41.5 35.6L28.6 59.4c-.5.9-1.4 1.4-2.4 1.4h-3.4c-.9 0-1.5-.9-1.2-1.7l8-23.5z" />
      {/* estabilizadores */}
      <path d="M14.6 29.4L8.9 19.3c-.4-.7-1.1-1.1-1.9-1.1H5.3c-.7 0-1.2.7-1 1.4l3 9.8zM14.6 34.6L8.9 44.7c-.4.7-1.1 1.1-1.9 1.1H5.3c-.7 0-1.2-.7-1-1.4l3-9.8z" />
      {/* turbinas */}
      <rect x="29.4" y="14.3" width="9.6" height="4.2" rx="2.1" />
      <rect x="29.4" y="45.5" width="9.6" height="4.2" rx="2.1" />
      {/* fuselagem: nariz arredondado, cauda afinada */}
      <path d="M3.2 32c0-1.5 1.6-2.6 4.6-2.9l37.4-1.9c8.4 0 15.6 2 15.6 4.8s-7.2 4.8-15.6 4.8L7.8 34.9c-3-.3-4.6-1.4-4.6-2.9z" />
      {/* cabine e faixa das janelas */}
      <path d="M54.3 29.9c1.6.5 2.7 1.2 3 2.1-.3.9-1.4 1.6-3 2.1-.5-.6-.8-1.3-.8-2.1s.3-1.5.8-2.1z" style={{ fill: cut }} />
      <path d="M15 31.35h34.5v1.3H15z" style={{ fill: cut }} opacity="0.55" />
    </>
  );
}

/** Código de barras decorativo: larguras sorteadas a partir das iniciais (cada convite tem o seu), sempre o mesmo desenho. */
function barcode(seed: string, width: number): { x: number; w: number }[] {
  let s = 7;
  for (const ch of seed || "convite") s = (s * 31 + ch.charCodeAt(0)) % 2147483647;
  const next = () => (s = (s * 48271) % 2147483647);
  const bars: { x: number; w: number }[] = [];
  // guardas de início e fim, como num código de verdade
  let x = 0;
  for (const w of [1, 1]) {
    bars.push({ x, w });
    x += w + 1;
  }
  while (x < width - 6) {
    const w = [1, 1, 2, 1, 3, 2, 1, 4][next() % 8];
    bars.push({ x, w: Math.min(w, width - 4 - x) });
    x += w + [1, 2, 1, 1, 3][next() % 5];
  }
  bars.push({ x: width - 3, w: 1 }, { x: width - 1, w: 1 });
  return bars;
}

/** Miolo do carimbo, por tipo de evento (desenhado em torno de 0,0, cerca de 24 de largura). */
function StampIcon({ eventType, cut }: { eventType?: string; cut: string }) {
  if (eventType === "casamento")
    return (
      <>
        <path d="M0 10.4C-11.6 2.6-13 -4.6-8.9-8.5-5.5-11.7-1.5-10.2 0-6.6 1.5-10.2 5.5-11.7 8.9-8.5 13-4.6 11.6 2.6 0 10.4z" />
        <path d="M-6.9-5.6c1.2-1.4 2.9-1.6 4-.7" fill="none" style={{ stroke: cut }} strokeWidth="1.3" strokeLinecap="round" />
      </>
    );
  if (eventType === "aniversario") {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 12.4 : 5.2;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${r2(Math.cos(a) * r)} ${r2(Math.sin(a) * r)}`);
    }
    return <path d={`M${pts.join("L")}z`} strokeLinejoin="round" stroke="currentColor" strokeWidth="1.6" />;
  }
  if (eventType === "quinze-anos")
    return (
      <>
        <path d="M-11.6 5.4L-13 -6.2l6.6 5.6L0-10.4l6.4 9.8L13-6.2 11.6 5.4z" strokeLinejoin="round" stroke="currentColor" strokeWidth="1.2" />
        <rect x="-11.6" y="7.2" width="23.2" height="2.6" rx="1.3" />
        <circle cx="0" cy="-10.6" r="1.9" />
        <circle cx="-13" cy="-6.4" r="1.6" />
        <circle cx="13" cy="-6.4" r="1.6" />
      </>
    );
  if (eventType === "cha")
    return (
      <>
        <ellipse cx="0" cy="-3" rx="8.2" ry="9.6" />
        <path d="M-2.2 6.2h4.4L0 9.2z" />
        <path d="M0 9c-2.6 2.2 2.2 3 0 5.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M-4.6-7.4c1.2-1.8 2.8-2.6 4.4-2.4" fill="none" style={{ stroke: cut }} strokeWidth="1.3" strokeLinecap="round" />
      </>
    );
  if (eventType === "formatura")
    return (
      <>
        <path d="M0-9.6L14-3.6 0 2.4-14-3.6z" strokeLinejoin="round" stroke="currentColor" strokeWidth="1" />
        <path d="M-7.6 1.2v5.2c0 2.2 3.4 4 7.6 4s7.6-1.8 7.6-4V1.2L0 4.4z" />
        <path d="M11.4-2.6v8.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="11.4" cy="7" r="1.7" />
      </>
    );
  return (
    <g transform="rotate(-38) translate(-13.4 -13.4) scale(0.42)">
      <Plane cut={cut} />
    </g>
  );
}

/** Carimbo de embarque: anel duplo com legenda em arco, miolo por tipo de evento e as ondas do cancelamento à esquerda. */
function Postmark({ eventType }: { eventType?: string }) {
  const u = useUid();
  const cx = 104;
  const cy = 50;
  // onda preenchida: a borda de baixo tem amplitude menor que a de cima, então a espessura varia ao longo do traço
  const wave = (y: number, t: number) =>
    `M4 ${y}c7-5.4 13-5.4 19.4 0s12.4 5.4 19.4 0 12-5.4 18.4-.6l-.8 ${t}c-5.8-3.6-10.6-3.2-16.6.9-7.6 5.2-14.4 5-21-.3-5.6-4.5-11.2-4.6-17.6.3z`;
  return (
    <svg className="emb-postmark" viewBox="0 0 152 100" fill="currentColor" aria-hidden="true">
      <defs>
        <path id={`embarque-arc-${u}`} d={`M${cx} ${cy + 32.6}A32.6 32.6 0 1 1 ${cx + 0.01} ${cy + 32.6}`} />
      </defs>
      <g opacity="0.92">
        <path d={wave(31, 2.6)} />
        <path d={wave(43.5, 3.4)} />
        <path d={wave(56, 3.4)} />
        <path d={wave(68.5, 2.6)} />
        {/* o anel cobre o fim das ondas: disco na cor do papel, depois os dois fios */}
        <circle cx={cx} cy={cy} r="45" style={{ fill: "var(--paper)" }} />
        <path fillRule="evenodd" d={`M${cx - 45} ${cy}a45 45 0 1 0 90 0a45 45 0 1 0-90 0zM${cx - 41.6} ${cy}a41.6 41.6 0 1 1 83.2 0a41.6 41.6 0 1 1-83.2 0z`} />
        <path fillRule="evenodd" d={`M${cx - 23} ${cy}a23 23 0 1 0 46 0a23 23 0 1 0-46 0zM${cx - 21.8} ${cy}a21.8 21.8 0 1 1 43.6 0a21.8 21.8 0 1 1-43.6 0z`} />
        <text className="emb-postmark-text" textAnchor="start">
          <textPath href={`#embarque-arc-${u}`} textLength="196" lengthAdjust="spacing">
            EMBARQUE AUTORIZADO • CONVITE •
          </textPath>
        </text>
        <g transform={`translate(${cx} ${cy})`}>
          <StampIcon eventType={eventType} cut="var(--paper)" />
        </g>
      </g>
    </svg>
  );
}

/** Topo: faixa da "companhia" e a rota entre as iniciais. */
function Top({ initials, eventType }: { initials: string[]; eventType?: string }) {
  const flight = flightOf(eventType);
  const from = initials[0] ?? "C";
  const to = initials.length > 1 ? initials[1] : flight.dest;
  return (
    <div className="emb-top" aria-hidden="true">
      <div className="emb-band">
        <span className="emb-band-title">Cartão de embarque</span>
        <svg className="emb-band-plane" viewBox="0 0 64 64" fill="currentColor">
          <g transform="rotate(-38 32 32)">
            <Plane cut="var(--accent)" />
          </g>
        </svg>
      </div>
      <div className="emb-route">
        <span className="emb-code">{from}</span>
        <span className="emb-path">
          <svg className="emb-plane" viewBox="0 0 64 64" fill="currentColor">
            <Plane cut="var(--paper)" />
          </svg>
          <span className="emb-tag">{flight.tag}</span>
        </span>
        <span className="emb-code" data-len={to.length > 3 ? "long" : undefined}>
          {to}
        </span>
      </div>
    </div>
  );
}

/** Canhoto: campos de enfeite, código de barras e carimbo. */
function Stub({ initials, eventType }: { initials: string[]; eventType?: string }) {
  const flight = flightOf(eventType);
  const code = initials.join("") || "CV";
  const W = 150;
  return (
    <div className="emb-stub" aria-hidden="true">
      <div className="emb-fields">
        <span className="emb-field">
          <span className="emb-l">Portão</span>
          <span className="emb-v">{flight.gate}</span>
        </span>
        <span className="emb-field">
          <span className="emb-l">Assento</span>
          <span className="emb-v">Reservado</span>
        </span>
      </div>
      <svg className="emb-barcode" viewBox={`0 0 ${W} 40`} preserveAspectRatio="none" fill="currentColor">
        {barcode(code + (eventType ?? ""), W).map((b) => (
          <rect key={b.x} x={b.x} y="0" width={b.w} height="40" />
        ))}
      </svg>
      <span className="emb-serial">{`CNV ${code} 0001`}</span>
      <Postmark eventType={eventType} />
    </div>
  );
}

/** Assinatura do fecho (e ornamento de divisão): um trecho de rota pontilhada em arco, com o avião no alto. */
function RouteMark() {
  return (
    <svg className="emb-mark" viewBox="0 0 168 40" width="168" height="40" fill="currentColor" aria-hidden="true">
      <path d="M12 33C40 9 62 3 76 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 6.4" />
      <path d="M156 33C128 9 108 3 98 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 6.4" />
      {/* origem: anel; destino: marcador cheio */}
      <path fillRule="evenodd" d="M8 30a4.6 4.6 0 1 0 .01 0zM8 32.4a2.2 2.2 0 1 1-.01 0z" />
      <path d="M160 24.6c-3.6 0-6.2 2.7-6.2 6 0 4.4 6.2 8.8 6.2 8.8s6.2-4.4 6.2-8.8c0-3.3-2.6-6-6.2-6zm0 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z" />
      <g transform="translate(73.5 -9.5) scale(0.42)">
        <Plane cut="var(--paper)" />
      </g>
    </svg>
  );
}

/** Fundo: carta de rotas. Arcos pontilhados, marcadores de aeroporto, um anel de rumo e dois aviões pequenos. */
function Chart({ id }: { id: string }) {
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width="280" height="280" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <path d="M-20 214C60 120 150 96 300 150" strokeWidth="2" strokeDasharray="0.1 7" />
            <path d="M24 -10C70 80 170 150 290 30" strokeWidth="2" strokeDasharray="0.1 7" />
            <path d="M-10 62C40 40 80 44 122 78" strokeWidth="1.6" strokeDasharray="0.1 6" />
            <path d="M150 290C170 240 216 214 290 222" strokeWidth="1.6" strokeDasharray="0.1 6" />
            {/* anel de rumo */}
            <circle cx="208" cy="92" r="26" strokeWidth="1" />
            <circle cx="208" cy="92" r="20" strokeWidth="2.4" strokeDasharray="0.1 5.24" />
            <path d="M208 60v8M208 116v8M176 92h8M232 92h8" strokeWidth="1.4" />
          </g>
          <g fill="currentColor">
            <path d="M208 74l3.6 14.4L226 92l-14.4 3.6L208 110l-3.6-14.4L190 92l14.4-3.6z" />
            {/* aeroportos */}
            <path fillRule="evenodd" d="M56 172a5 5 0 1 0 .01 0zM56 174.6a2.4 2.4 0 1 1-.01 0z" />
            <path fillRule="evenodd" d="M122 78a5 5 0 1 0 .01 0zM122 80.6a2.4 2.4 0 1 1-.01 0z" />
            <circle cx="262" cy="216" r="3" />
            <circle cx="20" cy="20" r="2.4" />
            <g transform="translate(118 108) rotate(-24) scale(0.4)">
              <Plane cut="var(--bg)" />
            </g>
            <g transform="translate(40 252) rotate(-142) scale(0.3)">
              <Plane cut="var(--bg)" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Forro do envelope: revoada de aviõezinhos em fileiras desencontradas e a tarja de correio aéreo junto à dobra. */
function Liner({ u }: { u: string }) {
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`embarque-liner-${u}`} width="46" height="46" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <g transform="translate(1 3) rotate(-45 10 10) scale(0.31)">
              <Plane cut="var(--liner)" />
            </g>
            <g transform="translate(24 26) rotate(-45 10 10) scale(0.31)">
              <Plane cut="var(--liner)" />
            </g>
            <circle cx="34" cy="11" r="1.3" />
            <circle cx="11" cy="34" r="1.3" />
          </g>
        </pattern>
        <pattern id={`embarque-tarja-${u}`} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="28" height="28" style={{ fill: "var(--paper)" }} />
          <rect width="7" height="28" style={{ fill: "var(--accent)" }} />
          <rect x="14" width="7" height="28" style={{ fill: "var(--emb-second)" }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#embarque-liner-${u})`} />
      <rect y="93%" width="100%" height="7%" fill={`url(#embarque-tarja-${u})`} />
    </svg>
  );
}

function Art({ slot, initials, eventType }: ArtProps) {
  const u = useUid();
  if (slot === "top") return <Top initials={initials} eventType={eventType} />;
  if (slot === "divider") return <RouteMark />;
  if (slot === "bottom") return <Stub initials={initials} eventType={eventType} />;
  if (slot === "backdrop") return <Chart id={`embarque-chart-${u}`} />;
  if (slot === "liner") return <Liner u={u} />;
  return null;
}

export const def: TemplateDef = {
  id: "embarque",
  name: "Embarque",
  description: "Cartão de embarque com canhoto picotado, código de barras e carimbo",
  premium: true,
  suits: ["casamento", "aniversario", "formatura", "outro"],
  palettes: [
    { id: "marinho", name: "Branco e azul-marinho", vars: { bg: "#D8E0EB", paper: "#FCFDFE", ink: "#101B33", soft: "#4E5B76", accent: "#1D3F86", line: "#C7D1E0", btnInk: "#FCFDFE", seal: "#B3262B", sealInk: "#FBEDE6", liner: "#1D3F86" } },
    { id: "carimbo", name: "Creme e vermelho-carimbo", vars: { bg: "#E5DAC3", paper: "#F8F1E1", ink: "#26211C", soft: "#645A4C", accent: "#A82A1F", line: "#D8CAAD", btnInk: "#F8F1E1", seal: "#25345A", sealInk: "#F3E7CF", liner: "#A82A1F" } },
    { id: "ceu", name: "Azul-céu e laranja", vars: { bg: "#B9D8EE", paper: "#F4FAFE", ink: "#0F2F4F", soft: "#476079", accent: "#B8440F", line: "#C3DAEB", btnInk: "#F4FAFE", seal: "#17497A", sealInk: "#FDEBDD", liner: "#17497A" } },
    { id: "preto", name: "Preto e amarelo", vars: { bg: "#0B0B0C", paper: "#18181B", ink: "#F4F0E4", soft: "#B8B3A6", accent: "#F0C02C", line: "#3B3B41", btnInk: "#18181B", seal: "#E9E3D2", sealInk: "#18181B", liner: "#F0C02C" } },
    { id: "pinho", name: "Areia e verde-pinho", vars: { bg: "#D4D8C9", paper: "#F5F3EA", ink: "#1E2A23", soft: "#56625A", accent: "#1F5A44", line: "#CDD1BE", btnInk: "#F5F3EA", seal: "#A8581A", sealInk: "#FFF3E0", liner: "#1F5A44" } },
  ],
  Art,
};
