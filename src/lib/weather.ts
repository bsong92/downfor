import type { WeatherData } from "@/types/database";

const WEATHER_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌧️",
  53: "🌧️",
  55: "🌧️",
  61: "🌧️",
  63: "⛈️",
  65: "⛈️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  77: "❄️",
  80: "🌧️",
  81: "⛈️",
  82: "⛈️",
  85: "❄️",
  86: "❄️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Light Rain",
  53: "Moderate Rain",
  55: "Heavy Rain",
  61: "Rainy",
  63: "Heavy Rain",
  65: "Very Heavy Rain",
  71: "Light Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Heavy Rain Showers",
  82: "Extreme Rain Showers",
  85: "Light Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Hail",
  99: "Thunderstorm with Hail",
};

export async function getWeatherForLocation(
  location: string,
  date: string
): Promise<WeatherData | null> {
  try {
    // Geocode the location
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) return null;

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const { latitude, longitude } = geoData.results[0];

    // Get weather forecast
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max,precipitation_sum,wind_speed_10m_max&timezone=auto`
    );

    if (!weatherResponse.ok) return null;

    const weatherData = await weatherResponse.json();

    // Parse the requested date
    const activityDate = new Date(date).toISOString().split("T")[0];
    const dailyDates = weatherData.daily.time as string[];
    const dateIndex = dailyDates.indexOf(activityDate);

    if (dateIndex === -1) return null;

    const weatherCode = weatherData.daily.weather_code[dateIndex] as number;
    const tempMax = weatherData.daily.temperature_2m_max[dateIndex] as number;
    const tempMin = weatherData.daily.temperature_2m_min[dateIndex] as number;
    const humidity = weatherData.daily.relative_humidity_2m_max[dateIndex] as number;
    const precipitation = weatherData.daily.precipitation_sum[dateIndex] as number;
    const windSpeed = weatherData.daily.wind_speed_10m_max[dateIndex] as number;

    return {
      temperature: Math.round((tempMax + tempMin) / 2),
      condition: WEATHER_DESCRIPTIONS[weatherCode] || "Unknown",
      humidity,
      windSpeed: Math.round(windSpeed),
      precipitation: Math.round(precipitation * 10) / 10,
      icon: WEATHER_ICONS[weatherCode] || "🌍",
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}
