// Article content for the blog. Every number comes from tools/data.json, exported from the app database.
import fs from "node:fs";
import path from "node:path";

export const SITE = "https://hillradar.com";
export const BRAND = "Hillradar AI";
const D = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "data.json"), "utf8"));
const n = (x) => Number(x).toLocaleString("en-US");
const pct = (a, b, d = 1) => ((a / b) * 100).toFixed(d) + "%";
const AS_OF = D.asOf; // e.g. 2026-10-05
const PUB = "2026-10-13";
const T = D.totals;
const house = D.byChamber.find((c) => c.chamber === "House"), senate = D.byChamber.find((c) => c.chamber === "Senate");
const rep = D.byParty.find((p) => p.party === "Republican"), dem = D.byParty.find((p) => p.party === "Democrat");
const bucket = (b) => D.delayBuckets.find((x) => x.b === b).n;
const owner = (o) => D.owner.find((x) => x.o === o).n;

// ---------------- chart helpers (inline SVG, brand palette, accessible) ----------------
const GOLD = "#e7b23c", BUY = "#22c58b", SELL = "#f26a6a", DEM = "#4ea1ff", REP = "#f26a6a", INK = "#e7ecf5", MUTE = "#8a96ad", LINE = "#223052";
const svgOpen = (w, h, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,system-ui,sans-serif"><title>${label}</title>`;
function figure(svg, caption) { return `<figure class="chart">${svg}<figcaption>${caption}</figcaption></figure>`; }

/** vertical bars, optional stacked pair [a,b] */
function bars({ labels, values, values2, colors = [GOLD, SELL], label, fmt = n, legend }) {
  const W = 760, H = 320, L = 56, R = 16, Tp = legend ? 40 : 18, B = 44;
  const max = Math.max(...labels.map((_, i) => (values[i] || 0) + (values2 ? values2[i] || 0 : 0)));
  const cw = (W - L - R) / labels.length, bw = Math.min(46, cw * 0.66);
  let s = svgOpen(W, H, label);
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) { const y = Tp + (H - Tp - B) * (1 - t / ticks); const v = Math.round((max * t) / ticks); s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="${LINE}" stroke-width="1"/><text x="${L - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${MUTE}">${fmt(v)}</text>`; }
  labels.forEach((lb, i) => {
    const x = L + i * cw + (cw - bw) / 2; const h1 = ((values[i] || 0) / max) * (H - Tp - B); const y1 = H - B - h1;
    s += `<rect x="${x}" y="${y1}" width="${bw}" height="${h1}" rx="4" fill="${colors[0]}"><title>${lb}: ${fmt(values[i])}</title></rect>`;
    if (values2) { const h2 = ((values2[i] || 0) / max) * (H - Tp - B); s += `<rect x="${x}" y="${y1 - h2}" width="${bw}" height="${h2}" rx="4" fill="${colors[1]}"><title>${lb}: ${fmt(values2[i])}</title></rect>`; }
    s += `<text x="${x + bw / 2}" y="${H - B + 16}" text-anchor="middle" font-size="11" fill="${MUTE}">${lb}</text>`;
  });
  if (legend) legend.forEach(([t, c], i) => { s += `<rect x="${L + i * 150}" y="10" width="12" height="12" rx="3" fill="${c}"/><text x="${L + i * 150 + 18}" y="21" font-size="12" fill="${INK}">${t}</text>`; });
  return s + "</svg>";
}
/** horizontal bars with labels on the left */
function hbars({ rows, label, color = GOLD, fmt = n, width = 760 }) {
  const W = width, rh = 30, L = 210, R = 70, H = rows.length * rh + 20;
  const max = Math.max(...rows.map((r) => r[1]));
  let s = svgOpen(W, H, label);
  rows.forEach(([lb, v], i) => { const y = 10 + i * rh; const w = ((v / max) * (W - L - R)); s += `<text x="${L - 10}" y="${y + 19}" text-anchor="end" font-size="12.5" fill="${INK}">${lb}</text><rect x="${L}" y="${y + 6}" width="${w}" height="18" rx="4" fill="${color}"><title>${lb}: ${fmt(v)}</title></rect><text x="${L + w + 8}" y="${y + 19}" font-size="12" fill="${MUTE}">${fmt(v)}</text>`; });
  return s + "</svg>";
}
/** donut with legend */
function donut({ parts, label, total }) {
  const W = 760, H = 260, cx = 150, cy = 130, r = 92, sw = 34; let acc = 0; const sum = total ?? parts.reduce((a, p) => a + p[1], 0);
  let s = svgOpen(W, H, label) + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${LINE}" stroke-width="${sw}"/>`;
  const C = 2 * Math.PI * r;
  parts.forEach(([t, v, c]) => { const len = (v / sum) * C; s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})"><title>${t}: ${n(v)}</title></circle>`; acc += len; });
  s += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="22" font-weight="700" fill="${INK}">${n(sum)}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="${MUTE}">total</text>`;
  parts.forEach(([t, v, c], i) => { const y = 60 + i * 34; s += `<rect x="300" y="${y - 12}" width="14" height="14" rx="4" fill="${c}"/><text x="322" y="${y}" font-size="14" fill="${INK}">${t}</text><text x="${W - 20}" y="${y}" text-anchor="end" font-size="14" fill="${MUTE}">${n(v)} · ${pct(v, sum)}</text>`; });
  return s + "</svg>";
}
/** simple step timeline */
function timeline(steps, label) {
  const W = 760, H = 150, x0 = 60, x1 = W - 60; let s = svgOpen(W, H, label) + `<line x1="${x0}" x2="${x1}" y1="70" y2="70" stroke="${LINE}" stroke-width="4"/>`;
  steps.forEach(([t, sub, c], i) => { const x = x0 + ((x1 - x0) * i) / (steps.length - 1); s += `<circle cx="${x}" cy="70" r="12" fill="${c || GOLD}" stroke="#0a0f1c" stroke-width="4"/><text x="${x}" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${t}</text><text x="${x}" y="104" text-anchor="middle" font-size="11.5" fill="${MUTE}">${sub}</text>`; });
  return s + "</svg>";
}
const callout = (html) => `<div class="callout">${html}</div>`;
const takeaways = (items) => `<div class="takeaways"><b>Key takeaways</b><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;

const BUYS = T.buys, SELLS = T.sells, LATE = D.delay.late;

export const articles = [
  // 1 ------------------------------------------------------------------
  { slug: "what-is-the-stock-act", category: "Guide", date: PUB, asOf: AS_OF, tags: ["stock-act", "basics"],
    title: "The STOCK Act, explained: what members of Congress must disclose, and when",
    short: "The STOCK Act, explained", desc: "What the 2012 STOCK Act requires US senators and representatives to disclose about their stock trades, the 45-day deadline, what a filing contains, and where the records are published.",
    heroAlt: "Timeline from a congressional stock trade to its public disclosure under the STOCK Act",
    intro: "Every row in a congressional trade tracker exists because of one 2012 law. Here is what it requires, where its limits are, and how the filings become public data.",
    faq: [["Does the STOCK Act ban members of Congress from trading stocks?", "No. It requires disclosure, not abstention. Members may buy and sell securities, but transactions over $1,000 must be reported within 45 days. Several bills to ban or restrict trading have been introduced since, but as of the data date none has replaced the disclosure regime."],
          ["Who else is covered by the STOCK Act?", "Besides members of Congress, the Act covers senior congressional staff, the President and Vice President, and senior executive-branch officials. Spouses and dependent children of members are included in a member's own reports."],
          ["What happens if a lawmaker files late?", "The standard penalty is a $200 late fee, which ethics committees can waive. There is no automatic public enforcement, which is one reason trackers flag the gap between trade date and filing date on every record."]],
    body: () => `
<h2 id="origins">Where the law came from</h2>
<p>The <strong>Stop Trading on Congressional Knowledge Act</strong> was signed in April 2012 after a wave of reporting on lawmakers trading around market-moving information. Its core idea is simple: members of Congress already owed the public an annual financial disclosure, but a once-a-year snapshot said nothing about <em>when</em> a stock was bought or sold. The STOCK Act added a near-real-time layer, the <strong>Periodic Transaction Report (PTR)</strong>, and confirmed that insider-trading law applies to Congress like anyone else.</p>
<h2 id="who-files">Who has to file</h2>
<p>All 100 senators and 435 voting representatives, plus delegates, file. So do senior staff above a pay threshold, the President and Vice President, and senior executive officials. Crucially, a member's report also covers transactions by a <strong>spouse</strong> and <strong>dependent children</strong>, and jointly held accounts. In our database of ${n(T.trades)} transactions, ${pct(owner("spouse"), T.trades, 0)} are marked as a spouse's trade and ${pct(owner("joint"), T.trades, 0)} as joint accounts, so skipping those would hide a large share of the record.</p>
<h2 id="what-counts">What has to be reported</h2>
<ul>
<li>Any purchase, sale or exchange of a <strong>stock, bond, commodity future, option or other security over $1,000</strong>.</li>
<li>Mutual funds and ETFs are generally exempt from PTRs when they are widely diversified, though many members report them anyway. Treasury securities and cryptocurrency positions do appear in the filings in practice.</li>
<li>The amount is reported as a <strong>range</strong>, not an exact figure: $1,001–$15,000, $15,001–$50,000, $50,001–$100,000 and so on up to over $50,000,000.</li>
</ul>
<h2 id="deadline">The 45-day deadline</h2>
${figure(timeline([["Trade date", "transaction happens", GOLD], ["≤ 30 days", "after being notified of it", BUY], ["≤ 45 days", "hard deadline after the trade", SELL], ["Published", "posted by the Clerk / Secretary", DEM]], "STOCK Act disclosure timeline"), "From trade to public record: the two deadlines the STOCK Act sets and where the filing is published.")}
<p>A PTR is due within <strong>30 days of the member being notified</strong> of a transaction and no later than <strong>45 days after the trade itself</strong>. That window is why a tracker always shows two dates. Across our record the median gap between a trade and its filing is <strong>${D.delayMedian.m} days</strong>, but ${pct(LATE, T.trades)} of transactions (${n(LATE)}) were filed after the 45-day mark, and ${n(D.delay.late90)} arrived more than 90 days late. The statutory late fee is $200.</p>
<h2 id="where">Where the filings are published</h2>
<p>House members file with the <strong>Clerk of the House</strong>, whose Financial Disclosure site publishes PTRs as PDFs with a machine-readable index. Senators file with the <strong>Secretary of the Senate</strong> through the electronic Financial Disclosure (eFD) system. Both are public and free, but neither offers search across lawmakers, companies or dates, and older Senate filings are scanned paper. That is the gap services like ${BRAND} fill: we parse the filings into a database of lawmakers, companies, dates and amounts, and link each row back to its source.</p>
<h2 id="limits">What the law does not give you</h2>
${takeaways([`No exact amounts, only ranges (most filings, ${pct(D.bands[0].n, T.trades, 0)}, sit in the smallest $1,001–$15,000 band).`, "No reason for the trade, no price paid, and no statement of who made the decision (a member, a spouse, or a financial adviser).", `A built-in lag: even on-time filings can be 45 days old, and ${pct(LATE, T.trades)} are later than that.`, "Filers can amend reports after the fact, so numbers in any tracker can move slightly."])}
<p>Read with those limits in mind, the STOCK Act record is still one of the most detailed windows into the financial activity of any legislature in the world, and it is entirely public. <a href="/blog/how-to-read-a-periodic-transaction-report/">Our next guide walks through a single filing line by line.</a></p>` },

  // 2 ------------------------------------------------------------------
  { slug: "how-to-read-a-periodic-transaction-report", category: "Guide", date: PUB, asOf: AS_OF, tags: ["stock-act", "basics", "filings"],
    title: "How to read a congressional Periodic Transaction Report (PTR), field by field",
    short: "How to read a PTR", desc: "A line-by-line guide to a congressional stock trade filing: owner codes, asset names and tickers, transaction type, dates, amount ranges, and the traps that trip up first-time readers.",
    heroAlt: "Annotated example of a congressional Periodic Transaction Report with each field labelled",
    intro: "A Periodic Transaction Report looks like a dull form. Once you know its seven fields, it tells you who traded what, when, roughly how much, and how long they waited to say so.",
    faq: [["What do SP, JT and DC mean on a filing?", "They are owner codes: SP is the member's spouse, JT a joint account, DC a dependent child. A blank owner means the member themself."],
          ["Why do some filings list a company without a ticker?", "Bonds, municipal debt, private funds, real estate partnerships and some foreign securities have no exchange ticker. They are still reportable and still appear in trackers, usually flagged as non-stock assets."],
          ["Is a 'sale (partial)' different from a sale?", "Yes. The member sold part of the position and still holds the rest. It is still recorded as a sell in trackers, which is why sells can outnumber buys for a lawmaker who is slowly exiting a holding."]],
    body: () => `
<h2 id="anatomy">The seven fields</h2>
<ol>
<li><strong>Owner</strong> — blank for the member, <code>SP</code> spouse, <code>JT</code> joint, <code>DC</code> dependent child.</li>
<li><strong>Asset</strong> — the company or instrument name, usually with the ticker in brackets, e.g. <em>Microsoft Corporation (MSFT)</em>. Options show the underlying plus strike and expiry.</li>
<li><strong>Transaction type</strong> — <code>P</code> purchase, <code>S</code> sale, <code>S (partial)</code> partial sale, <code>E</code> exchange.</li>
<li><strong>Transaction date</strong> — the day the trade happened.</li>
<li><strong>Notification date</strong> — when the member says they learned of it (relevant for managed accounts).</li>
<li><strong>Amount</strong> — a range, never an exact value.</li>
<li><strong>Filing date</strong> — stamped by the Clerk or Secretary; the clock that the 45-day rule is judged against.</li>
</ol>
${figure(donut({ label: "Who owns the traded asset, across all filings", parts: [["Member (self)", owner("self"), GOLD], ["Joint account", owner("joint"), DEM], ["Spouse", owner("spouse"), BUY], ["Dependent child", owner("child"), SELL]] }), `Owner field across ${n(T.trades)} transactions in the ${BRAND} database, data as of ${AS_OF}.`)}
<h2 id="owner">Reading the owner column</h2>
<p>The owner code changes how a trade should be read. A spouse's trade can be in an account the member has no control over, while a joint account implies shared decisions. In our data only ${pct(owner("self"), T.trades, 0)} of transactions are the member's own; the rest are joint, spouse or child accounts. The <strong>Senate</strong> record skews even further: senators' own accounts make up a much smaller share than in the House, where self-owned trades dominate.</p>
<h2 id="asset">Asset names and tickers</h2>
<p>Most filings name a listed company and its ticker, which is what lets a tracker group trades by stock. But ${pct(D.noTicker.n, D.noTicker.t, 0)} of transactions in our database have <strong>no ticker</strong>: Treasury bills, municipal bonds, private funds, real-estate partnerships and crypto. They are still real transactions and still show up, but they are excluded from stock-only statistics such as <a href="/blog/most-traded-stocks-by-members-of-congress/">which companies Congress trades most</a>.</p>
<h2 id="type">Purchase, sale, partial sale, exchange</h2>
<p>Across the whole record there are ${n(BUYS)} purchases and ${n(SELLS)} sales, a ratio close to one. A lawmaker whose filings are mostly <em>S (partial)</em> is usually drawing down a position over time, often through a financial adviser, not making a series of bearish calls. Exchanges are rare (${n(T.exch)} in total) and usually reflect a merger or a fund conversion rather than a decision.</p>
<h2 id="amount">The amount range</h2>
<p>Ranges are the most misread field. <strong>$15,001–$50,000</strong> does not mean around $30,000; it only tells you the true figure lies somewhere in that band. ${pct(D.bands[0].n, T.trades, 0)} of all transactions are in the smallest band. When ${BRAND} shows a "volume" for a lawmaker or a company, it is an <em>upper bound</em> built from the top of each band, and labelled as such. <a href="/blog/why-congress-trade-amounts-are-ranges/">Here is why the ranges exist and how to use them.</a></p>
<h2 id="dates">Two dates, one gap</h2>
<p>Subtract the transaction date from the filing date and you get the disclosure delay. The median is ${D.delayMedian.m} days; anything above 45 is late under the Act. We print that number on every record because it is the fastest way to judge how fresh the information was when the public first saw it.</p>
${callout(`<b>Practical tip:</b> when you see a burst of identical small trades on one day, it is almost always a managed account rebalancing. When you see a single large purchase in a stock the member does not usually hold, that is the row worth reading twice.`)}
<h2 id="pitfalls">Common pitfalls</h2>
${takeaways(["Treating the midpoint of a range as the trade size.", "Counting a partial sale as 'selling out' of a company.", "Ignoring the owner code and attributing a spouse's managed-account trade to the member's judgment.", "Reading a late filing as a recent trade: always check the transaction date, not just the publish date."])}` },

  // 3 ------------------------------------------------------------------
  { slug: "congress-stock-trades-by-the-numbers", category: "Data story", date: PUB, asOf: AS_OF, tags: ["data", "statistics"],
    title: `Congress stock trades by the numbers: ${n(T.trades)} filings from 2014 to 2026`,
    short: "Congress trades by the numbers", desc: `Every disclosed congressional transaction since 2014 in one data story: filings per year, buys versus sells, Republicans versus Democrats, House versus Senate, and the states that trade the most.`,
    heroAlt: "Bar chart of disclosed congressional stock transactions per year, 2014 to 2026",
    intro: `We counted every Periodic Transaction Report in the record. The totals, the trends and the surprises, with charts drawn from the ${BRAND} database as of ${AS_OF}.`,
    faq: [["Which year had the most congressional stock trades?", `2025, with ${n(D.perYear.find((y) => y.y === "2025").n)} disclosed transactions, ahead of 2020's ${n(D.perYear.find((y) => y.y === "2020").n)}. 2026 is a partial year in this data set.`],
          ["Do Republicans or Democrats trade more?", `By filing count the record is close: ${n(rep.n)} transactions from ${rep.pols} Republicans and ${n(dem.n)} from ${dem.pols} Democrats, which works out to more filings per Democratic member.`],
          ["Does the House or the Senate file more trades?", `The House, by a wide margin: ${n(house.n)} transactions from ${house.pols} representatives versus ${n(senate.n)} from ${senate.pols} senators, partly because there are more than four times as many House members.`]],
    body: () => `
<h2 id="totals">The headline numbers</h2>
<p>As of ${AS_OF} the ${BRAND} database holds <strong>${n(T.trades)} disclosed transactions</strong> by <strong>${T.pols} current and former lawmakers</strong> across <strong>${n(T.issuers)} companies and assets</strong>. ${n(BUYS)} of them are purchases and ${n(SELLS)} are sales, a near-even split that holds in most years.</p>
<h2 id="per-year">Filings per year</h2>
${figure(bars({ labels: D.perYear.map((y) => y.y.slice(2)), values: D.perYear.map((y) => y.buys), values2: D.perYear.map((y) => y.sells), colors: [BUY, SELL], legend: [["Purchases", BUY], ["Sales", SELL]], label: "Disclosed congressional transactions per year, purchases and sales" }), `Transactions by trade date. 2014 is a partial first year of electronic data and 2026 runs to ${AS_OF}.`)}
<p>Two peaks stand out. <strong>2020</strong>, the pandemic year, produced ${n(D.perYear.find((y) => y.y === "2020").n)} transactions as portfolios were repositioned in a volatile market. Then after a quieter 2021–2024, <strong>2025 set a new record at ${n(D.perYear.find((y) => y.y === "2025").n)}</strong>, driven by a handful of very active filers and a large new freshman class. 2026 is on a similar pace.</p>
<h2 id="party">By party</h2>
${figure(donut({ label: "Transactions by party", parts: [["Republican", rep.n, REP], ["Democrat", dem.n, DEM], ["Independent & other", T.trades - rep.n - dem.n, MUTE]] }), `Party is the member's party as listed in the official congressional directory. ${rep.pols} Republicans, ${dem.pols} Democrats and ${T.pols - rep.pols - dem.pols} others have filed at least once since 2014.`)}
<p>Republicans account for ${pct(rep.n, T.trades)} of transactions and Democrats ${pct(dem.n, T.trades)}. Per member, Democrats file slightly more often (about ${Math.round(dem.n / dem.pols)} transactions each versus ${Math.round(rep.n / rep.pols)}), but the distribution is extremely skewed: the ten most active filers alone account for roughly a third of the entire record, so party averages say more about a few portfolios than about either caucus.</p>
<h2 id="chamber">House versus Senate</h2>
<p>The House produced ${n(house.n)} transactions (${pct(house.n, T.trades, 0)}) and the Senate ${n(senate.n)}. Per member the gap is smaller: ${D.perMember.House} filings per representative against ${D.perMember.Senate} per senator. Senators do file faster, averaging ${senate.avg_delay} days from trade to filing against ${house.avg_delay} in the House. <a href="/blog/house-vs-senate-stock-trade-disclosures/">We compare the two chambers in detail here.</a></p>
<h2 id="states">States with the most trades</h2>
${figure(hbars({ rows: D.states.map((s) => [s.state, s.n]), label: "Transactions by the lawmaker's state, top 10" }), "New Jersey leads thanks to two of the three most active filers in the entire record. California, Florida and Texas follow their large delegations.")}
<h2 id="assets">Not only stocks</h2>
<p>${pct(D.noTicker.n, T.trades, 0)} of transactions involve assets without a stock ticker: ${n(D.sectors.find((s) => s.s === "Bonds & Treasuries").n)} bond and Treasury trades, ${n(D.sectors.find((s) => s.s === "Funds & ETFs").n)} fund and ETF trades, ${n(D.sectors.find((s) => s.s === "Options").n)} options trades and ${n(D.sectors.find((s) => s.s === "Crypto").n)} crypto transactions. The stock-only views on ${BRAND} exclude them; the "all assets" toggle on the dashboard brings them back.</p>
${takeaways([`${n(T.trades)} transactions, ${T.pols} lawmakers, ${n(T.issuers)} assets since 2014.`, `2025 was the busiest year on record; 2020 was second.`, `Party split is close by count; a few very active members drive most of the volume.`, `The House files 4× as many transactions as the Senate but senators file faster.`])}
<p>All of these numbers update as new filings arrive. The live versions, filterable by lawmaker, company, date and amount, are on the <a href="/">${BRAND} dashboard</a>.</p>` },

  // 4 ------------------------------------------------------------------
  { slug: "most-traded-stocks-by-members-of-congress", category: "Data story", date: PUB, asOf: AS_OF, tags: ["data", "companies"],
    title: "The 15 stocks traded by the most members of Congress",
    short: "Most traded stocks by Congress", desc: `Which companies appear in the most lawmakers' disclosures? Apple, Microsoft and Amazon lead a list of ${15} stocks ranked by how many members of Congress have bought or sold them since 2014.`,
    heroAlt: "Horizontal bar chart of the stocks traded by the most members of Congress, led by Apple and Microsoft",
    intro: "Counting transactions rewards whoever trades most. Counting lawmakers tells you which companies sit in the widest range of congressional portfolios. Here is that list, with buys and sells for each.",
    faq: [["Which stock has the most members of Congress trading it?", `Apple (AAPL): ${D.topCompanies[0].pols} different lawmakers have disclosed at least one Apple transaction since 2014, with ${n(D.topCompanies[0].n)} transactions in total.`],
          ["Which stock has the most congressional transactions overall?", `Microsoft (MSFT), with ${n(D.topCompanies[1].n)} disclosed transactions by ${D.topCompanies[1].pols} lawmakers.`],
          ["Are these stocks being bought or sold?", "Both. For most large-cap names buys and sells are close to balanced, which is what you expect from long-term holdings being rebalanced. A few, such as Amazon and NVIDIA, show noticeably more purchases than sales in the record."]],
    body: () => `
<h2 id="ranking">The ranking</h2>
${figure(hbars({ rows: D.topCompanies.map((c) => [`${c.ticker} · ${c.name.replace(/ (Inc\.|Corporation|Company|Incorporated|Holdings Corporation|& Co\.)$/, "")}`, c.pols]), label: "Number of distinct lawmakers who disclosed a trade in each stock", width: 760 }), `Distinct members of Congress with at least one disclosed transaction in the stock, 2014 to ${AS_OF}.`)}
<table class="dt"><thead><tr><th>#</th><th>Stock</th><th>Lawmakers</th><th>Transactions</th><th>Buys</th><th>Sells</th></tr></thead><tbody>
${D.topCompanies.map((c, i) => `<tr><td>${i + 1}</td><td><b>${c.ticker}</b> <small>${c.name}</small></td><td>${c.pols}</td><td>${n(c.n)}</td><td class="buy">${n(c.buys)}</td><td class="sell">${n(c.sells)}</td></tr>`).join("")}
</tbody></table>
<h2 id="pattern">What the list says</h2>
<p>It is, almost exactly, the list of the largest and most widely held US companies. That is the first and most important lesson: <strong>a stock being popular in Congress mostly means it is popular everywhere</strong>. Apple, Microsoft, Amazon, Alphabet, JPMorgan, Johnson &amp; Johnson, Procter &amp; Gamble, Disney, UnitedHealth and ExxonMobil are index staples, and they appear in congressional portfolios for the same reason they appear in pension funds.</p>
<p>The more interesting signal is in the <strong>buy/sell balance</strong>. Microsoft has the most transactions (${n(D.topCompanies[1].n)}) and they split almost evenly. Amazon leans heavily to purchases (${n(D.topCompanies[2].buys)} buys to ${n(D.topCompanies[2].sells)} sells), as does NVIDIA (${n(D.topCompanies.find((c) => c.ticker === "NVDA").buys)} to ${n(D.topCompanies.find((c) => c.ticker === "NVDA").sells)}). UnitedHealth and ExxonMobil lean the other way, with more sales than purchases across the period.</p>
<h2 id="recent">The same list, 2025 onwards</h2>
${figure(hbars({ rows: D.top2025.map(([t, p]) => [t, p]), label: "Distinct lawmakers trading each stock since January 2025", color: BUY }), "Trades dated 2025-01-01 or later. NVIDIA climbs from 13th all-time to 4th in the recent window.")}
<p>Restrict the window to trades since January 2025 and the top of the list barely moves, but <strong>NVIDIA jumps from 13th to 4th</strong>, and Alphabet overtakes JPMorgan. Shifts like that, where a company suddenly appears in many more portfolios than before, are exactly what ${BRAND}'s activity-cluster view is built to surface, with the lawmakers and dates behind each one.</p>
<h2 id="caveats">How to use this responsibly</h2>
${takeaways(["Breadth (number of lawmakers) is a better measure of 'congressional interest' than raw transaction counts, which one active filer can dominate.", "Large-cap names dominate because they dominate every portfolio; look for companies that are unusual for Congress, not the usual ones.", "Buy/sell imbalances are informative but say nothing about why; the filings carry no reasons.", "Every count here is of disclosed transactions, with the 45-day lag and the amendment caveat that applies to all STOCK Act data."])}
<p>The company pages on ${BRAND} show, for any ticker, every lawmaker who has traded it with dates and amount ranges. <a href="/signup">Create a free account to look one up.</a></p>` },

  // 5 ------------------------------------------------------------------
  { slug: "congress-45-day-filing-rule-and-late-disclosures", category: "Data story", date: PUB, asOf: AS_OF, tags: ["stock-act", "data", "filings"],
    title: `The 45-day rule: how late Congress really files its stock trades`,
    short: "How late Congress files", desc: `The STOCK Act gives lawmakers 45 days to disclose a trade. We measured the gap on ${n(T.trades)} filings: the median is ${D.delayMedian.m} days, but ${pct(LATE, T.trades)} are late and ${n(D.delay.late90)} arrived more than 90 days after the trade.`,
    heroAlt: "Bar chart showing how many days after a trade congressional disclosures are filed, in buckets",
    intro: `Every disclosure carries two dates. The distance between them is the single best measure of how useful the STOCK Act is in practice. Here is the full distribution.`,
    faq: [["What is the average delay between a congressional trade and its disclosure?", `Across ${n(T.trades)} filings the average is ${D.delay.avg} days and the median is ${D.delayMedian.m} days. The average is pulled up by a tail of filings that arrive months late.`],
          ["What share of congressional stock trades are filed late?", `${pct(LATE, T.trades)} of transactions (${n(LATE)}) were filed more than 45 days after the trade, and ${pct(D.delay.late90, T.trades)} more than 90 days after.`],
          ["Which chamber files faster?", `The Senate: an average of ${senate.avg_delay} days versus ${house.avg_delay} in the House, and a late rate of ${pct(senate.late, senate.n)} versus ${pct(house.late, house.n)}.`]],
    body: () => `
<h2 id="distribution">The distribution</h2>
${figure(bars({ labels: ["0–15 days", "16–30", "31–45", "46–90", "90+"], values: ["0-15", "16-30", "31-45", "46-90", "90+"].map(bucket), colors: [GOLD], label: "Days between trade date and filing date, number of transactions" }), `Delay in days from transaction date to filing date, ${n(D.delay.n)} transactions with both dates, data as of ${AS_OF}. Everything right of the 31–45 bucket is late under the Act.`)}
<p>Most members comply. <strong>${pct(bucket("0-15") + bucket("16-30") + bucket("31-45"), D.delay.n)}</strong> of transactions are filed inside the 45-day window, and ${pct(D.delay.fast, D.delay.n)} within two weeks. The median delay is <strong>${D.delayMedian.m} days</strong>. But the tail is long: ${n(bucket("46-90"))} filings landed between 46 and 90 days, and <strong>${n(bucket("90+"))} came more than 90 days after the trade</strong>. That tail is why the average (${D.delay.avg} days) is double the median.</p>
<h2 id="why-late">Why filings are late</h2>
<ul>
<li><strong>Managed accounts.</strong> A member may not learn of a trade until a monthly or quarterly statement arrives. The 30-days-after-notification rule is meant to cover this, but notification dates are self-reported.</li>
<li><strong>Batch catch-ups.</strong> Many of the 90+ day filings arrive in bundles, where a member discloses months of transactions in one report, often after ethics staff or journalists ask.</li>
<li><strong>Amended reports.</strong> A corrected filing keeps the original transaction date but gets a new filing date, so corrections look late even when the original was on time.</li>
</ul>
<h2 id="chambers">House versus Senate</h2>
${figure(bars({ labels: ["House", "Senate"], values: [house.avg_delay, senate.avg_delay], colors: [GOLD], fmt: (v) => v + "d", label: "Average filing delay in days by chamber" }), `Average days from trade to filing. House: ${n(house.n)} transactions, late rate ${pct(house.late, house.n)}. Senate: ${n(senate.n)} transactions, late rate ${pct(senate.late, senate.n)}.`)}
<p>Senators file faster and are late less often. Part of the difference is scale: the House has ${house.pols} filers in our record against ${senate.pols} senators, and more of the House volume comes from a few very high-frequency portfolios where catch-up filings are common.</p>
<h2 id="penalty">The penalty</h2>
<p>The Act sets a <strong>$200 late fee</strong>, which the ethics committees may waive. There is no public ledger of fees paid, and no escalation for repeat lateness. For most readers the practical consequence is informational: a late filing means the market has already moved on by the time the public can see the trade.</p>
<h2 id="using">How ${BRAND} handles it</h2>
${takeaways([`Every trade shows its delay in days; anything over 45 is marked in red.`, `Lawmaker profiles report an average filing delay so you can see who is habitually late.`, `Alerts fire on the <em>filing</em> date, which is the first moment the information is public, and always show the original trade date alongside it.`, `We never backfill alerts for filings older than 30 days, so a catch-up bundle from last year does not arrive as "news".`])}
<p>Next in the series: <a href="/blog/house-vs-senate-stock-trade-disclosures/">how the two chambers' disclosure systems differ</a>, from file formats to owner reporting.</p>` },

  // 6 ------------------------------------------------------------------
  { slug: "most-active-stock-traders-in-congress", category: "Data story", date: PUB, asOf: AS_OF, tags: ["data", "lawmakers"],
    title: "The most active stock traders in Congress, ranked by disclosed transactions",
    short: "Most active traders in Congress", desc: `Ten members of Congress account for roughly a third of all ${n(T.trades)} disclosed transactions since 2014. Here is the ranking, with buys, sells and active years, and what a high count does and does not mean.`,
    heroAlt: "Horizontal bar chart of members of Congress with the most disclosed stock transactions",
    intro: "A handful of portfolios dominate the congressional trading record. Knowing who they are matters for reading every other statistic about Congress and stocks.",
    faq: [["Who has filed the most stock trades in Congress?", `Former Rep. Thomas MacArthur (R-NJ) with ${n(D.topLawmakers[0].n)} disclosed transactions between 2015 and 2019, narrowly ahead of Rep. Josh Gottheimer (D-NJ) with ${n(D.topLawmakers[1].n)}, who is still filing.`],
          ["Does a high transaction count mean a lawmaker is picking stocks?", "Not necessarily. Many high-volume filers use professionally managed accounts that rebalance frequently, which generates dozens of small filings. The owner code, the amount bands and the pattern of trades say more than the raw count."],
          ["Why do New Jersey lawmakers appear so often?", "Two of the three most active filers in the whole record represent New Jersey districts, which is enough to put the state first in total transactions despite a mid-sized delegation."]],
    body: () => `
<h2 id="ranking">The top ten</h2>
${figure(hbars({ rows: D.topLawmakers.slice(0, 10).map((p) => [`${p.name.replace(/^(Rep|Sen)\. /, "")} (${p.party[0]}-${p.state})`, p.n]), label: "Members of Congress with the most disclosed transactions, 2014 to date" }), `Disclosed transactions per lawmaker, all asset types, 2014 to ${AS_OF}. Party and state from the official congressional directory.`)}
<table class="dt"><thead><tr><th>#</th><th>Lawmaker</th><th>Chamber</th><th>Transactions</th><th>Buys</th><th>Sells</th><th>Active</th></tr></thead><tbody>
${D.topLawmakers.slice(0, 10).map((p, i) => `<tr><td>${i + 1}</td><td><b>${p.name}</b> <small>${p.party}, ${p.state}</small></td><td>${p.chamber}</td><td>${n(p.n)}</td><td class="buy">${n(p.buys)}</td><td class="sell">${n(p.sells)}</td><td><small>${p.first.slice(0, 4)}–${p.last.slice(0, 4)}</small></td></tr>`).join("")}
</tbody></table>
<h2 id="concentration">How concentrated the record is</h2>
<p>The ten lawmakers above filed <strong>${n(D.topLawmakers.slice(0, 10).reduce((a, p) => a + p.n, 0))} transactions</strong> between them, about <strong>${pct(D.topLawmakers.slice(0, 10).reduce((a, p) => a + p.n, 0), T.trades, 0)} of everything in the database</strong>. The median member of Congress, by contrast, files a few dozen transactions in a whole career, and many file none at all: of ${T.pols} lawmakers with any filing since 2014, only ${D.activePols12m} disclosed a trade in the last twelve months.</p>
<h2 id="patterns">Three kinds of high-volume filer</h2>
<ul>
<li><strong>The managed portfolio.</strong> Hundreds of small transactions, mostly in the $1,001–$15,000 band, often in index-like baskets of large caps, with buys and sells roughly balanced. Thomas MacArthur's ${n(D.topLawmakers[0].n)} filings in four years and Lisa McClain's ${n(D.topLawmakers.find((p) => p.name.includes("McClain")).n)} since 2024 fit this pattern.</li>
<li><strong>The steady seller.</strong> Sells far outnumber buys, consistent with liquidating holdings acquired before office. Daniel Goldman's record (${n(D.topLawmakers.find((p) => p.name.includes("Goldman")).buys)} buys, ${n(D.topLawmakers.find((p) => p.name.includes("Goldman")).sells)} sells) is the clearest example in the top ten.</li>
<li><strong>The long-tenured trader.</strong> Moderate annual volume sustained over a decade, such as Lois Frankel or Alan Lowenthal, whose totals come from longevity rather than intensity.</li>
</ul>
${callout(`<b>Reading tip:</b> volume is not the same as conviction. ${BRAND}'s lawmaker profiles pair the transaction count with the share of trades in a member's own account, the typical amount band, and a hit rate computed from six-month returns, so a 3,000-filing portfolio and a 30-filing portfolio can be compared on equal terms.`)}
<h2 id="senators">Where the senators are</h2>
<p>Only three senators make the top ten: David Perdue (${n(D.topLawmakers.find((p) => p.name.includes("Perdue")).n)} transactions, 2015–2020), Tommy Tuberville (${n(D.topLawmakers.find((p) => p.name.includes("Tuberville")).n)}) and Thomas Carper (${n(D.topLawmakers.find((p) => p.name.includes("Carper")).n)}). The Senate record is smaller overall (${n(senate.n)} transactions) and, as the owner codes show, far more of it sits in spouse and joint accounts than in the House.</p>
${takeaways(["Ten lawmakers produce roughly a third of all congressional trade filings.", "High counts usually indicate managed accounts, not day trading.", "Buy/sell ratio and owner code separate rebalancing from deliberate positioning.", `Only ${D.activePols12m} members disclosed any trade in the past 12 months.`])}
<p>Every lawmaker in this table has a live profile on ${BRAND} with their full filing history, most-traded companies and filing delay. <a href="/signup">Look one up free.</a></p>` },

  // 7 ------------------------------------------------------------------
  { slug: "why-congress-trade-amounts-are-ranges", category: "Guide", date: PUB, asOf: AS_OF, tags: ["basics", "filings", "data"],
    title: "Why congressional stock trades are reported as ranges, and how to use them anyway",
    short: "Why trade amounts are ranges", desc: `Lawmakers never disclose exact dollar amounts, only bands like $15,001–$50,000. Here are the bands, how ${n(T.trades)} filings are distributed across them, and the honest way to estimate volume.`,
    heroAlt: "Bar chart of congressional trade filings by amount range, dominated by the $1,001 to $15,000 band",
    intro: "The amount column is the most quoted and most misunderstood part of a congressional disclosure. This guide explains the bands and shows where real filings fall.",
    faq: [["What are the STOCK Act amount ranges?", "$1,001–$15,000; $15,001–$50,000; $50,001–$100,000; $100,001–$250,000; $250,001–$500,000; $500,001–$1,000,000; $1,000,001–$5,000,000; $5,000,001–$25,000,000; $25,000,001–$50,000,000; and over $50,000,000."],
          ["Can you work out the exact amount of a congressional trade?", "Not from the filing. Occasionally a member discloses an exact figure voluntarily, and share counts can sometimes be inferred from later annual reports, but for the vast majority of transactions only the band is public."],
          ["How does Hillradar calculate 'volume'?", "As an upper bound: the top of each transaction's band, summed, and labelled as an estimate. Using midpoints would look more precise while being no more accurate."]],
    body: () => `
<h2 id="bands">The ten bands</h2>
${figure(hbars({ rows: D.bands.map((b) => [b.b, b.n]), label: "Number of filings in each amount range", color: GOLD }), `Filings by amount range, ${n(T.trades - 369)} transactions with a standard band, data as of ${AS_OF}. A small number of filings with non-standard values are omitted.`)}
<p>The bands come from the Ethics in Government Act and were carried into the STOCK Act unchanged. <strong>${pct(D.bands[0].n, T.trades, 0)} of all congressional transactions fall in the smallest band</strong>, $1,001–$15,000. Another ${pct(D.bands[1].n, T.trades, 0)} are $15,001–$50,000. Everything above $250,000 together makes up ${pct(D.bands.slice(4).reduce((a, b) => a + b.n, 0), T.trades)} of filings, and transactions over $5 million are rare (${D.bands.slice(7).reduce((a, b) => a + b.n, 0)} in twelve years).</p>
<h2 id="why">Why ranges exist</h2>
<p>Congress designed the disclosure system to reveal <em>conflicts</em>, not net worth. A band is enough to show that a member has a meaningful position in a company they regulate, without publishing a precise personal balance sheet. Whether that trade-off still makes sense is a live political debate; for data users it is simply the constraint to design around.</p>
<h2 id="mistakes">The midpoint mistake</h2>
<p>The most common error in coverage of congressional trading is to treat a range as its midpoint, then sum midpoints into a headline figure. Two problems: the widest bands span a factor of five or more, and the distribution inside a band is not uniform. A $1,001–$15,000 filing is far more likely to be $2,000 than $14,000, because small periodic rebalances dominate that band. Midpoint sums therefore <strong>overstate small portfolios and understate large ones</strong>.</p>
${callout(`<b>What ${BRAND} does instead:</b> every "volume" figure is computed from the top of each band and labelled <em>upper bound</em>. It is a ceiling, not an estimate of the true amount, and it is consistent across lawmakers so comparisons remain fair.`)}
<h2 id="useful">What ranges are still good for</h2>
${takeaways(["Relative size within one lawmaker's history: a $250K+ purchase from someone who usually files $1K–$15K trades is unusual by definition.", "Screening: filtering to $100,001 and above removes almost all managed-account noise.", "Direction: a large sale band followed by a small buy band tells a story even without exact numbers.", "Aggregation across many filers: upper-bound totals by company or sector rank consistently even if their absolute level is inflated."])}
<h2 id="example">A worked example</h2>
<p>Suppose a representative files three purchases of the same stock on one day: $15,001–$50,000, $15,001–$50,000 and $1,001–$15,000. The honest statement is "between $31,003 and $115,000", with an upper bound of $115,000. Saying "about $73,000" (the midpoint sum) adds no information and invites a false sense of precision. ${BRAND}'s filters let you set a minimum band so you decide what counts as material.</p>
<p>For the full field-by-field walkthrough of a filing, see <a href="/blog/how-to-read-a-periodic-transaction-report/">how to read a Periodic Transaction Report</a>.</p>` },

  // 8 ------------------------------------------------------------------
  { slug: "how-to-get-alerts-for-congress-stock-trades", category: "How-to", date: PUB, asOf: AS_OF, tags: ["how-to", "alerts"],
    title: "How to get alerts when a member of Congress files a stock trade",
    short: "How to get alerts", desc: "A step-by-step guide to being told the moment a congressional trade is disclosed: choosing who to follow, connecting Telegram, WhatsApp or email, and what an alert actually contains.",
    heroAlt: "Illustration of a phone receiving an alert about a newly filed congressional stock trade",
    intro: "Filings appear at unpredictable hours and the official sites have no notifications. Here is how to be first to know, and how to avoid drowning in noise.",
    faq: [["Are congressional trade alerts free?", "On Hillradar AI, setting up channels and a one-item watchlist is free; delivery of alerts is part of the Pro plan ($497 per year), which also unlocks the full history, unlimited watchlist and CSV export."],
          ["How fast after a filing does an alert arrive?", "Within minutes of the filing appearing in our feed, which refreshes several times a day. The alert always shows the original trade date next to the filing date so you can see how old the trade is."],
          ["Can I get alerts only for large trades?", "Yes. Watchlist alerts can be limited by amount band, and activity-cluster alerts only fire when several lawmakers file in the same company within a short window."]],
    body: () => `
<h2 id="why">Why alerts, not browsing</h2>
<p>The House Clerk and Senate eFD sites publish filings as they are processed, with no feed, no email and no search by company. The ${BRAND} database refreshes several times a day; in the last 90 days alone it added ${n(D.last90)} transactions. Nobody can watch that by hand, so the practical answer is a watchlist plus a channel you already look at.</p>
<h2 id="step1">Step 1: decide what you want to hear about</h2>
<ul>
<li><strong>A lawmaker</strong> — every filing they make. Best for your own representative or senator, or a committee chair relevant to your work.</li>
<li><strong>A company</strong> — any lawmaker trading a stock you follow. Best for investors and sector journalists.</li>
<li><strong>Activity clusters</strong> — when two or more lawmakers file trades in the same company within weeks of each other. Best if you only want the unusual.</li>
</ul>
${figure(timeline([["Filing published", "Clerk / eFD", DEM], ["Parsed", "lawmaker, ticker, dates, band", GOLD], ["Matched", "against your watchlist", BUY], ["Delivered", "Telegram · WhatsApp · email", SELL]], "How a congressional trade alert is produced"), "From the moment a filing is published to the message on your phone.")}
<h2 id="step2">Step 2: connect a channel</h2>
<ol>
<li><strong>Telegram</strong> — in Settings, click <em>Connect Telegram</em>, send the one-time code to the bot, and the channel shows as connected within seconds. Fastest and most reliable on phones.</li>
<li><strong>WhatsApp</strong> — add your number in international format. Delivery depends on the WhatsApp provider configured on the server.</li>
<li><strong>Email</strong> — add an address; good for a daily record you can search later.</li>
</ol>
<p>Tick <em>Trade alerts</em>, <em>Signal alerts</em> or both, press <em>Send test</em>, and you are done.</p>
<h2 id="contains">Step 3: know what an alert contains</h2>
${callout(`<b>Example:</b><br><code>BUY · NVDA NVIDIA Corporation<br>Rep. Example Member (R-TX) · House<br>Amount: $15,001–$50,000 · Owner: joint<br>Traded 2026-09-02 · Filed 2026-09-30 (28 days)<br>Also bought by 3 other lawmakers in the last 45 days</code>`)}
<p>Every alert carries the transaction type, the company and ticker, the lawmaker with party and chamber, the amount band, the owner code, both dates with the delay in days, and a link to the filing's record. Cluster alerts add how many other lawmakers filed in the same company recently.</p>
<h2 id="noise">Step 4: control the noise</h2>
${takeaways(["Follow companies rather than very active lawmakers if you want fewer messages; a managed account can produce 30 filings a day.", "Set a minimum amount band on watchlist alerts to skip $1K–$15K rebalances.", "Use cluster alerts as your default and lawmaker alerts for a handful of people you genuinely track.", "Alerts are only sent for filings published in the last 30 days, so historical imports never flood you."])}
<h2 id="honest">What an alert is not</h2>
<p>An alert is a notification that a public record was published. It is not a recommendation, and the trade it describes is typically weeks old by law. Use it to read the record first, not to act on it blind. The <a href="/disclaimer/">Disclaimer</a> covers this in detail.</p>
<p>Ready to set one up? <a href="/signup">Create a free account</a>, add a watchlist item and connect Telegram in about two minutes.</p>` },

  // 9 ------------------------------------------------------------------
  { slug: "what-is-a-congressional-trading-cluster", category: "Explainer", date: PUB, asOf: AS_OF, tags: ["ai-scanning", "data", "how-to"],
    title: "What is a congressional trading cluster, and how AI Scanning finds one",
    short: "Congressional trading clusters", desc: "When several members of Congress file trades in the same company within a few weeks, that is a cluster. Here is how Hillradar AI detects and scores them, what the back-test shows, and the caveats that come with it.",
    heroAlt: "Diagram of several lawmakers' trades in the same company converging within a 45-day window",
    intro: "One lawmaker buying a stock is noise. Five lawmakers from both parties buying the same stock in the same month is a pattern worth a second look. This is the logic behind AI Scanning.",
    faq: [["What counts as a cluster?", "Two or more different lawmakers filing a purchase in the same company within 45 days of each other. Clusters are stronger when more lawmakers are involved, when both parties are represented, when the filings are recent, and when the buyers have good historical track records."],
          ["Is a cluster a buy signal?", "No. It is a research flag: an unusual concentration of public disclosures. Hillradar AI scores it, explains the reasons in plain English and shows the back-tested history, and leaves the decision to you or your adviser."],
          ["How is a lawmaker's track record measured?", "For each disclosed purchase we compare the stock's return over the following six months with the S&P 500 over the same window. The share of purchases that beat the market is the lawmaker's hit rate; it requires a minimum number of trades to be shown."]],
    body: () => `
<h2 id="definition">Definition</h2>
<p>A <strong>trading cluster</strong> is a group of disclosed purchases of the same company by different members of Congress inside a short window, which ${BRAND} sets at 45 days, the same length as the STOCK Act filing deadline. The idea is borrowed from insider-trading research in the corporate world, where several executives buying at once has long been treated as more informative than one.</p>
${figure(timeline([["Day 0", "Rep. A buys", DEM], ["Day 11", "Sen. B buys", REP], ["Day 19", "Rep. C buys", DEM], ["Day 32", "Rep. D buys", REP], ["Day 45", "window closes", GOLD]], "A four-lawmaker, bipartisan cluster inside the 45-day window"), "Four purchases of one company by four different lawmakers inside 45 days: a bipartisan cluster.")}
<h2 id="scoring">How a cluster is scored</h2>
<p>Each company in the window gets a score from 0 to 100, built from five ingredients:</p>
<ol>
<li><strong>Breadth</strong> — how many distinct lawmakers bought, and how recently.</li>
<li><strong>Bipartisanship</strong> — buyers from both parties count for more than a single-party group.</li>
<li><strong>Track record of the buyers</strong> — a purchase by a lawmaker whose past buys beat the market 65% of the time weighs more than one from a 40% record.</li>
<li><strong>History in that stock</strong> — how previous congressional purchases of the same company performed.</li>
<li><strong>Sell pressure</strong> — concurrent sales by other lawmakers lower the score.</li>
</ol>
<p>Scores of 55 and above are labelled <em>high</em> confidence, 35 to 54 <em>medium</em>, and the rest <em>watch</em>. Every score comes with the list of buyers, the reasons in plain English and, when AI insight is enabled, a short thesis.</p>
<h2 id="backtest">What the history shows</h2>
<p>We measured every disclosed stock purchase since 2014 with a known six-month outcome, ${n(D.perf.n)} trades, against the S&amp;P 500 over the same six months. Taken all together, congressional purchases returned <strong>${D.perf.ret}%</strong> over six months on average, essentially identical to the market. Lawmakers as a group are not beating the index.</p>
<p>The picture changes when the rule gets stricter. Purchases that were part of a cluster did somewhat better than the average, and purchases that were part of a cluster <em>and</em> made by lawmakers with strong track records did markedly better in the historical data. The live figures, recomputed from the database, are shown on the Investment Plan page inside the app rather than quoted here, because they move as filings arrive.</p>
${callout(`<b>Caveats, stated plainly:</b> the back-test applies <em>today's</em> track records to past trades, which flatters results; it ignores fees, taxes and the 45-day disclosure lag; averages hide large winners and losers; and past performance does not predict future results. Treat the numbers as evidence that the pattern is worth studying, not as a promise.`)}
<h2 id="not">What AI Scanning is not</h2>
${takeaways(["It is not a recommendation engine; it ranks public records by how unusual they are.", "It does not know why anyone traded; filings contain no reasons.", "It cannot see a trade before it is filed, so every cluster is already weeks old by law.", "It is a research tool for people who want the primary source organised, not a substitute for advice."])}
<h2 id="using">Using it well</h2>
<p>Start from the cluster, then open the company page and read the individual filings: who bought, in which account, in what band, and how late. Check whether the buyers usually hold that stock. Then compare with your own research. That workflow, record first and conclusions second, is what the tool is designed for. <a href="/blog/how-to-get-alerts-for-congress-stock-trades/">You can also have new clusters sent to Telegram, WhatsApp or email.</a></p>` },

  // 10 -----------------------------------------------------------------
  { slug: "house-vs-senate-stock-trade-disclosures", category: "Data story", date: PUB, asOf: AS_OF, tags: ["data", "stock-act", "filings"],
    title: "House vs Senate: how congressional stock trade disclosures differ",
    short: "House vs Senate disclosures", desc: `The two chambers file under the same law but produce very different records: ${n(house.n)} House transactions against ${n(senate.n)} in the Senate, different speeds, different owner patterns and different file formats.`,
    heroAlt: "Side-by-side comparison of House and Senate congressional trade disclosure statistics",
    intro: "Same statute, two systems. Comparing the House and Senate records explains a lot of the quirks you meet in any congressional trade tracker.",
    faq: [["Where are House and Senate stock trade filings published?", "House filings are published by the Clerk of the House on its Financial Disclosure site; Senate filings by the Secretary of the Senate through the electronic Financial Disclosure (eFD) system. Both are free and public."],
          ["Do senators trade less than representatives?", `Per member the gap is modest: ${D.perMember.Senate} transactions per senator versus ${D.perMember.House} per representative since 2014. The much larger House total mostly reflects the number of members.`],
          ["Why are so many Senate trades in spouse or joint accounts?", "The Senate record has a higher share of transactions marked spouse or joint, which often reflects older members with long-established family holdings and managed accounts, rather than any difference in the rules."]],
    body: () => `
<h2 id="volume">Volume and pace</h2>
${figure(bars({ labels: ["House", "Senate"], values: [house.n, senate.n], colors: [GOLD], label: "Disclosed transactions by chamber since 2014" }), `${house.pols} representatives and ${senate.pols} senators with at least one filing, data as of ${AS_OF}.`)}
<p>The House has filed <strong>${n(house.n)}</strong> transactions and the Senate <strong>${n(senate.n)}</strong>, a ratio of about ${(house.n / senate.n).toFixed(1)} to 1. Per filer the difference almost disappears: <strong>${D.perMember.House} per representative versus ${D.perMember.Senate} per senator</strong>. The House total is also more concentrated, with the three most active filers in the entire record all representatives.</p>
<h2 id="speed">Filing speed</h2>
<p>Senators file faster. The average delay from trade to filing is <strong>${senate.avg_delay} days in the Senate against ${house.avg_delay} in the House</strong>, and the late rate (over 45 days) is ${pct(senate.late, senate.n)} versus ${pct(house.late, house.n)}. One reason is that the Senate eFD system is fully electronic with structured entry, while a share of House filings still arrive as scanned forms that take longer to process and publish.</p>
<h2 id="owner">Whose account</h2>
${figure(bars({ labels: ["House self", "House joint", "House spouse", "Senate self", "Senate joint", "Senate spouse"], values: [D.ownerByChamber.House.self, D.ownerByChamber.House.joint, D.ownerByChamber.House.spouse, D.ownerByChamber.Senate.self, D.ownerByChamber.Senate.joint, D.ownerByChamber.Senate.spouse], colors: [GOLD], label: "Transactions by owner code and chamber" }), "Owner code on the filing: self (the member), joint account, or spouse. Dependent-child transactions omitted for scale.")}
<p>This is the sharpest difference. In the House, <strong>${pct(D.ownerByChamber.House.self, house.n, 0)}</strong> of transactions are in the member's own name. In the Senate it is only <strong>${pct(D.ownerByChamber.Senate.self, senate.n, 0)}</strong>; spouse and joint accounts make up the large majority. Anyone attributing Senate trades to a senator's personal judgment should look at the owner column first.</p>
<h2 id="format">File formats and what they mean for data</h2>
<ul>
<li><strong>House:</strong> PDFs per filing plus a yearly machine-readable index of who filed what and when. Scanned handwritten forms exist, especially in older years, and require OCR, which is where most parsing errors in any tracker originate.</li>
<li><strong>Senate:</strong> web forms in eFD since 2012 with structured fields for most filers, and scanned paper for a minority. Easier to parse, but the site is session-based and not designed for bulk access.</li>
<li><strong>Both:</strong> amendments replace nothing; they add a new filing, so trackers must de-duplicate by lawmaker, asset, date and amount.</li>
</ul>
<h2 id="trackers">What this means when you read a tracker</h2>
${takeaways([`House numbers dominate any all-Congress statistic; filter by chamber before comparing lawmakers.`, "Senate filings are fresher on average, so a Senate alert is typically a few weeks closer to the trade.", "Most Senate transactions are spouse or joint; most House transactions are the member's own.", "Parsing quality differs by source; a good tracker links every row to its original filing so you can check."])}
<p>${BRAND} shows chamber, owner and filing delay on every record, and lets you filter by all three. <a href="/signup">Create a free account</a> to compare the two chambers on live data, or read <a href="/blog/congress-45-day-filing-rule-and-late-disclosures/">the full analysis of filing delays</a>.</p>` },

  // 11 ------------------------------------------------------------------
  { slug: "how-the-stock-act-affects-investors", category: "Explainer", date: PUB, asOf: AS_OF, tags: ["stock-act", "basics", "data"],
    title: "What the STOCK Act means for everyday investors",
    short: "The STOCK Act and investors", desc: `What the STOCK Act disclosure record can and cannot tell an investor: ${n(T.trades)} congressional trades, the filing lag, amount ranges, and why it is a transparency tool, not a stock tip.`,
    heroAlt: "The companies most members of Congress have disclosed trading, led by Apple, Microsoft and Amazon",
    intro: "The STOCK Act turned Congress's trades into a public dataset anyone can read. Here is what that record is genuinely useful for as an investor, and the three reasons it is a poor shortcut to returns.",
    faq: [["Can I make money copying congressional stock trades?", `There is no guarantee. By the time a trade is public it is weeks old (the median gap is ${D.delayMedian.m} days and ${pct(LATE, T.trades)} of filings are late), the amount is only a range, and you often cannot tell whether the member, a spouse or an adviser made the decision. The record is a transparency tool, not investment advice.`],
          ["Are congressional trades a reliable market signal?", `Only weakly. The companies Congress trades most are the same mega-caps most index funds already hold, buys and sells are close to balanced (${pct(BUYS, T.trades, 0)} vs ${pct(SELLS, T.trades, 0)}), and the filing lag removes most of any timing edge.`],
          ["Is it legal to trade based on these disclosures?", "Yes. The filings are public records published under the STOCK Act, and trading on public information is legal for anyone. Nothing on Hillradar AI is a recommendation to buy or sell."]],
    body: () => `
<p>The STOCK Act was written for <strong>transparency</strong>, not for investors. Its side effect, though, is one of the richest public financial datasets anywhere: <strong>${n(T.trades)} disclosed transactions</strong> from <strong>${n(T.pols)} lawmakers</strong> across <strong>${n(T.issuers)} companies and assets</strong>. The question for an investor is a narrow one: what can that record actually tell you, and what can it not?</p>
<h2 id="holdings">What Congress actually trades</h2>
${figure(hbars({ label: "Companies traded by the most members of Congress", rows: D.topCompanies.slice(0, 6).map((c) => [`${c.ticker}`, c.pols]), fmt: n }), `Number of distinct lawmakers who have disclosed trading each company, top six, in the ${BRAND} database as of ${AS_OF}.`)}
<p>The first surprise is how ordinary the list is. The names most members of Congress trade are <strong>Apple</strong>, <strong>Microsoft</strong> and <strong>Amazon</strong>, the same mega-cap stocks that sit at the top of almost every index fund. Congress, in aggregate, is not trading exotic tickers you have never heard of. That alone should temper the idea that the disclosures are a secret watchlist.</p>
<h2 id="lag">Why the timing works against you</h2>
${figure(bars({ labels: D.delayBuckets.map((x) => x.b), values: D.delayBuckets.map((x) => x.n), colors: [GOLD], label: "How many days after a trade it was disclosed", legend: [["Days from trade to filing", GOLD]] }), `Disclosure delay across ${n(T.trades)} filings: days between the trade and its public filing. The STOCK Act allows up to 45.`)}
<p>This is the biggest problem with treating the record as a signal. The median trade is disclosed <strong>${D.delayMedian.m} days</strong> after it happens, <strong>${pct(LATE, T.trades)}</strong> of filings (${n(LATE)}) arrive after the 45-day deadline, and <strong>${n(D.delay.late90)}</strong> land more than 90 days late. By the time a trade is public, whatever information or timing it reflected is usually stale. A disclosure is a piece of history, not a live tip.</p>
<h2 id="fineprint">What the filing never tells you</h2>
<p>Even a fresh filing withholds the things an investor would most want to know:</p>
<ul>
<li><strong>Not the size.</strong> Amounts are ranges, and ${pct(D.bands[0].n, T.trades, 0)} of all transactions sit in the smallest $1,001–$15,000 band. You cannot tell a token position from a conviction bet.</li>
<li><strong>Not who decided.</strong> Only ${pct(owner("self"), T.trades, 0)} of transactions are the member's own account; the rest are joint, spouse or dependent-child accounts, many run by a financial adviser the member does not direct.</li>
<li><strong>Not the price, and not the reason.</strong> There is no entry price, no thesis, and no note on whether a sale was a view on the company or a scheduled rebalance.</li>
<li><strong>Not final.</strong> Filers can amend reports later, so any single row can move.</li>
</ul>
${callout(`<b>The copy-trading trap:</b> "buy what Congress buys" means buying an unknown amount, for an unknown reason, decided by an unknown person, reported weeks after the fact. That is four blind spots stacked on top of each other.`)}
<h2 id="use">Where it genuinely helps</h2>
<p>Read as a <strong>transparency and accountability</strong> record rather than a trade feed, the data is valuable:</p>
${takeaways(["Spotting potential conflicts of interest when a lawmaker trades in a sector they write laws about.", "Checking a company you already follow to see whether members of Congress have been buying or selling it, and when.", "Using a filing as a prompt to go read the primary source and the company's own disclosures, not as a reason to act.", "Following specific lawmakers or tickers for awareness, with alerts, so you learn of a filing when it posts rather than months later."])}
<h2 id="bottom">The honest bottom line</h2>
<p>The STOCK Act record is one of the most detailed public windows into a legislature's finances anywhere, and that is exactly its worth: it lets voters, journalists and investors <em>watch</em>. It is not a strategy. ${BRAND} publishes the record, the filing delay and the amount band on every row, and states plainly that nothing here is investment advice. Start with <a href="/blog/what-is-the-stock-act/">what the STOCK Act requires</a>, then <a href="/blog/why-congress-trade-amounts-are-ranges/">why the amounts are ranges</a> and <a href="/blog/congress-45-day-filing-rule-and-late-disclosures/">how late the filings really are</a>.</p>` },
];

// longer-form sections appended to every article
import { extras } from "./extras.mjs";
for (const a of articles) { const base = a.body; a.body = (x) => base(x) + (extras[a.slug] ?? ""); }
