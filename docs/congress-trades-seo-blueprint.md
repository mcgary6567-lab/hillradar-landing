# Hillradar AI — Congress Trades SEO/AEO Content Blueprint

> The same 4-part framework as the screener blueprint, but built on the **real** product:
> a tracker of the stock trades US senators and representatives disclose under the **STOCK Act**.
> This one is safe to ship — every feature and number below exists in the product or `tools/data.json`.
> Companion to the broader [`aeo-seo-playbook.md`](./aeo-seo-playbook.md).

## 1. Intent Clustering Matrix

Keyword bank derived from the site's real domain and current metadata.

| Cluster | Intent | Keywords |
|---|---|---|
| **A — Core Tracker & Tool** | Transactional | congress stock trades tracker · track senator stock trades · politician stock trades app · congressional trading tracker · stock act tracker · house of representatives stock trades · senate stock trade disclosures · search congress trades · free congress trade tracker |
| **B — Lawmaker & Entity Screens** | High-authority informational (the "guru" analog) | most active congress stock traders · {lawmaker} stock trades · which stocks is congress buying · most traded stocks by congress · congressional trading clusters · republican vs democrat stock trades · house vs senate trading |
| **C — Filing Mechanics & Metrics** | Technical feature | what is the STOCK Act · periodic transaction report · 45 day filing rule · congress trade amount ranges · late congressional disclosures · disclosure delay days · buy vs sell ratio · owner codes self spouse dependent |
| **D — Alerts, Monitoring & Retention** | Advanced / retention | congress trade alerts · congressional trading watchlist · telegram congress trade alerts · csv export congress trades · real-time filing notifications |

**Notes.** Cluster B is where the long tail and AI-citations live — build **programmatic entity pages**
(one per lawmaker, one per ticker). Cluster C maps 1:1 to the existing blog; tighten those for AEO.
Cluster D is the Pro conversion path — every monitor page should end on an alert/watchlist CTA.
When targeting a named lawmaker, keep it factual (public figure, public records) and repeat the
"public records, not financial advice" disclaimer.

## 2. Data-Dense Landing Copy — Core Tracker Page (196 words)

> **Hillradar AI** tracks every **stock trade** US **senators and representatives** are required to
> disclose under the **STOCK Act**. It turns their **Periodic Transaction Reports** — filed as PDFs
> with the **House Clerk** and **Senate eFD** — into one searchable database. **57,000+ disclosed
> trades** since **2014**, across **350+ lawmakers** and **9,000+ companies and assets**, refreshed
> several times a day.
>
> Every record carries the **lawmaker**, **chamber**, **party**, **state**, the **company and
> ticker**, whether it was a **purchase, sale or exchange**, the **trade date**, the **filing date**,
> and the reported **amount range** (filings never state exact dollars, only bands like
> **$15,001–$50,000**). The law allows up to **45 days** to file; Hillradar computes the
> **disclosure delay** on every trade and marks **late filings** — the median gap is **27 days**.
>
> Filter by lawmaker, company, party, chamber, state, trade type, amount or date. Open a **lawmaker
> profile** to see their full record and filing speed, or a **company view** to see which members of
> Congress traded a ticker. **Activity clusters** flag when several lawmakers file the same stock
> within weeks. Follow any lawmaker or company for **instant Telegram, WhatsApp and email alerts**,
> and **export to CSV**.

*Every figure traces to `tools/data.json` (asOf 2026-10-05). Bold = entities crawlers and LLMs anchor on.*

## 3. On-Page Metadata (titles `<60`, meta `<160`)

CTR-tuned for voters, journalists and self-directed investors. The live `<title>` is already strong;
these are tested alternates.

| # | Title Tag | Meta Description |
|---|---|---|
| 1 | `Congress Stock Trades Tracker — Live Filings` | `Search 57,000+ stock trades senators and representatives disclosed under the STOCK Act since 2014. Updated daily, free. See who bought what, and when.` |
| 2 | `Senator & House Stock Trades — STOCK Act Data` | `Track every congressional stock trade from the official filings. Lawmaker and company profiles, activity clusters and instant alerts. Free to search.` |
| 3 | `Track Politician Stock Trades + Instant Alerts` | `Follow any member of Congress and get a Telegram, WhatsApp or email alert the moment they file a trade. 57,000+ disclosures since 2014. Start free.` |

## 4. Content Hub — 3 Net-New Builds (with the "math")

The blog already covers Cluster C explainers. These three are the highest-value **missing** pages —
the ones AI answerers and the long tail reach for. "Math" here = how each computed field is derived.

### Build 1 — Lawmaker entity page template: "{Name} Stock Trades — Full Disclosure Record"
*Programmatic, one URL per lawmaker (`/congress/{slug}`). Targets Cluster B long tail.*
- **H1:** {Name} Stock Trades: Every Disclosed Filing
  - **H2:** Summary — {N} filings, {buys} buys / {sells} sells, {firstYear}–present
    - **H3:** How we count a "filing" and where the data comes from (House Clerk / Senate eFD)
  - **H2:** Filing speed — median **disclosure delay** of {X} days vs. the 45-day limit
    - **H3:** How delay is computed: `filing date − trade date`, late = > 45 days
  - **H2:** Most-traded companies by this lawmaker (table: ticker, trades, buy/sell split)
  - **H2:** Full transaction table (sortable: date, ticker, type, amount range)
  - **H2:** What this record does and does not tell you (ranges, spouse/dependent owner codes, amendments)
  - Schema: `Person` + `Dataset`, `BreadcrumbList`.

### Build 2 — Ticker entity page template: "Which Members of Congress Trade {TICKER}?"
*Programmatic, one URL per company (`/stock/{ticker}`). Targets "{company} congress trades".*
- **H1:** Which Members of Congress Have Traded {Company} ({TICKER})?
  - **H2:** {N} lawmakers have filed {trades} trades in {TICKER} since 2014
    - **H3:** How "{N} lawmakers" is counted (distinct filers, not transactions)
  - **H2:** Buy vs. sell breakdown and the reported amount ranges
  - **H2:** Timeline — filings by quarter, with any **activity clusters** flagged
    - **H3:** What a cluster is and how it's scored (link to the cluster explainer)
  - **H2:** Every {TICKER} filing (table: lawmaker, party, chamber, date, type, amount)
  - **H2:** Disclaimer — public records, amount bands, not financial advice
  - Schema: `Dataset`, `BreadcrumbList`.

### Build 3 — Live monitor: "What Stocks Is Congress Buying Right Now?"
*Refreshed on each data pull; dated. Targets the highest-intent Cluster B query.*
- **H1:** What Is Congress Buying Right Now? (updated {asOf})
  - **H2:** Most-bought tickers in the last 90 days (buys minus sells, filing count)
    - **H3:** The math: net buying = buy filings − sell filings over the window
  - **H2:** Newest activity clusters this month
  - **H2:** Latest late filers (trades disclosed > 45 days after the trade date)
  - **H2:** Most active lawmakers this quarter
  - **H2:** Methodology & limits — filing not trade dates, ranges not amounts, amendments
  - Schema: `Dataset` + `ItemList`; emit a visible `asOf` so AI engines state freshness.

**AEO note.** Open every page with a 40–60 word self-contained answer (the key numbers + source)
before the tables — that is the block Claude/ChatGPT/Gemini quote. Keep each number tied to its
source filing URL so answers built from the page are citable. Mirror the live totals in `llms.txt`
and emit `dateModified` everywhere so "updated daily" is provable.
