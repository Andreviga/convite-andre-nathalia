export type SplitTitle = { names: string[]; connector: string | null; initials: string[] };

function initial(text: string): string {
  const letter = text.trim().match(/\p{L}/u);
  return letter ? letter[0].toLocaleUpperCase("pt-BR") : "";
}

/**
 * "Marina & Rafael" -> dois nomes com o "&" separado (para compor como papelaria: nome, conector, nome).
 * Títulos que não são um par de nomes curtos ("Helena faz 30", "Chá do Miguel") ficam inteiros.
 */
export function splitTitle(title: string): SplitTitle {
  const clean = title.trim().replace(/\s+/g, " ");
  const pair = clean.match(/^(.+?)\s+(&|e)\s+(.+)$/i);
  if (pair) {
    const [, first, connector, second] = pair;
    const short = (name: string) => name.split(" ").length <= 3 && name.length <= 24;
    if (short(first) && short(second)) {
      return { names: [first, second], connector: connector === "&" ? "&" : "e", initials: [initial(first), initial(second)].filter(Boolean) };
    }
  }
  const words = clean.split(" ").filter((word) => /^\p{Lu}/u.test(word));
  return { names: [clean], connector: null, initials: [initial(words[0] ?? clean)].filter(Boolean) };
}

/** Espaço não separável: a linha nunca quebra nele. */
export const NBSP = " ";

const PARTICLES = new Set(["de", "da", "do", "das", "dos", "e"]);
const DASH = /^[—–]$/;
const letters = (text: string) => [...text].length;

/**
 * Prepara um título para quebrar bem em várias linhas: cola com espaço não separável as partículas (de, da, do, das, dos, e)
 * à palavra seguinte e o travessão à palavra anterior. Assim "da" e "e" nunca sobram no fim de uma linha e o travessão nunca
 * abre uma linha ("Formatura de Direito — / Turma 2026", nunca "… / — Turma 2026").
 * Um trecho colado não passa de `maxChunk` letras (salvo o travessão, que sempre cola): trecho comprido demais não caberia na
 * linha e seria partido no meio, o que é pior do que uma partícula solta. Vinte letras é o que a capa garante caber numa linha
 * em tela de 320px (a fonte encolhe até lá), então "de Confraternização" (19) ainda vai colado.
 */
export function glueTitle(title: string, maxChunk = 20): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  let out = "";
  let chunk = 0; // letras do trecho inseparável em construção
  words.forEach((word, i) => {
    if (i === 0) {
      out = word;
      chunk = letters(word);
      return;
    }
    const prev = words[i - 1];
    const dash = DASH.test(word);
    const particle = PARTICLES.has(prev.toLocaleLowerCase("pt-BR")) && !dash;
    const glue = dash || (particle && chunk + 1 + letters(word) <= maxChunk);
    out += (glue ? NBSP : " ") + word;
    chunk = glue ? chunk + 1 + letters(word) : letters(word);
  });
  return out;
}

// Palavras átonas do texto corrido que não podem sobrar no fim de uma linha (artigos, preposições curtas, contrações, "e").
const TEXT_PARTICLES = new Set(["a", "o", "as", "os", "e", "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas", "ao", "à", "às", "um", "uma", "com", "por"]);

/**
 * O mesmo cuidado de glueTitle para texto corrido da capa (frase de abertura, recado, saudação): cola cada palavra átona
 * ("e", "de", "da", "do", "a", "com"…) à palavra seguinte, para nunca fechar uma linha, e o travessão à palavra anterior.
 * Preserva as quebras de linha que a pessoa digitou. O trecho colado não passa de `maxChunk` letras, para caber na linha
 * mais estreita (rótulo em caixa alta num cartão de 320px).
 */
export function glueText(text: string, maxChunk = 16): string {
  return text
    .split("\n")
    .map((line) => {
      const words = line.split(/[ \t]+/);
      let out = "";
      let chunk = 0;
      words.forEach((word, i) => {
        if (i === 0) {
          out = word;
          chunk = letters(word);
          return;
        }
        const prev = words[i - 1];
        const dash = DASH.test(word);
        const particle = TEXT_PARTICLES.has(prev.toLocaleLowerCase("pt-BR")) && word !== "";
        const glue = prev !== "" && (dash || (particle && chunk + 1 + letters(word) <= maxChunk));
        out += (glue ? NBSP : " ") + word;
        chunk = glue ? chunk + 1 + letters(word) : letters(word);
      });
      return out;
    })
    .join("\n");
}

export type TitleRun = { text: string; num: boolean };

/**
 * Separa algarismos e travessões do resto do título. Nas fontes caligráficas eles ficam ruins (o "3" parece um "Z"),
 * então a capa os envolve em <span class="inv-num"> e o modelo os compõe na serifa.
 */
export function titleRuns(text: string): TitleRun[] {
  const runs: TitleRun[] = [];
  let last = 0;
  for (const match of text.matchAll(/\d+(?:[.,:/]\d+)*[ºª°]?|[—–]/g)) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index), num: false });
    runs.push({ text: match[0], num: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), num: false });
  return runs;
}

export type TitleShape = {
  /** 2 = casal (nome, conector, nome); 1 = título único. */
  count: number;
  /** Número de palavras (no casal, do nome com mais palavras). */
  words: number;
  /**
   * Letras do maior trecho que precisa caber numa linha: a maior palavra (ou palavras coladas por glueTitle) e, no casal,
   * o nome inteiro quando tem até 14 letras.
   */
  longest: number;
  /**
   * Letras que precisam caber numa linha para o título não se dividir: o título inteiro quando é único e curto (até 14
   * caracteres, "Helena faz 30", "Chá do Miguel"); senão, igual a `longest`. Os modelos de caligrafia usam esta medida
   * (variável --line) para não deixar "faz 30" sozinho na segunda linha.
   */
  line: number;
  /** Título comprido: casal com um nome de 11 letras ou mais; título único com mais de 16 caracteres. */
  long: boolean;
  /** Nome único curto ("Sofia", "Helena"): uma palavra de até 7 letras. Pode ser composto bem maior. */
  short: boolean;
  /** Título único que é frase, não nome: tem travessão ou quatro palavras ou mais ("Chá revelação da Ana e do Pedro"). */
  phrase: boolean;
};

/** Medidas do título para o CSS decidir tamanho e fonte (viram atributos data-* em .inv-names). */
export function titleShape(title: string): TitleShape {
  const { names } = splitTitle(title);
  const parts = names.map((name) => name.split(" "));
  const words = Math.max(0, ...parts.map((p) => p.length));
  if (names.length === 2) {
    // No casal, um nome composto de até 14 letras ("Maria Eduarda") conta inteiro: cabe numa linha só, em vez de virar duas.
    const longest = Math.max(0, ...names.flatMap((name) => (letters(name) <= 14 ? [letters(name)] : glueTitle(name).split(" ").map(letters))));
    return { count: 2, words, longest, line: longest, long: Math.max(...names.map((n) => n.length)) >= 11, short: false, phrase: false };
  }
  const longest = Math.max(0, ...names.flatMap((name) => glueTitle(name).split(" ").map(letters)));
  const clean = names[0] ?? "";
  const hasDash = parts[0]?.some((word) => DASH.test(word)) ?? false;
  const line = letters(clean) <= 14 ? Math.max(longest, letters(clean)) : longest;
  return { count: 1, words, longest, line, long: clean.length > 16, short: words === 1 && letters(clean) <= 7, phrase: hasDash || words >= 4 };
}
