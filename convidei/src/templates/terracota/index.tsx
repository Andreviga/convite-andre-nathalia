import type { ArtProps, TemplateDef } from "../types";

// Terracota: boho terroso. O cartão tem topo em arco; no alto do arco nasce um sol em meia-esfera (motivo-herói),
// e um ramo de capim-dos-pampas em traço fecha o cartão (detalhe). Uma só cor de ornamento, um só peso de traço.

const n = (v: number) => Math.round(v * 10) / 10;

/** Sol nascente: meia-esfera cheia, um halo em fio e raios alternados, pousado sobre uma linha ondulada. */
function Sun() {
  const cx = 90;
  const cy = 70;
  const rays: string[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (Math.PI * i) / 14;
    const from = 39;
    const to = i % 2 === 0 ? 56 : 48;
    rays.push(`M${n(cx + Math.cos(a) * from)} ${n(cy + Math.sin(a) * from)}L${n(cx + Math.cos(a) * to)} ${n(cy + Math.sin(a) * to)}`);
  }
  return (
    <svg className="tc-sun" viewBox="0 0 180 88" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" aria-hidden="true">
      <path d={`M${cx - 24} ${cy}a24 24 0 0 1 48 0z`} fill="currentColor" stroke="none" />
      <path d={`M${cx - 31} ${cy}a31 31 0 0 1 62 0`} />
      <path d={rays.join("")} />
      <path d="M42 81c8-5 16-5 24 0s16 5 24 0 16-5 24 0 16 5 24 0" />
    </svg>
  );
}

/** Linha ondulada curta: o separador do modelo. */
function Wave() {
  return (
    <svg className="tc-wave" viewBox="0 0 76 10" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" aria-hidden="true">
      <path d="M2 5c6-4.5 12-4.5 18 0s12 4.5 18 0 12-4.5 18 0 12 4.5 18 0" />
    </svg>
  );
}

/** Uma pluma de capim-dos-pampas: haste em curva e barbas finas, densas, que crescem e somem em fuso. */
function plume(bx: number, by: number, qx: number, qy: number, tx: number, ty: number, size: number): string {
  const parts: string[] = [`M${bx} ${by}Q${qx} ${qy} ${tx} ${ty}`];
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const s = i / (steps - 1);
    const t = 0.4 + 0.58 * s;
    const u = 1 - t;
    const x = u * u * bx + 2 * u * t * qx + t * t * tx;
    const y = u * u * by + 2 * u * t * qy + t * t * ty;
    const ang = Math.atan2(2 * u * (qy - by) + 2 * t * (ty - qy), 2 * u * (qx - bx) + 2 * t * (tx - qx));
    const len = size * (0.14 + 0.86 * Math.sin(Math.PI * (0.14 + 0.86 * s)) ** 0.8);
    for (const side of [-1, 1]) {
      const a1 = ang + side * 0.2;
      const a2 = ang + side * 0.5;
      parts.push(`M${n(x)} ${n(y)}Q${n(x + Math.cos(a1) * len * 0.6)} ${n(y + Math.sin(a1) * len * 0.6)} ${n(x + Math.cos(a2) * len)} ${n(y + Math.sin(a2) * len)}`);
    }
  }
  return parts.join("");
}

/** Três plumas em leque, de alturas desiguais, amarradas por um laço. */
function Pampas() {
  return (
    <svg className="tc-pampas" viewBox="0 0 150 84" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" aria-hidden="true">
      <path d={plume(75, 82, 72, 44, 40, 15, 12)} />
      <path d={plume(75, 82, 73, 40, 75, 3, 14)} />
      <path d={plume(75, 82, 79, 46, 106, 22, 11)} />
      <path d="M70.5 70.5c3-1.6 6-1.6 9 0" />
    </svg>
  );
}

/** Forro do envelope: arcos concêntricos em escama, na cor do forro. */
function Liner() {
  const arcs = (cx: number, cy: number) => [17, 12, 7].map((r) => `M${cx - r} ${cy}a${r} ${r} 0 0 1 ${2 * r} 0`).join("");
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="terracota-liner" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d={arcs(18, 18) + arcs(0, 36) + arcs(36, 36)} fill="none" stroke="currentColor" strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#terracota-liner)" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Sun />;
  if (slot === "divider") return <Wave />;
  if (slot === "bottom") return <Pampas />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "terracota",
  name: "Terracota",
  description: "Cartão em arco, sol nascente e tons de terra",
  premium: true,
  suits: ["casamento", "aniversario"],
  palettes: [
    { id: "terracota", name: "Terracota e areia", vars: { bg: "#DDB8A0", paper: "#FAF3E8", ink: "#3B2A22", soft: "#74554A", accent: "#B8623F", line: "#E5D2BF", btnInk: "#FFF8EE", seal: "#A9502F", sealInk: "#F8E6D2", liner: "#C98466" } },
    { id: "rose", name: "Rosé e nude", vars: { bg: "#E6CCC2", paper: "#FBF4F0", ink: "#4A2F2E", soft: "#80595A", accent: "#B9776C", line: "#EAD6CE", btnInk: "#FFF7F3", seal: "#B06A62", sealInk: "#FBEAE4", liner: "#D9AAA0" } },
    { id: "oliva", name: "Oliva seco", vars: { bg: "#CBC7A6", paper: "#F7F3E6", ink: "#33351F", soft: "#5F6140", accent: "#7A7B4F", line: "#DDD8BF", btnInk: "#FBF8EC", seal: "#6B6C3E", sealInk: "#F2EED8", liner: "#A9A97C" } },
    { id: "ferrugem", name: "Ferrugem escuro", vars: { bg: "#2B150F", paper: "#4A2419", ink: "#F7E7D4", soft: "#E0BFA6", accent: "#E3A27C", line: "#6F3B2A", btnInk: "#3A1B12", seal: "#C4714F", sealInk: "#FBEBD8", liner: "#7C3B27" } },
  ],
  Art,
};
