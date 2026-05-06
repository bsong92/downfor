import Link from "next/link";
import { CategoryBadge, getCategoryConfig } from "./CategoryBadge";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import { formatInTimeZone, getDateLabelInTimeZone } from "@/lib/date-time";
import type { ActivityWithAttendees } from "@/types/app";

function formatTime(dateStr: string, timeZone: string | null) {
  return formatInTimeZone(dateStr, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getUrgencyIndicator(spots: number) {
  if (spots === 0) return { label: "Sold out", color: "bg-gray-100 text-gray-600" };
  if (spots === 1) return { label: "Last spot", color: "bg-red-100 text-red-700" };
  if (spots <= 2) return { label: "Almost full", color: "bg-orange-100 text-orange-700" };
  return null;
}

export function ActivityCard({ activity }: { activity: ActivityWithAttendees }) {
  const { poster } = activity;
  const urgency = getUrgencyIndicator(activity.spots_available);
  const c = getCategoryConfig(activity.category);
  const timeZone = getStoredLocationTimezone(activity.location);

  // Get approved attendees for social proof
  const approvedAttendees = activity.join_requests
    .filter((req) => req.status === "approved")
    .slice(0, 3)
    .map((req) => req.requester);

  const totalAttendees = activity.join_requests.filter((req) => req.status === "approved").length;
  const hasChat = totalAttendees > 0;

  // Determine spot color (red if low)
  const spotsColor = activity.spots_available <= 2 ? "text-red-600 font-semibold" : "text-gray-700";

  return (
    <Link href={`/activity/${activity.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all duration-300 h-full flex flex-col">
        {/* Top: Category pill + date */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{c.emoji}</span>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide bg-indigo-50 px-2.5 py-1 rounded-full">
              {c.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasChat && (
              <Link
                href={`/activity/${activity.id}#activity-chat`}
                className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                aria-label="Open activity chat"
              >
                💬
              </Link>
            )}
            <span className="text-xs text-gray-400">
              {getDateLabelInTimeZone(activity.activity_date, timeZone)}
            </span>
          </div>
        </div>

        {/* Middle: Title + description */}
        <div className="px-5 py-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {activity.title}
          </h3>

          {activity.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{activity.description}</p>
          )}

          {/* Time + Location */}
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <span className="font-medium">
                {getDateLabelInTimeZone(activity.activity_date, timeZone)} at{" "}
                {formatTime(activity.activity_date, timeZone)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="text-gray-600">{getStoredLocationLabel(activity.location)}</span>
            </div>
          </div>
        </div>

        {/* Bottom: Host + Spots + Attendees + CTA */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
          {/* Host info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 overflow-hidden flex-shrink-0">
              {poster.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster.photo_url} alt={poster.name} className="w-full h-full object-cover" />
              ) : (
                poster.name.charAt(0)
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">{poster.name}</span>
          </div>

          {/* Attendees + Spots + CTA row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Attendee avatars */}
              {approvedAttendees.length > 0 && (
                <div className="flex -space-x-2">
                  {approvedAttendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-700 border border-white overflow-hidden"
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

              {/* Going count + urgency badge */}
              <div className="flex items-center gap-2">
                {totalAttendees > 0 && (
                  <span className="text-xs font-semibold text-gray-700">
                    {totalAttendees} {totalAttendees === 1 ? "going" : "going"}
                  </span>
                )}
                {urgency && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
                    {urgency.label}
                  </span>
                )}
              </div>
            </div>

            {/* Spots remaining + Join button */}
            <div className="flex items-center gap-3 ml-auto">
              <div className={`text-sm font-semibold ${spotsColor}`}>
                {activity.spots_available} left
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-lg transition-all duration-200 flex-shrink-0 whitespace-nowrap"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
