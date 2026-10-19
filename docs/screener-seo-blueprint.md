# Quant Stock Screener — SEO/AEO Content Blueprint (reference / not the live site)

> **Scope.** This blueprint is for a **Stockopedia-style quantitative stock screener**
> (QVM factors, Piotroski F-Score, Magic Formula, DCF). The live hillradar.com is a
> **Congress stock-trades tracker** and has **none** of these features. Do **not** publish
> any of this to the current site — it would claim tools that don't exist. Keep this as
> planning material for a possible screener product. For the real site, see
> [`congress-trades-seo-blueprint.md`](./congress-trades-seo-blueprint.md).

## 1. Intent Clustering Matrix

| Cluster | Intent | Keywords |
|---|---|---|
| **A — Core Software & Tool** | Transactional | stock screener · stock ranks · quantitative stock screening · stock market analytics · proprietary stock ranking system · stock screening tool for value investors · dividend growth screener · automated financial ratio builder · algorithmic stock scanning platform · fundamental stock analysis engine · institutional grade financial data · factor investing software |
| **B — Quant Strategies & Guru Screens** | High-authority informational | quality value momentum factor · qvm factor score · piotroski f score scanner · altman z score formula · beneish m score earnings manipulation · magic formula stock strategy · joel greenblatt stock screening |
| **C — Valuation Metrics & Ratios** | Technical feature | financial ratios · trailing twelve months financial metrics · ev to ebit earnings yield · return on capital employed roce · net current asset value ncav · debt to equity ratio scanner · price to earnings growth peg · discounted cash flow analysis dcf |
| **D — Portfolio Analytics & Risk** | Retention / advanced | portfolio backtesting software · custom investment portfolio tracker · stock market tracking dashboard |

**Notes.** Cluster D is thin — expand with `max drawdown screener`, `sharpe ratio calculator`,
`portfolio volatility tracker`, `rebalancing alerts`. `altman z` / `beneish m` are risk signals;
link them from B into D. `institutional grade financial data` is a trust modifier for meta/E-E-A-T,
not a standalone page.

## 2. Data-Dense Landing Copy — Core Screener Page (191 words)

> **Hillradar** is a **quantitative stock screening** engine that ranks **40,000+ global equities**
> on raw fundamentals, not opinion. Every stock carries a **proprietary stock ranking system**
> score built from three independent factors: **Quality**, **Value**, and **Momentum** (**QVM**).
> Scores are percentile-ranked 0–100 against each stock's market and sector.
>
> The **stock screener** filters on **100+ financial ratios** computed on **trailing-twelve-month
> (TTM)** data: **EV/EBIT earnings yield**, **return on capital employed (ROCE)**,
> **price-to-earnings-growth (PEG)**, **debt-to-equity**, free cash flow yield, and **net current
> asset value (NCAV)**. Build compound rules — *ROCE > 15% AND EV/EBIT < 10 AND F-Score ≥ 7* — in
> the **automated financial ratio builder**, then sort the result set by any column.
>
> Accounting-quality flags run on every name: the **Piotroski F-Score**, **Altman Z-Score**, and
> **Beneish M-Score** surface balance-sheet strength and earnings-manipulation risk before you buy.
> A **discounted cash flow (DCF)** module outputs intrinsic value per share.
>
> As **factor investing software** with point-in-time, restated **institutional-grade financial
> data**, Hillradar runs the same math on live and historical universes, so a screen you design is
> a screen you can **backtest**.

## 3. On-Page Metadata (titles `<60`, meta `<160`)

| # | Title Tag | Meta Description |
|---|---|---|
| 1 | `Quant Stock Screener & Stock Ranks \| Hillradar` | `Screen 40,000+ stocks with a quantitative ranking system. Sort by EV/EBIT, ROCE, PEG and F-Score. Institutional-grade data, free to start.` |
| 2 | `Quantitative Stock Screening & Factor Ranks` | `Rank every stock on Quality, Value & Momentum. Build custom financial-ratio screens, flag Altman Z & Beneish M risk, then backtest it.` |
| 3 | `Financial Ratio Screener: EV/EBIT · ROCE · PEG` | `Screen value stocks on 100+ TTM ratios and guru models — Magic Formula, Piotroski F-Score, NCAV. Institutional data. Start free today.` |

## 4. Academic Content Hub — Article Outlines (with the math)

### Article 1 — The Piotroski F-Score: 9 Tests That Separate Strong Balance Sheets From Value Traps
- **H1:** The Piotroski F-Score Explained: Scoring Financial Strength 0–9
  - **H2:** What the F-Score Measures and Why Joseph Piotroski Built It
  - **H2:** The 9 Binary Tests (1 point each)
    - **H3:** Profitability (4) — positive **ROA**, positive **CFO**, rising ROA YoY, **CFO > ROA**
    - **H3:** Leverage & Liquidity (3) — falling long-term debt ratio, rising current ratio, no new shares
    - **H3:** Operating Efficiency (2) — rising gross margin, rising asset turnover
  - **H2:** Reading the Score — 8–9 Strong, 0–2 Avoid
  - **H2:** How to Screen: `F-Score ≥ 7 AND P/B < 1`
  - **H2:** Backtest Evidence and Limitations (small/micro-cap bias)

### Article 2 — The Magic Formula Decoded: Greenblatt's Earnings Yield × Return on Capital
- **H1:** Greenblatt's Magic Formula: The Two-Factor Math, Step by Step
  - **H2:** Cheap (Earnings Yield) × Good (Return on Capital)
  - **H2:** Factor 1 — Earnings Yield
    - **H3:** Formula: **EBIT ÷ Enterprise Value**, and why EV beats P/E
  - **H2:** Factor 2 — Return on Capital
    - **H3:** Formula: **EBIT ÷ (Net Working Capital + Net Fixed Assets)** vs. **ROCE**
  - **H2:** Combining the Ranks — Universe Rules (exclude financials/utilities, min market cap)
  - **H2:** How to Replicate the Screen and Sort by Combined Rank
  - **H2:** Why It Underperforms for Years — the Discipline It Requires

### Article 3 — Altman Z-Score vs. Beneish M-Score: Screening for Bankruptcy and Manipulation
- **H1:** Two Forensic Scores to Run Before You Buy
  - **H2:** Altman Z-Score — Distance From Bankruptcy
    - **H3:** `Z = 1.2·X1 + 1.4·X2 + 3.3·X3 + 0.6·X4 + 1.0·X5`
    - **H3:** The Five Inputs (WC/Assets, Retained Earnings/Assets, EBIT/Assets, Mkt Equity/Liabilities, Sales/Assets)
    - **H3:** Zones: Safe > 2.99 · Grey 1.81–2.99 · Distress < 1.81
  - **H2:** Beneish M-Score — Probability of Earnings Manipulation
    - **H3:** The 8-Variable Model (DSRI, GMI, AQI, SGI, DEPI, SGAI, TATA, LVGI)
    - **H3:** Threshold: **M > −1.78** flags a likely manipulator
  - **H2:** Combining Both With a **Debt-to-Equity** Quality Gate
  - **H2:** How to Add Z-Score and M-Score Columns to Any Screen

**AEO note.** Open each article with a 40–60 word self-contained answer (formula + threshold)
before expanding — that block is what Claude/ChatGPT/Gemini extract and cite. Mark up with
`FAQPage` + `HowTo` schema; give each formula both an alt-texted image and raw text so it survives scraping.
