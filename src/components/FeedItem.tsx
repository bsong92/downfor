import Link from "next/link";
import { getCategoryConfig, getCategoryGradient } from "./CategoryBadge";
import { WeatherDisplay } from "./WeatherDisplay";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import { formatInTimeZone, getDateLabelInTimeZone } from "@/lib/date-time";
import type { ActivityWithAttendees } from "@/types/app";

function getDescriptionPreview(description: string | null) {
  if (!description) return null;

  const trimmed = description.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= 14) return trimmed;
  return `${words.slice(0, 14).join(" ")}...`;
}

function formatTime(dateStr: string, timeZone: string | null) {
  return formatInTimeZone(dateStr, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FeedItem({ activity }: { activity: ActivityWithAttendees }) {
  const { poster } = activity;
  const c = getCategoryConfig(activity.category);
  const gradientClass = getCategoryGradient(activity.category);
  const timeZone = getStoredLocationTimezone(activity.location);
  const descriptionPreview = getDescriptionPreview(activity.description);
  const dateLabel = getDateLabelInTimeZone(activity.activity_date, timeZone);

  const approvedAttendees = activity.join_requests
    .filter((req) => req.status === "approved")
    .slice(0, 3)
    .map((req) => req.requester);

  const totalAttendees = activity.join_requests.filter(
    (req) => req.status === "approved"
  ).length;
  const hasChat = totalAttendees > 0;

  return (
    <Link href={`/activity/${activity.id}`} className="block group h-full">
      <div className="h-full bg-white rounded-[28px] overflow-hidden border border-gray-200/80 hover:shadow-[0_22px_70px_rgba(79,70,229,0.14)] hover:border-indigo-300 transition-all duration-300 mb-4 flex flex-col">
        {/* Hero section */}
        <div className={`relative h-60 md:h-72 ${gradientClass}`}>
          {activity.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.image_url}
              alt={activity.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
            {/* Category pill */}
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
              {c.emoji} {c.label}
            </div>
            {hasChat && (
              <Link
                href={`/activity/${activity.id}#activity-chat`}
                className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-white transition-colors"
                aria-label="Open activity chat"
              >
                💬
              </Link>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 md:p-6 space-y-4 flex flex-col">
          <div className="space-y-2">
            <h3 className="font-display text-[1.45rem] md:text-[1.7rem] leading-tight text-gray-950 group-hover:text-indigo-700 transition-colors">
              {activity.title}
            </h3>
            {descriptionPreview && (
              <p className="text-[0.95rem] leading-6 text-gray-600 line-clamp-2">
                {descriptionPreview}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-950">{dateLabel}</div>
              <div className="text-sm text-gray-500">{formatTime(activity.activity_date, timeZone)}</div>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
              {activity.is_outdoor ? "Outdoor" : "Indoor"}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-1 min-w-0">
              <span>📍</span>
              <span className="truncate">{getStoredLocationLabel(activity.location)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 overflow-hidden">
                {poster.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster.photo_url}
                    alt={poster.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  poster.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{poster.name}</span>
            </div>
          </div>

          {/* Weather for outdoor activities */}
          {activity.is_outdoor && activity.weather_data && (
            <div className="pt-1">
              <WeatherDisplay
                weather={activity.weather_data}
                variant="compact"
                category={activity.category}
              />
            </div>
          )}
          {activity.is_outdoor && !activity.weather_data && (
            <div className="text-xs text-gray-500">
              Weather pending
            </div>
          )}

          {/* Row 2: Attendees and Spots */}
          <div className="flex items-end justify-between pt-2 mt-auto gap-4">
            <div className="flex items-center gap-2">
              {approvedAttendees.length > 0 && (
                <div className="flex -space-x-1.5">
                  {approvedAttendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-700 border border-white overflow-hidden flex-shrink-0"
                    >
                      {attendee.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={attendee.photo_url}
                          alt={attendee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        attendee.name.charAt(0)
                      )}
                    </div>
                  ))}
                </div>
              )}
              {totalAttendees > 0 && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                  {totalAttendees} going
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-700 block">
                {activity.spots_available} left
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
