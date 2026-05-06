const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const API_ENDPOINT = process.env.DOWNFOR_API_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

async function refreshWeather() {
  const start = new Date().toISOString();
  console.log(`[${start}] weather refresh start`);

  try {
    if (!CRON_SECRET) {
      throw new Error("CRON_SECRET environment variable not set");
    }

    const response = await fetch(`${API_ENDPOINT}/api/cron/weather-refresh`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API returned ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] refresh done:`, result);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] refresh failed:`, err.message);
  }

  setTimeout(refreshWeather, POLL_INTERVAL_MS);
}

refreshWeather();
