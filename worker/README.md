# Downfor Weather Worker

A Node.js worker that runs on Railway and periodically refreshes weather data for upcoming outdoor activities.

## What it does

- Polls the database every hour
- Fetches upcoming outdoor activities without weather data (within 14 days)
- Calls Open-Meteo API to get weather forecasts
- Updates Supabase with weather data
- Logs all activity for monitoring

## Environment Variables

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (from Settings → API)

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Railway

1. Push this folder to GitHub
2. Go to Railway.app → New Project → Deploy from GitHub
3. Select this repository and set Root Directory to `worker/`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

## How it works

The worker runs continuously and refreshes weather every hour for:
- Activities marked as `is_outdoor = true`
- With `activity_date` in the next 14 days
- That don't have `weather_data` yet

Once weather is fetched and stored, it won't be re-fetched (to save API calls). You can manually delete `weather_data` in Supabase if you want to force a refresh.
