/**
 * Lawmaker list derived from tools/data.json (topLawmakers, exported from the app database).
 * One entry per member with a slug, clean name, role and summary counts.
 * Shared by build-lawmakers.mjs (page generator) and build-blog.mjs (sitemap + llms.txt).
 *
 * These are the most active disclosed traders only — the full roster lives in the app.
 * To add more lawmakers (e.g. high-search names), export them into data.json.topLawmakers
 * with the same fields; their pages then build automatically.
 */
import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "data.json"), "utf8"));

export const asOf = data.asOf;

const roleOf = (n) => (/^Sen\./.test(n) ? "Senator" : "Representative");
const cleanName = (n) => n.replace(/^(Rep\.|Sen\.|Del\.)\s+/, "").trim();
const slugify = (n) => cleanName(n).toLowerCase().replace(/[.'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const lawmakers = (data.topLawmakers || []).map((l, i) => {
  const name = cleanName(l.name);
  return {
    rank: i + 1,
    raw: l.name,
    name,
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
    firstY: l.first.slice(0, 4),
    lastY: l.last.slice(0, 4),
  };
});
