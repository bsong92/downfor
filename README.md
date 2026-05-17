# DownFor

DownFor is a desktop-first activity board for finding people to do things with. It lets users post activities, request to join them, manage approvals, chat with approved attendees, and browse upcoming plans in a calendar view.

The app is built around a real production stack:
- Clerk for authentication
- Supabase for persistence and row-level security
- Open-Meteo for weather and geocoding
- Railway for background weather refreshes
- Vercel for deployment

Live app: https://downfor.vercel.app

## What’s in the app

- Feed with desktop-style activity cards
- Activity detail pages with join requests and shared chat
- Requests dashboard with pending / approved / declined filtering
- Calendar view for upcoming activities
- Members directory and profile page
- Location autocomplete and weather-aware outdoor activities
- Photo attachments and message deletion in activity chat

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a local `.env.local` file with the values from your deployment dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CRON_SECRET=...
DOWNFOR_API_URL=...
LOCATION_AUTOCOMPLETE_PROVIDER=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

The repository ignores `.env*` files by default.

## Core Routes

- `/feed` - activity feed
- `/create` - post a new activity
- `/requests` - sent and incoming requests
- `/calendar` - month view and upcoming schedule
- `/members` - public community directory
- `/profile` - current user profile and hosted/joined activities
- `/activity/[id]` - activity detail, requests, and chat

## Weather + Chat

Outdoor activities use Open-Meteo forecasts. A Railway worker refreshes weather in the background through the `/api/cron/weather-refresh` endpoint.

Approved attendees and the host share one activity chat thread. Messages can include photo attachments, and senders can delete their own messages.

## Manual Smoke Tests

See [docs/SMOKE_TESTS.md](docs/SMOKE_TESTS.md) for the lightweight checklist I use after changes.

To run the automated browser smoke tests:

```bash
npx playwright install chromium
npm run test:e2e
```

That command runs the public smoke suite. To run the full browser suite, including the opt-in authenticated test, use:

```bash
npm run test:e2e:all
```

To create an authenticated Playwright state file for private-page tests:

```bash
npm run auth:record
```

After you sign in once in the browser, the saved `.auth/user.json` file can be reused for the authenticated test spec.

If the local Clerk page does not render, use the production app instead:

```bash
npm run auth:record:prod
```

To run only the authenticated spec:

```bash
npm run test:e2e:auth
```

To run the authenticated spec against production:

```bash
npm run test:e2e:auth:prod
```

## Notes for Reviewers

- The project started from a standard Next.js scaffold, but the current app is significantly different from the boilerplate.
- The code intentionally defers email notifications, push notifications, maps, and real-time chat presence to keep the core loop solid.
- If you want a quick orientation, start with the feed, requests, calendar, and activity detail pages.
