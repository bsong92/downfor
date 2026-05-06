# Downfor Weather Worker

A lightweight Node.js worker that runs on Railway and periodically refreshes weather data for upcoming outdoor activities.

## What it does

- Runs on a schedule (every 1 hour by default)
- Calls the `/api/cron/weather-refresh` endpoint on your Vercel app
- The endpoint fetches upcoming outdoor activities and updates weather data
- Logs all activity for monitoring

## Environment Variables

- `DOWNFOR_API_URL` — Your Vercel app URL (e.g., `https://downfor.vercel.app`)
- `CRON_SECRET` — Must match the `CRON_SECRET` in your Vercel environment

## Local Development

```bash
npm install
DOWNFOR_API_URL=http://localhost:3000 CRON_SECRET=supersecrettoken123 npm run dev
```

## Deploy to Railway

1. Push this folder to GitHub (already done)
2. Go to Railway.app → New Project → Deploy from GitHub
3. Select `downfor` repository and set **Root Directory** to `worker/`
4. Add environment variables:
   - `DOWNFOR_API_URL` = `https://downfor.vercel.app` (your Vercel domain)
   - `CRON_SECRET` = `supersecrettoken123` (same as Vercel's CRON_SECRET)
5. Deploy

The worker will start polling your weather endpoint every hour automatically.

## How it works

The worker makes HTTP requests to your Vercel API endpoint every hour. The endpoint:
- Fetches upcoming outdoor activities without weather data
- Calls Open-Meteo API for weather forecasts
- Updates Supabase with the weather data
- Returns a summary of updates

This approach allows you to run weather refreshes on the free Hobby tier without Vercel's cron limitations.
