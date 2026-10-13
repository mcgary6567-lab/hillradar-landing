/**
 * Renders a 1200x630 hero/OG image per article (assets/blog/<slug>.jpg) from the article's first chart,
 * on the brand background. Needs Chromium via Playwright.
 *   node tools/render-heroes.mjs [playwright-module-path]
 */
import fs from "node:fs";
import path from "node:path";
import { articles, BRAND } from "./articles.mjs";
const pw = await import(process.argv[2] || "playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const logo = fs.readFileSync(path.join(root, "assets", "logo.svg"), "utf8").replace("<svg ", '<svg width="64" height="64" ');
fs.mkdirSync(path.join(root, "assets", "blog"), { recursive: true });
const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const a of articles) {
  const body = a.body(a);
  const svg = (body.match(/<svg[\s\S]*?<\/svg>/) || [""])[0].replace("<svg ", '<svg style="width:100%;height:100%" ');
  await p.setContent(`<html><head><style>
    body{margin:0;width:1200px;height:630px;background:radial-gradient(900px 500px at 85% -10%,rgba(231,178,60,.16),transparent 60%),linear-gradient(135deg,#0b1020,#16213f 60%,#0b1020);font-family:Inter,system-ui,sans-serif;color:#e7ecf5;display:flex;flex-direction:column;padding:44px 56px;box-sizing:border-box}
    .top{display:flex;align-items:center;gap:14px}.top .n{font-size:24px;font-weight:800}.top .n b{color:#e7b23c}.top .n small{color:#8a96ad;font-weight:600;font-size:16px;margin-left:6px}
    .cat{margin-left:auto;border:1px solid rgba(231,178,60,.45);background:rgba(231,178,60,.1);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:700;color:#e7b23c;letter-spacing:.05em;text-transform:uppercase}
    h1{font-size:${a.title.length > 70 ? 36 : 42}px;line-height:1.12;margin:22px 0 0;letter-spacing:-.02em;max-width:1080px}
    .chart{flex:1;margin-top:18px;background:rgba(18,26,46,.8);border:1px solid #223052;border-radius:18px;padding:16px 20px;min-height:0;display:flex}
    .chart svg{max-height:100%}.foot{margin-top:12px;font-size:14px;color:#8a96ad;display:flex;justify-content:space-between}
  </style></head><body>
    <div class="top">${logo}<span class="n">Hill<b>radar</b><small>AI</small></span><span class="cat">${a.category}</span></div>
    <h1>${a.title}</h1>
    <div class="chart">${svg || ""}</div>
    <div class="foot"><span>hillradar.com/blog · data as of ${a.asOf}</span><span>Source: official STOCK Act filings</span></div>
  </body></html>`);
  await p.screenshot({ path: path.join(root, "assets", "blog", `${a.slug}.jpg`), type: "jpeg", quality: 82 });
  console.log("hero", a.slug);
}
await b.close();
