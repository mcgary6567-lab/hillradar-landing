// Additional sections appended to each article (keeps articles.mjs readable). Keyed by slug.
import fs from "node:fs";
import path from "node:path";
const D = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "data.json"), "utf8"));
const n = (x) => Number(x).toLocaleString("en-US");
const pct = (a, b, d = 1) => ((a / b) * 100).toFixed(d) + "%";
const T = D.totals;
const house = D.byChamber.find((c) => c.chamber === "House"), senate = D.byChamber.find((c) => c.chamber === "Senate");
const y = (yy) => D.perYear.find((p) => p.y === String(yy));
const tk = (t) => D.topCompanies.find((c) => c.ticker === t);
const lm = (s) => D.topLawmakers.find((p) => p.name.includes(s));

export const extras = {
  "what-is-the-stock-act": `
<h2 id="history">How the rules evolved after 2012</h2>
<p>The STOCK Act did not arrive fully formed. The original 2012 text required filings to be posted in a searchable, sortable online database. In 2013 Congress quietly repealed that requirement for most staff and kept only the members' obligation, which is why the official sites remain PDF archives rather than databases. Later reforms were mostly procedural: the Senate moved to its electronic eFD system, the House added a machine-readable index, and ethics committees issued guidance on managed accounts and notification dates. Each of these changes shows up in the data as a step change in filing speed, which is one reason comparing years before 2015 with recent years is tricky.</p>
<p>Enforcement has stayed light. The $200 late fee has not been indexed to inflation, there is no public register of fines, and several members have acknowledged filing dozens of transactions months late with no consequence beyond press coverage. That gap between the law's ambition and its teeth is the main argument behind the recurring proposals to ban individual stock ownership by members outright, none of which had passed by the date of this data.</p>
<h2 id="numbers">The record in numbers</h2>
<p>Twelve years of STOCK Act filings now add up to <strong>${n(T.trades)} transactions</strong> by ${T.pols} members, covering ${n(T.issuers)} distinct companies and assets. The busiest single year was ${y(2025).y} with ${n(y(2025).n)} transactions; the quietest full year was ${y(2024).y} with ${n(y(2024).n)}. The House contributes ${pct(house.n, T.trades, 0)} of the record. Roughly ${pct(D.noTicker.n, T.trades, 0)} of transactions involve bonds, funds, options or other assets without a stock ticker, which many trackers silently drop; ${"Hillradar AI"} keeps them and lets you toggle them on.</p>
<h2 id="why-it-matters">Why the disclosures matter even with their limits</h2>
<p>Three audiences use this record for different reasons. <strong>Voters and journalists</strong> use it to check whether a lawmaker's financial interests overlap with their committee work, which is the Act's original purpose. <strong>Researchers</strong> use it as a rare, long-running data set on how a well-informed group of people actually trades, with the finding that, taken as a whole, Congress does not beat the market. <strong>Investors</strong> use it as one more public signal, with the understanding that every trade they see is weeks old and stripped of its reasons. In all three cases the value comes from the same thing: the record is official, complete for its scope, and free.</p>`,

  "how-to-read-a-periodic-transaction-report": `
<h2 id="example-walkthrough">A worked example, line by line</h2>
<p>Take a representative filing: <em>SP · NVIDIA Corporation (NVDA) · P · 09/02/2026 · 09/15/2026 · $15,001–$50,000</em>, filed 09/30/2026. Reading left to right: the <strong>spouse's</strong> account bought NVIDIA on 2 September; the member says they were told on 15 September; the amount is somewhere between $15,001 and $50,000; the public saw it on 30 September, 28 days after the trade and inside the 45-day limit. What you do not know: the price paid, the number of shares, whether an adviser made the call, or whether the household already held NVIDIA. A tracker that shows "Rep. X bought $50,000 of NVIDIA" has overstated the filing twice, once on the amount and once on who decided.</p>
<h2 id="annual">PTRs versus the annual financial disclosure</h2>
<p>Periodic Transaction Reports are only half of the picture. Every member also files an <strong>annual financial disclosure</strong> each May covering the previous calendar year: assets held (again in ranges), income, liabilities, positions and gifts. The annual report tells you <em>what a member owns</em>; the PTR tells you <em>what changed and when</em>. Serious research uses both: a PTR showing a $250,001–$500,000 sale means something different for a member whose annual report shows a $5 million portfolio than for one whose total holdings are under $100,000. Trackers such as this one are built on PTRs because they are timely; for holdings, the annual reports on the Clerk and Senate sites remain the source.</p>
<h2 id="data-quality">Where parsing goes wrong</h2>
<p>Most errors in any congressional trade database come from three places. <strong>Scanned filings</strong>, common in older House years, need optical character recognition and sometimes misread tickers or dates. <strong>Non-standard asset names</strong>, such as a company written without its ticker, must be matched by name and can be mis-matched. <strong>Amendments</strong> add a second record for the same trade unless de-duplicated. In our database of ${n(T.trades)} rows, every record keeps a link back to its filing so a reader can check the original, and amendments are merged by lawmaker, asset, date and amount. If you spot an error, the Contact page explains how to report it; corrections are reviewed within a business day.</p>`,

  "congress-stock-trades-by-the-numbers": `
<h2 id="two-years">The last two years, month by month</h2>
<p>Zooming in on filing dates rather than trade dates shows how uneven publication is. The busiest month in the last two years saw ${n(Math.max(...D.monthly24.map((m) => m.n)))} filings and the quietest full month ${n(Math.min(...D.monthly24.slice(1, -1).map((m) => m.n)))}, a ${(Math.max(...D.monthly24.map((m) => m.n)) / Math.min(...D.monthly24.slice(1, -1).map((m) => m.n))).toFixed(0)}× swing. Spikes line up with the ends of calendar quarters, when managed accounts rebalance and brokerage statements arrive, and with the May annual-report season, when members catch up on transactions they had missed. If you watch filings in real time, expect bursts rather than a steady stream, which is why alerts are more practical than refreshing the official sites.</p>
<h2 id="who-drives">Who drives the totals</h2>
<p>The ${T.pols} lawmakers in the record are not equal contributors. The three most active, ${lm("MacArthur").name} (${n(lm("MacArthur").n)}), ${lm("Gottheimer").name} (${n(lm("Gottheimer").n)}) and ${lm("Cisneros").name} (${n(lm("Cisneros").n)}), together filed ${n(lm("MacArthur").n + lm("Gottheimer").n + lm("Cisneros").n)} transactions, about ${pct(lm("MacArthur").n + lm("Gottheimer").n + lm("Cisneros").n, T.trades, 0)} of everything. Meanwhile only ${D.activePols12m} members disclosed a single trade in the past twelve months. Any statistic about "Congress" trading is therefore really a statistic about a few dozen active portfolios, most of them professionally managed. That does not make the aggregate meaningless, but it does mean per-lawmaker views are more informative than totals.</p>
<h2 id="sizes">How big the trades are</h2>
<p>Size tells the same story of concentration from a different angle. ${pct(D.bands[0].n, T.trades, 0)} of all transactions are in the $1,001–$15,000 band and a further ${pct(D.bands[1].n, T.trades, 0)} are $15,001–$50,000. Only ${n(D.bands.slice(5).reduce((a, b) => a + b.n, 0))} transactions in twelve years exceeded $500,000, and ${D.bands.slice(7).reduce((a, b) => a + b.n, 0)} exceeded $5 million. Filtering to the larger bands strips out most managed-account noise and leaves a few hundred transactions a year that are genuinely worth reading.</p>`,

  "most-traded-stocks-by-members-of-congress": `
<h2 id="sectors">Reading the list by sector</h2>
<p>Group the fifteen names and the shape of congressional portfolios appears. <strong>Technology</strong> supplies five (Apple, Microsoft, Amazon, Alphabet, NVIDIA) and the two with the most transactions. <strong>Consumer staples</strong> add Procter &amp; Gamble and PepsiCo; <strong>healthcare</strong> Johnson &amp; Johnson and UnitedHealth; <strong>energy</strong> ExxonMobil and Chevron; <strong>telecoms</strong> AT&amp;T and Verizon; <strong>financials</strong> JPMorgan; and <strong>media</strong> Disney. It is a diversified blue-chip portfolio of the kind a wealth manager would build for a cautious client, which is consistent with how most of these accounts are run.</p>
<h2 id="turnover">Turnover versus breadth</h2>
<p>Microsoft has ${n(tk("MSFT").n)} transactions from ${tk("MSFT").pols} lawmakers, about ${(tk("MSFT").n / tk("MSFT").pols).toFixed(1)} per holder, while Apple has ${n(tk("AAPL").n)} from ${tk("AAPL").pols}, or ${(tk("AAPL").n / tk("AAPL").pols).toFixed(1)}. NVIDIA stands out with ${n(tk("NVDA").n)} transactions from only ${tk("NVDA").pols} lawmakers, ${(tk("NVDA").n / tk("NVDA").pols).toFixed(1)} each, the highest turnover in the top fifteen. High turnover in one stock usually means a small number of very active accounts trading it repeatedly, so when NVIDIA appears in a cluster it is worth checking whether the buyers are new to the stock or the same frequent traders.</p>
<h2 id="how-to-use">How to use company data on a tracker</h2>
<p>Open the company page, sort by trade date and look at three things: whether purchases cluster in time, whether the buyers are lawmakers who do not normally hold the stock, and what amount bands they used. A dozen $1,001–$15,000 purchases spread over a year by the same two managed accounts is background noise. Four purchases in a month by four different members, two of them in the $50,001–$100,000 band or above, is the kind of pattern ${"Hillradar AI"}'s AI Scanning flags automatically. Either way, the filing dates tell you how stale the information already is.</p>`,

  "congress-45-day-filing-rule-and-late-disclosures": `
<h2 id="trend">Is filing getting faster?</h2>
<p>Yes, slowly. The Senate's move to fully electronic filing and the House's machine-readable index both shortened the gap between a member submitting a report and the public being able to read it. The statutory deadline has not changed, but the share of filings landing in the 0–15 day bucket has grown as more offices file as soon as a brokerage notification arrives rather than batching monthly. The tail of very late filings has not shrunk in the same way, because it is driven by a small number of members catching up on long periods at once, and no procedural change fixes that.</p>
<h2 id="notification">The notification-date loophole</h2>
<p>The Act's clock has two hands: 45 days from the trade, or 30 days from the member being <em>notified</em> of the trade, whichever is earlier in principle. In practice the notification date is self-reported, and for managed accounts it can be weeks after the transaction. A filing can therefore appear on time against the notification date while being 60 or 70 days after the actual trade. ${"Hillradar AI"} measures delay from the <strong>transaction date</strong>, the number that matters to a reader, and ignores the notification date for that purpose. It is the stricter reading, and it is why our late share of ${pct(D.delay.late, T.trades)} is higher than figures that use notification dates.</p>
<h2 id="checklist">A reader's checklist for late filings</h2>
<ul>
<li>Check whether the late filing is part of a <strong>bundle</strong> covering months; if so, the individual trades are old news and the story is the lateness itself.</li>
<li>Look at the <strong>owner code</strong>; managed spouse or joint accounts explain most long delays.</li>
<li>Compare the member's <strong>average delay</strong> on their profile; a one-off 60-day filing from a habitually punctual member is different from a pattern.</li>
<li>Remember that the <strong>market has already moved</strong>; a 90-day-old purchase carries almost no timing information.</li>
</ul>`,

  "most-active-stock-traders-in-congress": `
<h2 id="per-year">Intensity: transactions per year in office</h2>
<p>Raw totals favour long tenures, so it helps to divide by active years. ${lm("MacArthur").name} compressed ${n(lm("MacArthur").n)} transactions into four years, roughly ${Math.round(lm("MacArthur").n / 4)} a year, the highest intensity in the record. ${lm("McClain").name} is on a similar pace with ${n(lm("McClain").n)} since early 2024. ${lm("Gottheimer").name} has sustained about ${Math.round(lm("Gottheimer").n / 9.6)} a year for almost a decade. By contrast ${lm("Carper").name}'s ${n(lm("Carper").n)} transactions span more than ten years, about ${Math.round(lm("Carper").n / 10.6)} a year. Intensity, not the total, is what tells you whether an account is being actively traded today.</p>
<h2 id="what-they-trade">What the most active filers trade</h2>
<p>The high-volume portfolios are dominated by the same large-cap names that top the all-Congress list: Apple, Microsoft, Amazon, JPMorgan and the big consumer and healthcare companies. That is expected for managed accounts, which rebalance broad holdings. The exceptions are informative: a member whose record is 95% index-like baskets and then shows a single large purchase in a small-cap company has done something out of character, and that single row is more interesting than the thousands around it. Lawmaker profiles on ${"Hillradar AI"} list each member's most-traded companies so those outliers are easy to spot.</p>
<h2 id="departed">Former members still shape the data</h2>
<p>Four of the ten most active filers have left Congress, including the top name. Their transactions remain in the record because the STOCK Act archive is permanent, and they still influence every all-time statistic: state rankings, party totals, sector mixes. When you want a picture of <em>current</em> congressional trading, filter to the last twelve or twenty-four months, where ${D.activePols12m} sitting members account for all activity and the distribution is rather different.</p>`,

  "why-congress-trade-amounts-are-ranges": `
<h2 id="history-bands">Where the bands came from</h2>
<p>The ranges predate the STOCK Act by decades. The Ethics in Government Act of 1978 created annual financial disclosure for federal officials and chose bands as a compromise between transparency and privacy; later amendments added the upper tiers as portfolios grew. When Congress added transaction reporting in 2012 it reused the same categories so that PTRs and annual reports would be comparable. Proposals to require exact amounts, or at least narrower bands at the low end where ${pct(D.bands[0].n, T.trades, 0)} of transactions sit, have been introduced several times without passing.</p>
<h2 id="bias">The systematic bias in band data</h2>
<p>Because managed accounts generate many small trades, the lowest band is crowded near its floor, while the rare large transactions tend to sit anywhere in their wide bands. Any method that assigns one number per band will therefore <strong>overstate small portfolios and understate the dispersion of large ones</strong>. The upper-bound approach at least errs in a known direction. For comparisons between lawmakers, the fairest measures are counts within bands ("how many trades above $100,000") rather than summed dollar figures of any kind.</p>
<h2 id="practical">Practical filters that work</h2>
<ul>
<li><strong>Minimum band $50,001</strong> removes about ${pct(D.bands[0].n + D.bands[1].n, T.trades, 0)} of all transactions and nearly all routine rebalancing.</li>
<li><strong>Minimum band $250,001</strong> leaves ${n(D.bands.slice(4).reduce((a, b) => a + b.n, 0))} transactions across twelve years, a list short enough to read in full.</li>
<li><strong>Band jumps</strong>: a member's first-ever filing in a band two steps above their usual one is a reliable "look here" flag.</li>
<li><strong>Buy/sell asymmetry by band</strong>: large sells with small buys usually mean an exit; the reverse means accumulation.</li>
</ul>`,

  "how-to-get-alerts-for-congress-stock-trades": `
<h2 id="volume">How many alerts to expect</h2>
<p>The database added ${n(D.last90)} transactions in the last 90 days, about ${Math.round(D.last90 / 13)} a week, from ${D.activePols12m} active members. Following the single most active lawmaker could mean dozens of messages on a rebalancing day; following one large-cap company such as Apple means a message every few days; following clusters only means a handful a month. Start narrow. Most users settle on cluster alerts plus two or three companies or lawmakers they genuinely care about.</p>
<h2 id="channels">Choosing between Telegram, WhatsApp and email</h2>
<p><strong>Telegram</strong> is the fastest to set up and the most reliable for instant delivery, and the bot keeps a scrollable history. <strong>WhatsApp</strong> suits people who do not use Telegram, with the caveat that delivery depends on the provider configured on the server and template rules can delay messages. <strong>Email</strong> is best as a searchable archive and for teams, where a shared inbox can receive every alert. You can enable all three at once; each alert is delivered to every connected channel.</p>
<h2 id="workflow">A simple workflow for busy readers</h2>
<ol>
<li>Enable cluster alerts and set a minimum band of $15,001 on watchlist alerts.</li>
<li>When an alert arrives, open the record and check the owner code, the delay in days and whether the buyer usually holds the stock.</li>
<li>If it is interesting, open the company page to see the other lawmakers trading it and the dates.</li>
<li>Save anything you want to revisit by exporting to CSV at the end of the week.</li>
</ol>
<p>The whole loop takes two minutes per alert and keeps you working from the primary record rather than from someone else's summary of it.</p>`,

  "what-is-a-congressional-trading-cluster": `
<h2 id="why-45">Why a 45-day window</h2>
<p>Forty-five days is the STOCK Act's own deadline, so it is the longest gap two trades can have while still being disclosed in the same "generation" of filings. A shorter window, say two weeks, would miss clusters where one member's filing arrived late; a longer one would group unrelated trades. Because the window is applied to <em>transaction</em> dates, not filing dates, a cluster can be detected only once the last filing in it is published, which in practice means two to seven weeks after the first purchase.</p>
<h2 id="examples">What clusters look like in the record</h2>
<p>Since January 2025 the stocks bought by the most distinct lawmakers were ${D.top2025.slice(0, 4).map(([t, p]) => `${t} (${p})`).join(", ")}. Not all of those are clusters in the strict sense, because many of the purchases are spread across months, but the ranking shows where congressional buying concentrates. NVIDIA is the clearest recent example of a company moving from occasional to widespread holding: it ranks 13th in the all-time list by breadth and 4th since 2025. A cluster detector surfaces that kind of shift within weeks rather than after a year-end review.</p>
<h2 id="false">False positives and how we limit them</h2>
<ul>
<li><strong>Index rebalancing</strong> can make several managed accounts buy the same large-cap on the same day; the track-record weight and the "do these buyers usually hold this" check reduce the score of such clusters.</li>
<li><strong>Spouse and joint accounts</strong> are included (they are part of the disclosure) but shown with their owner code so you can discount them.</li>
<li><strong>Catch-up filings</strong> that disclose months of old trades at once can create a cluster of stale purchases; the freshness term in the score penalises them.</li>
<li><strong>Thin history</strong>: a lawmaker with five trades does not get a track record at all, so one lucky call cannot dominate a score.</li>
</ul>
<p>Read together with the <a href="/disclaimer/">Disclaimer</a>, the rule is simple: a cluster tells you where to read first, never what to do.</p>`,

  "house-vs-senate-stock-trade-disclosures": `
<h2 id="per-year-chamber">Per-year pattern by chamber</h2>
<p>House volume is lumpier than Senate volume. The House produced the 2020 and 2025 spikes almost entirely by itself, because a few representatives with very active managed accounts joined or left during those years. The Senate's annual count has been steadier, partly because senators' six-year terms mean slower turnover in who is filing, and partly because so much Senate activity sits in spouse and joint accounts that trade less frequently. When a chart of "Congress" trading jumps, the first question to ask is which chamber, and usually which handful of members, moved it.</p>
<h2 id="committees">Committees and conflicts</h2>
<p>The two chambers also differ in how disclosures interact with committee work. Senate committees are smaller and more senior, so a single senator's holdings in a regulated industry attract more scrutiny than a junior representative's. The House, with ${house.pols} filers in the record, offers more cases but each is harder to connect to specific legislative influence. Trackers help by making the overlap visible: ${"Hillradar AI"} profiles show committee-relevant sectors alongside holdings so readers can judge for themselves. Neither chamber's rules currently prohibit trading in companies a member oversees; they require disclosure of it.</p>
<h2 id="practical-tips">Practical tips for reading each chamber</h2>
<ul>
<li>For <strong>House</strong> filings, check the delay in days first; the average is ${house.avg_delay} and bundles of late trades are common.</li>
<li>For <strong>Senate</strong> filings, check the owner code first; most transactions are spouse or joint.</li>
<li>Use per-member averages (${D.perMember.House} House, ${D.perMember.Senate} Senate) rather than chamber totals when comparing individuals.</li>
<li>When citing a filing, link to the original on the Clerk or eFD site; the two systems number and format documents differently.</li>
</ul>`,
};
