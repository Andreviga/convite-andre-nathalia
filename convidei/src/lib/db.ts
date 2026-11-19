import { mkdirSync } from "node:fs";
import { MIGRATIONS } from "./schema.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>;

const store = globalThis as unknown as { __convideiDb?: Promise<Runner> };

async function migrate(run: Runner) {
  await run(
    "create table if not exists schema_migrations (version int primary key, applied_at timestamptz not null default now())",
  );
  const done = new Set((await run("select version from schema_migrations")).map((r) => Number(r.version)));
  for (let i = 0; i < MIGRATIONS.length; i++) {
    if (done.has(i + 1)) continue;
    for (const statement of MIGRATIONS[i]) await run(statement);
    await run("insert into schema_migrations (version) values ($1) on conflict do nothing", [i + 1]);
  }
}

async function connect(): Promise<Runner> {
  const url = process.env.DATABASE_URL;
  let run: Runner;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    run = async (text, params = []) => (await sql.query(text, params)) as Row[];
  } else {
    if (process.env.VERCEL) throw new Error("DATABASE_URL não está configurada.");
    // Desenvolvimento e testes: Postgres embutido, sem nada para instalar.
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = process.env.PGLITE_DIR ?? ".data/pglite";
    if (!dir.startsWith("memory://")) mkdirSync(dir, { recursive: true });
    const db = new PGlite(dir);
    run = async (text, params = []) => (await db.query(text, params as unknown[])).rows as Row[];
  }
  await migrate(run);
  return run;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  store.__convideiDb ??= connect().catch((err) => {
    store.__convideiDb = undefined;
    throw err;
  });
  const run = await store.__convideiDb;
  return (await run(text, params)) as T[];
}

export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
