"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkLogin, createUser, endSession, requireUser, startSession } from "@/lib/auth";
import { EVENT_TYPES, TEMPLATES, template as findTemplate } from "@/lib/catalog";
import { one, q } from "@/lib/db";
import { eventBySlug, eventForUser, guestByToken, guestCount, rsvpClosed, type GiftLink } from "@/lib/events";
import { isDate, isTime, onlyDigits, safeUrl, todayBR } from "@/lib/format";
import { newId, newToken, slugify } from "@/lib/ids";
import { normalizePixKey, PIX_KEY_TYPES } from "@/lib/pix";
import { guestLimit, isPremium } from "@/lib/plans";

export type FormState = { error?: string; ok?: string; values?: Record<string, string> };

function text(form: FormData, name: string, max = 200): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function snapshot(form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  delete values.password;
  return values;
}

/* ───────── Conta ───────── */

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name", 80);
  const email = text(form, "email", 160).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const values = snapshot(form);
  if (name.length < 2) return { error: "Diga como podemos chamar você.", values };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Esse e-mail não parece válido.", values };
  if (password.length < 8 || password.length > 200) return { error: "A senha precisa ter pelo menos 8 caracteres.", values };
  const user = await createUser(name, email, password);
  if (!user) return { error: "Já existe uma conta com esse e-mail. Tente entrar.", values };
  await startSession(user.id);
  redirect("/painel/novo");
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email", 160).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string).slice(0, 200) : "";
  const user = await checkLogin(email, password);
  if (!user) return { error: "E-mail ou senha incorretos.", values: snapshot(form) };
  await startSession(user.id);
  redirect("/painel");
}

export async function signOut() {
  await endSession();
  redirect("/");
}

/* ───────── Evento ───────── */

export async function saveEvent(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = snapshot(form);
  values.open_rsvp = form.get("open_rsvp") === "on" ? "on" : "off";
  const fail = (error: string): FormState => ({ error, values });

  const id = text(form, "id", 64);
  const existing = id ? await eventForUser(id, user.id) : null;
  if (id && !existing) return fail("Evento não encontrado.");

  const type = text(form, "type", 32);
  if (!EVENT_TYPES.some((t) => t.id === type)) return fail("Escolha o tipo de evento.");
  const tpl = text(form, "template", 32);
  if (!TEMPLATES.some((t) => t.id === tpl)) return fail("Escolha um modelo.");
  if (findTemplate(tpl).premium && !isPremium(existing?.plan ?? "free")) {
    return fail(`O modelo ${findTemplate(tpl).name} faz parte do Premium. Escolha outro modelo ou faça o upgrade depois de criar o evento.`);
  }

  const title = text(form, "title", 80);
  if (title.length < 2) return fail("Preencha o nome que aparece no convite.");
  const eventDate = text(form, "event_date", 10);
  if (!isDate(eventDate)) return fail("Informe a data do evento.");
  const eventTime = text(form, "event_time", 5);
  if (eventTime && !isTime(eventTime)) return fail("O horário não parece válido.");
  const deadline = text(form, "rsvp_deadline", 10);
  if (deadline && !isDate(deadline)) return fail("A data limite para confirmar não parece válida.");
  if (deadline && deadline > eventDate) return fail("A data limite para confirmar precisa ser antes do evento.");

  const giftLinks: GiftLink[] = [];
  for (let i = 0; i < 5; i++) {
    const rawUrl = text(form, `gift_url_${i}`, 500);
    if (!rawUrl) continue;
    const url = safeUrl(rawUrl);
    if (!url) return fail(`O link de presentes "${rawUrl}" não parece válido.`);
    giftLinks.push({ label: text(form, `gift_label_${i}`, 60) || new URL(url).hostname.replace(/^www\./, ""), url });
  }

  let pixType = "";
  let pixKey = "";
  const pixHolder = text(form, "pix_holder", 60);
  const pixCity = text(form, "pix_city", 40);
  const rawPix = text(form, "pix_key", 100);
  if (rawPix) {
    pixType = text(form, "pix_key_type", 16);
    if (!PIX_KEY_TYPES.some((t) => t.id === pixType)) return fail("Escolha o tipo da chave Pix.");
    const normalized = normalizePixKey(pixType, rawPix);
    if (!normalized) return fail("A chave Pix não confere com o tipo escolhido. Revise para ninguém mandar presente para a pessoa errada.");
    if (pixHolder.length < 2) return fail("Informe o nome de quem recebe o Pix, como está no banco.");
    if (pixCity.length < 2) return fail("Informe a cidade de quem recebe o Pix.");
    pixKey = normalized;
  }

  const fields = [
    type,
    tpl,
    title,
    text(form, "headline", 120),
    text(form, "message", 600),
    eventDate,
    eventTime,
    text(form, "venue_name", 100),
    text(form, "address", 240),
    text(form, "dress_code", 80),
    deadline,
    text(form, "extra_info", 800),
    text(form, "gift_message", 400),
    JSON.stringify(giftLinks),
    pixType,
    pixKey,
    pixKey ? pixHolder : "",
    pixKey ? pixCity : "",
    form.get("open_rsvp") === "on",
  ];

  let eventId = existing?.id;
  if (existing) {
    await q(
      `update events set type=$1, template=$2, title=$3, headline=$4, message=$5, event_date=$6, event_time=$7,
         venue_name=$8, address=$9, dress_code=$10, rsvp_deadline=$11, extra_info=$12, gift_message=$13,
         gift_links=$14::jsonb, pix_key_type=$15, pix_key=$16, pix_holder=$17, pix_city=$18, open_rsvp=$19
       where id=$20 and user_id=$21`,
      [...fields, existing.id, user.id],
    );
    revalidatePath(`/c/${existing.slug}`, "layout");
  } else {
    eventId = newId();
    const base = slugify(title) || "convite";
    let slug = base;
    for (let attempt = 0; ; attempt++) {
      const inserted = await q(
        `insert into events (id, user_id, slug, type, template, title, headline, message, event_date, event_time,
           venue_name, address, dress_code, rsvp_deadline, extra_info, gift_message, gift_links,
           pix_key_type, pix_key, pix_holder, pix_city, open_rsvp)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,$22)
         on conflict (slug) do nothing returning id`,
        [eventId, user.id, slug, ...fields],
      );
      if (inserted.length) break;
      if (attempt > 5) return fail("Não foi possível criar o endereço do convite. Tente de novo.");
      slug = `${base}-${newToken(4)}`;
    }
  }
  redirect(`/painel/${eventId}${existing ? "?salvo=1" : "?novo=1"}`);
}

export async function deleteEvent(form: FormData) {
  const user = await requireUser();
  await q("delete from events where id = $1 and user_id = $2", [text(form, "id", 64), user.id]);
  redirect("/painel");
}

export async function requestUpgrade(form: FormData) {
  const user = await requireUser();
  const id = text(form, "id", 64);
  await q("update events set upgrade_requested_at = now() where id = $1 and user_id = $2", [id, user.id]);
  redirect(`/painel/${id}/premium?pedido=1`);
}

/* ───────── Convidados (anfitrião) ───────── */

type NewGuest = { name: string; phone: string; maxPeople: number };

async function insertGuests(eventId: string, plan: string, guests: NewGuest[]): Promise<{ added: number; skipped: number }> {
  const limit = guestLimit(plan);
  const room = limit === null ? guests.length : Math.max(0, limit - (await guestCount(eventId)));
  const accepted = guests.slice(0, room);
  for (const g of accepted) {
    await q("insert into guests (id, event_id, token, name, phone, max_people) values ($1,$2,$3,$4,$5,$6)", [
      newId(),
      eventId,
      newToken(8),
      g.name,
      g.phone,
      g.maxPeople,
    ]);
  }
  return { added: accepted.length, skipped: guests.length - accepted.length };
}

function people(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1;
}

const FULL = "Você chegou ao limite de convites do plano grátis. Faça o upgrade para convidar mais gente.";

export async function addGuest(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return { error: "Evento não encontrado." };
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Informe o nome do convidado ou da família.", values: snapshot(form) };
  const result = await insertGuests(event.id, event.plan, [{ name, phone: onlyDigits(text(form, "phone", 30)), maxPeople: people(text(form, "max_people", 3)) }]);
  if (!result.added) return { error: FULL, values: snapshot(form) };
  revalidatePath(`/painel/${event.id}`);
  return { ok: `${name} entrou na lista.` };
}

export async function addGuestsBulk(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return { error: "Evento não encontrado." };
  const guests: NewGuest[] = [];
  for (const line of text(form, "lines", 20000).split(/\r?\n/)) {
    const [name = "", second = "", third = ""] = line.split(/[;\t]/).map((cell) => cell.trim());
    if (name.length < 2) continue;
    // Aceita "Nome; telefone; pessoas" e também "Nome; pessoas".
    const secondIsCount = /^\d{1,2}$/.test(second);
    guests.push({
      name: name.slice(0, 80),
      phone: secondIsCount ? "" : onlyDigits(second).slice(0, 15),
      maxPeople: people(secondIsCount ? second : third),
    });
    if (guests.length >= 500) break;
  }
  if (!guests.length) return { error: "Cole pelo menos um nome por linha.", values: snapshot(form) };
  const result = await insertGuests(event.id, event.plan, guests);
  revalidatePath(`/painel/${event.id}`);
  if (!result.added) return { error: FULL, values: snapshot(form) };
  if (result.skipped) return { ok: `${result.added} convites adicionados.`, error: `${result.skipped} ficaram de fora: ${FULL}` };
  return { ok: `${result.added} convites adicionados.` };
}

export async function deleteGuest(form: FormData) {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return;
  await q("delete from guests where id = $1 and event_id = $2", [text(form, "guest_id", 64), event.id]);
  revalidatePath(`/painel/${event.id}`);
}

export async function markSent(eventId: string, guestId: string) {
  const user = await requireUser();
  const event = await eventForUser(String(eventId).slice(0, 64), user.id);
  if (!event) return;
  await q("update guests set sent_at = coalesce(sent_at, now()) where id = $1 and event_id = $2", [String(guestId).slice(0, 64), event.id]);
  revalidatePath(`/painel/${event.id}`);
}

/* ───────── Convite público ───────── */

export type RsvpState = { error?: string; saved?: "yes" | "no" };

export async function submitRsvp(_prev: RsvpState, form: FormData): Promise<RsvpState> {
  if (text(form, "website", 100)) return { saved: "yes" }; // campo-isca: só robôs preenchem
  const event = await eventBySlug(text(form, "slug", 80));
  if (!event) return { error: "Convite não encontrado." };
  if (rsvpClosed(event, todayBR())) return { error: "O prazo para confirmar presença já terminou. Fale com quem convidou você." };

  const status = text(form, "status", 3);
  if (status !== "yes" && status !== "no") return { error: "Escolha se você vai ou não." };
  const note = text(form, "note", 300);
  const count = people(text(form, "people", 3));
  const token = text(form, "token", 16);

  if (token) {
    const guest = await guestByToken(event.id, token);
    if (!guest) return { error: "Convite não encontrado." };
    await q("update guests set status=$1, people_count=$2, note=$3, responded_at=now(), opened_at=coalesce(opened_at, now()) where id=$4", [
      status,
      status === "yes" ? Math.min(count, guest.max_people) : 0,
      note,
      guest.id,
    ]);
    revalidatePath(`/painel/${event.id}`);
    return { saved: status };
  }

  if (!event.open_rsvp) return { error: "Este convite é individual. Abra pelo link que você recebeu." };
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Escreva seu nome para a gente saber quem confirmou." };
  const limit = guestLimit(event.plan);
  if (limit !== null && (await guestCount(event.id)) >= limit) {
    return { error: "A lista de confirmações deste evento está cheia. Avise quem convidou você." };
  }
  const openCount = Math.min(count, 6);
  const newTokenValue = newToken(8);
  await q(
    `insert into guests (id, event_id, token, name, phone, max_people, status, people_count, note, source, opened_at, open_count, responded_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',now(),1,now())`,
    [newId(), event.id, newTokenValue, name, onlyDigits(text(form, "phone", 30)).slice(0, 15), openCount, status, status === "yes" ? openCount : 0, note],
  );
  revalidatePath(`/painel/${event.id}`);
  redirect(`/c/${event.slug}/${newTokenValue}?confirmado=${status}`);
}

export async function markOpened(slug: string, token: string) {
  const event = await one<{ id: string }>("select id from events where slug = $1", [String(slug).slice(0, 80)]);
  if (!event) return;
  await q("update guests set open_count = open_count + 1, opened_at = coalesce(opened_at, now()) where event_id = $1 and token = $2", [
    event.id,
    String(token).slice(0, 16),
  ]);
}
