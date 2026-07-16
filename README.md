# Nasunko

Nasunko is a dark Nasdaq-focused financial information platform that combines market data, automated news collection, investor discussion, and user trade outcome records.

The project is designed not only as a web app, but also as a small financial data pipeline and BI-style portfolio project.

## Product Concept

Nasunko organizes the service into four main data areas:

```txt
Nasdaq       = Market data dashboard
News         = Automated news collection pipeline
Analytics    = BI and risk KPI dashboard
Lounge       = Investor opinion data
Trade Records = User profit / loss outcome data
```

This structure allows the app to collect, store, display, and later analyze market signals, news flow, community sentiment, and user trading behavior.

## Current Features

### Nasdaq Dashboard

The Nasdaq page is the main market dashboard.

- Nasdaq-focused market overview
- Major U.S. tech stock cards
- TradingView chart integration
- Related market cards such as VIX, USD/KRW, Gold, WTI, and semiconductor ETFs
- Real market quote integration through FMP when an API key is available
- Fallback handling when external market data is unavailable

### News

The News page is backed by an automated RSS-based ETL pipeline.

- Scheduled RSS collection from external news sources
- News title, URL, source, category, and published time extraction
- URL canonicalization and tracking parameter removal
- Title fingerprinting for duplicate detection
- Automatic category classification
- PostgreSQL bulk insert with `ON CONFLICT DO NOTHING`
- News sync execution logs through `news_sync_runs`
- Scrollable news timeline with category filters

News is stored first, then served from PostgreSQL. The page does not depend on live RSS calls during normal user browsing.

### Analytics

The Analytics page turns stored data into BI-style KPI summaries.

- News ETL status metrics
- News category distribution
- News sync quality metrics such as inserted and duplicate counts
- M7, big tech, and semiconductor average change metrics
- Advancing and declining stock counts
- Top gainers, top losers, and most volatile watched symbols
- Community and trade records shown as future user-generated datasets

### Lounge

The Lounge is the investor discussion area and user-generated opinion data source.

- Sign up and login
- Create, view, edit, and delete posts
- Comment system
- Admin moderation for posts and comments
- Nickname-based community display
- PostgreSQL-backed persistence

### Trade Records

The Trade Records section stores user profit and loss review data.

- Create trade records with symbol, return rate, realized P/L, entry price, exit price, recap text, and image upload
- Profit / loss classification
- Negative return input automatically switches the record to loss
- Trade detail page with edit and delete controls for the owner
- Comment support
- Data foundation for future trade outcome analytics

### Mobile App Ready

- Capacitor iOS and Android projects included
- Native shell can load the deployed Vercel app

## Data Engineering Highlights

Nasunko includes a small ETL pipeline for news automation.

```txt
[RSS Sources]
Korean financial news RSS feeds
        |
        v
[Extract]
Fetch RSS, parse articles
        |
        v
[Transform]
Normalize title
Canonicalize URL
Remove tracking parameters
Standardize published time
Classify category
Detect duplicates
        |
        v
[Load]
Bulk insert into PostgreSQL
ON CONFLICT DO NOTHING
        |
        v
[Serving]
News page reads from PostgreSQL
        |
        v
[Monitoring]
news_sync_runs stores sync status and duration
```

Key improvement:

- Article-by-article inserts were replaced with bulk insert.
- For 68 collected articles, the maximum insert requests were reduced from 68 to 1.
- RSS request timeout was reduced from 4000ms to 2500ms.
- News sync run logs track status, fetched count, inserted count, duplicate count, deleted count, source error count, and duration.

More details are documented in:

```txt
docs/news-feed-automation.md
```

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** React, CSS
- **Database:** AWS RDS PostgreSQL
- **Auth:** Cookie-based sessions
- **Charts:** TradingView Widget, Recharts
- **Market Data:** FMP API
- **News Pipeline:** RSS, GitHub Actions, Vercel Cron, PostgreSQL
- **File Uploads:** Vercel Blob
- **Deployment:** Vercel
- **Mobile:** Capacitor

## Project Structure

```txt
app/
  api/                  Next.js API routes
  api/cron/news/        Scheduled news sync endpoint
  api/admin/news-sync/  Admin news sync status endpoint
  nasdaq/               Nasdaq market dashboard
  feed/                 News page
  analytics/            BI and risk analytics dashboard
  lounge/               Community lounge
  trades/               User trade records
  login/                Login page
  signup/               Signup page

components/             Reusable UI components
lib/                    Data, auth, database, market, news, trade logic
docs/                   Project documentation and portfolio writeups
ios/                    Capacitor iOS project
android/                Capacitor Android project
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
ADMIN_EMAILS=admin@example.com
FMP_API_KEY=your_fmp_api_key
FRED_API_KEY=your_fred_api_key
CRON_SECRET=your_cron_secret
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

Notes:

- `DATABASE_URL` is required for auth, lounge posts, comments, trade records, and news persistence.
- `ADMIN_EMAILS` is a comma-separated list of admin accounts.
- `FMP_API_KEY` is used for market quotes.
- `FRED_API_KEY` is optional and reserved for indicator-related pages or future analytics.
- `CRON_SECRET` protects the scheduled news sync endpoint in production.
- `BLOB_READ_WRITE_TOKEN` is used for image uploads with Vercel Blob.

## Database Setup

After setting `DATABASE_URL`, run the setup route once:

```txt
http://localhost:3000/api/setup
```

This creates or updates core tables for:

- users
- sessions
- lounge posts
- comments
- trade records
- news articles
- news sync logs

It also applies admin roles based on `ADMIN_EMAILS`.

## News Sync

The automated news sync can be triggered by:

```txt
GET /api/cron/news
```

In production, this route requires:

```txt
Authorization: Bearer <CRON_SECRET>
```

Admin users can inspect recent news sync runs through:

```txt
GET /api/admin/news-sync
```

## Scripts

```bash
npm run dev          # Start local development server
npm run build        # Build production app
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run cap:sync     # Sync Capacitor projects
npm run cap:ios      # Open iOS project in Xcode
npm run cap:android  # Open Android project
```

## Mobile App

Capacitor is configured with:

```txt
App name: Nasunko
App ID: com.hyowoncho.nasunko
```

Sync native projects:

```bash
npm run cap:sync
```

Open iOS:

```bash
npm run cap:ios
```

Open Android:

```bash
npm run cap:android
```

The mobile shell currently loads the deployed Vercel app:

```txt
https://nasunko.vercel.app
```

## Security Notes

- Passwords are hashed with `scrypt`.
- Session tokens are stored as hashes in PostgreSQL.
- Browser sessions use an HTTP-only cookie.
- SQL queries use parameter binding.
- Admin permissions are checked server-side.
- Cron endpoint is protected by `CRON_SECRET` in production.
- `.env.local` must never be committed.

## Portfolio Positioning

Nasunko can be described as a financial BI and data pipeline project:

> Nasunko collects market-related news, stores normalized records in PostgreSQL, combines them with Nasdaq-focused market quotes, and presents BI/risk KPIs for news flow and market movement. Community and trade records remain available as future user-generated datasets.

This makes the project relevant to data analyst, risk analyst, and junior data engineering roles because it includes data collection, transformation, deduplication, loading, persistence, monitoring, and dashboard presentation.

## Disclaimer

Nasunko does not provide investment advice. All investment decisions are the user's responsibility.
