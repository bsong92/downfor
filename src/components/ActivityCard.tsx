import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import type { ActivityWithPoster } from "@/lib/mock-data";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function ActivityCard({ activity }: { activity: ActivityWithPoster }) {
  const { poster } = activity;

  return (
    <Link href={`/activity/${activity.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <CategoryBadge category={activity.category} />
          <span className="text-xs text-gray-400 shrink-0">
            {formatDate(activity.activity_date)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors leading-snug">
          {activity.title}
        </h3>

        {activity.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{activity.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            🕐 {formatTime(activity.activity_date)}
          </span>
          <span className="flex items-center gap-1">
            📍 {activity.location}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            {activity.spots_available === 1
              ? "1 spot left"
              : `${activity.spots_available} spots`}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 overflow-hidden shrink-0">
            {poster.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster.photo_url} alt={poster.name} className="w-full h-full object-cover" />
            ) : (
              poster.name.charAt(0)
            )}
          </div>
          <span className="text-xs text-gray-500">{poster.name}</span>
        </div>
      </div>
    </Link>
  );
}
