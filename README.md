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

### Getting more lawmakers (the recommended way)
`lawmakers.mjs` merges three sources, de-duped by slug and re-ranked by trade count:
1. `data.json` → `topLawmakers` — the original hand-made top-15.
2. `lawmakers-export.json` — the **app export** (bulk, real data). Generate it from the app repo
   (`politrade-ai`): `DB_PATH=/path/to/prod.db npx tsx scripts/export-lawmakers.ts <this-checkout> [limit] [minTrades]`
   (defaults: limit 150, minTrades 20). Lower `minTrades` / raise `limit` to include more names
   (e.g. Nancy Pelosi, who trades in size but not high frequency).
3. `extra-lawmakers.json` — hand-curated overrides that win over the bulk export (see
   `extra-lawmakers.example.json`).

Then rebuild: `node tools/build-lawmakers.mjs && node tools/build-blog.mjs`. All figures come from the
database — **never invent numbers for real lawmakers**. (A page needs `name`, `party`, `chamber`, `state`,
`n`, `buys`, `sells`, `first`, `last`.)

## Blog
Articles live in `tools/articles.mjs` (numbers from `tools/data.json`). Build with `node tools/build-blog.mjs`
(writes `/blog/`, `/congress/` URLs into `sitemap.xml`, and the blog + lawmaker sections of `llms.txt`) and `node tools/render-heroes.mjs` for the hero images.
`.htaccess` gives clean URLs and 301s from the old `.html` paths on Apache hosts such as Hostinger.

The homepage **Featured insights** cards use clean, text-free thumbnails in `assets/insights/` (so the
title only appears once, below the image). Regenerate them with `node tools/render-insights.mjs`; to
feature different posts, edit the card list in both `index.html` and `tools/render-insights.mjs`.

## Social card (Open Graph / Twitter)
`assets/og-image.jpg` (and the `.png` copy the exported FAQ / legal pages use) is the 1200x630 preview shown when any page
is shared on X, Facebook, LinkedIn, WhatsApp, Telegram or Slack. Rebuild it after `tools/data.json` changes with
`node tools/render-og.mjs` (needs Playwright + Chromium, same as the hero images). The home page's `og:title`,
`og:description` and `twitter:*` tags are in `index.html`. After changing the image bump `?v=` on the `og:image` URLs
and re-scrape at https://developers.facebook.com/tools/debug/ and https://www.linkedin.com/post-inspector/ so the old
preview is dropped from their caches.

## IndexNow (fast indexing)
`64581947aaa5a24e2a893146b50d825c.txt` at the site root is the IndexNow key; keep it deployed.
`.github/workflows/indexnow.yml` submits every `sitemap.xml` URL to IndexNow (Bing, Yandex, Seznam,
Naver) on each content push to `main`, and can be run manually (Actions → IndexNow ping → Run workflow),
so new/updated pages get crawled fast. The key must be live at `https://hillradar.com/<key>.txt` for
submissions to verify — deploy the site first, then the pings succeed. (Google doesn't use IndexNow; submit
`sitemap.xml` in Google Search Console for Google.)
