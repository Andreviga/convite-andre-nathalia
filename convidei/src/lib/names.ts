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
