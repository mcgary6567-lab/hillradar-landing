"""
Finds publicly listed contact emails on each firm's own website.
  python3 tools/leads/crawl_emails.py in.csv out.csv
Polite crawl: obeys robots.txt, identifies itself, at most MAX_PAGES pages per site (home + contact/about/team
links), one site at a time per worker, skips social-media "websites". Prints counts only, never emails
(the repo is public and so are its Actions logs).
"""
import asyncio, csv, re, sys, os
from urllib.parse import urljoin, urlparse
from urllib import robotparser
import aiohttp

UA = "HillRadarBot/1.0 (+https://hillradar.com; info@hillradar.com)"
MAX_PAGES = int(os.environ.get("MAX_PAGES", 5))
WORKERS = int(os.environ.get("WORKERS", 40))
TIMEOUT = aiohttp.ClientTimeout(total=20)
SOCIAL = re.compile(r"(linkedin|facebook|twitter|x\.com|youtube|instagram|google|yelp|wix\.com/|sites\.google)", re.I)
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}")
OBF = re.compile(r"([A-Za-z0-9._%+-]+)\s*[\[\(\{]\s*at\s*[\]\)\}]\s*([A-Za-z0-9-]+)\s*[\[\(\{]\s*dot\s*[\]\)\}]\s*([A-Za-z]{2,24})", re.I)
LINK = re.compile(r'href=["\']([^"\'#]+)["\']', re.I)
PAGE_HINT = re.compile(r"contact|about|team|our-?people|staff|advisors?|leadership|who-we-are", re.I)
JUNK = re.compile(r"\.(png|jpe?g|gif|svg|webp|css|js)$|example\.|sentry|wixpress|domain\.com|email\.com|yourname|"
                  r"@sentry|godaddy|squarespace|wordpress|cloudflare|u00|\d+x\.", re.I)
ROLE_FIRST = ("info", "contact", "hello", "office", "admin", "service", "clientservice")


def root(u):
    u = u.strip()
    if not u.lower().startswith("http"):
        u = "https://" + u
    p = urlparse(u)
    return f"{p.scheme.lower()}://{p.netloc.lower()}"


def bare(host):
    host = host.lower().split(":")[0]
    return host[4:] if host.startswith("www.") else host


def clean(emails, domain):
    out = []
    for e in emails:
        e = e.strip(".").lower()
        if JUNK.search(e) or len(e) > 80:
            continue
        if e not in out:
            out.append(e)
    # firm-domain emails first, personal-looking before role inboxes
    same = [e for e in out if e.split("@")[1].endswith(domain)]
    other = [e for e in out if e not in same]
    same.sort(key=lambda e: e.split("@")[0] in ROLE_FIRST)
    return same, other


async def fetch(sess, url):
    try:
        async with sess.get(url, allow_redirects=True, ssl=False) as r:
            if r.status != 200 or "html" not in r.headers.get("content-type", ""):
                return None, str(r.url)
            return (await r.text(errors="replace"))[:2_000_000], str(r.url)
    except Exception:
        return None, url


async def robots(sess, base):
    rp = robotparser.RobotFileParser()
    try:
        async with sess.get(base + "/robots.txt", ssl=False) as r:
            rp.parse((await r.text(errors="replace")).splitlines() if r.status == 200 else [])
    except Exception:
        rp.parse([])
    return rp


async def crawl_site(sess, site):
    base = root(site)
    rp = await robots(sess, base)
    if not rp.can_fetch(UA, base + "/"):
        return [], "robots"
    html, final = await fetch(sess, base + "/")
    if html is None and base.startswith("https://"):
        base = "http://" + base[8:]
        html, final = await fetch(sess, base + "/")
    if html is None:
        return [], "unreachable"
    host = bare(urlparse(final).netloc)
    found = EMAIL.findall(html) + ["@".join(m[:2]) + "." + m[2] for m in OBF.findall(html)]
    pages = []
    for href in LINK.findall(html):
        u = urljoin(final, href)
        if bare(urlparse(u).netloc) == host and PAGE_HINT.search(urlparse(u).path) and u not in pages:
            pages.append(u)
    for u in pages[: MAX_PAGES - 1]:
        if not rp.can_fetch(UA, u):
            continue
        h, _ = await fetch(sess, u)
        if h:
            found += EMAIL.findall(h) + ["@".join(m[:2]) + "." + m[2] for m in OBF.findall(h)]
    return found, host


async def main():
    src, out = sys.argv[1], sys.argv[2]
    rows = list(csv.DictReader(open(src)))
    todo = [r for r in rows if r.get("website") and not SOCIAL.search(r["website"])]
    print(f"{len(rows)} firms, {len(todo)} with a crawlable website")
    stats = {"done": 0, "with_email": 0, "robots": 0, "unreachable": 0}
    q = asyncio.Queue()
    for r in todo:
        q.put_nowait(r)

    async def worker(sess):
        while not q.empty():
            r = await q.get()
            try:
                found, host = await asyncio.wait_for(crawl_site(sess, r["website"]), 90)
            except Exception:
                found, host = [], "unreachable"
            if host in ("robots", "unreachable"):
                stats[host] += 1
                host = bare(urlparse(root(r["website"])).netloc)
            same, other = clean(found, host)
            r["email"] = same[0] if same else ""
            r["all_emails_on_site"] = "; ".join(same + other)
            stats["done"] += 1
            stats["with_email"] += bool(same)
            if stats["done"] % 500 == 0:
                print(f"  {stats['done']}/{len(todo)} crawled, {stats['with_email']} with a firm-domain email", flush=True)

    conn = aiohttp.TCPConnector(limit=WORKERS * 2, limit_per_host=2, ttl_dns_cache=300)
    async with aiohttp.ClientSession(connector=conn, timeout=TIMEOUT, headers={"User-Agent": UA}) as sess:
        await asyncio.gather(*(worker(sess) for _ in range(WORKERS)))

    for r in rows:
        r.setdefault("email", ""); r.setdefault("all_emails_on_site", "")
    rows.sort(key=lambda r: (not r["email"], -int(r.get("aum_usd") or 0)))
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader(); w.writerows(rows)
    print(f"\nDONE {stats['done']} sites crawled: {stats['with_email']} firms with a firm-domain email, "
          f"{stats['robots']} blocked by robots.txt, {stats['unreachable']} unreachable -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
