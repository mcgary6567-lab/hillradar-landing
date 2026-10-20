# Landing page (static)

Hillradar marketing / Google Ads landing page. Plain HTML, CSS and JS. No build step.

## Files
- `index.html` – the page
- `styles.css` – all styling
- `app.js` – fills live numbers and latest filings from the app's public API, rewrites app links
- `config.js` – **edit this**: `APP_URL` (where the app runs) and `API_URL` (same server)
- `assets/` – icons

## Public pages
`/faq/`, `/terms/`, `/privacy/`, `/disclaimer/`, `/contact/` are exported from the app
(`cd server && npm run export:landing`) so the marketing site serves them itself. Only sign-in / sign-up links go to the app.

## Deploy
Upload the folder to any static host (cPanel/Hostinger `public_html`, Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3).
Point your domain at it. Done.

## Live data
`app.js` calls `API_URL + /api/public/landing` (read-only, no auth, CORS open). If the API is unreachable the static
fallback numbers in the HTML stay, so the page never looks broken.

## Ads
Final URL: the root of this domain. Links to sign-up keep `?plan=` and `utm_*` parameters.

## Lawmaker pages
Per-lawmaker SEO pages at `/congress/<slug>/` (plus the `/congress/` index) target "{name} stock trades"
searches. Built from `tools/lawmakers.mjs` by `node tools/build-lawmakers.mjs`, then run
`node tools/build-blog.mjs` so `sitemap.xml` and `llms.txt` pick them up (build-blog is the sitemap authority).
Shared header/footer/`<head>` live in `tools/shell.mjs`.

### Adding notable lawmakers (e.g. Nancy Pelosi)
`tools/data.json` → `topLawmakers` is the *most active by trade count*, exported from the app DB. High-search
names like Pelosi trade in large amounts but not high frequency, so they are **not** in that list — and their
numbers must be **real**, never invented. Add them in `tools/extra-lawmakers.json` (a hand-curated array that
survives `data.json` re-exports; see `tools/extra-lawmakers.example.json` for the shape), then re-run both build
scripts. `lawmakers.mjs` merges the two sources, de-dupes by slug and re-ranks.

Get the real figures by running this against the app's SQLite DB (`politrade-ai`, `server/src/db.ts` schema):

```sql
-- one row per lawmaker, in the extra-lawmakers.json shape
SELECT
  (CASE p.chamber WHEN 'Senate' THEN 'Sen. ' ELSE 'Rep. ' END) || p.name AS name,
  p.party, p.chamber, p.state,
  COUNT(*)                        AS n,
  SUM(t.tx_type = 'buy')          AS buys,
  SUM(t.tx_type = 'sell')         AS sells,
  MIN(t.tx_date)                  AS first,
  MAX(t.tx_date)                  AS last
FROM trades t JOIN politicians p ON p.id = t.politician_id
WHERE p.name LIKE '%Pelosi%'      -- repeat / OR more names, or drop the WHERE for everyone
GROUP BY p.id
ORDER BY n DESC;
```

Run it as `sqlite3 <app.db> ".mode json" "<query>"` to get rows you can paste straight into
`extra-lawmakers.json` (drop the `name` prefix adjustment if `politicians.name` already includes a title).
Each record needs: `name`, `party`, `chamber`, `state`, `n`, `buys`, `sells`, `first`, `last`.

## Blog
Articles live in `tools/articles.mjs` (numbers from `tools/data.json`). Build with `node tools/build-blog.mjs`
(writes `/blog/`, `/congress/` URLs into `sitemap.xml`, and the blog + lawmaker sections of `llms.txt`) and `node tools/render-heroes.mjs` for the hero images.
`.htaccess` gives clean URLs and 301s from the old `.html` paths on Apache hosts such as Hostinger.

## Social card (Open Graph / Twitter)
`assets/og-image.jpg` (and the `.png` copy the exported FAQ / legal pages use) is the 1200x630 preview shown when any page
is shared on X, Facebook, LinkedIn, WhatsApp, Telegram or Slack. Rebuild it after `tools/data.json` changes with
`node tools/render-og.mjs` (needs Playwright + Chromium, same as the hero images). The home page's `og:title`,
`og:description` and `twitter:*` tags are in `index.html`. After changing the image bump `?v=` on the `og:image` URLs
and re-scrape at https://developers.facebook.com/tools/debug/ and https://www.linkedin.com/post-inspector/ so the old
preview is dropped from their caches.
