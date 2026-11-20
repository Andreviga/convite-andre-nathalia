const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const TZ = "America/Sao_Paulo";

export function isDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isTime(text: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

export function longDate(date: string): string {
  const { y, m, d } = parts(date);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

export function shortDate(date: string): string {
  const { y, m, d } = parts(date);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function dateBits(date: string) {
  const { y, m, d, weekday } = parts(date);
  return { day: String(d).padStart(2, "0"), month: MONTHS[m - 1], year: String(y), weekday: WEEKDAYS[weekday] };
}

export function prettyTime(time: string): string {
  if (!isTime(time)) return "";
  const [h, min] = time.split(":");
  return min === "00" ? `${Number(h)}h` : `${Number(h)}h${min}`;
}

/** Data de hoje no fuso de Brasília, como AAAA-MM-DD. */
export function todayBR(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function daysUntil(date: string, today = todayBR()): number {
  const a = parts(today);
  const b = parts(date);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

export function onlyDigits(text: string): string {
  return text.replace(/\D/g, "");
}

/** Número para o wa.me: só dígitos, com 55 na frente. Vazio se não parecer um telefone brasileiro. */
export function whatsappNumber(phone: string): string {
  const digits = onlyDigits(phone);
  const local = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? `55${local}` : "";
}

export function safeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function mapsUrl(venue: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue, address].filter(Boolean).join(", "))}`;
}

export function wazeUrl(place: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(place)}&navigate=yes`;
}

export function uberUrl(venue: string, address: string): string {
  const params = new URLSearchParams({ action: "setPickup", pickup: "my_location" });
  params.set("dropoff[formatted_address]", address || venue);
  if (venue) params.set("dropoff[nickname]", venue);
  return `https://m.uber.com/ul/?${params.toString()}`;
}

function stamp(date: string, time: string, addHours = 0): string {
  const { y, m, d } = parts(date);
  const [h, min] = (isTime(time) ? time : "00:00").split(":").map(Number);
  const moment = new Date(Date.UTC(y, m - 1, d, h + addHours, min));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${moment.getUTCFullYear()}${pad(moment.getUTCMonth() + 1)}${pad(moment.getUTCDate())}T${pad(moment.getUTCHours())}${pad(moment.getUTCMinutes())}00`;
}

export type CalendarEvent = { title: string; date: string; time: string; location: string; details: string; /** Link do convite, para a pessoa voltar a ele a partir da agenda. */ url?: string };

/** "sábado" -> "Sábado": para começo de frase nas seções do convite. */
export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

const NAME_JOINERS = new Set(["&", "e", "de", "da", "do", "das", "dos"]);

/**
 * Título do compromisso na agenda. Quando o título do evento é só o nome de alguém ("André & Nathalia", "Sofia"),
 * acrescenta o tipo: "Casamento de André & Nathalia". Frases ("Helena faz 30", "Chá do Miguel") ficam como estão.
 */
export function calendarTitle(typeLabel: string, title: string): string {
  const clean = title.trim().replace(/\s+/g, " ");
  const label = typeLabel.trim();
  if (!clean || !label) return clean;
  const words = clean.split(" ");
  const onlyNames = words.length <= 7 && words.every((word) => NAME_JOINERS.has(word.toLocaleLowerCase("pt-BR")) || /^\p{Lu}[\p{L}'.-]*$/u.test(word));
  const firstLabelWord = label.split(" ")[0].toLocaleLowerCase("pt-BR");
  const repeats = /\p{L}/u.test(firstLabelWord) && clean.toLocaleLowerCase("pt-BR").includes(firstLabelWord);
  return onlyNames && !repeats ? `${label} de ${clean}` : clean;
}

// Tipos de evento (ids de EVENT_TYPES) em que "<Tipo> de <nomes>" faz sentido como título do compromisso.
const CALENDAR_LABEL: Record<string, string> = { casamento: "Casamento", aniversario: "Aniversário", "quinze-anos": "15 anos", formatura: "Formatura" };

/** Título do compromisso a partir do tipo do evento (id) e do título do convite. */
export function eventCalendarTitle(typeId: string, title: string): string {
  return calendarTitle(CALENDAR_LABEL[typeId] ?? "", title);
}

function calendarDetails(ev: CalendarEvent): string {
  return [ev.details.trim(), ev.url ? `Convite: ${ev.url}` : ""].filter(Boolean).join("\n\n");
}

export function googleCalendarUrl(ev: CalendarEvent): string {
  const { y, m, d } = parts(ev.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const dates = isTime(ev.time)
    ? `${stamp(ev.date, ev.time)}/${stamp(ev.date, ev.time, 4)}`
    : `${y}${pad(m)}${pad(d)}/${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
  const params = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates, ctz: TZ, location: ev.location, details: calendarDetails(ev) });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Texto do convite para a agenda. A frase do casamento começa em minúscula ("convidam para…") e pede os nomes na frente. */
export function calendarMessage(title: string, message: string): string {
  const text = message.trim();
  return /^\p{Ll}/u.test(text) ? `${title.trim()} ${text}` : text;
}

/**
 * Dobra uma linha de conteúdo do .ics em pedaços de até 75 octetos (RFC 5545, 3.1): as continuações começam com um espaço,
 * que conta no limite. Corta entre caracteres inteiros, nunca no meio de uma letra acentuada ou de um emoji em UTF-8.
 */
export function icsFold(line: string): string {
  const size = (ch: string) => Buffer.byteLength(ch, "utf8");
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const n = size(ch);
    if (bytes + n > 75) {
      out.push(current);
      current = " ";
      bytes = 1;
    }
    current += ch;
    bytes += n;
  }
  out.push(current);
  return out.join("\r\n");
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

// Brasília não tem horário de verão desde 2019: um único bloco fixo em -03:00 basta para o Outlook e afins entenderem o TZID.
const VTIMEZONE = ["BEGIN:VTIMEZONE", `TZID:${TZ}`, "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:-0300", "TZOFFSETTO:-0300", "TZNAME:-03", "END:STANDARD", "END:VTIMEZONE"];

export function icsFile(ev: CalendarEvent & { uid: string; url: string }): string {
  const { y, m, d } = parts(ev.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const timed = isTime(ev.time);
  const when = timed
    ? [`DTSTART;TZID=${TZ}:${stamp(ev.date, ev.time)}`, `DTEND;TZID=${TZ}:${stamp(ev.date, ev.time, 4)}`]
    : [
        `DTSTART;VALUE=DATE:${y}${pad(m)}${pad(d)}`,
        `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`,
      ];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Convidei//Convite//PT-BR",
    "CALSCALE:GREGORIAN",
    ...(timed ? VTIMEZONE : []),
    "BEGIN:VEVENT",
    `UID:${ev.uid}@convidei`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    ...when,
    `SUMMARY:${icsEscape(ev.title)}`,
    `LOCATION:${icsEscape(ev.location)}`,
    `DESCRIPTION:${icsEscape(calendarDetails(ev))}`,
    `URL:${ev.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(ev.title)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(icsFold)
    .concat("")
    .join("\r\n");
}

export function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  // Evita que o Excel interprete o conteúdo digitado por convidados como fórmula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
