/**
 * Lawmaker list for the /congress/ pages.
 *
 * Sources, merged by slug (de-duplicated, re-ranked by trade count):
 *   1. tools/data.json  -> topLawmakers : the most active traders, exported from the app DB.
 *   2. tools/extra-lawmakers.json       : hand-curated notable members (e.g. Nancy Pelosi) who
 *      are NOT in the top-by-count export. This file is NOT overwritten when data.json is
 *      re-exported, so curated pages survive. See tools/extra-lawmakers.example.json for the shape.
 *
 * Every record must carry REAL figures from the app database (name, party, chamber, state, n,
 * buys, sells, first, last). Do not invent numbers for real lawmakers — run the query in the
 * README against the app's SQLite DB and paste the result into extra-lawmakers.json.
 */
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
const extraPath = path.join(dir, "extra-lawmakers.json");
const extra = fs.existsSync(extraPath) ? JSON.parse(fs.readFileSync(extraPath, "utf8")) : [];

export const asOf = data.asOf;

const roleOf = (n) => (/^Sen\./.test(n) ? "Senator" : "Representative");
const cleanName = (n) => n.replace(/^(Rep\.|Sen\.|Del\.)\s+/, "").trim();
const slugify = (n) => cleanName(n).toLowerCase().replace(/[.'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const required = ["name", "party", "chamber", "state", "n", "buys", "sells", "first", "last"];
const valid = (l) => l && required.every((k) => l[k] !== undefined && l[k] !== null && l[k] !== "");

// Merge: data.json first, then extras (an extra with the same slug overrides).
const bySlug = new Map();
for (const l of [...(data.topLawmakers || []), ...extra]) {
  if (!valid(l)) { if (l && l.name) console.warn(`lawmakers: skipping "${l.name}" — missing required field(s)`); continue; }
  bySlug.set(slugify(l.name), l);
}

export const lawmakers = [...bySlug.values()]
  .sort((a, b) => (b.n || 0) - (a.n || 0))
  .map((l, i) => ({
    rank: i + 1,
    raw: l.name,
    name: cleanName(l.name),
    role: roleOf(l.name),
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
