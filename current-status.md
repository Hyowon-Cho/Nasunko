# Nasunko Current Status - 2026-07-16

## Current Product Direction

Nasunko is being positioned as a financial data analysis and BI portfolio project focused on Nasdaq-related market data and automated news collection.

Current service areas:

```txt
Nasdaq        = Market data dashboard
News          = Automated RSS news ETL pipeline
Analytics     = News + Nasdaq market BI/risk dashboard
Lounge        = Investor opinion data source, future dataset
Trade Records = User profit/loss outcome data source, future dataset
```

## What Changed Today

### 1. News Page Simplification

The previous feed concept was simplified into a news-only page.

- Removed the economic indicator section from the feed/news page.
- Renamed the navigation label from `피드` to `뉴스`.
- Kept the page focused on RSS news stored in PostgreSQL.

Reason:

- The news page should show the result of the news ETL pipeline clearly.
- Economic indicator failures made the page look broken even when news automation was working.

### 2. News ETL Documentation

Updated `docs/news-feed-automation.md` into a clearer ETL portfolio document.

It now explains:

- RSS extraction
- Article title, URL, and published time cleanup
- URL canonicalization
- Title fingerprinting
- Duplicate removal
- Category classification
- PostgreSQL bulk insert
- `news_sync_runs` execution log tracking
- Quantitative improvement metrics

Key quantitative points:

```txt
Insert requests: up to 68 -> 1
RSS timeout: 4000ms -> 2500ms
Measured sync duration: about 1661ms -> 436ms
News page DB response: about 0.19s
```

### 3. Analytics Dashboard Added

Added a new `/analytics` page and navigation item.

Initial version included community and trade data, but those datasets are currently sparse. The dashboard was then refocused toward data that actually exists now:

- News ETL status
- News category distribution
- News sync quality
- M7 average change
- Big tech average change
- Semiconductor average change
- Watched-stock downside ratio
- Top gainers
- Top losers
- Most volatile watched symbols

Community and trade records are still shown, but only as future user-generated datasets.

### 4. Analytics Data Layer

Added `lib/analytics.ts`.

It aggregates:

- PostgreSQL news data
- News sync run data
- FMP/Yahoo-backed market quote data
- Community counts
- Trade record counts

The current analytics focus is:

```txt
News + Nasdaq/stock market analysis first
Community + trade data later, after real usage accumulates
```

## Current Database Snapshot

Verified against RDS on 2026-07-16:

```txt
News articles: 147
Today's collected news: 64
Last 7 days news: 64
Latest news sync status: success
Latest sync duration: 436ms
Latest duplicate count: 68
Users: 5
Community posts: 0
Trade records: 0
```

## Portfolio Positioning

Current positioning:

> Nasunko is a Nasdaq-focused financial BI project that combines automated RSS news ETL with market quote data to analyze news flow, sector movement, and downside risk signals.

Best-fit portfolio angles:

- Data analyst
- Risk analyst
- Junior data engineer
- BI analyst

Strongest current evidence:

- Working ETL pipeline
- PostgreSQL persistence
- Bulk insert optimization
- Execution log table
- Market KPI dashboard
- Risk-oriented stock movement summary

## Next Steps

Recommended next implementation steps:

1. Add CSV export from `/analytics` for Excel/Tableau use.
2. Add a Python script under `scripts/analytics/` for news and market summary export.
3. Add daily market snapshot storage so market trends can be analyzed over time.
4. Add a simple risk scoring method using news volume + market downside ratio.
5. Add documentation for the analytics dashboard in `docs/analytics-dashboard.md`.
