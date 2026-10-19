/**
 * Renders the site-wide social card (assets/og-image.jpg + assets/og-image.png, 1200x630) used by
 * index.html, the blog index and the exported FAQ / legal pages when they are shared on X, Facebook,
 * LinkedIn, WhatsApp, Telegram, Slack and iMessage. Numbers come from tools/data.json.
 *   node tools/render-og.mjs [playwright-module-path]
 * Needs Chromium via Playwright (set CHROMIUM=/path/to/chrome if it is not on the default path).
 */
import fs from "node:fs";
import path from "node:path";

const pw = await import(process.argv[2] || "playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "tools", "data.json"), "utf8"));
const logo = fs.readFileSync(path.join(root, "assets", "logo.svg"), "utf8").replace("<svg ", '<svg width="56" height="56" ');

const floorK = (n) => `${Math.floor(n / 1000).toLocaleString("en-US")},000+`;
const trades = floorK(data.totals.trades);          // 57,000+
const pols = `${Math.floor(data.totals.pols / 10) * 10}+`;   // 350+
const since = data.perYear[0].y;                    // 2014
const rows = data.topCompanies.slice(0, 4);         // most widely traded companies, from the real record

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}
  body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#e7ecf5;
    background:#0a0f1c;position:relative}
  .glow1{position:absolute;left:-180px;top:-220px;width:720px;height:720px;border-radius:50%;
    background:radial-gradient(closest-side,rgba(231,178,60,.22),transparent)}
  .glow2{position:absolute;right:-140px;bottom:-260px;width:760px;height:760px;border-radius:50%;
    background:radial-gradient(closest-side,rgba(78,161,255,.16),transparent)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:40px 40px;
    -webkit-mask-image:radial-gradient(ellipse at 40% 50%,#000 30%,transparent 75%)}
  .wrap{position:absolute;inset:0;padding:48px 56px 44px;display:flex;flex-direction:column}
  .top{display:flex;align-items:center;gap:14px}
  .top .bn{font-size:26px;font-weight:800;letter-spacing:-.01em;line-height:1;white-space:nowrap}
  .top .bn b{color:#e7b23c}.top .bn small{color:#8a96ad;font-weight:600;font-size:17px;margin-left:6px}
  .top .t{font-size:13px;color:#8a96ad;font-weight:500;margin-top:5px}
  .eyebrow{margin-left:auto;display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(231,178,60,.45);
    background:rgba(231,178,60,.1);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:700;
    letter-spacing:.06em;text-transform:uppercase;color:#e7b23c}
  .eyebrow i{width:8px;height:8px;border-radius:50%;background:#22c58b;box-shadow:0 0 0 4px rgba(34,197,139,.22)}
  .main{flex:1;display:flex;gap:40px;align-items:center;margin-top:10px}
  .left{flex:1;min-width:0}
  h1{font-size:58px;line-height:1.06;letter-spacing:-.03em;margin:0;font-weight:800}
  h1 em{font-style:normal;color:#e7b23c}
  .lead{font-size:22px;line-height:1.4;color:#b8c2d6;margin:18px 0 0;max-width:560px}
  .lead b{color:#e7ecf5;font-weight:700}
  .stats{display:flex;gap:28px;margin-top:26px}
  .stats div{border-left:3px solid #e7b23c;padding-left:14px}
  .stats b{display:block;font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1}
  .stats span{display:block;font-size:14px;color:#8a96ad;margin-top:6px;font-weight:500}
  .panel{width:440px;flex:none;background:linear-gradient(180deg,#141d33,#101828);border:1px solid #2a3a60;
    border-radius:20px;box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 1px rgba(231,178,60,.08);overflow:hidden;
    transform:rotate(-1.5deg)}
  .ph{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #223052;
    font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a96ad}
  .ph .live{display:inline-flex;align-items:center;gap:7px;color:#22c58b}
  .ph .live i{width:7px;height:7px;border-radius:50%;background:#22c58b;box-shadow:0 0 0 4px rgba(34,197,139,.2)}
  .row{display:flex;align-items:center;gap:14px;padding:13px 18px;border-bottom:1px solid #1b2744}
  .row:last-child{border-bottom:0}
  .tk{font-family:ui-monospace,Menlo,monospace;font-weight:800;color:#e7b23c;font-size:17px;width:62px}
  .who{flex:1;min-width:0;line-height:1.2}
  .who b{display:block;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .who small{display:block;white-space:nowrap;font-size:12px;color:#8a96ad;margin-top:3px}
  .bar{width:80px;height:6px;border-radius:999px;background:#1b2744;overflow:hidden}
  .bar i{display:block;height:100%;background:linear-gradient(90deg,#22c58b,#e7b23c)}
  .n{font-size:14px;font-weight:700;color:#e7ecf5;width:74px;text-align:right}
  .n small{display:block;font-size:11px;color:#8a96ad;font-weight:600}
  .pf{padding:12px 18px;background:rgba(231,178,60,.08);border-top:1px solid #223052;font-size:13px;color:#e7b23c;font-weight:700;display:flex;justify-content:space-between}
  .pf span:last-child{color:#8a96ad;font-weight:600}
  .bottom{display:flex;align-items:center;gap:14px;margin-top:8px}
  .cta{display:inline-flex;align-items:center;gap:10px;background:#e7b23c;color:#0a0f1c;font-weight:800;font-size:18px;
    border-radius:14px;padding:14px 22px;box-shadow:0 10px 30px rgba(231,178,60,.3)}
  .cta svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
  .fine{font-size:16px;color:#b8c2d6;font-weight:500}
  .fine b{color:#e7ecf5}
  .url{margin-left:auto;font-size:18px;font-weight:700;color:#8a96ad;letter-spacing:.01em}
  .url b{color:#e7ecf5}
</style></head><body>
<div class="glow1"></div><div class="glow2"></div><div class="grid"></div>
<div class="wrap">
  <div class="top">${logo}<div><div class="bn">Hill<b>radar</b><small>AI</small></div><div class="t">Congress trades, on your radar.</div></div>
    <span class="eyebrow"><i></i> Public records · STOCK Act</span></div>
  <div class="main">
    <div class="left">
      <h1>See what members of <em>Congress</em> are trading.</h1>
      <p class="lead">Every stock trade senators and representatives must disclose, from the <b>official filings</b>. Who bought what, when, and how late they told the public.</p>
      <div class="stats">
        <div><b>${trades}</b><span>disclosed trades</span></div>
        <div><b>${pols}</b><span>senators &amp; reps</span></div>
        <div><b>Daily</b><span>new filings added</span></div>
      </div>
    </div>
    <div class="panel">
      <div class="ph"><span>Most traded by Congress</span><span class="live"><i></i> Live record</span></div>
      ${rows.map((r) => `<div class="row"><span class="tk">${r.ticker}</span><span class="who"><b>${r.name.replace(/, Inc\.| Inc\.| Corporation| Company| & Co\./g, "").replace("The Walt Disney", "Disney")}</b><small>${r.pols} lawmakers traded it</small></span><span class="bar"><i style="width:${Math.round((r.pols / rows[0].pols) * 100)}%"></i></span><span class="n">${r.n.toLocaleString("en-US")}<small>filings</small></span></div>`).join("")}
      <div class="pf"><span>+ ${(data.totals.issuers - rows.length).toLocaleString("en-US")} more companies</span><span>since ${since}</span></div>
    </div>
  </div>
  <div class="bottom">
    <span class="cta"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg> Search free</span>
    <span class="fine"><b>No card needed</b> · instant alerts on Pro</span>
    <span class="url">hillradar<b>.com</b></span>
  </div>
</div>
</body></html>`;

const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(root, "assets", "og-image.jpg"), type: "jpeg", quality: 88 });
await p.screenshot({ path: path.join(root, "assets", "og-image.png"), type: "png" });
await b.close();
console.log("og-image", trades, pols, since);
