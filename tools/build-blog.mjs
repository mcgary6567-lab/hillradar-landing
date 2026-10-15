/**
 * Builds the blog: /blog/index.html, /blog/<slug>/index.html, hero images, sitemap.xml and the blog part of llms.txt.
 *   node tools/build-blog.mjs            (run from the repo root)
 * Articles live in tools/articles.mjs; the numbers they cite come from tools/data.json (exported from the app database).
 */
import fs from "node:fs";
import path from "node:path";
import { articles, SITE, BRAND } from "./articles.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const words = (html) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const clip = (s, n) => { s = String(s).replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const cut = s.slice(0, n - 1); return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–]$/, "") + "…"; };
const seoTitle = (a) => { const full = `${a.title} | ${BRAND}`; return full.length <= 62 ? full : `${a.short} | ${BRAND}`; };
const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-x-logo" viewBox="0 0 24 24"><path d="M4 3h4.6l4.1 5.7L17.6 3H20l-6.2 7.3L20.5 21h-4.6l-4.4-6.1L6.3 21H4l6.5-7.6z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
</svg>`;

const header = (active) => `<header class="site-header">
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

const footer = () => `<div class="cookie" id="cookie" hidden><span>We use cookies for analytics and, where shown, advertising. See our <a href="/privacy/">Privacy Policy</a>.</span><button type="button" id="cookie-ok" class="btn sm">OK</button></div>
<footer class="site-footer">
  <div class="wrap">
    <a class="brand fb" href="/"><img src="/assets/logo.svg" width="40" height="40" alt="${BRAND} logo"><span class="bw"><span class="bt"><span class="b1">Hill</span><b class="b2">radar</b> <em class="ai">AI</em></span><span class="tag">Congress trades, on your radar.</span></span></a>
    <div class="social" aria-label="Follow ${BRAND}">
      <a data-social="x" href="https://x.com/hillradarai" target="_blank" rel="noopener me" aria-label="${BRAND} on X (Twitter)" title="X / Twitter"><svg class="i" viewBox="0 0 24 24"><use href="#i-x-logo"/></svg></a>
    </div>
    <span>© <span data-year>${today.slice(0, 4)}</span> <span data-company>${BRAND}</span></span>
    <nav>
      <a href="/blog/">Blog</a><a href="/faq/">Help &amp; FAQ</a><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/disclaimer/">Disclaimer</a><a href="/contact/">Contact</a><a data-mail href="mailto:info@hillradar.com">info@hillradar.com</a>
    </nav>
  </div>
</footer>
${ICONS}
<script src="/config.js?v=3"></script>
<script src="/app.js?v=3" defer></script>`;

const head = ({ title, desc, url, image, ld, type = "article" }) => `<!doctype html>
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
<link rel="stylesheet" href="/styles.css?v=3">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body>`;

// ---------- article pages ----------
const toc = (body) => {
  const h2s = [...body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)];
  return h2s.length ? `<nav class="toc" aria-label="On this page"><b>On this page</b><ol>${h2s.map((m) => `<li><a href="#${m[1]}">${m[2]}</a></li>`).join("")}</ol></nav>` : "";
};
const related = (a) => articles.filter((x) => x.slug !== a.slug && (x.tags.some((t) => a.tags.includes(t)))).slice(0, 3);

for (const a of articles) {
  const url = `${SITE}/blog/${a.slug}/`;
  const image = `${SITE}/assets/blog/${a.slug}.jpg`;
  const body = a.body(a);
  const wc = words(body);
  const mins = Math.max(3, Math.round(wc / 220));
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "BlogPosting", "@id": `${url}#post`, headline: a.title, description: a.desc, image: [image], datePublished: a.date, dateModified: a.updated ?? a.date, wordCount: wc,
      author: { "@type": "Organization", name: BRAND, url: SITE + "/" }, publisher: { "@id": `${SITE}/#org` }, mainEntityOfPage: { "@type": "WebPage", "@id": url }, keywords: a.tags.join(", "), articleSection: "Congress stock trades", inLanguage: "en-US", isAccessibleForFree: true },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` }, { "@type": "ListItem", position: 3, name: a.title, item: url }] },
    ...(a.faq?.length ? [{ "@type": "FAQPage", mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans.replace(/<[^>]+>/g, "") } })) }] : []),
  ] };
  const rel = related(a);
  const html = `${head({ title: seoTitle(a), desc: clip(a.desc, 155), url, image, ld })}
${header("blog")}
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>${esc(a.short ?? a.title)}</span></nav>
  <article>
    <header class="ahead">
      <span class="eyebrow">${esc(a.category)}</span>
      <h1>${esc(a.title)}</h1>
      <p class="lead">${a.intro}</p>
      <div class="meta"><span><svg class="i" viewBox="0 0 24 24"><use href="#i-cal"/></svg> ${fmtDate(a.date)}</span><span><svg class="i" viewBox="0 0 24 24"><use href="#i-clock"/></svg> ${mins} min read</span><span><svg class="i" viewBox="0 0 24 24"><use href="#i-user"/></svg> ${BRAND} research</span><span>Data as of ${fmtDate(a.asOf)}</span></div>
    </header>
    <figure class="hero-img"><img src="/assets/blog/${a.slug}.jpg" width="1200" height="630" alt="${esc(a.heroAlt)}" fetchpriority="high"></figure>
    ${toc(body)}
    <div class="prose">${body}</div>
    ${a.faq?.length ? `<section class="afaq"><h2 id="faq">Frequently asked questions</h2>${a.faq.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${ans}</p></details>`).join("")}</section>` : ""}
    <aside class="cta-box"><div><b>See the record for yourself</b><p>Every disclosed congressional trade since 2014, searchable and free. Follow a lawmaker or a company and get told when a new filing lands.</p></div><div class="btns"><a class="btn gold" href="/signup">Create a free account</a><a class="btn" href="/">How it works</a></div></aside>
    <p class="disc-inline">${BRAND} republishes public STOCK Act disclosures for research and education. Figures come from the official filings as collected in our database on the date shown; filings can be amended by the filer. Nothing here is investment advice.</p>
  </article>
  ${rel.length ? `<section class="related"><h2>Related reading</h2><div class="grid3">${rel.map((r) => card(r)).join("")}</div></section>` : ""}
</main>
${footer()}
</body></html>`;
  fs.mkdirSync(path.join(root, "blog", a.slug), { recursive: true });
  fs.writeFileSync(path.join(root, "blog", a.slug, "index.html"), html);
  console.log(`blog/${a.slug}/ (${wc} words)`);
}

function card(a) {
  return `<a class="post" href="/blog/${a.slug}/"><img src="/assets/blog/${a.slug}.jpg" width="600" height="315" alt="${esc(a.heroAlt)}" loading="lazy"><div class="pb"><span class="pc">${esc(a.category)}</span><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p><small>${fmtDate(a.date)} · ${Math.max(3, Math.round(words(a.body(a)) / 220))} min read</small></div></a>`;
}

// ---------- blog index ----------
{
  const url = `${SITE}/blog/`;
  const sorted = [...articles].sort((x, y) => (x.date < y.date ? 1 : -1));
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": `${url}#page`, url, name: `Blog | ${BRAND}`, description: "Guides and data stories about congressional stock trading and STOCK Act disclosures.", isPartOf: { "@id": `${SITE}/#website` }, inLanguage: "en-US" },
    { "@type": "Blog", "@id": `${url}#blog`, url, name: `${BRAND} Blog`, publisher: { "@id": `${SITE}/#org` }, blogPost: sorted.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: `${SITE}/blog/${a.slug}/`, datePublished: a.date, image: `${SITE}/assets/blog/${a.slug}.jpg` })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Blog", item: url }] },
  ] };
  const html = `${head({ title: `Congress Stock Trading Blog: Guides & Data | ${BRAND}`, desc: "Guides and data stories on STOCK Act disclosures: how to read filings, who trades most, which stocks Congress holds, late filings and alerts.", url, image: `${SITE}/assets/og-image.jpg`, ld, type: "website" })}
${header("blog")}
<main class="wrap">
  <section class="bhero">
    <span class="eyebrow">Blog</span>
    <h1>Congress stock trades, explained with data</h1>
    <p class="sub">Guides and data stories built from the official STOCK Act filings in our database: ${articles.length} articles, updated as the record grows.</p>
  </section>
  <section class="posts"><div class="grid3">${sorted.map((a) => card(a)).join("")}</div></section>
  <section><div class="final"><h2>Start reading the record today</h2><p class="sub center">Free account, no card, 30 seconds.</p><div class="ctas center"><a class="btn gold" href="/signup">Create a free account</a><a class="btn" href="/">How it works</a></div></div></section>
</main>
${footer()}
</body></html>`;
  fs.mkdirSync(path.join(root, "blog"), { recursive: true });
  fs.writeFileSync(path.join(root, "blog", "index.html"), html);
  console.log("blog/ index");
}

// ---------- sitemap + llms ----------
{
  const pages = [["", "1.0", "weekly"], ["blog/", "0.9", "weekly"], ...articles.map((a) => [`blog/${a.slug}/`, "0.8", "monthly"]), ["faq/", "0.8", "monthly"], ["contact/", "0.5", "yearly"], ["disclaimer/", "0.4", "yearly"], ["terms/", "0.3", "yearly"], ["privacy/", "0.3", "yearly"]];
  fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    pages.map(([u, pr, cf]) => { const a = articles.find((x) => `blog/${x.slug}/` === u); return `  <url><loc>${SITE}/${u}</loc><lastmod>${a?.updated ?? a?.date ?? today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority>${a ? `<image:image><image:loc>${SITE}/assets/blog/${a.slug}.jpg</image:loc><image:title>${esc(a.title)}</image:title></image:image>` : ""}</url>`; }).join("\n") + "\n</urlset>\n");
  const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8").split("\n## Blog")[0].trimEnd();
  fs.writeFileSync(path.join(root, "llms.txt"), llms + "\n\n## Blog\n" + articles.map((a) => `- [${a.title}](${SITE}/blog/${a.slug}/): ${a.desc}`).join("\n") + "\n");
  console.log("sitemap.xml + llms.txt");
}
