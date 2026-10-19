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

## Blog
Articles live in `tools/articles.mjs` (numbers from `tools/data.json`). Build with `node tools/build-blog.mjs`
(writes `/blog/`, `sitemap.xml`, the blog section of `llms.txt`) and `node tools/render-heroes.mjs` for the hero images.
`.htaccess` gives clean URLs and 301s from the old `.html` paths on Apache hosts such as Hostinger.

## Social card (Open Graph / Twitter)
`assets/og-image.jpg` (and the `.png` copy the exported FAQ / legal pages use) is the 1200x630 preview shown when any page
is shared on X, Facebook, LinkedIn, WhatsApp, Telegram or Slack. Rebuild it after `tools/data.json` changes with
`node tools/render-og.mjs` (needs Playwright + Chromium, same as the hero images). The home page's `og:title`,
`og:description` and `twitter:*` tags are in `index.html`. After changing the image bump `?v=` on the `og:image` URLs
and re-scrape at https://developers.facebook.com/tools/debug/ and https://www.linkedin.com/post-inspector/ so the old
preview is dropped from their caches.
