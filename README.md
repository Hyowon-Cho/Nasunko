# Nasunko

Nasunko is a dark Nasdaq dashboard for tracking live market data, major tech stocks, economic indicators, news, and investor community posts in one place.

Built with Next.js, TypeScript, AWS RDS PostgreSQL, and Capacitor.

## Features

- **Nasdaq Dashboard**
  - Live Nasdaq-focused market overview
  - Major tech stock cards
  - TradingView chart integration
  - Related market cards

- **Feed**
  - Economic indicators and market news in one page
  - Scrollable news feed
  - Indicator detail pages with charts

- **Lounge**
  - Sign up and login
  - Create, edit, and delete posts
  - Comment system
  - Admin controls for post and comment moderation

- **Profit / Loss**
  - Trade recap section scaffold
  - Profit and loss review entry point
  - Ready to be connected to DB-backed trade journals

- **Mobile App Ready**
  - Capacitor iOS and Android projects included
  - Loads the deployed Vercel app inside the native shell

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** React, CSS
- **Database:** AWS RDS PostgreSQL
- **Auth:** Cookie-based sessions
- **Charts:** TradingView Widget, Recharts
- **Market Data:** FMP API
- **Deployment:** Vercel
- **Mobile:** Capacitor

## Project Structure

```txt
app/
  api/              Next.js API routes
  nasdaq/           Nasdaq dashboard
  feed/             News and indicators feed
  lounge/           Community lounge
  trades/           Profit / loss section
  login/            Login page
  signup/           Signup page

components/         Reusable UI components
lib/                Data, auth, database, market, news, indicator logic
ios/                Capacitor iOS project
android/            Capacitor Android project
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
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

Notes:

- `DATABASE_URL` is required for lounge login, posts, comments, and admin features.
- `ADMIN_EMAILS` is a comma-separated list of admin accounts.
- `FMP_API_KEY` is used for market quotes.
- `FRED_API_KEY` is optional depending on indicator data usage.
- `BLOB_READ_WRITE_TOKEN` is used for image uploads with Vercel Blob.

## Database Setup

After setting `DATABASE_URL`, run the setup route once:

```txt
http://localhost:3000/api/setup
```

This creates or updates:

- `users`
- `sessions`
- `posts`
- `comments`

It also applies admin roles based on `ADMIN_EMAILS`.

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
- `.env.local` must never be committed.

## Disclaimer

Nasunko does not provide investment advice. All investment decisions are the user's responsibility.
