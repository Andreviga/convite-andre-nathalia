import assert from "node:assert/strict";
import { test } from "node:test";
import { crc16, normalizePixKey, pixPayload } from "../src/lib/pix.ts";
import { csvCell, daysUntil, googleCalendarUrl, icsFile, isDate, longDate, prettyTime, safeUrl, whatsappNumber } from "../src/lib/format.ts";
import { slugify } from "../src/lib/ids.ts";

test("crc16 bate com o vetor padrão CCITT-FALSE", () => {
  assert.equal(crc16("123456789"), "29B1");
});

test("pix: payload bem formado e com CRC válido", () => {
  const payload = pixPayload("+5511999998888", "André Vigarani da Silva Sauro Longo", "São Bernardo do Campo");
  assert.match(payload, /^000201/);
  assert.ok(payload.includes("0014br.gov.bcb.pix0114+5511999998888"));
  assert.ok(payload.includes("5925Andre Vigarani da Silva S"));
  assert.ok(payload.includes("6015Sao Bernardo do"));
  assert.equal(crc16(payload.slice(0, -4)), payload.slice(-4));
});

test("pix: normaliza chave conforme o tipo", () => {
  assert.equal(normalizePixKey("cpf", "123.456.789-09"), "12345678909");
  assert.equal(normalizePixKey("telefone", "(11) 99999-8888"), "+5511999998888");
  assert.equal(normalizePixKey("telefone", "+55 11 99999-8888"), "+5511999998888");
  assert.equal(normalizePixKey("email", " Ana@Exemplo.com "), "ana@exemplo.com");
  assert.equal(normalizePixKey("cpf", "123"), null);
  assert.equal(normalizePixKey("aleatoria", "nao-e-uuid"), null);
});

test("datas", () => {
  assert.equal(isDate("2026-05-03"), true);
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(longDate("2026-05-03"), "3 de maio de 2026");
  assert.equal(prettyTime("16:00"), "16h");
  assert.equal(prettyTime("19:30"), "19h30");
  assert.equal(daysUntil("2026-05-03", "2026-05-01"), 2);
  assert.equal(daysUntil("2026-05-03", "2026-05-04"), -1);
});

test("links", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("loja.com.br/lista"), "https://loja.com.br/lista");
  assert.equal(whatsappNumber("(11) 99999-8888"), "5511999998888");
  assert.equal(whatsappNumber("123"), "");
  assert.equal(slugify("André & Nathália"), "andre-e-nathalia");
});

test("agenda", () => {
  const ev = { title: "Casamento", date: "2026-05-03", time: "22:30", location: "Rua A, 1", details: "x" };
  assert.ok(googleCalendarUrl(ev).includes("dates=20260503T223000%2F20260504T023000"));
  const ics = icsFile({ ...ev, uid: "1", url: "https://x" });
  assert.ok(ics.includes("DTSTART;TZID=America/Sao_Paulo:20260503T223000"));
  assert.ok(ics.includes("LOCATION:Rua A\\, 1"));
});

test("csv não deixa virar fórmula", () => {
  assert.equal(csvCell('=SOMA(1;2) "x"'), `"'=SOMA(1;2) ""x"""`);
});

import { createHmac } from "node:crypto";
import { planEffect, validSignature } from "../src/lib/mercadopago.ts";

test("mercado pago: só pagamento aprovado, em reais e no valor cheio libera o Premium", () => {
  const base = { id: 1, external_reference: "e", transaction_amount: 79, currency_id: "BRL" };
  assert.equal(planEffect({ ...base, status: "approved" }), "premium");
  assert.equal(planEffect({ ...base, status: "approved", transaction_amount: 1 }), "none");
  assert.equal(planEffect({ ...base, status: "approved", currency_id: "ARS" }), "none");
  assert.equal(planEffect({ ...base, status: "pending" }), "none");
  assert.equal(planEffect({ ...base, status: "rejected" }), "none");
  assert.equal(planEffect({ ...base, status: "refunded" }), "free");
  assert.equal(planEffect({ ...base, status: "charged_back" }), "free");
});

test("mercado pago: assinatura do aviso", () => {
  const now = 1_800_000_000_000;
  const ts = String(now);
  const v1 = createHmac("sha256", "segredo").update(`id:123;request-id:req-1;ts:${ts};`).digest("hex");
  assert.equal(validSignature("segredo", `ts=${ts},v1=${v1}`, "req-1", "123", now), true);
  assert.equal(validSignature("outro", `ts=${ts},v1=${v1}`, "req-1", "123", now), false);
  assert.equal(validSignature("segredo", `ts=${ts},v1=${v1}`, "req-1", "999", now), false);
  assert.equal(validSignature("segredo", `ts=${ts},v1=${v1}`, "req-1", "123", now + 3_600_000), false);
  assert.equal(validSignature("segredo", null, "req-1", "123", now), false);
});

import { splitTitle } from "../src/lib/names.ts";

test("nomes: separa o casal e tira as iniciais", () => {
  assert.deepEqual(splitTitle("Marina & Rafael"), { names: ["Marina", "Rafael"], connector: "&", initials: ["M", "R"] });
  assert.deepEqual(splitTitle("Ângela e João Pedro"), { names: ["Ângela", "João Pedro"], connector: "e", initials: ["Â", "J"] });
  assert.deepEqual(splitTitle("Helena faz 30").names, ["Helena faz 30"]);
  assert.deepEqual(splitTitle("Chá do Miguel").initials, ["C"]);
  assert.equal(splitTitle("Formatura de Direito e Jantar de confraternização da turma de 2026").names.length, 1);
});
