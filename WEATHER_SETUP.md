# Weather Feature Setup Guide

The weather feature has been implemented with real-time display and periodic background refresh. Here's how to set it up:

## 1. Database Migration (Required)

Run this SQL in your Supabase SQL editor:

```sql
ALTER TABLE activities ADD COLUMN is_outdoor boolean DEFAULT true;
ALTER TABLE activities ADD COLUMN weather_data jsonb;
ALTER TABLE activities ADD COLUMN weather_last_updated timestamp;

CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE INDEX idx_activities_is_outdoor ON activities(is_outdoor);
```

## 2. Environment Variables

Add this to your `.env.local`:

```
CRON_SECRET=your-secret-token-here
```

Generate a secure token (e.g., `openssl rand -base64 32`).

## 3. Cron Job Setup (Choose One)

### Option A: Vercel Cron (Recommended for Vercel deployment)

1. In `vercel.json`, add:

```json
{
  "crons": [{
    "path": "/api/cron/weather-refresh",
    "schedule": "0 */6 * * *"
  }]
}
```

2. Deploy to Vercel: `vercel deploy --prod`

3. Set `CRON_SECRET` in Vercel project settings → Environment Variables

### Option B: Railway Cron Job

1. Create a Railway job trigger:
   - Go to your Railway project
   - Add "Cron Job" plugin
   - Set interval: `0 */6 * * *` (every 6 hours)
   - Webhook URL: `https://your-domain.com/api/cron/weather-refresh`
   - Headers: `Authorization: Bearer your-secret-token-here`

### Option C: External Service (EasyCron, etc.)

1. Go to https://www.easycron.com
2. Create a cron job:
   - URL: `https://your-domain.com/api/cron/weather-refresh`
   - Cron expression: `0 */6 * * *`
   - Add HTTP header: `Authorization: Bearer your-secret-token-here`

## 4. Features

### On Create Page
- **Is this outdoor?** toggle (below category selection)
- When enabled, weather will be fetched and stored in the database
- Category gradient shows as cover photo placeholder

### On Feed
- Weather icon + temperature shown for outdoor activities
- Updates when activities are viewed or created

### On Activity Detail
- Full weather card showing:
  - Current conditions + icon
  - Temperature and humidity
  - Wind speed and precipitation forecast

### Automatic Refresh
- Weather refreshes every 6 hours for upcoming outdoor activities (within 14 days)
- Only updates activities that don't already have weather data
- New activities get weather immediately on creation

## 5. Testing

1. Create an activity with `is_outdoor: true`
2. Check Supabase → activities table → `weather_data` column
3. Weather should appear on the feed card and detail page

## 6. Open-Meteo API

The feature uses the free [Open-Meteo](https://open-meteo.com) API:
- No API key required
- No rate limits for reasonable usage
- Accurate weather forecasts via European weather models
- Global coverage

## 7. Troubleshooting

### No weather showing?
- Check `is_outdoor` is `true` in Supabase
- Verify location can be geocoded (try a major city name)
- Check browser console for errors

### Cron job not firing?
- Verify `CRON_SECRET` matches in env vars
- Check server logs for the cron route
- Test manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/weather-refresh`

### Weather always stale?
- The cron runs every 6 hours on a schedule
- Force refresh by calling `updateActivityWeather` manually in actions.ts
- Or re-create the activity to trigger immediate fetch

## Files Modified

- `src/types/database.ts` — Added WeatherData type and new Activity fields
- `src/lib/weather.ts` — Weather API integration (getWeatherForLocation)
- `src/components/WeatherDisplay.tsx` — New component for displaying weather
- `src/components/FeedItem.tsx` — Shows compact weather on cards
- `src/app/activity/[id]/page.tsx` — Shows full weather on detail page
- `src/app/create/page.tsx` — Is outdoor toggle
- `src/app/activity/ActivityEditClient.tsx` — Edit is_outdoor toggle
- `src/app/actions.ts` — Updated createActivity, updateActivity, added updateActivityWeather
- `src/app/api/cron/weather-refresh/route.ts` — New cron endpoint
