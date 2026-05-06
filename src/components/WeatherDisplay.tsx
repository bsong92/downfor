import type { WeatherData } from "@/types/database";

interface WeatherDisplayProps {
  weather: WeatherData;
  variant?: "compact" | "full";
}

export function WeatherDisplay({ weather, variant = "compact" }: WeatherDisplayProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-lg">{weather.icon}</span>
        <span>{Math.round(weather.temperature)}°</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
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
      {weather.precipitation > 0 && (
        <p className="text-sm text-gray-600 mt-2">💧 {weather.precipitation}mm precipitation</p>
      )}
      {weather.windSpeed > 0 && (
        <p className="text-sm text-gray-600">💨 {weather.windSpeed} km/h winds</p>
      )}
    </div>
  );
}
