import {
  Alex_Brush, Bodoni_Moda, Cinzel, Cormorant_SC, DM_Sans, DM_Serif_Display, EB_Garamond, Fraunces, Great_Vibes,
  Italianno, Jost, Marcellus, Montserrat, Ms_Madi, Parisienne, Pinyon_Script, Playfair_Display, Poiret_One,
} from "next/font/google";

// Fontes disponíveis para o app e para os modelos de convite. Cada uma vira uma variável CSS (--f-*).
// Só as duas do app são pré-carregadas; as dos modelos baixam apenas quando o modelo as usa.
// Serifa de texto: EB Garamond (variável, pesos 400 a 800, com itálico de verdade). Era a Cormorant Garamond, mas nela (e na
// Cormorant e na Cormorant Infant) o circunflexo minúsculo é uma cunha fina e alta: "Você", "bebê" e "avô" pareciam ter
// sujeira sobre a letra. É desenho da fonte, não peso sintetizado. Peso 300 não existe aqui: quem pedir recebe 400.
const serif = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-serif", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--f-sans", display: "swap" });
const sc = Cormorant_SC({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600"], variable: "--f-sc" });
const pinyon = Pinyon_Script({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-pinyon" });
const parisienne = Parisienne({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-parisienne" });
const italianno = Italianno({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-italianno" });
const alex = Alex_Brush({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-alex" });
const madi = Ms_Madi({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-madi" });
const greatVibes = Great_Vibes({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-greatvibes" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-playfair" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-bodoni" });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-cinzel" });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-jost" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-fraunces" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], display: "swap", preload: false, weight: "400", style: ["normal", "italic"], variable: "--f-dmserif" });
const marcellus = Marcellus({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-marcellus" });
const poiret = Poiret_One({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-poiret" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-montserrat" });

export const fontVariables = [serif, sans, sc, pinyon, parisienne, italianno, alex, madi, greatVibes, playfair, bodoni, cinzel, jost, fraunces, dmSerif, marcellus, poiret, montserrat]
  .map((font) => font.variable)
  .join(" ");
