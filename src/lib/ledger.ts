import "server-only";
import { db } from "./db";
import { appUrl } from "./env";
import { CATEGORY_CHARITY, CHARITIES, charityFor, impactLine, type Category } from "./charities";
import { categorizeFast, parseFast, type Parsed } from "./parse";
import { PICK_CATEGORIES, isValidPick, type PickCategory } from "./charity-options";
import { categorizeWithLlm, parseWithLlm } from "./llm";
import { addDays, pct, pledgeFor, usd, weekStartET } from "./money";
import { makeToken } from "./session";
import { BAD_PRICE, CHITCHAT, NO_GOAL_HINT, bigPriceCancelled, bigPriceConfirm, newGoalReply } from "./copy";

export type User = { id: number; phone: string; name: string | null; status: string; pending_item: string | null; pending_confirm?: string | null; created_at: string };
export type Goal = { id: number; label: string; target_cents: number; reached_at: string | null };
export type Skip = {
  id: number; item: string; price_cents: number; category: Category; charity: string; pledge_cents: number;
  created_at: string; undone_at: string | null; settled_at: string | null; goal_id: number | null;
};

const MOUTH = [
  "Every no is a yes to something.",
  "Somewhere an ad budget just wept.",
  "They wanted it. You kept it.",
  "Intent 1, impulse 0.",
  "The algorithm will have to cope.",
  "The croissant industry will survive.",
  "Your wallet says thanks.",
  "Retargeting ads: wasted on you.",
  "Quietly powerful.",
  "Tap-to-buy has left the chat.",
];
const mouth = (seed: number) => MOUTH[seed % MOUTH.length];

// ---------- reads ----------

export async function userByPhone(phone: string) {
  const q = await db();
  const [u] = await q<User>("SELECT * FROM users WHERE phone = $1", [phone]);
  return u ?? null;
}

export async function userById(id: number) {
  const q = await db();
  const [u] = await q<User>("SELECT * FROM users WHERE id = $1", [id]);
  return u ?? null;
}

export async function activeGoal(userId: number) {
  const q = await db();
  const [g] = await q<Goal>("SELECT id, label, target_cents, reached_at FROM goals WHERE user_id = $1 AND active ORDER BY id DESC LIMIT 1", [userId]);
  return g ?? null;
}

export async function goalSaved(goalId: number) {
  const q = await db();
  const [r] = await q<{ s: string | null }>("SELECT COALESCE(SUM(price_cents),0) AS s FROM skips WHERE goal_id = $1 AND undone_at IS NULL", [goalId]);
  return Number(r?.s ?? 0);
}

export async function skipsFor(userId: number, since?: string, until?: string) {
  const q = await db();
  const params: unknown[] = [userId];
  let where = "user_id = $1 AND undone_at IS NULL";
  if (since) { params.push(since); where += ` AND created_at >= ($${params.length}::date AT TIME ZONE 'America/New_York')`; }
  if (until) { params.push(until); where += ` AND created_at < ($${params.length}::date AT TIME ZONE 'America/New_York')`; }
  const rows = await q<Skip>(`SELECT * FROM skips WHERE ${where} ORDER BY created_at DESC`, params);
  return rows.map((r) => ({ ...r, id: Number(r.id), price_cents: Number(r.price_cents), pledge_cents: Number(r.pledge_cents) }));
}

export async function summary(userId: number) {
  const goal = await activeGoal(userId);
  const saved = goal ? await goalSaved(goal.id) : 0;
  const all = await skipsFor(userId);
  const week = weekStartET();
  const thisWeek = all.filter((s) => new Date(s.created_at) >= weekStartDate(week));
  const lifetimeSkipped = all.reduce((a, s) => a + s.price_cents, 0);
  const lifetimePledged = all.reduce((a, s) => a + s.pledge_cents, 0);
  const unsettled = all.filter((s) => !s.settled_at);
  const byCharity: Record<string, number> = {};
  for (const s of unsettled) byCharity[s.charity] = (byCharity[s.charity] ?? 0) + s.pledge_cents;
  const donated = all.filter((s) => s.settled_at).reduce((a, s) => a + s.pledge_cents, 0);
  return {
    goal: goal ? { ...goal, target_cents: Number(goal.target_cents), saved, pct: pct(saved, Number(goal.target_cents)) } : null,
    thisWeek: { count: thisWeek.length, skipped: thisWeek.reduce((a, s) => a + s.price_cents, 0), pledged: thisWeek.reduce((a, s) => a + s.pledge_cents, 0) },
    lifetime: { count: all.length, skipped: lifetimeSkipped, pledged: lifetimePledged, donated },
    owed: byCharity,
    recent: all.slice(0, 12),
  };
}

function weekStartDate(ymd: string) {
  // Monday 00:00 ET ≈ 04:00/05:00 UTC; use 04:00 UTC (EDT) — DST edge is irrelevant for a weekly tally.
  return new Date(`${ymd}T04:00:00Z`);
}

export async function issueNumber(user: User, weekStart: string) {
  const first = weekStartET(new Date(user.created_at));
  const diff = Math.round((new Date(weekStart).getTime() - new Date(first).getTime()) / (7 * 864e5));
  return diff + 1;
}

export async function weekRecap(userId: number, weekStart: string) {
  const skips = await skipsFor(userId, weekStart, addDays(weekStart, 7));
  const byCat: Record<string, { count: number; cents: number }> = {};
  const byCharity: Record<string, number> = {};
  for (const s of skips) {
    byCat[s.category] = { count: (byCat[s.category]?.count ?? 0) + 1, cents: (byCat[s.category]?.cents ?? 0) + s.price_cents };
    byCharity[s.charity] = (byCharity[s.charity] ?? 0) + s.pledge_cents;
  }
  return {
    skips,
    count: skips.length,
    skipped: skips.reduce((a, s) => a + s.price_cents, 0),
    pledged: skips.reduce((a, s) => a + s.pledge_cents, 0),
    byCat,
    byCharity,
    biggest: [...skips].sort((a, b) => b.price_cents - a.price_cents)[0] ?? null,
  };
}

// ---------- charity picks ----------

export async function charityPicks(userId: number): Promise<Partial<Record<PickCategory, string>>> {
  const q = await db();
  const rows = await q<{ category: PickCategory; slug: string }>("SELECT category, slug FROM user_charities WHERE user_id = $1", [userId]);
  return Object.fromEntries(rows.filter((r) => isValidPick(r.category, r.slug)).map((r) => [r.category, r.slug]));
}

export async function charityChoice(userId: number, category: Category): Promise<string> {
  if (category === "other") return CATEGORY_CHARITY.other;
  const picks = await charityPicks(userId);
  return picks[category] ?? CATEGORY_CHARITY[category];
}

export async function saveCharityPicks(userId: number, picks: Partial<Record<PickCategory, string>>) {
  const q = await db();
  for (const cat of PICK_CATEGORIES) {
    const slug = picks[cat];
    if (!slug || !isValidPick(cat, slug)) continue;
    await q(
      `INSERT INTO user_charities (user_id, category, slug) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, category) DO UPDATE SET slug = EXCLUDED.slug, updated_at = now()`,
      [userId, cat, slug],
    );
  }
}

// ---------- writes ----------

export async function createUser(phone: string, goalLabel: string, goalCents: number, name?: string | null) {
  const q = await db();
  const existing = await userByPhone(phone);
  let id: number;
  if (existing) {
    id = Number(existing.id);
    await q("UPDATE users SET status = 'active', consent_at = now(), name = COALESCE($2, name) WHERE id = $1", [id, name ?? null]);
  } else {
    const [u] = await q<{ id: number }>("INSERT INTO users (phone, name, consent_at) VALUES ($1, $2, now()) RETURNING id", [phone, name ?? null]);
    id = Number(u.id);
  }
  if (goalLabel && goalCents > 0 && !(await activeGoal(id))) await setGoal(id, goalLabel, goalCents);
  return id;
}

export function cleanGoal(label: string) {
  const t = label.trim().replace(/^(a|an|the|my|new)\s+/i, "").replace(/[.!]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export async function setGoal(userId: number, rawLabel: string, cents: number) {
  const label = cleanGoal(rawLabel);
  const q = await db();
  await q("UPDATE goals SET active = false WHERE user_id = $1 AND active", [userId]);
  await q("INSERT INTO goals (user_id, label, target_cents) VALUES ($1, $2, $3)", [userId, label, cents]);
}

async function log(userId: number | null, direction: "in" | "out", channel: string, body: string, intent?: string, sid: string | null = null) {
  const q = await db();
  await q("INSERT INTO messages (user_id, direction, channel, body, intent, sid) VALUES ($1,$2,$3,$4,$5,$6)", [userId, direction, channel, body, intent ?? null, sid]);
}

async function categorize(item: string, hint: Category | null): Promise<Category> {
  return hint ?? categorizeFast(item) ?? (await categorizeWithLlm(item)) ?? "other";
}

async function recordSkip(user: User, item: string, priceCents: number, raw: string, sid: string | null, hint: Category | null) {
  const q = await db();
  const category = await categorize(item, hint);
  const charitySlug = await charityChoice(Number(user.id), category);
  const pledge = pledgeFor(priceCents);
  const goal = await activeGoal(Number(user.id));
  if (sid) {
    const dup = await q("SELECT 1 FROM skips WHERE message_sid = $1", [sid]);
    if (dup.length) return null; // Twilio retry — already recorded
  }
  await q(
    `INSERT INTO skips (user_id, goal_id, item, price_cents, category, charity, pledge_cents, raw_text, message_sid)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [user.id, goal?.id ?? null, item, priceCents, category, charitySlug, pledge, raw, sid],
  );
  await q("UPDATE users SET pending_item = NULL WHERE id = $1", [user.id]);
  return { category, charitySlug, pledge, goal };
}

// ---------- the conversation ----------

export async function dashboardLink(userId: number) {
  return `${appUrl()}/in/${makeToken(userId, 60 * 60 * 24 * 7)}`;
}

/** Handle one inbound message. Returns the reply text (or null for STOP). */
export async function handleMessage(opts: { user: User; body: string; channel: "sms" | "sim"; sid?: string | null }): Promise<string | null> {
  const { user, body, channel } = opts;
  const uid = Number(user.id);
  if (opts.sid) {
    const q = await db();
    const seen = await q("SELECT 1 FROM messages WHERE sid = $1", [opts.sid]);
    if (seen.length) return null; // Twilio retry
  }
  await log(uid, "in", channel, body, undefined, opts.sid ?? null);

  let parsed: Parsed | null = parseFast(body);
  let hint: Category | null = null;
  if (!parsed) {
    const llm = await parseWithLlm(body);
    parsed = llm?.parsed ?? { intent: "unknown" };
    hint = llm?.category ?? null;
  }

  const reply = await respond(user, parsed, body, opts.sid ?? null, hint);
  if (reply) await log(uid, "out", channel, reply, parsed.intent);
  return reply;
}

async function respond(user: User, p: Parsed, raw: string, sid: string | null, hint: Category | null): Promise<string | null> {
  const q = await db();
  const uid = Number(user.id);

  // A big price is waiting for YES.
  if (user.pending_confirm) {
    await q("UPDATE users SET pending_confirm = NULL WHERE id = $1", [uid]);
    if (p.intent === "start") {
      try {
        const pc = JSON.parse(user.pending_confirm) as { item: string; cents: number };
        return skipReply(user, pc.item, pc.cents, raw, sid, hint);
      } catch {
        /* fall through */
      }
    } else if (p.intent === "unknown") {
      return bigPriceCancelled;
    }
  }

  switch (p.intent) {
    case "stop":
      await q("UPDATE users SET status = 'stopped' WHERE id = $1", [uid]);
      return null; // Twilio handles the STOP confirmation for toll-free numbers
    case "start":
      await q("UPDATE users SET status = 'active' WHERE id = $1", [uid]);
      return "You're back. Text what you didn't buy, like: croissant 5";
    case "help":
      return "Donate the Difference: text what you skipped + price (croissant 5). Also: totals, undo, new goal bike 500, dashboard. Help: hello@notbuying.org. Msg&data rates may apply. STOP to opt out.";
    case "dashboard":
      return `Your dashboard: ${await dashboardLink(uid)}`;
    case "totals": {
      const s = await summary(uid);
      const g = s.goal ? `${s.goal.label}: ${usd(s.goal.saved)} of ${usd(s.goal.target_cents)} (${s.goal.pct}%). ` : "No goal yet. Text: new goal bike 500. ";
      return `${g}This week: ${s.thisWeek.count} skip${s.thisWeek.count === 1 ? "" : "s"}, ${usd(s.thisWeek.pledged, { always2: true })} pledged. Lifetime pledged: ${usd(s.lifetime.pledged, { always2: true })}.`;
    }
    case "undo": {
      const [last] = await q<{ id: number; item: string; price_cents: number }>(
        "SELECT id, item, price_cents FROM skips WHERE user_id = $1 AND undone_at IS NULL AND settled_at IS NULL ORDER BY created_at DESC LIMIT 1",
        [uid],
      );
      if (!last) return "Nothing to undo.";
      await q("UPDATE skips SET undone_at = now() WHERE id = $1", [last.id]);
      const g = await activeGoal(uid);
      if (g?.reached_at && (await goalSaved(Number(g.id))) < Number(g.target_cents)) await q("UPDATE goals SET reached_at = NULL WHERE id = $1", [g.id]);
      return `Undone: ${last.item} ${usd(Number(last.price_cents))}. If the price was off, text it again with the right one.`;
    }
    case "new_goal": {
      if (!p.targetCents) return `What does ${cleanGoal(p.label)} cost? Text: new goal ${p.label} 500`;
      await setGoal(uid, p.label, p.targetCents);
      return newGoalReply(cleanGoal(p.label), usd(p.targetCents));
    }
    case "bad_price":
      return BAD_PRICE;
    case "price_only": {
      if (!user.pending_item) return "Got a number, but for what? Text the item and price, like: croissant 5";
      if (p.needsConfirm) return askConfirm(uid, user.pending_item, p.priceCents);
      return skipReply(user, user.pending_item, p.priceCents, raw, sid, hint);
    }
    case "skip": {
      if (!p.priceCents) {
        await q("UPDATE users SET pending_item = $2 WHERE id = $1", [uid, p.item]);
        return `Nice. What would the ${p.item} have cost? Just text the number.`;
      }
      if (p.needsConfirm) return askConfirm(uid, p.item, p.priceCents);
      return skipReply(user, p.item, p.priceCents, raw, sid, hint);
    }
    default:
      return CHITCHAT;
  }
}

async function askConfirm(uid: number, item: string, cents: number) {
  const q = await db();
  await q("UPDATE users SET pending_confirm = $2, pending_item = NULL WHERE id = $1", [uid, JSON.stringify({ item, cents })]);
  return bigPriceConfirm(usd(cents));
}

async function skipReply(user: User, item: string, priceCents: number, raw: string, sid: string | null, hint: Category | null) {
  const r = await recordSkip(user, item, priceCents, raw, sid, hint);
  if (!r) return null;
  const charity = CHARITIES[r.charitySlug];
  const impact = impactLine(charity, r.pledge);
  const pledgeTxt = `${usd(r.pledge, { always2: true })} pledged to ${charity.name}${impact ? ` (${impact})` : ""}.`;
  let goalTxt = `${NO_GOAL_HINT}.`;
  if (r.goal) {
    const saved = await goalSaved(Number(r.goal.id));
    const target = Number(r.goal.target_cents);
    if (saved >= target && !r.goal.reached_at) {
      const q = await db();
      await q("UPDATE goals SET reached_at = now() WHERE id = $1", [r.goal.id]);
      return `No ${item}. That's it: ${usd(saved)} skipped toward ${r.goal.label}. GOAL REACHED. ${pledgeTxt} Go get it. Then text: new goal ...`;
    }
    goalTxt = `${r.goal.label}: ${usd(saved)} of ${usd(target)} (${pct(saved, target)}%).`;
  }
  return `No ${item}. +${usd(priceCents)}. ${goalTxt} ${pledgeTxt} ${mouth(Math.floor(Date.now() / 1000) + item.length)}`;
}

export { charityFor };
