import Link from "next/link";
import { CategoryBadge, getCategoryConfig } from "./CategoryBadge";
import type { ActivityWithPoster } from "@/types/app";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getUrgencyIndicator(spots: number) {
  if (spots === 0) return { label: "Sold out", color: "bg-gray-100 text-gray-600" };
  if (spots === 1) return { label: "Last spot", color: "bg-red-100 text-red-700" };
  if (spots <= 2) return { label: "Almost full", color: "bg-orange-100 text-orange-700" };
  return null;
}

export function ActivityCard({ activity }: { activity: ActivityWithPoster }) {
  const { poster } = activity;
  const urgency = getUrgencyIndicator(activity.spots_available);
  const c = getCategoryConfig(activity.category);

  return (
    <Link href={`/activity/${activity.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all duration-300 h-full flex flex-col">
        {/* Header with category and urgency */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{c.label}</span>
          </div>
          {urgency && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
              {urgency.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
            {activity.title}
          </h3>

          {activity.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
              {activity.description}
            </p>
          )}

          {/* Date, time, location */}
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <span className="font-medium">{formatDate(activity.activity_date)} at {formatTime(activity.activity_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="text-gray-600">{activity.location}</span>
            </div>
          </div>
        </div>

        {/* Footer: Host info and CTA */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
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
    </Link>
  );
}
