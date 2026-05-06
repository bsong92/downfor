import type { WeatherData } from "@/types/database";
import {
  getWeatherRecommendation,
  getWeatherRecommendationStyles,
} from "@/lib/weather-advice";

interface WeatherDisplayProps {
  weather: WeatherData;
  variant?: "compact" | "full";
  category?: string;
}

export function WeatherDisplay({
  weather,
  variant = "compact",
  category,
}: WeatherDisplayProps) {
  const recommendation = getWeatherRecommendation(weather, category);
  const recommendationStyles = getWeatherRecommendationStyles(recommendation.tone);

  if (variant === "compact") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-lg">{weather.icon}</span>
          <span>{Math.round(weather.temperature)}°</span>
        </div>
        <div className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-medium ${recommendationStyles}`}>
          {recommendation.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{weather.icon}</span>
          <div>
            <p className="font-semibold text-gray-900">{weather.condition}</p>
            <p className="text-sm text-gray-600">
              {Math.round(weather.temperature)}° · {Math.round(weather.humidity)}% humidity
            </p>
          </div>
        </div>
      </div>
      <div className={`rounded-xl border px-3 py-2 text-sm font-medium ${recommendationStyles}`}>
        {recommendation.message}
      </div>
      <div className="space-y-1">
        {weather.precipitation > 0 && (
          <p className="text-sm text-gray-600">💧 {weather.precipitation}mm precipitation</p>
        )}
        {weather.windSpeed > 0 && (
          <p className="text-sm text-gray-600">💨 {weather.windSpeed} km/h winds</p>
        )}
      </div>
    </div>
  );
}
