import assert from "node:assert/strict";
import { test } from "node:test";
import { parseGuestLine } from "../src/lib/guest-lines.ts";

test("lista de convidados: ponto e vírgula, tabulação e vírgula", () => {
  assert.deepEqual(parseGuestLine("Família Oliveira; 11 99999-8888; 4"), { name: "Família Oliveira", phone: "11999998888", maxPeople: 4 });
  assert.deepEqual(parseGuestLine("Tia Lúcia; 2"), { name: "Tia Lúcia", phone: "", maxPeople: 2 });
  assert.deepEqual(parseGuestLine("João Pedro"), { name: "João Pedro", phone: "", maxPeople: 1 });
  assert.deepEqual(parseGuestLine("Ana\t(11) 98888-7777\t3"), { name: "Ana", phone: "11988887777", maxPeople: 3 });
  // vírgula só separa quando o que vem depois é telefone ou número
  assert.deepEqual(parseGuestLine("Maria, 11 97777-6666, 2"), { name: "Maria", phone: "11977776666", maxPeople: 2 });
  assert.deepEqual(parseGuestLine("Maria, 3"), { name: "Maria", phone: "", maxPeople: 3 });
  assert.deepEqual(parseGuestLine("Silva, João"), { name: "Silva, João", phone: "", maxPeople: 1 });
  assert.deepEqual(parseGuestLine("Silva, João, 11 97777-6666"), { name: "Silva, João", phone: "11977776666", maxPeople: 1 });
  assert.equal(parseGuestLine("   "), null);
  assert.equal(parseGuestLine("; 11 99999-8888"), null);
});
