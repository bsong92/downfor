import Link from "next/link";
import { getCategoryConfig, getCategoryGradient } from "./CategoryBadge";
import type { ActivityWithAttendees } from "@/types/app";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function FeedItem({ activity }: { activity: ActivityWithAttendees }) {
  const { poster } = activity;
  const c = getCategoryConfig(activity.category);
  const gradientClass = getCategoryGradient(activity.category);

  const approvedAttendees = activity.join_requests
    .filter((req) => req.status === "approved")
    .slice(0, 3)
    .map((req) => req.requester);

  const totalAttendees = activity.join_requests.filter(
    (req) => req.status === "approved"
  ).length;

  return (
    <Link href={`/activity/${activity.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 mb-4">
        {/* Hero section */}
        <div className={`relative h-44 ${gradientClass}`}>
          {activity.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.image_url}
              alt={activity.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category pill */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-900">
            {c.emoji} {c.label}
          </div>

          {/* Time badge */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white">
            {formatTime(activity.activity_date)}
          </div>

          {/* Title overlaid at bottom */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
              {activity.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Row 1: Location and Host */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-1 min-w-0">
              <span>📍</span>
              <span className="truncate">{activity.location}</span>
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

          {/* Row 2: Attendees and Spots */}
          <div className="flex items-center justify-between">
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
            <span className="text-sm font-semibold text-gray-700">
              {activity.spots_available} left
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
