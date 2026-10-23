/**
 * Renders clean, text-free thumbnail images for the homepage "Featured insights" cards,
 * so the card image is decorative (like a magazine thumbnail) and the title sits below it —
 * instead of reusing the blog hero images, which bake the article title into the picture.
 * Writes assets/insights/<slug>.jpg (1200x630). Needs Chromium via Playwright.
 *   node tools/render-insights.mjs [playwright-module-path]
 */
import fs from "node:fs";
import path from "node:path";

const pw = await import(process.argv[2] || "playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const logo = fs.readFileSync(path.join(root, "assets", "logo.svg"), "utf8").replace("<svg ", '<svg width="40" height="40" ');

const GOLD = "#e7b23c", BUY = "#22c58b", SELL = "#f26a6a", INK = "#e7ecf5", MUTE = "#8a96ad";

// --- text-free motifs, ~440px wide, centred ---
const shield = `<svg viewBox="0 0 220 220" width="300" height="300" fill="none">
  <path d="M110 18 l74 30 v52 c0 48-32 84-74 94 -42-10-74-46-74-94 V48z" fill="rgba(231,178,60,.12)" stroke="${GOLD}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M78 110 l22 22 42-46" stroke="${GOLD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const bars = (() => {
  const vals = [40, 70, 55, 95, 120, 150], W = 360, H = 240, bw = 42, gap = 16, base = H;
  let s = `<svg viewBox="0 0 ${W} ${H + 10}" width="420" height="300">`;
  vals.forEach((v, i) => { const x = i * (bw + gap) + 10; const c = i === vals.length - 1 ? BUY : GOLD; s += `<rect x="${x}" y="${base - v}" width="${bw}" height="${v}" rx="6" fill="${c}" opacity="${0.55 + i * 0.07}"/>`; });
  return s + `</svg>`;
})();

const candles = (() => {
  // decorative candlesticks (green up / red down), no labels
  const data = [[70, 30, "up"], [55, 40, "down"], [90, 46, "up"], [60, 34, "down"], [110, 54, "up"], [80, 30, "up"]];
  const W = 380, H = 240, cw = 30, gap = 30; let s = `<svg viewBox="0 0 ${W} ${H}" width="430" height="280">`;
  data.forEach(([top, h, dir], i) => { const x = i * (cw + gap) + 24; const c = dir === "up" ? BUY : SELL; const wick = 26; s += `<line x1="${x + cw / 2}" x2="${x + cw / 2}" y1="${top - wick}" y2="${top + h + wick}" stroke="${c}" stroke-width="4"/><rect x="${x}" y="${top}" width="${cw}" height="${h}" rx="4" fill="${c}"/>`; });
  return s + `</svg>`;
})();

const radar = `<svg viewBox="0 0 240 240" width="300" height="300" fill="none">
  <circle cx="120" cy="120" r="30" stroke="${GOLD}" stroke-width="3" opacity=".5"/>
  <circle cx="120" cy="120" r="62" stroke="${GOLD}" stroke-width="3" opacity=".35"/>
  <circle cx="120" cy="120" r="94" stroke="${GOLD}" stroke-width="3" opacity=".22"/>
  <path d="M120 120 L120 26 A94 94 0 0 1 206 96 Z" fill="${GOLD}" opacity=".16"/>
  <line x1="120" y1="120" x2="120" y2="26" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="176" cy="70" r="9" fill="${BUY}"/>
  <circle cx="176" cy="70" r="16" fill="none" stroke="${BUY}" stroke-width="2" opacity=".5"/>
</svg>`;

const cards = [
  { slug: "what-is-the-stock-act", label: "Guide", motif: shield },
  { slug: "congress-stock-trades-by-the-numbers", label: "Data story", motif: bars },
  { slug: "most-traded-stocks-by-members-of-congress", label: "Data story", motif: candles },
  { slug: "how-the-stock-act-affects-investors", label: "Explainer", motif: radar },
];

const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.join(root, "assets", "insights"), { recursive: true });

for (const c of cards) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{margin:0;width:1200px;height:630px;overflow:hidden;position:relative;font-family:Inter,system-ui,sans-serif;
      background:radial-gradient(760px 480px at 78% -12%,rgba(231,178,60,.20),transparent 60%),linear-gradient(135deg,#0b1020,#16213f 55%,#0b1020)}
    .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px;
      -webkit-mask-image:radial-gradient(ellipse at 50% 45%,#000 35%,transparent 78%)}
    .motif{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 20px 50px rgba(0,0,0,.4))}
    .chip{position:absolute;top:40px;left:44px;display:inline-flex;align-items:center;gap:9px;border:1px solid rgba(231,178,60,.45);background:rgba(231,178,60,.1);
      border-radius:999px;padding:9px 18px;font-size:19px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${GOLD}}
    .brand{position:absolute;bottom:38px;left:44px;display:flex;align-items:center;gap:12px}
    .brand .n{font-size:22px;font-weight:800;color:${INK}} .brand .n b{color:${GOLD}} .brand .n small{color:${MUTE};font-weight:600;font-size:15px;margin-left:5px}
  </style></head><body>
    <div class="grid"></div>
    <div class="motif">${c.motif}</div>
    <span class="chip">${c.label}</span>
    <div class="brand">${logo}<span class="n">Hill<b>radar</b><small>AI</small></span></div>
  </body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(root, "assets", "insights", `${c.slug}.jpg`), type: "jpeg", quality: 86 });
  console.log("insight", c.slug);
}
await b.close();
