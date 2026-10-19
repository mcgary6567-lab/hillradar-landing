# Hillradar AI — AEO & Technical SEO Playbook

> **Scope note.** The request that generated this used a generic template that called
> hillradar.com a "live weather radar / precipitation" tool and left the keyword list
> placeholder empty. hillradar.com is in fact a **Congress stock-trades tracker** built on
> STOCK Act disclosures. This playbook is written for the real platform, and the keyword
> list in section 3 is derived from the site's actual target terms, not supplied by the brief.

The goal is dual visibility: classic **Google Search** rich results *and* **AI retrieval**
(Claude, ChatGPT, Gemini, Perplexity) that cite the site when users ask about congressional
trading. The lever for both is the same: high **information density**, explicit **entities**,
and **structured, parseable facts** that trace back to a primary source.

---

## 1. Comprehensive on-page metadata mapping

### 1.1 Title tag and meta description (home page)

The hard limits are ~60 chars for the title and ~160 for the description. Lead with the
entity + the primary query, not the brand.

| Field | Value | Length |
|---|---|---|
| Title tag | `Congress Stock Trades Tracker — STOCK Act Filings` | 49 |
| Meta description | `Search 57,000+ stock trades US senators and representatives disclosed under the STOCK Act since 2014. Updated daily, free to search. See who bought what.` | 151 |

> Already-live alternative titles that also pass: `See What Members of Congress Are Trading | Hillradar AI` (social/OG, 55). Keep the
> SEO `<title>` focused on the head term (`Congress Stock Trades Tracker`); keep the brand
> in the OG title where click-through is driven by recognition.

**Per-template title formulas** (apply across the site so every URL earns its own intent):

- Home: `Congress Stock Trades Tracker — STOCK Act Filings`
- Lawmaker profile (in-app/SEO): `{Name} Stock Trades — Disclosed Filings | Hillradar AI`
- Company/ticker view: `Which Members of Congress Trade {TICKER}? | Hillradar AI`
- Blog guide: `{Specific claim with a number} | Hillradar AI` (≤60; fall back to `short` title)

### 1.2 Semantic heading hierarchy (entity-rich)

A landing page built around a **live data widget** (here: the "Latest filings" / "Right now
in Congress" panels) should give crawlers and LLMs a heading outline that names entities and
answers questions, never generic UI labels like "Features" or "Overview".

```
H1  See what members of Congress are trading
      └ one H1 only; contains the entities "members of Congress" + "trading"

H2  Every congressional stock trade since 2014, searchable
    H3  Every disclosed trade, filterable by lawmaker, company, party and chamber
    H3  Lawmaker profiles: filings, favourite tickers and filing speed
    H3  Company view: which senators and representatives trade a ticker
    H3  Activity clusters: when several lawmakers buy the same stock

H2  Live from the record: the latest STOCK Act filings   ← wraps the widget
    H3  Most active lawmakers in the last 90 days
    H3  Companies traded by the most members of Congress

H2  How Hillradar collects congressional disclosures
    H3  Reading House Clerk and Senate eFD filings several times a day
    H3  Following lawmakers and companies on your watchlist
    H3  Instant Telegram, WhatsApp and email alerts

H2  Congress stock trades, explained
    H3  What is the STOCK Act?
    H3  What a Periodic Transaction Report contains
    H3  How to track politician stock trades

H2  Simple pricing: free to search, Pro for the full record
H2  Questions about congressional trading data   ← FAQ, mirrors FAQPage schema
```

Rules:
- **Exactly one H1.** Never skip a level (no H2 → H4).
- Every H2/H3 should read like a **search query or a question** a user or an AI would phrase.
- Put the widget under a descriptive H2 (`Live from the record…`) so the dynamic content has
  a textual anchor even before JS runs.

### 1.3 Bolded intent signals

Bold (`<strong>`, not `<b>` styling) the terms that tell a crawler what the page is *about* —
use it on the **first, in-context mention**, not everywhere (over-bolding dilutes the signal):

- Entity anchors: **stock trades**, **members of Congress**, **senators and representatives**,
  **STOCK Act**, **Periodic Transaction Report**, **disclosed filings**.
- Trust/credibility: **official filings**, **House Clerk**, **Senate eFD**, **public records**,
  **independent**, **non-partisan**.
- Differentiators: **activity clusters**, **instant alerts**, **updated daily**,
  **free to search**.

One bolded phrase per idea, ideally inside a sentence that *defines* it ("Lawmakers file
**Periodic Transaction Reports** as documents"). That co-location of the bold term with its
definition is exactly what extractive AI answerers quote.

### 1.4 Functional alt-text for the data visuals

The site renders a live **filings panel** and blog **chart images** (canvas/SVG). Alt-text must
describe the *data and function*, not the decoration. Pattern: `{what it shows} — {the key
numbers} — {source}`.

- Latest-filings panel container: `Live panel of the most recent congressional stock-trade
  filings: lawmaker, ticker, buy or sell, amount range and filing date.`
- "Most traded" chart hero: `Bar chart of the companies traded by the most members of
  Congress — Apple (134 lawmakers), Microsoft (122), Amazon (109) — from STOCK Act filings.`
- Social/OG image: `Hillradar AI: see what members of Congress are trading. 57,000+ disclosed
  trades, 350+ lawmakers, updated daily. Search free.` *(already applied)*
- Decorative icons (radar sweep, chrome): `alt=""` so assistive tech and crawlers skip them.

For a live canvas with no natural text, pair it with a visually-hidden `<figcaption>` or
`aria-label` carrying the same "what + numbers + source" sentence, so the fact survives even
when the pixels can't be read.

---

## 2. MCP & structural integration analysis

AI engines retrieve two ways: they **crawl** your HTML (so the JSON-LD and llms.txt below do
the work), and, increasingly, they **call tools** over the **Model Context Protocol (MCP)**.
Format the data so both paths succeed.

### 2.1 Make the real-time data parseable by LLMs / MCP

1. **Keep a machine-readable mirror of every human page.** The site already ships
   [`llms.txt`](/llms.txt) (the plain-language map AI crawlers look for) — keep it in sync with
   the real totals and clean URLs on every data refresh. Add an `llms-full.txt` later if you
   want the full article bodies inlined for retrieval.
2. **Expose a read-only JSON API with stable, self-describing fields.** The landing page already
   calls `GET /api/public/landing`. Treat that contract as a product: documented field names
   (`ticker`, `lawmaker`, `chamber`, `party`, `tradeType`, `tradeDate`, `filingDate`,
   `amountLow`, `amountHigh`, `disclosureDelayDays`), ISO-8601 dates, explicit units, and a
   top-level `asOf` timestamp so a model can state data freshness.
3. **Ship a thin MCP server** (`hillradar-mcp`) wrapping that API with a few typed tools:
   - `search_trades(lawmaker?, ticker?, party?, chamber?, since?, limit?)`
   - `lawmaker_profile(name)` → filings, top tickers, median filing delay
   - `company_holders(ticker)` → which members of Congress traded it
   - `latest_filings(limit)` and `activity_clusters(since)`
   Each tool returns **structured JSON + a one-line natural-language summary** and always
   includes the source filing URL, so any answer an assistant builds is citable. Keep tool
   descriptions dense and example-driven — that text is what the model reads to decide to call
   it. (The `mcp-builder` approach: narrow, well-named tools beat one giant `query` tool.)
4. **Every record links back to its primary source.** A disclosure row that carries the House
   Clerk / Senate eFD document URL is far more likely to be cited than a bare number, because
   retrieval systems weight verifiable, sourced facts.
5. **Freshness signals.** Emit `dateModified` in JSON-LD, `<lastmod>` in `sitemap.xml`, and an
   `asOf` field in the API and llms.txt. "Updated daily" is only an AEO asset if the timestamps
   prove it.

### 2.2 JSON-LD schema template (Dataset + SoftwareApplication)

This platform is **both** an app and a dataset, so model both. A `Dataset` node has now been
added to the home page `@graph` alongside the existing `SoftwareApplication`. Template:

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://hillradar.com/#dataset",
  "name": "US Congress Stock Trades — STOCK Act Disclosures (2014–present)",
  "description": "Every stock, bond, option and fund transaction US senators and representatives have disclosed under the STOCK Act since 2014. 57,000+ Periodic Transaction Report filings across 350+ lawmakers and 9,000+ assets, each with lawmaker, chamber, party, state, ticker, transaction type, trade date, filing date and reported amount range.",
  "url": "https://hillradar.com/",
  "keywords": ["congress stock trades","senator stock trades","STOCK Act disclosures","periodic transaction report","congressional trading"],
  "creator": { "@id": "https://hillradar.com/#org" },
  "publisher": { "@id": "https://hillradar.com/#org" },
  "isAccessibleForFree": true,
  "license": "https://hillradar.com/terms/",
  "usageInfo": "https://hillradar.com/disclaimer/",
  "creditText": "Compiled by Hillradar AI from official US House Clerk and Senate eFD STOCK Act filings.",
  "temporalCoverage": "2014-01-01/..",
  "spatialCoverage": { "@type": "Place", "name": "United States" },
  "measurementTechnique": "Parsing of official House Clerk and Senate eFD Periodic Transaction Report filings, joined to the congress-legislators directory.",
  "variableMeasured": ["Lawmaker name","Chamber","Party","State","Company or asset","Ticker","Transaction type","Trade date","Filing date","Disclosure delay (days)","Reported amount range (USD)"],
  "distribution": [{
    "@type": "DataDownload",
    "name": "CSV export (member accounts)",
    "encodingFormat": "text/csv",
    "contentUrl": "https://hillradar.com/signup"
  }],
  "dateModified": "2026-10-19"
}
```

Keep these nodes connected by `@id` in one `@graph` (as the site does): `Organization`,
`WebSite`, `WebPage` (+ `primaryImageOfPage`), `SoftwareApplication`, `Dataset`, `FAQPage`.
Validate every change at the **Rich Results Test** and **Schema.org validator** before deploy.
Next schema wins to add: `BreadcrumbList` on blog and section pages, and `Person` + `Dataset`
nodes on each lawmaker profile so "{Name} stock trades" can win an entity panel.

---

## 3. Knowledge clustering workflow

No keyword list was supplied, so the set below is derived from the site's actual domain and
the terms already in its metadata. Grouped by intent; third cluster re-maps the brief's
"extreme weather monitors" to this platform's real analog — **signal / activity monitors**
watching for unusual or clustered trading.

### Cluster A — Tool users (transactional / high intent)
*They want to search, follow and get alerted now.*

Keywords: `congress stock trades tracker`, `track senator stock trades`, `politician stock
trades app`, `congressional trading tracker`, `house of representatives stock trades`,
`senate stock trade disclosures`, `congress stock trade alerts`, `stock act tracker`,
`watch congress trades`, `congress trading csv export`.

3-step content plan:
1. **Home + tool pages carry the transactional terms in H1/H2 and the first 100 words**, each
   paired with the live widget so the page *demonstrates* the tool, not just describes it.
2. **Ship programmatic entity pages** — one per lawmaker and per ticker (`/congress/{name}`,
   `/stock/{ticker}`) — each a dense table (filings, buys/sells, amount bands, filing delay)
   + a 2-sentence plain-English summary + `Dataset`/`Person` schema. These win the long tail
   ("does {senator} own {stock}") that both Google and AI answerers field constantly.
3. **One comparison/decision asset**: "How to track Congress stock trades (free vs paid)",
   a table of methods and what each covers, ending on the free-search CTA.

### Cluster B — Informational seekers (learn / understand)
*They're searching to understand the law and the records.*

Keywords: `what is the STOCK Act`, `are congressional stock trades legal`, `how to read a
periodic transaction report`, `why are congress trade amounts ranges`, `congress 45 day
filing rule`, `what is a periodic transaction report`, `do members of congress have to
disclose stock trades`, `house vs senate disclosure rules`.

3-step content plan (the blog already covers most of these — tighten for AEO):
1. **Open every guide with a 40–60 word direct answer** to the title question (an extractable
   "answer box" paragraph), *then* expand. AI engines quote the first self-contained answer.
2. **Lead with facts and numbers, cut filler.** Replace throat-clearing intros with a stat or
   a definition in sentence one. Density beats length — thin, padded prose gets filtered as
   low-value by both ranking and retrieval.
3. **Cross-link and mark up.** Add `FAQPage`/`QAPage` schema to each guide's question list,
   `BreadcrumbList` for hierarchy, and internal links from each definition to the tool page
   that lets them act on it (definition → "see {TICKER} filings").

### Cluster C — Signal / activity monitors (the "extreme event" analog)
*They want the unusual: clusters, late filers, big or surprising trades.*

Keywords: `unusual congress stock trades`, `congress stock trade clusters`, `most active
congress stock traders`, `late congressional stock disclosures`, `biggest congress stock
trades this week`, `which stocks is congress buying now`, `congress insider trading signals`,
`{lawmaker} latest stock trades`.

3-step content plan:
1. **A refreshed "Right now in Congress" data story / page** — most-traded this quarter, newest
   clusters, latest late filers — regenerated on each data pull, with visible `asOf` dates so
   it reads as live. This is the page AI assistants reach for on "what is Congress buying now".
2. **Define and own the proprietary entity "activity cluster"** with a precise, cited
   explainer (what triggers it, how it's scored, the back-test caveats). Owning a defined term
   earns the citation when someone asks an AI what it means.
3. **Keep framing factual and compliant.** Use "disclosed", "reported", "activity cluster" —
   not "insider trading" as a claim. Every monitor page repeats the disclaimer: public records,
   not financial advice, amounts are ranges, filings can be amended. This protects the brand
   *and* reads as trustworthy to the models weighting E-E-A-T.

---

## What has already been implemented in this repo

- **`Dataset` JSON-LD node** added to the home-page `@graph` (section 2.2), validated.
- **Social card + OG/Twitter tags** rewritten for intent (`og-image.jpg`, `og:title`,
  `og:description`, `twitter:*`, image `alt`, `?v=` cache-bust); broken `og-image.png`
  references on the FAQ/legal pages fixed.
- **`llms.txt`** corrected to canonical clean URLs (`/faq/` not `/faq.html`).

## Backlog (not yet built — needs app/API work)

1. Programmatic lawmaker and ticker entity pages with `Person`/`Dataset` schema.
2. `BreadcrumbList` schema on blog + section pages.
3. Documented public JSON API contract + a thin `hillradar-mcp` MCP server.
4. "Answer-box" first paragraphs + `FAQPage` markup on each blog guide.
5. A live, dated "Right now in Congress" monitor page regenerated on each data pull.
