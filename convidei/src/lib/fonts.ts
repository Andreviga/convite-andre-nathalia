import {
  Alex_Brush, Bodoni_Moda, Cinzel, Cormorant_SC, DM_Sans, DM_Serif_Display, EB_Garamond, Fraunces, Great_Vibes,
  Italianno, Jost, Marcellus, Montserrat, Ms_Madi, Parisienne, Pinyon_Script, Playfair_Display, Poiret_One,
  Petit_Formal_Script, Gilda_Display, Forum, Tenor_Sans, Abril_Fatface, Sacramento, Italiana, Prata, Tilt_Neon, Shrikhand, UnifrakturMaguntia, Allura, Space_Mono, Old_Standard_TT, Spectral, Outfit, Josefin_Slab, Raleway, Sora, Archivo_Narrow, Libre_Franklin, Fredoka, Baloo_2, Mulish, Lora,
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

const petit = Petit_Formal_Script({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-petit" });
const gilda = Gilda_Display({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-gilda" });
const forum = Forum({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-forum" });
const tenor = Tenor_Sans({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-tenor" });
const abril = Abril_Fatface({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-abril" });
const sacramento = Sacramento({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-sacramento" });
const italiana = Italiana({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-italiana" });
const prata = Prata({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-prata" });
const tiltneon = Tilt_Neon({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-tiltneon" });
const shrikhand = Shrikhand({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-shrikhand" });
const fraktur = UnifrakturMaguntia({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-fraktur" });
const allura = Allura({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-allura" });
const spacemono = Space_Mono({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"], variable: "--f-spacemono" });
const oldstandard = Old_Standard_TT({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"], style: ["normal", "italic"], variable: "--f-oldstandard" });
const spectral = Spectral({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--f-spectral" });
const outfit = Outfit({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-outfit" });
const josefinslab = Josefin_Slab({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-josefinslab" });
const raleway = Raleway({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-raleway" });
const sora = Sora({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-sora" });
const archivonarrow = Archivo_Narrow({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-archivonarrow" });
const franklin = Libre_Franklin({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-franklin" });
const fredoka = Fredoka({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-fredoka" });
const baloo = Baloo_2({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-baloo" });
const mulish = Mulish({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-mulish" });
const lora = Lora({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-lora" });

export const fontVariables = [serif, sans, sc, pinyon, parisienne, italianno, alex, madi, greatVibes, playfair, bodoni, cinzel, jost, fraunces, dmSerif, marcellus, poiret, montserrat, petit, gilda, forum, tenor, abril, sacramento, italiana, prata, tiltneon, shrikhand, fraktur, allura, spacemono, oldstandard, spectral, outfit, josefinslab, raleway, sora, archivonarrow, franklin, fredoka, baloo, mulish, lora]
  .map((font) => font.variable)
  .join(" ");
