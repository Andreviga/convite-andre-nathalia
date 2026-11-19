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

export type CalendarEvent = { title: string; date: string; time: string; location: string; details: string };

export function googleCalendarUrl(ev: CalendarEvent): string {
  const { y, m, d } = parts(ev.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const dates = isTime(ev.time)
    ? `${stamp(ev.date, ev.time)}/${stamp(ev.date, ev.time, 4)}`
    : `${y}${pad(m)}${pad(d)}/${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
  const params = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates, ctz: TZ, location: ev.location, details: ev.details });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

export function icsFile(ev: CalendarEvent & { uid: string; url: string }): string {
  const { y, m, d } = parts(ev.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const when = isTime(ev.time)
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
    "BEGIN:VEVENT",
    `UID:${ev.uid}@convidei`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    ...when,
    `SUMMARY:${icsEscape(ev.title)}`,
    `LOCATION:${icsEscape(ev.location)}`,
    `DESCRIPTION:${icsEscape(ev.details)}`,
    `URL:${ev.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  // Evita que o Excel interprete o conteúdo digitado por convidados como fórmula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
