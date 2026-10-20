/**
 * Lawmaker list for the /congress/ pages.
 *
 * Sources, merged by slug (later wins on a tie; de-duplicated, re-ranked by trade count):
 *   1. tools/data.json       -> topLawmakers : the original most-active export (legacy).
 *   2. tools/lawmakers-export.json           : the app export (server/scripts/export-lawmakers.ts) —
 *      the most active traders from the production DB, as many as you ask it for.
 *   3. tools/extra-lawmakers.json            : hand-curated notable members (e.g. Nancy Pelosi).
 *      Wins over the bulk export so a manual correction sticks. See extra-lawmakers.example.json.
 *
 * Every record must carry REAL figures from the app database (name, party, chamber, state, n,
 * buys, sells, first, last). Do not invent numbers for real lawmakers.
 */
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const readJson = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : []; };
const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
const exported = readJson("lawmakers-export.json");
const extra = readJson("extra-lawmakers.json");

export const asOf = data.asOf;

// Role comes from the chamber field (robust whether or not the name carries a "Rep./Sen." title).
const roleOf = (chamber) => (/senate/i.test(String(chamber)) ? "Senator" : "Representative");
const cleanName = (n) => String(n).replace(/^(Rep\.|Sen\.|Del\.|Representative|Senator)\s+/i, "").trim();
const slugify = (n) => cleanName(n).toLowerCase().replace(/[.'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const required = ["name", "party", "chamber", "state", "n", "buys", "sells", "first", "last"];
const valid = (l) => l && required.every((k) => l[k] !== undefined && l[k] !== null && l[k] !== "");

// Merge in priority order; a later source with the same slug overrides an earlier one.
const bySlug = new Map();
for (const l of [...(data.topLawmakers || []), ...exported, ...extra]) {
  if (!valid(l)) { if (l && l.name) console.warn(`lawmakers: skipping "${l.name}" — missing required field(s)`); continue; }
  bySlug.set(slugify(l.name), l);
}

export const lawmakers = [...bySlug.values()]
  .sort((a, b) => (b.n || 0) - (a.n || 0))
  .map((l, i) => ({
    rank: i + 1,
    raw: l.name,
    name: cleanName(l.name),
    role: roleOf(l.chamber),
    slug: slugify(l.name),
    party: l.party,
    chamber: l.chamber,
    state: l.state,
    n: l.n,
    buys: l.buys,
    sells: l.sells,
    buyPct: Math.round((l.buys / l.n) * 100),
    first: l.first,
    last: l.last,
    firstY: String(l.first).slice(0, 4),
    lastY: String(l.last).slice(0, 4),
  }));
