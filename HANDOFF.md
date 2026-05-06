# Downfor Weather Feature - Handoff Summary

## What's Done ✅

### 1. UI/UX Improvements
- **Edit Activity Modal**: Input fields now have dark text + white background for visibility
- **Create Page**: Added "Is this outdoor?" toggle below category selection
- **Feed Cards**: Hero gradient design with overlaid title + category badge
- **Activity Detail**: Full-width hero section with back button, category pill, title/location overlay
- **Who's Going?** section: Shows attendees with avatars

### 2. Weather Feature Code
- **`src/types/database.ts`**: Added `WeatherData` type and `is_outdoor`, `weather_data`, `weather_last_updated` fields to Activity type
- **`src/lib/weather.ts`**: Implements `getWeatherForLocation(location, date)` using Open-Meteo API
  - Geocodes location string → coordinates
  - Fetches daily forecast
  - Maps weather codes to emoji icons + descriptions
  - Returns temperature, condition, humidity, wind speed, precipitation
- **`src/components/WeatherDisplay.tsx`**: Displays weather in two variants:
  - `compact`: Icon + temperature (for feed cards)
  - `full`: Full weather card with all details (for activity detail page)
- **`src/app/api/cron/weather-refresh/route.ts`**: Server endpoint that:
  - Fetches upcoming outdoor activities without weather data
  - Calls `getWeatherForLocation` for each
  - Updates Supabase with weather_data + weather_last_updated
  - Protected by CRON_SECRET header validation

### 3. Database Updates
- `src/app/actions.ts`: 
  - `createActivity()` now accepts `is_outdoor` boolean
  - Calls `updateActivityWeather()` after creating activity
  - `updateActivity()` accepts optional `is_outdoor`
  - `updateActivityWeather()` async function that fetches + stores weather
- `src/app/activity/ActivityEditClient.tsx`: Added `is_outdoor` toggle in edit modal

### 4. Component Updates
- `src/components/FeedItem.tsx`: Shows weather compact display if `is_outdoor && weather_data`
- `src/app/activity/[id]/page.tsx`: Shows weather full display if `is_outdoor && weather_data`

### 5. Background Worker
- Created `worker/` directory with Node.js app that:
  - Runs every 1 hour
  - Calls `/api/cron/weather-refresh` endpoint
  - Deployed to Railway
  - Environment variables: `DOWNFOR_API_URL`, `CRON_SECRET`

### 6. Deployment
- **Vercel**: App deployed at https://downfor.vercel.app
  - CRON_SECRET env var set ✓
  - Latest commit: `a982680` (added logging to weather fetch)
- **Railway**: Worker deployed and Online
  - DOWNFOR_API_URL + CRON_SECRET env vars set ✓

## Current Issue ❌

**Weather data is NOT appearing on feed cards or activity detail page**, even though:
- Activities are created with `is_outdoor: true`
- Weather toggle is enabled
- Open-Meteo API is free/public

### Debugging Steps Taken
1. Verified `vercel.json` removed (was causing Hobby plan limit issue)
2. Confirmed CRON_SECRET set in Vercel
3. Checked database queries use `*` to select all fields (should include weather_data)
4. Added logging to `createActivity()` in `src/app/actions.ts` lines 55-63
   - Logs `[createActivity] Fetching weather for {activityId}`
   - Logs weather result or error

## Next Steps to Debug

### 1. Check Vercel Logs
Create a new outdoor activity with location "Chicago, Illinois", then:
```bash
# In terminal
cd downfor
vercel logs --follow
```
Look for entries starting with `[createActivity]`. This will show:
- If weather fetch is even being attempted
- If weather API call succeeds or fails
- What error message appears

### 2. Check Supabase Directly
Query the activities table:
```sql
SELECT id, title, is_outdoor, weather_data, weather_last_updated 
FROM activities 
ORDER BY created_at DESC 
LIMIT 5;
```
Check if `weather_data` column has JSON data or is NULL.

### 3. Possible Root Causes
- **Location geocoding failing**: Open-Meteo can't find "Millenium Park Picnic"
  - Solution: Test with simpler location like "Chicago" or full "Chicago, Illinois"
- **Weather API timeout**: Open-Meteo taking too long
  - Solution: Check network tab in browser DevTools when creating activity
- **Database update failing**: Activity created but weather update fails silently
  - Solution: Check Vercel logs for errors
- **`is_outdoor` not being passed**: Check if toggle is actually saving value
  - Solution: Inspect Supabase activity record directly

## Key Files

| File | Purpose |
|------|---------|
| `src/types/database.ts` | Activity + WeatherData types |
| `src/lib/weather.ts` | Open-Meteo API integration |
| `src/components/WeatherDisplay.tsx` | Weather UI component |
| `src/app/actions.ts` | `createActivity`, `updateActivityWeather` |
| `src/app/create/page.tsx` | Create form with `is_outdoor` toggle |
| `src/components/FeedItem.tsx` | Feed card (shows weather if exists) |
| `src/app/activity/[id]/page.tsx` | Activity detail (shows weather if exists) |
| `src/app/api/cron/weather-refresh/route.ts` | Weather refresh endpoint |
| `worker/index.js` | Railway worker that calls weather endpoint |
| `vercel.json` | Deployment config (crons array is empty) |

## Environment Variables

### Vercel
- `CRON_SECRET`: `supersecrettoken123` ✓

### Railway Worker
- `DOWNFOR_API_URL`: `https://downfor.vercel.app` ✓
- `CRON_SECRET`: `supersecrettoken123` ✓

## Testing Checklist

- [ ] Create activity with `is_outdoor: ON` and location "Chicago, Illinois"
- [ ] Check Vercel logs for `[createActivity]` entries
- [ ] Check Supabase to see if `weather_data` is populated
- [ ] If weather_data exists in DB, check why it's not rendering on frontend
- [ ] If weather_data is NULL, check the error message in logs
- [ ] Test with simpler location if "Chicago, Illinois" fails
- [ ] Check if Open-Meteo API is responding (test in browser console)

## Open Questions
1. Why is weather_data NULL in database after activity creation?
2. Is the location geocoding failing silently?
3. Is the async `updateActivityWeather` call completing before page revalidates?
4. Are the database columns actually created (did user run the SQL migration)?

## SQL Migration (Must be run in Supabase)
```sql
ALTER TABLE activities 
  ADD COLUMN is_outdoor boolean DEFAULT true,
  ADD COLUMN weather_data jsonb,
  ADD COLUMN weather_last_updated timestamp;

CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE INDEX idx_activities_is_outdoor ON activities(is_outdoor);
```

## Commits Since Last Stable
1. `e27eb40` - fix: add missing weather types and lib
2. `6f40659` - fix: simplify worker to call API endpoint
3. `93fdb95` - refactor: move weather refresh from Vercel cron to Railway worker
4. `7a6a75b` - feat: add weather feature with cron job scheduling
5. `8fef4ff` - fix: make edit modal input fields have dark text
6. `a982680` - debug: add logging to weather fetch (CURRENT)

## Last Known State
- App deployed and live
- Weather code is in place but not storing/displaying data
- Need to debug why weather API call or database update is failing
