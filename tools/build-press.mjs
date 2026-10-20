/**
 * Builds the press / data page at /press/index.html — a citable methodology page for journalists,
 * researchers and NGOs (the kind of page that earns links). Numbers come from tools/data.json.
 *   node tools/build-press.mjs      (run from the repo root)
 * Run tools/build-blog.mjs afterwards so sitemap.xml picks it up (build-blog is the sitemap authority).
 */
import fs from "node:fs";
import path from "node:path";
import { SITE, BRAND, esc, fmtDate, header, footer, head } from "./shell.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const D = JSON.parse(fs.readFileSync(path.join(root, "tools", "data.json"), "utf8"));
const n = (x) => Number(x).toLocaleString("en-US");
const pct = (a, b, d = 1) => ((a / b) * 100).toFixed(d) + "%";
const T = D.totals;
const since = D.perYear[0].y;
const asOf = D.asOf;
const url = `${SITE}/press/`;
const title = `Press & Data — Congress Stock Trades | ${BRAND}`;
const desc = `Sources, method and headline numbers behind ${BRAND}'s congressional STOCK Act dataset: ${n(T.trades)} trades, ${n(T.pols)} lawmakers since ${since}. How to cite and reach us.`;
const citation = `${BRAND}, congressional STOCK Act disclosures (hillradar.com), data as of ${fmtDate(asOf)}.`;

const ld = { "@context": "https://schema.org", "@graph": [
  { "@type": "WebPage", "@id": `${url}#page`, url, name: title, description: desc, isPartOf: { "@id": `${SITE}/#website` }, publisher: { "@id": `${SITE}/#org` }, about: { "@id": `${url}#dataset` }, breadcrumb: { "@id": `${url}#bc` }, inLanguage: "en-US", dateModified: asOf },
  { "@type": "Dataset", "@id": `${url}#dataset`, name: "US Congress Stock Trades — STOCK Act Disclosures (2014–present)", description: `Every stock, bond, option and fund transaction US senators and representatives have disclosed under the STOCK Act since ${since}: ${n(T.trades)} Periodic Transaction Report filings across ${n(T.pols)} lawmakers and ${n(T.issuers)} companies and assets, each with lawmaker, chamber, party, state, ticker, transaction type, trade date, filing date and reported amount range.`, url, creator: { "@id": `${SITE}/#org` }, publisher: { "@id": `${SITE}/#org` }, isAccessibleForFree: true, license: `${SITE}/terms/`, usageInfo: url, creditText: `Compiled by ${BRAND} from official US House Clerk and Senate eFD STOCK Act filings.`, temporalCoverage: `${since}-01-01/..`, spatialCoverage: { "@type": "Place", name: "United States" }, measurementTechnique: "Parsing of official House Clerk and Senate eFD Periodic Transaction Report filings, joined to the congress-legislators directory.", variableMeasured: ["Lawmaker name", "Chamber", "Party", "State", "Company or asset", "Ticker", "Transaction type", "Trade date", "Filing date", "Disclosure delay (days)", "Reported amount range (USD)"], dateModified: asOf },
  { "@type": "BreadcrumbList", "@id": `${url}#bc`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: "Press & data", item: url }] },
] };

const html = `${head({ title, desc, url, image: `${SITE}/assets/og-image.jpg`, ld, type: "website" })}
${header()}
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <span>Press &amp; data</span></nav>
  <article>
    <header class="ahead">
      <span class="eyebrow">Press &amp; data</span>
      <h1>Press &amp; data</h1>
      <p class="lead"><span data-brand>${BRAND}</span> maintains a structured, public-records dataset of every stock trade US senators and representatives disclose under the <strong>STOCK Act</strong>. This page is for journalists, researchers and anyone citing the data: our sources, our method, the headline numbers, how to credit us, and how to reach us.</p>
      <div class="proof">
        <div><b>${n(T.trades)}</b><span>disclosed trades</span></div>
        <div><b>${n(T.pols)}</b><span>senators &amp; representatives</span></div>
        <div><b>${n(T.issuers)}</b><span>companies &amp; assets</span></div>
        <div><b>${since}–now</b><span>full record, updated daily</span></div>
      </div>
    </header>
    <div class="prose">
      <h2 id="sources">Where the data comes from</h2>
      <p>Every record traces to a primary government source. House members file Periodic Transaction Reports with the <strong>Clerk of the House</strong>; senators file through the Senate's <strong>electronic Financial Disclosure (eFD)</strong> system. Names, parties, chambers and states come from the official <strong>congress-legislators</strong> directory. We publish the filing date and disclosure delay on every row so the provenance of each figure is visible.</p>
      <h2 id="method">How we build it</h2>
      <ul>
        <li>We read the official House and Senate disclosure records several times a day and add every new transaction.</li>
        <li>Filings are parsed into structured fields, with company names matched to tickers and the congressional directory for lawmaker details.</li>
        <li>Amendments add a new filing rather than replacing one, so records are de-duplicated by lawmaker, asset, date and amount.</li>
        <li>For each trade we compute the <strong>disclosure delay</strong> (filing date minus trade date); the median across the record is <strong>${D.delayMedian.m} days</strong>.</li>
      </ul>
      <h2 id="limits">Known limitations</h2>
      <p>We state these plainly because they matter to anyone reporting on the data:</p>
      ${`<ul>
        <li><strong>Amounts are ranges</strong>, not exact figures (e.g. $15,001–$50,000); ${pct(D.bands[0].n, T.trades, 0)} of transactions fall in the smallest band.</li>
        <li><strong>A built-in lag:</strong> the law allows up to 45 days to file, and ${pct(D.delay.late, T.trades)} of filings still arrive after that.</li>
        <li><strong>Source quality varies:</strong> older filings are scanned paper requiring OCR, the main source of parsing errors in any tracker.</li>
        <li><strong>Filers can amend</strong> reports after the fact, so figures can move slightly.</li>
        <li>Widely diversified mutual funds and ETFs are often exempt from Periodic Transaction Reports.</li>
      </ul>`}
      <h2 id="fields">Data points on every trade</h2>
      <p>Lawmaker, chamber, party and state; company or asset and ticker; transaction type (purchase, sale or exchange); trade date and filing date; reported amount range; disclosure delay; and the owner (self, spouse, joint or dependent child).</p>
      <h2 id="cite">How to cite ${BRAND}</h2>
      <p>You are welcome to cite and reference the data. Please credit it and link back so readers can reach the source:</p>
      ${`<div class="callout"><b>Suggested citation</b><br><span style="font-family:ui-monospace,Menlo,monospace;font-size:.92em">${esc(citation)}</span><br><span style="color:var(--mute)">Please link to <a href="/">hillradar.com</a> when you cite the data.</span></div>`}
      <p>The structured dataset is also described in machine-readable form for search engines and AI tools via <a href="/llms.txt">llms.txt</a> and the <code>Dataset</code> schema on this page.</p>
      <h2 id="contact">Custom data, interviews &amp; corrections</h2>
      <p>We can prepare specific data cuts (by lawmaker, company, chamber, party, state or date range), provide expert comment on congressional-disclosure trends, or correct an error in the record. Email <a data-mail href="mailto:info@hillradar.com">info@hillradar.com</a> and we reply within one business day.</p>
    </div>
    <aside class="cta-box"><div><b>Explore the live record</b><p>Search every disclosed congressional trade since ${since}, free. Browse the <a href="/congress/">most active lawmakers</a> or read the <a href="/blog/">data stories</a>.</p></div><div class="btns"><a class="btn gold" href="/signup">Create a free account</a><a class="btn" href="/congress/">Browse lawmakers</a></div></aside>
    <p class="disc-inline">${BRAND} republishes public STOCK Act disclosures for research, journalism and education. Figures come from the official filings as collected in our database as of ${fmtDate(asOf)}; filings can be amended by the filer. ${BRAND} is independent, non-partisan, not affiliated with any government body or lawmaker, and provides no investment advice. Amounts are the ranges lawmakers report.</p>
  </article>
</main>
${footer()}
</body></html>`;

fs.mkdirSync(path.join(root, "press"), { recursive: true });
fs.writeFileSync(path.join(root, "press", "index.html"), html);
console.log("press/ index");
