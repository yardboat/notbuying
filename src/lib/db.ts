import "server-only";

// One tiny query interface over two drivers:
//  - Neon (serverless HTTP) when DATABASE_URL is set (preview + production)
//  - PGlite (embedded Postgres) for local dev / when no database is connected yet
// Schema is idempotent (CREATE ... IF NOT EXISTS) and applied once per cold start.

type Row = Record<string, unknown>;
type Query = <T = Row>(text: string, params?: unknown[]) => Promise<T[]>;

let queryFn: Query | null = null;
let ready: Promise<void> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  pending_item TEXT,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  label TEXT NOT NULL,
  target_cents INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  reached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS skips (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  goal_id BIGINT REFERENCES goals(id),
  item TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  category TEXT NOT NULL,
  charity TEXT NOT NULL,
  pledge_cents INTEGER NOT NULL,
  raw_text TEXT,
  message_sid TEXT UNIQUE,
  undone_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS skips_user_idx ON skips(user_id, created_at);
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  direction TEXT NOT NULL,
  channel TEXT NOT NULL,
  body TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS auth_codes (
  phone TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settle_ups (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  charity TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  partner_id TEXT UNIQUE NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS weekly_sends (
  user_id BIGINT NOT NULL,
  week_start DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);
`;

async function init(): Promise<Query> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    return (async (text: string, params: unknown[] = []) => {
      const res = await sql.query(text, params);
      return res as never;
    }) as Query;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.VERCEL ? "/tmp/pglite" : "./.pglite";
  const g = globalThis as unknown as { __pglite?: InstanceType<typeof PGlite> };
  g.__pglite ??= new PGlite(dir);
  const pg = g.__pglite;
  return (async (text: string, params: unknown[] = []) => {
    const res = await pg.query(text, params);
    return res.rows as never;
  }) as Query;
}

async function applySchema(q: Query) {
  for (const stmt of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
    await q(stmt);
  }
}

export async function db(): Promise<Query> {
  if (!queryFn) queryFn = await init();
  if (!ready) ready = applySchema(queryFn);
  await ready;
  return queryFn;
}

export const usingEmbeddedDb = () => !process.env.DATABASE_URL;
