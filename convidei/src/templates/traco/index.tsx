import type { ReactNode } from "react";
import type { ArtProps, TemplateDef } from "../types";

// Traço: desenho de linha contínua. Uma única linha entra pela borda esquerda do cartão, desenha o motivo do evento e sai
// pela direita. Por trás dela, manchas de cor chapada, deslocadas do contorno como numa impressão em duas tintas fora de
// registro. O resto é branco e tipografia pequena, alinhada à esquerda.

const r1 = (n: number) => Math.round(n * 10) / 10;

type Pt = [number, number];

/** Traço da caneta: 1.2 unidade, pontas e junções redondas (a viewBox tem a largura do cartão, então 1 unidade ≈ 1px). */
const PEN = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Moldura comum dos desenhos do topo: manchas (tinta 2) por baixo, linha (tinta 1) por cima. */
function Sheet({ wash, children, tag, low, box = "0 0 360 176" }: { wash: ReactNode; children: ReactNode; tag: string; low?: boolean; box?: string }) {
  return (
    <>
      <svg className="traco-draw" viewBox={box} aria-hidden="true">
        <g className="traco-wash">{wash}</g>
        <g {...PEN}>{children}</g>
      </svg>
      <span className="traco-tag" data-low={low || undefined} aria-hidden="true">{tag}</span>
    </>
  );
}

/* ───────── Casamento: dois rostos de perfil, frente a frente, numa linha só ───────── */
const FACES =
  "M-4 153C24 153 56 152 78 138C95 127 100 113 96 97C90 73 91 45 113 31C128 21 148 22 156 34C162 43 160 52 161 60" +
  "C161.5 64 164 67 166 71C168 75 172 80 171.5 83C171 86 166 86 163.5 87.5C162 90 166.5 91.5 166 94.5C165.6 96.5 162.5 96.5 161.5 98" +
  "C163 99.5 166 101 165 104C164 107 160.5 107 160.5 110C160.5 115 164.5 119 160 123C155 127.5 145 124 137 118" +
  // os dois pescoços descem e se encontram numa ponta: com os queixos por cima, o vão entre os dois vira um coração
  "C129 137 152 157 180 171C209 157 232 142 224 125" +
  "C216 131 206 134.5 201 130C196.5 126 200.5 122 200.5 117C200.5 114 197 114 196 111C195 108 198 106.5 199.5 105" +
  "C198.5 103.5 195.4 103.5 195 101.5C194.5 98.5 199 97 197.5 94.5C195 93 190 93 189.5 90C189 87 193 82 195 78C197 74 199.5 71 200 67" +
  "C201 59 199 50 205 41C213 29 233 28 247 37C269 51 272 79 265 103C260 121 267 138 283 146C303 155 334 152 364 152";

function Faces() {
  return (
    <Sheet
      tag="Casamento"
      box="0 14 360 162"
      wash={
        <>
          {/* mancha maior atrás do rosto da esquerda, sol atrás do da direita e o coração entre os dois, fora de registro */}
          <path d="M92 44C112 12 168 14 186 46C200 72 190 112 160 128C128 144 92 132 82 102C76 82 80 62 92 44Z" />
          <circle className="traco-wash-2" cx="252" cy="62" r="31" />
          <path d="M185 170C170 160 160 151 160 141C160 131 174 127 185 138C196 127 210 131 210 141C210 151 200 160 185 170Z" />
        </>
      }
    >
      <path d={FACES} />
    </Sheet>
  );
}

/* ───────── Estrela de cinco pontas (louro da formatura) ───────── */
function star(cx: number, cy: number, ro: number, ri: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? ro : ri;
    pts.push(`${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)}`);
  }
  return `M${pts[0]}L${pts.slice(1).join("L")}Z`;
}

/* ───────── Chá: carrinho de bebê numa linha só (as rodas são dois laços da linha do chão) ───────── */
const PRAM =
  "M-4 160C30 160 92 161 128 160C152 160 159 130 140 130C121 130 128 160 152 160C176 160 192 160 208 160C232 160 239 130 220 130C201 130 208 160 232 160" +
  // sobe pela lateral, desenha o cesto, a capota, a borda e sai pela alça
  "C258 160 264 122 250 98C244 138 116 138 110 98C110 62 142 40 182 40C181 60 180 80 180 98C204 99 228 99 250 98C266 84 280 68 298 68C322 68 328 118 364 120";

function Pram() {
  return (
    <Sheet
      tag="Chá"
      box="0 14 360 162"
      wash={
        <>
          <path d="M116 94C116 58 148 36 188 36C187 56 186 76 186 94Z" />
          <circle className="traco-wash-2" cx="222" cy="82" r="34" />
        </>
      }
    >
      <path d={PRAM} />
    </Sheet>
  );
}

/* ───────── Quinze anos: tiara de três pontas, com uma gota em cada ponta ───────── */
/** Gota no alto de uma ponta: a linha sobe, dá a volta e desce pelo mesmo ponto. */
const drop = (x: number, y: number) => `C${x - 3} ${y - 5} ${x - 8} ${y - 11} ${x} ${y - 14}C${x + 8} ${y - 11} ${x + 3} ${y - 5} ${x} ${y}`;
const TIARA =
  "M-4 152C40 152 80 156 106 146C108 130 116 114 128 104" + drop(128, 104) +
  "C134 112 142 124 152 128C160 112 168 86 180 68" + drop(180, 68) +
  "C192 86 200 112 208 128C218 124 226 112 232 104" + drop(232, 104) +
  "C244 114 252 130 254 146C210 156 150 156 106 146C99 144 98 156 108 158C150 169 210 169 252 158C282 151 322 162 364 162";

function Tiara() {
  return (
    <Sheet
      tag="Quinze anos"
      box="0 14 360 162"
      wash={
        <>
          <circle className="traco-wash-2" cx="186" cy="104" r="46" />
          <circle cx="133" cy="97" r="7" />
          <circle cx="185" cy="61" r="7" />
          <circle cx="237" cy="97" r="7" />
        </>
      }
    >
      <path d={TIARA} />
    </Sheet>
  );
}

/* ───────── Aniversário: duas taças que se tocam, uma linha só ───────── */
/** Taça em coordenadas próprias (origem no centro do pé, y para cima negativo): sequência de curvas de Bézier encadeadas. */
const GLASS: Pt[] = [
  [-23, 0], // pé: da ponta esquerda…
  [-8, 1], [10, 1], [23, 0], // …à direita
  [31, -1], [31, -8], [20, -7], // volta num laço
  [10, -6], [1, -8], [0, -15], // e sobe pela haste
  [0, -26], [0, -36], [0, -47],
  [15, -49], [28, -70], [28, -97], // lado direito do bojo
  [28, -104.5], [-28, -104.5], [-28, -97], // borda de trás
  [-28, -70], [-15, -49], [0, -47], // lado esquerdo, até a haste
  [-15, -49], [-28, -70], [-28, -97], // de volta pela mesma linha
  [-28, -89.5], [28, -89.5], [28, -97], // borda da frente: a linha sai pela boca
];
/** O vinho: a parte de baixo do bojo, com a superfície ondulada. */
const WINE: Pt[] = [
  [-23.5, -76], [-10, -71], [8, -80], [23.5, -76], [20, -60], [12, -50], [0, -47], [-12, -50], [-20, -60], [-23.5, -76],
];
function place(pts: Pt[], cx: number, cy: number, deg: number, mirror: boolean): Pt[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x0, y]) => {
    const x = mirror ? -x0 : x0;
    return [r1(cx + x * c - y * s), r1(cy + x * s + y * c)] as Pt;
  });
}
const curve = (pts: Pt[]) => `C${pts.map((p) => p.join(" ")).join(" ")}`;

function Toast({ tag }: { tag: string }) {
  const a = place(GLASS, 131, 152, 11, false);
  const b = place(GLASS, 229, 152, -11, true).reverse();
  const first = a[0];
  const last = b[b.length - 1];
  const rimA = a[a.length - 1];
  const rimB = b[0];
  const line =
    `M-4 128C22 128 44 150 70 156C86 160 96 152 ${first.join(" ")}` +
    curve(a.slice(1)) +
    // o brinde: um laço pequeno entre as duas bocas
    `C${r1(rimA[0] - 6)} ${r1(rimA[1] - 24)} ${r1(rimB[0] + 6)} ${r1(rimB[1] - 24)} ${rimB.join(" ")}` +
    curve(b.slice(1)) +
    `C${r1(last[0] + 14)} ${r1(last[1] + 8)} ${r1(last[0] + 34)} ${r1(last[1] + 10)} 290 156C316 152 340 167 364 167`;
  const wineA = place(WINE, 131 + 4, 152 + 3, 11, false);
  const wineB = place(WINE, 229 - 4, 152 + 3, -11, true);
  return (
    <Sheet
      tag={tag}
      wash={
        <>
          <path d={`M${wineA[0].join(" ")}${curve(wineA.slice(1))}Z`} />
          <path d={`M${wineB[0].join(" ")}${curve(wineB.slice(1))}Z`} />
          {/* bolhas e faíscas do brinde */}
          <circle className="traco-wash-2" cx="180" cy="26" r="13" />
          <circle cx="150" cy="22" r="3.2" />
          <circle cx="212" cy="30" r="2.4" />
          <circle cx="196" cy="8" r="1.8" />
        </>
      }
    >
      <path d={line} />
      <path d="M180 17v18M171 26h18" />
    </Sheet>
  );
}

/* ───────── Ramo (formatura, festa e o que mais vier): haste que atravessa o cartão, com as folhas em laço ───────── */
type Cubic = [Pt, Pt, Pt, Pt];
function at([p0, p1, p2, p3]: Cubic, t: number): { p: Pt; d: Pt } {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  const len = Math.hypot(dx, dy) || 1;
  return { p: [x, y], d: [dx / len, dy / len] };
}
/** Folha em laço: sai do ponto p na direção `deg` (em relação à haste), abre até `w` e volta ao mesmo ponto. */
function leaf(p: Pt, d: Pt, deg: number, len: number, w: number): string {
  const a = (deg * Math.PI) / 180;
  const fx = d[0] * Math.cos(a) - d[1] * Math.sin(a);
  const fy = d[0] * Math.sin(a) + d[1] * Math.cos(a);
  const nx = -fy;
  const ny = fx;
  const q = (f: number, n: number) => `${r1(p[0] + fx * len * f + nx * w * n)} ${r1(p[1] + fy * len * f + ny * w * n)}`;
  return `M${q(0, 0)}C${q(0.22, 1)} ${q(0.72, 0.95)} ${q(1, 0)}C${q(0.66, -0.62)} ${q(0.24, -0.7)} ${q(0, 0)}`;
}

function Branch({ laurel, tag }: { laurel: boolean; tag: string }) {
  const stem: Cubic = laurel ? [[-4, 150], [80, 150], [150, 60], [364, 44]] : [[-4, 64], [110, 10], [196, 176], [364, 164]];
  const ts = laurel ? [0.2, 0.31, 0.42, 0.53, 0.64, 0.75, 0.86] : [0.16, 0.27, 0.38, 0.5, 0.61, 0.72, 0.83];
  const leaves: string[] = [];
  const fills: string[] = [];
  ts.forEach((t, i) => {
    const { p, d } = at(stem, t);
    const grow = 1 - Math.abs(i - 3) * 0.07;
    if (laurel) {
      // louro: folhas aos pares, curtas e regulares
      leaves.push(leaf(p, d, -46, 42 * grow, 10), leaf(p, d, 46, 40 * grow, -10));
      if (i % 2 === 0) fills.push(leaf(p, d, -46, 42 * grow, 10));
      else fills.push(leaf(p, d, 46, 40 * grow, -10));
    } else {
      // ramo solto: folhas alternadas, compridas
      const up = i % 2 === 0;
      const one = leaf(p, d, up ? -54 : 52, (up ? 56 : 48) * grow, up ? 13 : -12);
      leaves.push(one);
      if (i % 3 !== 1) fills.push(one);
    }
  });
  return (
    <Sheet
      low={laurel}
      tag={tag}
      wash={
        <>
          <g transform="translate(5 -3)">
            {fills.map((d) => (
              <path key={d} d={`${d}Z`} />
            ))}
          </g>
          <circle className="traco-wash-2" cx={laurel ? 72 : 78} cy={laurel ? 56 : 128} r={laurel ? 26 : 22} />
        </>
      }
    >
      <path d={`M${stem[0].join(" ")}C${stem.slice(1).map((p) => p.join(" ")).join(" ")}`} />
      <path d={leaves.join("")} />
      {laurel ? <path d={star(72, 56, 13, 5.4)} /> : <circle cx="78" cy="128" r="9" />}
    </Sheet>
  );
}

/* ───────── Fio com um laço: separa os nomes da data e assina o fecho da página ───────── */
function Loop() {
  return (
    <svg className="traco-loop" viewBox="0 0 132 18" width="132" height="18" aria-hidden="true">
      <circle className="traco-wash" cx="60" cy="8" r="7" />
      <path {...PEN} d="M1 11C22 11 40 15 54 10C63 6.6 62 0 56 1.4C50 3 52 11 62 12.4C78 14.6 100 9 131 10" />
    </svg>
  );
}

/* ───────── Forro do envelope: linhas de laços (um caderno de caligrafia) e duas manchas ───────── */
function Liner() {
  const rows: string[] = [];
  for (let y = 24; y < 210; y += 21) {
    let d = `M${-12 + ((y / 21) % 2) * 9} ${y}`;
    for (let i = 0; i < 18; i++) d += "c9 0 15-13 8-13c-7 0-1 13 10 13";
    rows.push(d);
  }
  return (
    <svg className="traco-liner" viewBox="0 0 280 200" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">
      <g className="traco-liner-wash">
        <path d="M96 -10C150 -24 214 4 210 52C206 96 152 112 116 92C78 72 52 2 96 -10Z" />
        <circle cx="62" cy="96" r="22" />
        <circle cx="228" cy="150" r="30" />
      </g>
      <path {...PEN} strokeWidth="1" d={rows.join("")} />
    </svg>
  );
}

const TAGS: Record<string, string> = {
  casamento: "Casamento",
  aniversario: "Aniversário",
  "quinze-anos": "Quinze anos",
  cha: "Chá",
  formatura: "Formatura",
};

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") {
    if (eventType === "casamento") return <Faces />;
    if (eventType === "cha") return <Pram />;
    if (eventType === "quinze-anos") return <Tiara />;
    if (eventType === "aniversario") return <Toast tag={TAGS.aniversario} />;
    if (eventType === "formatura") return <Branch laurel tag={TAGS.formatura} />;
    return <Branch laurel={false} tag={(eventType && TAGS[eventType]) || "Convite"} />;
  }
  if (slot === "divider") return <Loop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "traco",
  name: "Traço",
  description: "Desenho de linha contínua, muito branco e letra fina",
  premium: false,
  suits: ["casamento", "aniversario", "quinze-anos", "cha", "formatura", "outro"],
  palettes: [
    { id: "branco", name: "Branco e preto", vars: { bg: "#E9E8E4", paper: "#FFFFFF", ink: "#161616", soft: "#5A5A58", accent: "#1C1C1C", line: "#D6D5D0", btnInk: "#FFFFFF", seal: "#1C1C1C", sealInk: "#FFFFFF", liner: "#F1F0EC" } },
    { id: "terracota", name: "Areia e terracota", vars: { bg: "#E7DCCA", paper: "#F8F2E7", ink: "#2C231E", soft: "#69594D", accent: "#AD4E2C", line: "#DCCDB6", btnInk: "#F8F2E7", seal: "#AD4E2C", sealInk: "#FFF6EA", liner: "#EFD3BF" } },
    { id: "tinta", name: "Cinza-pérola e azul-tinta", vars: { bg: "#DCDFE3", paper: "#F5F6F7", ink: "#16233B", soft: "#525E76", accent: "#1F3D72", line: "#CCD2DA", btnInk: "#F5F6F7", seal: "#1F3D72", sealInk: "#F5F6F7", liner: "#CFD9E8" } },
    { id: "vinho", name: "Rosa-pó e vinho", vars: { bg: "#EAD8D5", paper: "#F9EFED", ink: "#38151F", soft: "#735058", accent: "#7B2238", line: "#E2CAC7", btnInk: "#F9EFED", seal: "#7B2238", sealInk: "#F9EFED", liner: "#EFD2D2" } },
    { id: "grafite", name: "Grafite e giz", vars: { bg: "#151617", paper: "#202224", ink: "#F3F0EA", soft: "#B7B3AB", accent: "#EAE5DA", line: "#45474A", btnInk: "#202224", seal: "#EAE5DA", sealInk: "#202224", liner: "#2C2E31" } },
  ],
  Art,
};
