import type { WeatherData } from "@/types/database";
import type { Category } from "@/types/database";

export type WeatherRecommendationTone = "good" | "caution" | "bad";

export type WeatherRecommendation = {
  tone: WeatherRecommendationTone;
  message: string;
};

function getActivityWord(category?: Category | string) {
  switch (category) {
    case "food":
      return "Picnic";
    case "workout":
      return "Workout";
    case "golf":
      return "Golf";
    case "climbing":
      return "Climbing";
    case "sports":
      return "Outdoor plans";
    case "concerts":
      return "Outdoor plans";
    default:
      return "Outdoor plans";
  }
}

export function getWeatherRecommendation(
  weather: WeatherData,
  category?: Category | string
): WeatherRecommendation {
  const activityWord = getActivityWord(category);
  const condition = weather.condition.toLowerCase();

  if (weather.precipitation >= 2 || condition.includes("thunderstorm")) {
    return {
      tone: "bad",
      message: `${activityWord} is probably not recommended. Rain is likely.`,
    };
  }

  if (weather.precipitation > 0.2 || condition.includes("rain")) {
    return {
      tone: "caution",
      message: `${activityWord} may still work, but bring a backup plan for rain.`,
    };
  }

  if (weather.windSpeed >= 30) {
    return {
      tone: "caution",
      message: `${activityWord} may be uncomfortable because it is very windy.`,
    };
  }

  if (weather.temperature <= 40) {
    return {
      tone: "caution",
      message: `${activityWord} may be chilly, so dress warm.`,
    };
  }

  if (weather.temperature >= 90) {
    return {
      tone: "caution",
      message: `${activityWord} may be hot, so plan for shade and water.`,
    };
  }

  return {
    tone: "good",
    message: `${activityWord} looks like a good outdoor choice.`,
  };
}

export function getWeatherRecommendationStyles(tone: WeatherRecommendationTone) {
  switch (tone) {
    case "bad":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "caution":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "good":
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}
