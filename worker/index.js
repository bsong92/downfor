import { createClient } from "@supabase/supabase-js";
import { getWeatherForLocation } from "../src/lib/weather.ts";

const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const LOOK_AHEAD_DAYS = 14;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function refreshWeather() {
  const start = new Date().toISOString();
  console.log(`[${start}] weather refresh start`);

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + LOOK_AHEAD_DAYS * 24 * 60 * 60 * 1000);

    // Fetch outdoor activities without weather data
    const { data: activities, error: fetchError } = await supabase
      .from("activities")
      .select("id, location, activity_date, is_outdoor")
      .eq("is_outdoor", true)
      .gte("activity_date", now.toISOString())
      .lte("activity_date", futureDate.toISOString())
      .is("weather_data", null);

    if (fetchError) throw fetchError;

    let updated = 0;
    let failed = 0;

    for (const activity of activities ?? []) {
      try {
        const activityDateStr = activity.activity_date.split("T")[0];
        const weatherData = await getWeatherForLocation(activity.location, activityDateStr);

        if (weatherData) {
          const { error: updateError } = await supabase
            .from("activities")
            .update({
              weather_data: weatherData,
              weather_last_updated: new Date().toISOString(),
            })
            .eq("id", activity.id);

          if (!updateError) {
            updated++;
            console.log(`[${new Date().toISOString()}] updated weather for ${activity.id}`);
          } else {
            failed++;
            console.error(`[${new Date().toISOString()}] failed to update ${activity.id}:`, updateError.message);
          }
        } else {
          failed++;
          console.warn(`[${new Date().toISOString()}] no weather data for ${activity.location}`);
        }
      } catch (err) {
        failed++;
        console.error(`[${new Date().toISOString()}] error processing activity:`, err.message);
      }
    }

    console.log(
      `[${new Date().toISOString()}] refresh done: ${activities?.length ?? 0} total, ${updated} updated, ${failed} failed`
    );
  } catch (err) {
    console.error(`[${new Date().toISOString()}] refresh failed:`, err.message);
  }

  setTimeout(refreshWeather, POLL_INTERVAL_MS);
}

refreshWeather();
