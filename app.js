/* ------------------------------------------------------------------
   Landing page script.
   Pulls live numbers + latest filings from the app's public endpoint
   and fills the placeholders. If the API is unreachable the static
   fallback text in the HTML simply stays.

   Hosting on its own domain: edit config.js (APP_URL / API_URL).
   Nothing else needs to change.
------------------------------------------------------------------- */
(function () {
  "use strict";

  var CFG = window.LANDING_CONFIG || {};
  var APP_URL = (CFG.APP_URL || "").replace(/\/$/, "");   // "" = same origin as this page
  var API_BASE = (CFG.API_URL || APP_URL).replace(/\/$/, "");
  var ENDPOINT = API_BASE + "/api/public/landing";

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(n) { return Number(n || 0).toLocaleString("en-US"); }
  function party(p) { return !p ? "i" : /^Rep/.test(p) ? "r" : /^Dem/.test(p) ? "d" : "i"; }
  function money(a, b) {
    function f(n) { return n >= 1e6 ? "$" + (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + "M" : n >= 1e3 ? "$" + Math.round(n / 1e3) + "K" : "$" + n; }
    if (a == null && b == null) return "—";
    if (a != null && b != null && a !== b) return f(a) + "–" + f(b);
    return f(a != null ? a : b);
  }
  function ago(d) {
    if (!d) return "";
    var days = Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
    return days <= 0 ? "today" : days === 1 ? "yesterday" : days < 30 ? days + " days ago" : d;
  }
  function setAll(attr, value, text) {
    $$("[" + attr + (value ? '="' + value + '"' : "") + "]").forEach(function (el) { el.textContent = text; });
  }

  // ---------- render ----------
  function renderBrand(d) {
    if (!d.brand) return;
    var short = d.brand.replace(/\s*AI$/i, "");
    $$(".brand .bt").forEach(function (bt) {
      var b1 = $(".b1", bt), b2 = $(".b2", bt), ai = $(".ai", bt);
      if (b1 && b2 && short.length > 6) { b1.textContent = short.slice(0, 4); b2.textContent = short.slice(4); }
      if (ai) ai.style.display = /\sAI$/i.test(d.brand) ? "" : "none";
    });
    setAll("data-brand", null, d.brand);
    setAll("data-brand-short", null, short);
    setAll("data-company", null, d.company || d.brand);
    if (d.contact) { $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + d.contact; a.textContent = d.contact; }); }
    document.title = d.brand + " — Congress stock trade tracker · public STOCK Act disclosures";
  }

  function renderStats(s) {
    if (!s) return;
    setAll("data-stat", "trades", num(s.trades));
    setAll("data-stat", "politicians", num(s.politicians));
    setAll("data-stat", "issuers", num(s.issuers));
    setAll("data-stat", "since", String(s.first_date || "2014").slice(0, 4));
    setAll("data-stat", "last", ago(s.last_pub) || "daily");
  }

  function renderLatest(rows) {
    var box = $("#latest"); if (!box || !rows || !rows.length) return;
    box.innerHTML = rows.map(function (t) {
      return '<div class="row">' +
        '<span class="pill ' + esc(t.tx_type) + '">' + esc(String(t.tx_type).toUpperCase()) + '</span>' +
        '<div class="who"><b><span class="tk">' + esc(t.ticker) + '</span> · ' + esc(t.issuer) + '</b>' +
        '<small><span class="dot ' + party(t.party) + '"></span>' + esc(t.politician) + (t.chamber ? ' · ' + esc(t.chamber) : '') + (t.state ? ' · ' + esc(t.state) : '') + '</small></div>' +
        '<div class="amt">' + money(t.amount_min, t.amount_max) + '<small>filed ' + esc(ago(t.published_date)) + '</small></div>' +
        '</div>';
    }).join("");
  }

  function renderActive(rows) {
    var ul = $("#active"); if (!ul || !rows || !rows.length) return;
    ul.innerHTML = rows.map(function (p) {
      return '<li><span><span class="dot ' + party(p.party) + '"></span>' + esc(p.name) +
        ' <small>' + esc(p.chamber || "") + (p.state ? " · " + esc(p.state) : "") + '</small></span><span>' + num(p.n) + ' filings</span></li>';
    }).join("");
  }

  function renderPopular(rows) {
    var ul = $("#popular"); if (!ul || !rows || !rows.length) return;
    ul.innerHTML = rows.map(function (i) {
      var logo = i.ticker ? '<img class="clogo" src="https://assets.parqet.com/logos/symbol/' + encodeURIComponent(String(i.ticker).toUpperCase()) + '?format=png" alt="" width="22" height="22" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '';
      return '<li><span>' + logo + '<span class="tk">' + esc(i.ticker) + '</span> ' + esc(i.name) + '</span><span>' + num(i.pols) + ' lawmakers</span></li>';
    }).join("");
  }

  function clearSkeletons() { $$(".skeleton").forEach(function (el) { el.classList.remove("skeleton"); el.style.display = "none"; }); }

  // ---------- load ----------
  function load() {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 8000);
    fetch(ENDPOINT, { signal: ctrl && ctrl.signal, headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        renderBrand(d); renderStats(d.stats); renderLatest(d.latest); renderActive(d.active); renderPopular(d.popular);
      })
      .catch(function () { /* keep static fallback copy */ })
      .then(function () { if (timer) clearTimeout(timer); clearSkeletons(); });
  }

  // social links from config.js (hide a button when its URL is empty)
  $$("[data-social]").forEach(function (a) {
    var key = "SOCIAL_" + a.getAttribute("data-social").toUpperCase(), url = CFG[key];
    if (url === "") a.style.display = "none"; else if (url) a.href = url;
  });

  // mobile sticky CTA: appears after the hero scrolls out, hidden again near the final CTA
  var sticky = $("#sticky-cta");
  if (sticky) {
    document.body.classList.add("has-sticky");
    var hero = $(".hero"), fin = $(".final"), lastShow = false;
    var onScroll = function () {
      var heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 500;
      var finVisible = fin ? fin.getBoundingClientRect().top < window.innerHeight : false;
      var show = heroGone && !finVisible && window.matchMedia("(max-width: 700px)").matches;
      if (show !== lastShow) { sticky.classList.toggle("show", show); sticky.setAttribute("aria-hidden", show ? "false" : "true"); lastShow = show; }
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  // ---- Google tag (GA4 + Google Ads) with Consent Mode v2: denied by default, granted on cookie OK ----
  var TAG_IDS = [CFG.GA4_ID, CFG.GOOGLE_ADS_ID].filter(Boolean);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var consented = false; try { consented = localStorage.getItem("hr_cookie_ok") === "1"; } catch (e) {}
  if (TAG_IDS.length) {
    gtag("consent", "default", { ad_storage: consented ? "granted" : "denied", ad_user_data: consented ? "granted" : "denied", ad_personalization: consented ? "granted" : "denied", analytics_storage: consented ? "granted" : "denied", wait_for_update: 500 });
    var gs = document.createElement("script"); gs.async = true; gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(TAG_IDS[0]); document.head.appendChild(gs);
    gtag("js", new Date());
    TAG_IDS.forEach(function (id) { gtag("config", id, { anonymize_ip: true }); });
    // sign-up click = the conversion we can see on this domain (the account itself is created on the app domain)
    $$('a[href*="/signup"]').forEach(function (a) {
      a.addEventListener("click", function () {
        gtag("event", "sign_up_click", { event_category: "conversion", page: location.pathname });
        if (CFG.GOOGLE_ADS_ID && CFG.GOOGLE_ADS_SIGNUP_LABEL) gtag("event", "conversion", { send_to: CFG.GOOGLE_ADS_ID + "/" + CFG.GOOGLE_ADS_SIGNUP_LABEL });
      });
    });
  }
  // cookie notice (once per browser); OK grants consent for the tags above
  var ck = $("#cookie");
  if (ck) {
    if (!consented) { ck.hidden = false; $("#cookie-ok").addEventListener("click", function () { ck.hidden = true; try { localStorage.setItem("hr_cookie_ok", "1"); } catch (e) {}
      if (TAG_IDS.length) gtag("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }); }); }
  }

  // footer year
  setAll("data-year", null, String(new Date().getFullYear()));

  // only links into the app (/signup, /login, /settings, /trades …) point at APP_URL; everything else
  // (/faq/, /blog/, /terms/ …) stays on this site. ?plan=pro + UTM params carry through to sign-up / sign-in.
  var APP_ROUTES = /^\/(signup|login|settings|trades|politicians|issuers|insights|signals|invest|admin)(\/|$|\?)/;
  var qs = new URLSearchParams(window.location.search);
  $$('a[href^="/"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (!APP_ROUTES.test(href)) return;
    var url = new URL(href, APP_URL || window.location.origin);
    if (/^\/(signup|login)/.test(url.pathname)) qs.forEach(function (v, k) { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
    a.setAttribute("href", APP_URL ? url.href : url.pathname + url.search);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load); else load();
})();
