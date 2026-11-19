"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkLogin, createUser, currentUser, endSession, requireUser, startSession } from "@/lib/auth";
import { DRAFT_COOKIE, draftCookie, draftCookieOptions, takeDraft } from "@/lib/draft";
import { EVENT_TYPES } from "@/lib/catalog";
import { paletteOf, TEMPLATE_DEFS, templateDef } from "@/templates";
import { one, q } from "@/lib/db";
import { eventBySlug, eventForUser, guestByToken, guestCount, rsvpClosed, type GiftLink, type GuestRow } from "@/lib/events";
import { OPEN_MAX_PEOPLE, rsvpCookie } from "@/lib/remember";
import { createCheckout, mercadoPagoEnabled } from "@/lib/mercadopago";
import { baseUrl } from "@/lib/url";
import { isDate, isTime, onlyDigits, safeUrl, todayBR } from "@/lib/format";
import { newId, newToken, slugify } from "@/lib/ids";
import { normalizePixKey, PIX_KEY_TYPES } from "@/lib/pix";
import { guestLimit, isPremium } from "@/lib/plans";
import { parseGuestLine } from "@/lib/guest-lines";

export type FormState = { error?: string; ok?: string; values?: Record<string, string>; /** Link de saída mostrado junto do erro (ex.: upgrade). */ link?: { href: string; label: string } };

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
  await takeDraft(); // conta nova sempre começa no editor; o rascunho da galeria (se houver) fica marcado como usado
  redirect("/painel/novo");
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email", 160).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string).slice(0, 200) : "";
  const user = await checkLogin(email, password);
  if (!user) return { error: "E-mail ou senha incorretos.", values: snapshot(form) };
  await startSession(user.id);
  // Só um rascunho recém-escolhido na galeria leva ao editor, e uma vez só: depois disso o login volta a cair no painel.
  redirect((await takeDraft()) ? "/painel/novo" : "/painel");
}

export async function signOut() {
  await endSession();
  (await cookies()).delete(DRAFT_COOKIE); // aparelho compartilhado: o rascunho não passa para a próxima pessoa
  redirect("/");
}

/* ───────── Rascunho: escolher um modelo antes de ter conta ───────── */

/** Guarda o modelo e os dados digitados na galeria e leva para a criação do convite (passando pelo cadastro, se preciso). */
export async function chooseTemplate(form: FormData) {
  const def = templateDef(text(form, "template", 32));
  const type = text(form, "type", 32);
  const date = text(form, "event_date", 10);
  const draft = {
    template: def.id,
    palette: paletteOf(def, text(form, "palette", 32)).id,
    type: EVENT_TYPES.some((t) => t.id === type) ? type : "",
    title: text(form, "title", 80),
    event_date: isDate(date) ? date : "",
  };
  const user = await currentUser();
  // Quem já está logado vai direto ao editor: o rascunho nasce "usado" e não desvia os próximos logins.
  (await cookies()).set(DRAFT_COOKIE, draftCookie(draft, Date.now(), Boolean(user)), draftCookieOptions);
  redirect(user ? "/painel/novo" : "/criar-conta");
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
  if (!TEMPLATE_DEFS.some((t) => t.id === tpl)) return fail("Escolha um modelo.");
  const def = templateDef(tpl);
  const palette = paletteOf(def, text(form, "palette", 32)).id;

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
    palette,
  ];

  let eventId = existing?.id;
  if (existing) {
    await q(
      `update events set type=$1, template=$2, title=$3, headline=$4, message=$5, event_date=$6, event_time=$7,
         venue_name=$8, address=$9, dress_code=$10, rsvp_deadline=$11, extra_info=$12, gift_message=$13,
         gift_links=$14::jsonb, pix_key_type=$15, pix_key=$16, pix_holder=$17, pix_city=$18, open_rsvp=$19, palette=$20
       where id=$21 and user_id=$22`,
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
           pix_key_type, pix_key, pix_holder, pix_city, open_rsvp, palette)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,$22,$23)
         on conflict (slug) do nothing returning id`,
        [eventId, user.id, slug, ...fields],
      );
      if (inserted.length) break;
      if (attempt > 5) return fail("Não foi possível criar o endereço do convite. Tente de novo.");
      slug = `${base}-${newToken(4)}`;
    }
  }
  if (!existing) (await cookies()).delete(DRAFT_COOKIE);
  redirect(`/painel/${eventId}${existing ? "?salvo=1" : "?novo=1"}`);
}

export async function deleteEvent(form: FormData) {
  const user = await requireUser();
  await q("delete from events where id = $1 and user_id = $2", [text(form, "id", 64), user.id]);
  redirect("/painel");
}

export async function startUpgrade(form: FormData) {
  const user = await requireUser();
  const event = await eventForUser(text(form, "id", 64), user.id);
  if (!event) redirect("/painel");
  if (isPremium(event.plan)) redirect(`/painel/${event.id}/premium`);
  await q("update events set upgrade_requested_at = now() where id = $1", [event.id]);
  // Sem a chave do Mercado Pago configurada, só registra o interesse.
  if (!mercadoPagoEnabled()) redirect(`/painel/${event.id}/premium`);

  let checkoutUrl: string;
  try {
    checkoutUrl = await createCheckout(event, user.email, await baseUrl());
  } catch (error) {
    console.error("Falha ao criar checkout", error);
    redirect(`/painel/${event.id}/premium?erro=1`);
  }
  redirect(checkoutUrl);
}

/* ───────── Convidados (anfitrião) ───────── */

type NewGuest = { name: string; phone: string; maxPeople: number };

async function insertGuests(eventId: string, plan: string, guests: NewGuest[]): Promise<{ added: number; skipped: number }> {
  const limit = guestLimit(plan);
  const room = limit === null ? guests.length : Math.max(0, limit - (await guestCount(eventId)));
  const accepted = guests.slice(0, room);
  // created_at crescente (1 ms por linha): a lista aparece na ordem em que foi colada.
  for (const [index, g] of accepted.entries()) {
    await q("insert into guests (id, event_id, token, name, phone, max_people, created_at) values ($1,$2,$3,$4,$5,$6, now() + ($7::int * interval '1 millisecond'))", [
      newId(),
      eventId,
      newToken(8),
      g.name,
      g.phone,
      g.maxPeople,
      index,
    ]);
  }
  return { added: accepted.length, skipped: guests.length - accepted.length };
}

function people(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1;
}

const FULL = "Você chegou ao limite de convites do plano grátis. Faça o upgrade para convidar mais gente.";
const upgradeLink = (eventId: string) => ({ href: `/painel/${eventId}/premium`, label: "Liberar convites ilimitados" });

export async function addGuest(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return { error: "Evento não encontrado." };
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Informe o nome do convidado ou da família.", values: snapshot(form) };
  const result = await insertGuests(event.id, event.plan, [{ name, phone: onlyDigits(text(form, "phone", 30)), maxPeople: people(text(form, "max_people", 3)) }]);
  if (!result.added) return { error: FULL, values: snapshot(form), link: upgradeLink(event.id) };
  revalidatePath(`/painel/${event.id}`);
  return { ok: `${name} entrou na lista.` };
}

export async function addGuestsBulk(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return { error: "Evento não encontrado." };
  // Guarda a linha original de cada convidado: as que não couberem voltam para o campo, para a pessoa saber quais faltam.
  const guests: NewGuest[] = [];
  const sources: string[] = [];
  const overflow: string[] = [];
  for (const line of text(form, "lines", 20000).split(/\r?\n/)) {
    const guest = parseGuestLine(line);
    if (!guest) continue;
    if (guests.length >= 500) {
      overflow.push(line.trim());
      continue;
    }
    guests.push(guest);
    sources.push(line.trim());
  }
  if (!guests.length) return { error: "Cole pelo menos um nome por linha.", values: snapshot(form) };
  const result = await insertGuests(event.id, event.plan, guests);
  revalidatePath(`/painel/${event.id}`);
  const left = [...sources.slice(result.added), ...overflow];
  const added = result.added === 1 ? "1 convite adicionado." : `${result.added} convites adicionados.`;
  if (!left.length) return { ok: added };
  const values = { lines: left.join("\n") };
  if (!result.skipped) return { ok: added, error: `A lista é adicionada em partes de 500. ${left.length === 1 ? "Ficou 1 linha" : `Ficaram ${left.length} linhas`} no campo: toque em “Adicionar lista” de novo.`, values };
  const kept = left.length === 1 ? "1 nome ficou de fora e continua no campo acima" : `${left.length} nomes ficaram de fora e continuam no campo acima`;
  return {
    ok: result.added ? added : undefined,
    error: `${result.added ? `${kept[0].toUpperCase()}${kept.slice(1)}` : "Nenhum convite foi adicionado"}: o plano grátis vai até ${guestLimit(event.plan)} convites.${result.added ? "" : " Os nomes continuam no campo acima."}`,
    values,
    link: upgradeLink(event.id),
  };
}

/** Corrige nome, celular ou número de pessoas de um convidado sem trocar o link nem apagar a resposta. */
export async function updateGuest(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const event = await eventForUser(text(form, "event_id", 64), user.id);
  if (!event) return { error: "Evento não encontrado." };
  const values = snapshot(form);
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Informe o nome do convidado ou da família.", values };
  const maxPeople = people(text(form, "max_people", 3));
  // Se a pessoa já confirmou mais gente do que o novo total, a confirmação desce junto (nunca fica acima do convite).
  const updated = await q(
    `update guests set name = $1, phone = $2, max_people = $3, people_count = least(people_count, $3)
     where id = $4 and event_id = $5 returning id`,
    [name, onlyDigits(text(form, "phone", 30)).slice(0, 15), maxPeople, text(form, "guest_id", 64), event.id],
  );
  if (!updated.length) return { error: "Convidado não encontrado. Recarregue a página.", values };
  revalidatePath(`/painel/${event.id}`);
  return { ok: "Alterações salvas. O link do convite continua o mesmo.", values };
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

export type RsvpState = { error?: string; saved?: "yes" | "no"; people?: number };

type Answer = "yes" | "no";
const RSVP_CLOSED = "O prazo para confirmar presença já terminou. Fale com quem convidou você.";

/**
 * Grava a resposta de um convidado. O número de pessoas só muda quando a pessoa informa um novo:
 * "não vou" guarda o último número (o painel só soma quem está com "sim"), para não voltar a 1 calado se ela mudar de ideia.
 */
async function saveAnswer(guest: GuestRow, status: Answer, informed: number | null): Promise<number> {
  const count = Math.min(Math.max(informed ?? guest.people_count, status === "yes" ? 1 : 0), guest.max_people);
  await q("update guests set status=$1, people_count=$2, responded_at=now(), opened_at=coalesce(opened_at, now()) where id=$3", [status, count, guest.id]);
  return count;
}

/**
 * Resposta por formulário comum (funciona sem JavaScript). Com `token` é o convite individual: os botões enviam
 * `status` (sim/não) ou `people` (o número de pessoas, que já vale como "sim"). Sem `token` é o link geral: a pessoa diz o nome.
 * Nos dois casos termina no convite individual, na seção da resposta.
 */
export async function submitRsvp(_prev: RsvpState, form: FormData): Promise<RsvpState> {
  if (text(form, "website", 100)) return { saved: "yes" }; // campo-isca: só robôs preenchem
  const event = await eventBySlug(text(form, "slug", 80));
  if (!event) return { error: "Convite não encontrado." };
  if (rsvpClosed(event, todayBR())) return { error: RSVP_CLOSED };

  const token = text(form, "token", 16);
  const peopleRaw = text(form, "people", 3);
  const informed = peopleRaw ? people(peopleRaw) : null;
  const status = text(form, "status", 3) || (token && informed ? "yes" : "");
  const hasNote = form.has("note");
  const note = text(form, "note", 300);

  if (token) {
    if (status !== "yes" && status !== "no") return { error: "Escolha se você vai ou não." };
    const guest = await guestByToken(event.id, token);
    if (!guest) return { error: "Convite não encontrado." };
    await saveAnswer(guest, status, informed);
    if (hasNote) await q("update guests set note=$1 where id=$2", [note, guest.id]);
    revalidatePath(`/painel/${event.id}`);
    redirect(`/c/${event.slug}/${guest.token}?confirmado=${status}#confirmar`);
  }

  if (!event.open_rsvp) return { error: "Este convite é individual. Abra pelo link que você recebeu." };
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Escreva seu nome para a gente saber quem está respondendo." };
  if (status !== "yes" && status !== "no") return { error: "Escolha se você vai ou não." };
  if (status === "yes" && !informed) return { error: "Toque em quantas pessoas vêm, contando com você." };

  // Mesmo aparelho, mesmo nome: atualiza a resposta que já existe em vez de criar outro convidado na lista.
  const jar = await cookies();
  const remembered = jar.get(rsvpCookie(event.slug))?.value;
  const previous = remembered ? await guestByToken(event.id, remembered.slice(0, 16)) : null;
  const same = (a: string, b: string) => a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR");
  let guestToken: string;
  if (previous && previous.source === "open" && same(previous.name, name)) {
    await saveAnswer(previous, status, informed);
    if (hasNote) await q("update guests set note=$1 where id=$2", [note, previous.id]);
    guestToken = previous.token;
  } else {
    const limit = guestLimit(event.plan);
    if (limit !== null && (await guestCount(event.id)) >= limit) {
      return { error: "A lista de confirmações deste evento está cheia. Avise quem convidou você." };
    }
    guestToken = newToken(8);
    // Quem responde pelo link geral pode mudar o número depois, até o teto do link geral (não fica preso ao primeiro número).
    await q(
      `insert into guests (id, event_id, token, name, phone, max_people, status, people_count, note, source, opened_at, open_count, responded_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',now(),1,now())`,
      [newId(), event.id, guestToken, name, onlyDigits(text(form, "phone", 30)).slice(0, 15), OPEN_MAX_PEOPLE, status, status === "yes" ? Math.min(informed ?? 1, OPEN_MAX_PEOPLE) : 0, note],
    );
  }
  // Lembra a resposta neste aparelho: ao reabrir o link geral, a pessoa cai no próprio convite.
  jar.set(rsvpCookie(event.slug), guestToken, { path: `/c/${event.slug}`, maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  revalidatePath(`/painel/${event.id}`);
  redirect(`/c/${event.slug}/${guestToken}?confirmado=${status}#confirmar`);
}

/** Um toque: grava "vou" (com o número de pessoas, quando o convite é para mais de uma) ou "não vou" na hora. */
export async function quickRsvp(slug: string, token: string, status: Answer, count?: number): Promise<{ error?: string; people?: number }> {
  if (status !== "yes" && status !== "no") return { error: "Escolha se você vai ou não." };
  const event = await eventBySlug(String(slug).slice(0, 80));
  if (!event) return { error: "Convite não encontrado." };
  if (rsvpClosed(event, todayBR())) return { error: RSVP_CLOSED };
  const guest = await guestByToken(event.id, String(token).slice(0, 16));
  if (!guest) return { error: "Convite não encontrado." };
  const informed = typeof count === "number" && Number.isFinite(count) ? people(String(Math.trunc(count))) : null;
  const saved = await saveAnswer(guest, status, informed);
  revalidatePath(`/painel/${event.id}`);
  return { people: saved };
}

/** Depois da resposta: recado e, se vier no formulário, o número de pessoas. Só mexe no que foi enviado. */
export async function saveRsvpDetails(_prev: RsvpState, form: FormData): Promise<RsvpState> {
  const event = await eventBySlug(text(form, "slug", 80));
  if (!event) return { error: "Convite não encontrado." };
  if (rsvpClosed(event, todayBR())) return { error: RSVP_CLOSED };
  const guest = await guestByToken(event.id, text(form, "token", 16));
  if (!guest || guest.status === "pending") return { error: "Responda primeiro se você vai." };
  const peopleRaw = text(form, "people", 3);
  const count = guest.status === "yes" && peopleRaw ? Math.min(people(peopleRaw), guest.max_people) : guest.people_count;
  const note = form.has("note") ? text(form, "note", 300) : guest.note;
  await q("update guests set people_count=$1, note=$2 where id=$3", [count, note, guest.id]);
  revalidatePath(`/painel/${event.id}`);
  return { saved: guest.status, people: count };
}

export async function markOpened(slug: string, token: string) {
  const event = await one<{ id: string }>("select id from events where slug = $1", [String(slug).slice(0, 80)]);
  if (!event) return;
  await q("update guests set open_count = open_count + 1, opened_at = coalesce(opened_at, now()) where event_id = $1 and token = $2", [
    event.id,
    String(token).slice(0, 16),
  ]);
}
