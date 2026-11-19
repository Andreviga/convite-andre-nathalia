import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { one, q } from "./db";
import { newId } from "./ids";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const COOKIE = "convidei_sessao";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await q("insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)", [digest(token), userId, expires.toISOString()]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q("delete from sessions where token_hash = $1", [digest(token)]);
  jar.delete(COOKIE);
}

export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    `select u.id, u.email, u.name from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [digest(token)],
  );
});

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  const id = newId();
  const rows = await q<User>(
    `insert into users (id, email, name, password_hash) values ($1, $2, $3, $4)
     on conflict (email) do nothing returning id, email, name`,
    [id, email, name, await hashPassword(password)],
  );
  return rows[0] ?? null;
}

export async function checkLogin(email: string, password: string): Promise<User | null> {
  const row = await one<User & { password_hash: string }>("select id, email, name, password_hash from users where email = $1", [email]);
  // Confere a senha mesmo quando o e-mail não existe, para o tempo de resposta não revelar quem tem conta.
  const ok = await verifyPassword(password, row?.password_hash ?? "00:00");
  return row && ok ? { id: row.id, email: row.email, name: row.name } : null;
}
