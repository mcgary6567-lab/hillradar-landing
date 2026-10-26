"""
Builds a lead list of small US investment advisers (RIAs) from the SEC's free, public Form ADV data.
  python3 tools/leads/sec_ria_leads.py [out.csv]
Source: SEC "Information About Registered Investment Advisers" monthly file
(https://www.sec.gov/data-research/sec-markets-data/information-about-registered-investment-advisers-exempt-reporting-advisers).
Keeps SEC-registered, US-based firms with 1-10 employees and $10M-$100M regulatory AUM, sorted by AUM.
Public data only: firm name, office address, phone, website, employees, AUM, CRD (link to adviserinfo.sec.gov).
"""
import csv, io, re, sys, urllib.request, zipfile

UA = {"User-Agent": "HillRadar research info@hillradar.com"}
PAGES = [
    "https://www.sec.gov/data-research/sec-markets-data/information-about-registered-investment-advisers-exempt-reporting-advisers",
    "https://www.sec.gov/foia-services/frequently-requested-documents/form-adv-data",
    "https://www.sec.gov/help/foiadocsinvafoiahtm.html",
]
MAX_EMP, MIN_AUM, MAX_AUM = 10, 10_000_000, 100_000_000


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def latest_zip():
    for page in PAGES:
        try:
            html = get(page).decode("utf-8", "replace")
        except Exception as e:
            print(f"page failed {page}: {e}")
            continue
        links = re.findall(r'href="([^"]+\.zip)"', html, re.I)
        # registered-adviser files (exclude exempt reporting advisers "era")
        ia = [l for l in links if re.search(r"/ia\d{6}\.zip$", l, re.I)] or [l for l in links if "era" not in l.lower()]
        print(f"{page}: {len(links)} zip links, {len(ia)} IA candidates, first: {ia[:3]}")
        if ia:
            l = ia[0]
            return l if l.startswith("http") else "https://www.sec.gov" + l
    sys.exit("no IA zip link found")


def rows_from_zip(data):
    z = zipfile.ZipFile(io.BytesIO(data))
    print("zip contents:", z.namelist())
    name = next(n for n in z.namelist() if n.lower().endswith((".csv", ".xlsx", ".txt")))
    raw = z.read(name)
    if name.lower().endswith(".xlsx"):
        import openpyxl
        ws = openpyxl.load_workbook(io.BytesIO(raw), read_only=True).active
        it = ws.iter_rows(values_only=True)
        head = [str(h or "").strip() for h in next(it)]
        return head, [dict(zip(head, ["" if v is None else str(v) for v in r])) for r in it]
    text = raw.decode("latin-1")
    rd = csv.DictReader(io.StringIO(text), delimiter="|" if text.count("|") > text.count(",") else ",")
    return [h.strip() for h in rd.fieldnames], list(rd)


def col(head, *pats):
    for p in pats:
        for h in head:
            if re.search(p, h, re.I):
                return h
    return None


def num(v):
    v = re.sub(r"[^\d.]", "", str(v or ""))
    try:
        return float(v) if v else None
    except ValueError:
        return None


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "sec_ria_leads.csv"
    url = latest_zip()
    print("downloading", url)
    head, rows = rows_from_zip(get(url))
    print(f"{len(rows)} rows; {len(head)} columns")
    print("columns sample:", head[:40])
    c = {
        "crd": col(head, r"^Organization CRD", r"CRD"),
        "name": col(head, r"^Primary Business Name", r"Business Name"),
        "legal": col(head, r"^Legal Name"),
        "street": col(head, r"Main Office Street Address 1", r"Street"),
        "city": col(head, r"Main Office City", r"City"),
        "state": col(head, r"Main Office State", r"State"),
        "zip": col(head, r"Main Office Postal Code", r"Postal|Zip"),
        "country": col(head, r"Main Office Country", r"Country"),
        "phone": col(head, r"Main Office Telephone", r"Telephone|Phone"),
        "web": col(head, r"Website Address", r"Website|Web"),
        "emp": col(head, r"^5A\b", r"Total Number of Employees", r"Employees"),
        "aum": col(head, r"^5F\(2\)\(c\)", r"5F2c", r"Total Regulatory|Assets Under Management|AUM"),
        "status": col(head, r"SEC Current Status", r"Status"),
    }
    print("column map:", c)
    missing = [k for k in ("name", "state", "emp", "aum") if not c[k]]
    if missing:
        sys.exit(f"missing columns {missing}")

    g = lambda r, k: (r.get(c[k]) or "").strip() if c[k] else ""
    keep = []
    for r in rows:
        if c["country"] and g(r, "country") and not re.match(r"united states|^us$|^usa$", g(r, "country"), re.I):
            continue
        if c["status"] and g(r, "status") and not re.match(r"approved", g(r, "status"), re.I):
            continue
        emp, aum = num(g(r, "emp")), num(g(r, "aum"))
        if emp is None or not (1 <= emp <= MAX_EMP) or aum is None or aum < MIN_AUM or aum > MAX_AUM:
            continue
        if not g(r, "state"):  # no US state = foreign office with a blank country field
            continue
        web = g(r, "web")
        if web and not web.lower().startswith("http"):
            web = "https://" + web.lstrip("/")
        crd = re.sub(r"\D", "", g(r, "crd"))
        keep.append({
            "firm": g(r, "name") or g(r, "legal"), "city": g(r, "city").title(), "state": g(r, "state"),
            "zip": g(r, "zip"), "address": g(r, "street").title(), "phone": g(r, "phone"), "website": web,
            "employees": int(emp), "aum_usd": int(aum), "crd": crd,
            "sec_profile": f"https://adviserinfo.sec.gov/firm/summary/{crd}" if crd else "",
        })
    keep.sort(key=lambda x: -x["aum_usd"])
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(keep[0].keys()) if keep else ["firm"])
        w.writeheader(); w.writerows(keep)
    with_web = sum(1 for k in keep if k["website"])
    print(f"\nKEPT {len(keep)} small US RIAs (1-{MAX_EMP} employees, AUM ${MIN_AUM:,}-${MAX_AUM:,}); {with_web} with a website -> {out}")
    for k in keep[:10]:
        print(f"  {k['firm'][:40]:40} {k['city']}, {k['state']}  emp={k['employees']}  aum=${k['aum_usd']:,}  {k['website']}")


if __name__ == "__main__":
    main()
