// Gera o "Pix copia e cola" (BR Code estático) a partir da chave do anfitrião.
// O dinheiro vai direto do convidado para o anfitrião; o app não intermedeia nada.

export type PixKeyType = "cpf" | "cnpj" | "telefone" | "email" | "aleatoria";

export const PIX_KEY_TYPES: { id: PixKeyType; label: string }[] = [
  { id: "cpf", label: "CPF" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Celular" },
  { id: "email", label: "E-mail" },
  { id: "aleatoria", label: "Chave aleatória" },
];

export function crc16(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function ascii(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

/** Devolve a chave no formato exigido pelo Pix, ou null se for inválida para o tipo. */
export function normalizePixKey(type: string, raw: string): string | null {
  const value = raw.trim();
  const digits = value.replace(/\D/g, "");
  switch (type) {
    case "cpf":
      return digits.length === 11 ? digits : null;
    case "cnpj":
      return digits.length === 14 ? digits : null;
    case "telefone": {
      const local = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
      return local.length === 10 || local.length === 11 ? `+55${local}` : null;
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 77 ? value.toLowerCase() : null;
    case "aleatoria":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        ? value.toLowerCase()
        : null;
    default:
      return null;
  }
}

function field(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

export function pixPayload(key: string, holder: string, city: string): string {
  const body =
    field("00", "01") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", key)) +
    field("52", "0000") +
    field("53", "986") +
    field("58", "BR") +
    field("59", ascii(holder, 25) || "RECEBEDOR") +
    field("60", ascii(city, 15) || "BRASIL") +
    field("62", field("05", "***")) +
    "6304";
  return body + crc16(body);
}
