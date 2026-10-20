/**
 * Builds the per-lawmaker SEO pages: /congress/index.html and /congress/<slug>/index.html.
 *   node tools/build-lawmakers.mjs      (run from the repo root)
 * Data comes from tools/lawmakers.mjs (derived from tools/data.json). Run tools/build-blog.mjs
 * afterwards so sitemap.xml and llms.txt pick the new pages up.
 */
import fs from "node:fs";
import path from "node:path";
import { lawmakers, asOf } from "./lawmakers.mjs";
import { SITE, BRAND, esc, clip, fmtDate, header, footer, head } from "./shell.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const num = (x) => Number(x).toLocaleString("en-US");
const OG = `${SITE}/assets/og-image.jpg`;

const miniCard = (l) => `<a class="post lw" href="/congress/${l.slug}/"><div class="pb"><span class="pc">${esc(l.party)} · ${esc(l.chamber)} · ${esc(l.state)}</span><h3>${esc(l.name)}</h3><p>${num(l.n)} disclosed trades · ${num(l.buys)} buys / ${num(l.sells)} sells · ${l.firstY}–${l.lastY}</p></div></a>`;

// ---------- per-lawmaker pages ----------
for (const l of lawmakers) {
  const url = `${SITE}/congress/${l.slug}/`;
  const t0 = `${l.name} Stock Trades`;
  const title = `${t0} | ${BRAND}`.length <= 60 ? `${t0} | ${BRAND}` : t0;
  const desc = clip(`${l.name}, ${l.party} ${l.role} from ${l.state}, has disclosed ${num(l.n)} stock trades under the STOCK Act — ${num(l.buys)} buys and ${num(l.sells)} sells, from ${l.firstY} to ${l.lastY}. See the record and get alerts.`, 158);
  const related = [...lawmakers.filter((x) => x.slug !== l.slug && x.chamber === l.chamber), ...lawmakers.filter((x) => x.slug !== l.slug && x.chamber !== l.chamber)].slice(0, 3);

  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "ProfilePage", "@id": `${url}#page`, url, name: title, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${url}#person` }, breadcrumb: { "@id": `${url}#bc` }, inLanguage: "en-US", dateModified: asOf },
    { "@type": "Person", "@id": `${url}#person`, name: l.name, jobTitle: `${l.party} ${l.role}`, homeLocation: { "@type": "AdministrativeArea", name: l.state }, subjectOf: { "@id": `${url}#dataset` } },
    { "@type": "Dataset", "@id": `${url}#dataset`, name: `${l.name} — Congressional Stock Trade Disclosures`, description: `${num(l.n)} stock-trade transactions disclosed by ${l.name} under the STOCK Act (${num(l.buys)} buys, ${num(l.sells)} sells), ${l.firstY}–${l.lastY}, from the official filings.`, url, creator: { "@id": `${SITE}/#org` }, isAccessibleForFree: true, license: `${SITE}/terms/`, temporalCoverage: `${l.first}/${l.last}`, variableMeasured: ["Company or asset", "Ticker", "Transaction type", "Trade date", "Filing date", "Amount range (USD)"], measurementTechnique: "Official House Clerk and Senate eFD Periodic Transaction Report filings.", dateModified: asOf },
    { "@type": "BreadcrumbList", "@id": `${url}#bc`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: "Lawmakers", item: `${SITE}/congress/` }, { "@type": "ListItem", position: 3, name: `${l.name} stock trades`, item: url }] },
  ] };

  const html = `${head({ title, desc, url, image: OG, ld, type: "profile" })}
${header()}
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/congress/">Lawmakers</a> › <span>${esc(l.name)}</span></nav>
  <article>
    <header class="ahead">
      <span class="eyebrow">${esc(l.party)} ${esc(l.role)} · ${esc(l.state)}</span>
      <h1>${esc(l.name)} Stock Trades</h1>
      <p class="lead">${esc(l.name)} is a <b>${esc(l.party)} ${esc(l.role.toLowerCase())}</b> from ${esc(l.state)}. Under the <b>STOCK Act</b>, they have disclosed <b>${num(l.n)}</b> stock, bond, option and fund transactions between ${fmtDate(l.first)} and ${fmtDate(l.last)} — ${num(l.buys)} purchases and ${num(l.sells)} sales — each filed as a public <b>Periodic Transaction Report</b>.</p>
      <div class="proof">
        <div><b>${num(l.n)}</b><span>disclosed trades</span></div>
        <div><b>${num(l.buys)}</b><span>purchases</span></div>
        <div><b>${num(l.sells)}</b><span>sales</span></div>
        <div><b>${l.firstY}–${l.lastY}</b><span>years on the record</span></div>
      </div>
    </header>
    <div class="prose">
      <h2 id="record">What's in ${esc(l.name)}'s disclosure record</h2>
      <p>Each of ${esc(l.name)}'s ${num(l.n)} filings names the <b>company or asset</b> and its <b>ticker</b>, whether the transaction was a <b>purchase, sale or exchange</b>, the <b>trade date</b>, the <b>filing date</b>, and a reported <b>amount range</b> such as $15,001–$50,000. Filings never state exact dollar amounts, which is why every figure is a band. The STOCK Act gives lawmakers up to <b>45 days</b> to disclose a trade, so a filing date can trail the trade itself by weeks.</p>
      <h2 id="activity">How active is ${esc(l.name)}?</h2>
      <p>${esc(l.name)} ranks <b>#${l.rank}</b> among the most active disclosed traders in the ${BRAND} record since 2014, with <b>${num(l.n)}</b> transactions over ${Number(l.lastY) - Number(l.firstY) || 1} years. Of those, <b>${l.buyPct}%</b> are purchases and <b>${100 - l.buyPct}%</b> are sales. A high filing count reflects disclosed <em>activity</em> — not the size, timing or performance of the trades, which are reported only as ranges and can be amended by the filer.</p>
    </div>
    <aside class="cta-box"><div><b>See every ${esc(l.name)} trade</b><p>All ${num(l.n)} filings — the company, ticker, amount range and how late each one was filed — searchable and free. Follow ${esc(l.name)} to get a Telegram, WhatsApp or email alert the moment a new trade is disclosed.</p></div><div class="btns"><a class="btn gold" href="/signup">See the full record free</a><a class="btn" href="/congress/">All lawmakers</a></div></aside>
    <p class="disc-inline">Figures are ${num(l.n)} transactions as collected in the ${BRAND} database as of ${fmtDate(asOf)} from public STOCK Act filings; filings can be amended by the filer. ${BRAND} is independent, not affiliated with any lawmaker, and provides no investment advice. Amounts are the ranges lawmakers report.</p>
  </article>
  <section class="related"><h2>Other active traders in Congress</h2><div class="grid3">${related.map(miniCard).join("")}</div></section>
</main>
${footer()}
</body></html>`;

  fs.mkdirSync(path.join(root, "congress", l.slug), { recursive: true });
  fs.writeFileSync(path.join(root, "congress", l.slug, "index.html"), html);
  console.log(`congress/${l.slug}/`);
}

// ---------- /congress/ index ----------
{
  const url = `${SITE}/congress/`;
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": `${url}#page`, url, name: `Congress Stock Trades by Lawmaker | ${BRAND}`, description: "The most active disclosed stock traders in Congress since 2014, ranked by number of STOCK Act filings.", isPartOf: { "@id": `${SITE}/#website` }, inLanguage: "en-US", dateModified: asOf },
    { "@type": "ItemList", "@id": `${url}#list`, name: "Most active disclosed traders in Congress", itemListOrder: "https://schema.org/ItemListOrderDescending", numberOfItems: lawmakers.length, itemListElement: lawmakers.map((l) => ({ "@type": "ListItem", position: l.rank, name: `${l.name} stock trades`, url: `${SITE}/congress/${l.slug}/` })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: "Lawmakers", item: url }] },
  ] };

  const rows = lawmakers.map((l) => `<tr><td class="rk">${l.rank}</td><td><a href="/congress/${l.slug}/">${esc(l.name)}</a></td><td>${esc(l.party)}</td><td>${esc(l.chamber)}</td><td>${esc(l.state)}</td><td class="tr">${num(l.n)}</td><td class="tr">${num(l.buys)} / ${num(l.sells)}</td><td>${l.firstY}–${l.lastY}</td></tr>`).join("");

  const html = `${head({ title: `Congress Stock Trades by Lawmaker | ${BRAND}`, desc: "The most active disclosed stock traders in Congress since 2014, ranked by STOCK Act filings. Open any senator or representative for their full record.", url, image: OG, ld, type: "website" })}
${header()}
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <span>Lawmakers</span></nav>
  <section class="bhero">
    <span class="eyebrow">Lawmakers</span>
    <h1>Congress stock trades by lawmaker</h1>
    <p class="sub">The most active disclosed traders in Congress since 2014, ranked by number of <b>STOCK Act</b> filings. Open any name for their full record, then follow them for alerts. ${lawmakers.length} lawmakers shown; the full roster of 350+ is in the app.</p>
  </section>
  <section class="prose">
    <div class="tablewrap"><table class="lwtable">
      <thead><tr><th>#</th><th>Lawmaker</th><th>Party</th><th>Chamber</th><th>State</th><th class="tr">Trades</th><th class="tr">Buys / Sells</th><th>Years</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="disc-inline">Ranked by disclosed transaction count in the ${BRAND} database as of ${fmtDate(asOf)}. A high count reflects disclosed activity, not trade size or performance. Amounts are reported as ranges; filings can be amended. Not affiliated with any lawmaker; not investment advice.</p>
  </section>
  <section><div class="final"><h2>Track any member of Congress</h2><p class="sub center">Search 350+ lawmakers free, then follow the ones you care about for instant alerts.</p><div class="ctas center"><a class="btn gold" href="/signup">Create a free account</a><a class="btn" href="/">How it works</a></div></div></section>
</main>
${footer()}
</body></html>`;

  fs.mkdirSync(path.join(root, "congress"), { recursive: true });
  fs.writeFileSync(path.join(root, "congress", "index.html"), html);
  console.log(`congress/ index (${lawmakers.length} lawmakers)`);
}
