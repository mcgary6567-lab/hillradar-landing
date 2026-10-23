/**
 * Shared page shell for the generated pages (blog + lawmaker pages).
 * Keeps header, footer and <head> in ONE place so the site stays consistent.
 * Imported by build-blog.mjs and build-lawmakers.mjs.
 */
import { SITE, BRAND } from "./articles.mjs";
export { SITE, BRAND };

export const today = new Date().toISOString().slice(0, 10);
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const clip = (s, n) => { s = String(s).replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const cut = s.slice(0, n - 1); return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–]$/, "") + "…"; };
export const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-x-logo" viewBox="0 0 24 24"><path d="M4 3h4.6l4.1 5.7L17.6 3H20l-6.2 7.3L20.5 21h-4.6l-4.4-6.1L6.3 21H4l6.5-7.6z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
</svg>`;

export const header = (active) => `<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="/"><img src="/assets/logo.svg" width="46" height="46" alt="${BRAND} logo"><span class="bw"><span class="bt"><span class="b1">Hill</span><b class="b2">radar</b> <em class="ai">AI</em></span><span class="tag">Congress trades, on your radar.</span></span></a>
    <nav class="nav">
      <a class="hide" href="/#features">Features</a>
      <a class="hide" href="/#data">Data</a>
      <a class="hide" href="/#pricing">Pricing</a>
      <a href="/login">Sign in</a>
      <a class="btn gold sm" href="/signup"><span class="l">Create free account</span><span class="s">Get started</span></a>
    </nav>
  </div>
</header>`;

export const footer = () => `<div class="cookie" id="cookie" hidden><span>We use cookies for analytics and, where shown, advertising. See our <a href="/privacy/">Privacy Policy</a>.</span><button type="button" id="cookie-ok" class="btn sm">OK</button></div>
<footer class="site-footer">
  <div class="wrap">
    <a class="brand fb" href="/"><img src="/assets/logo.svg" width="40" height="40" alt="${BRAND} logo"><span class="bw"><span class="bt"><span class="b1">Hill</span><b class="b2">radar</b> <em class="ai">AI</em></span><span class="tag">Congress trades, on your radar.</span></span></a>
    <div class="social" aria-label="Follow ${BRAND}">
      <a data-social="x" href="https://x.com/hillradarai" target="_blank" rel="noopener me" aria-label="${BRAND} on X (Twitter)" title="X / Twitter"><svg class="i" viewBox="0 0 24 24"><use href="#i-x-logo"/></svg></a>
    </div>
    <span>© <span data-year>${today.slice(0, 4)}</span> <span data-company>${BRAND}</span></span>
    <nav>
      <a href="/congress/">Lawmakers</a><a href="/blog/">Blog</a><a href="/press/">Press</a><a href="/faq/">Help &amp; FAQ</a><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/disclaimer/">Disclaimer</a><a href="/contact/">Contact</a><a data-mail href="mailto:info@hillradar.com">info@hillradar.com</a>
    </nav>
  </div>
</footer>
${ICONS}
<script src="/config.js?v=8"></script>
<script src="/app.js?v=8" defer></script>`;

export const head = ({ title, desc, url, image, ld, type = "article" }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="${BRAND}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#0a0f1c">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=8">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body>`;
