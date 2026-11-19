import { randomBytes, randomUUID } from "node:crypto";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // sem caracteres ambíguos (0/o, 1/l/i)

export function newId(): string {
  return randomUUID();
}

export function newToken(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}
