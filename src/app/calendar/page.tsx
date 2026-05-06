import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { FAB } from "@/components/FAB";
import { getCategoryConfig, getCategoryGradient } from "@/components/CategoryBadge";
import { createServiceClient } from "@/lib/supabase-server";
import { formatInTimeZone, getDateKeyInTimeZone, getDateLabelInTimeZone } from "@/lib/date-time";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import type { ActivityWithAttendees } from "@/types/app";

type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  activities: ActivityWithAttendees[];
};

function getDateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonthGrid(date: Date) {
  const firstDay = startOfMonth(date);
  const leadingDays = firstDay.getDay();
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - leadingDays);
  return gridStart;
}

function buildCalendarCells(monthDate: Date, activities: ActivityWithAttendees[]) {
  const cells: CalendarCell[] = [];
  const gridStart = endOfMonthGrid(monthDate);
  const currentMonth = monthDate.getMonth();

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const key = getDateKeyFromDate(date);
    const isCurrentMonth = date.getMonth() === currentMonth;

    cells.push({
      date,
      key,
      isCurrentMonth,
      activities: activities.filter((activity) => {
        const timeZone = getStoredLocationTimezone(activity.location);
        return getDateKeyInTimeZone(activity.activity_date, timeZone) === key;
      }),
    });
  }

  return cells;
}

function formatCalendarTime(activityDate: string, timeZone: string | null) {
  return formatInTimeZone(activityDate, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function CalendarPage() {
  const supabase = createServiceClient();
  const now = new Date();
  const monthStart = startOfMonth(now);

  const { data } = await supabase
    .from("activities")
    .select(
      "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url))"
    )
    .eq("status", "active")
    .order("activity_date", { ascending: true });

  const activities = (data ?? []) as ActivityWithAttendees[];
  const upcomingActivities = activities.filter((activity) => new Date(activity.activity_date) >= now);
  const calendarCells = buildCalendarCells(monthStart, upcomingActivities);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
              Calendar
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 leading-tight">
              Plan ahead by date
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-xl">
              Browse upcoming activities in a month view and jump into what is happening next.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-lg shadow-indigo-200"
          >
            + Post activity
          </Link>
        </div>

        <div className="grid xl:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
          <section className="rounded-[32px] border border-gray-200/80 bg-white/85 backdrop-blur p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                  Month view
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                  {getMonthLabel(monthStart)}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {upcomingActivities.length} upcoming activities
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
              {weekdayLabels.map((day) => (
                <div key={day} className="px-2 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                const isToday = getDateKeyFromDate(now) === cell.key;

                return (
                  <div
                    key={cell.key}
                    className={`min-h-32 rounded-[20px] border p-3 transition-colors ${
                      cell.isCurrentMonth
                        ? "border-gray-200 bg-white"
                        : "border-gray-100 bg-gray-50/70 text-gray-300"
                    } ${isToday ? "ring-2 ring-indigo-500/40" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{cell.date.getDate()}</span>
                      {cell.activities.length > 0 && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                          {cell.activities.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {cell.activities.slice(0, 2).map((activity) => {
                        const c = getCategoryConfig(activity.category);
                        const timeZone = getStoredLocationTimezone(activity.location);

                        return (
                          <Link
                            key={activity.id}
                            href={`/activity/${activity.id}`}
                            className="block rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-2 text-left hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] leading-none">{c.emoji}</span>
                              <span className="text-[11px] font-semibold text-gray-700 truncate">
                                {c.label}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-950 line-clamp-2 leading-snug">
                              {activity.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              {formatCalendarTime(activity.activity_date, timeZone)}
                            </p>
                          </Link>
                        );
                      })}
                      {cell.activities.length > 2 && (
                        <p className="text-[11px] font-medium text-gray-500 px-2">
                          +{cell.activities.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-gray-200/80 bg-white/85 backdrop-blur p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                  Schedule
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                  Next up
                </h2>
              </div>
              <div className="text-sm text-gray-500">{upcomingActivities.length} events</div>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <p className="font-semibold text-gray-900 mb-2">No upcoming activities</p>
                <p className="text-sm text-gray-500 mb-4">
                  Post something to populate the calendar.
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Post activity
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingActivities.map((activity) => {
                  const c = getCategoryConfig(activity.category);
                  const gradientClass = getCategoryGradient(activity.category);
                  const timeZone = getStoredLocationTimezone(activity.location);
                  const dateLabel = getDateLabelInTimeZone(activity.activity_date, timeZone, now);
                  const timeLabel = formatCalendarTime(activity.activity_date, timeZone);

                  return (
                    <Link
                      key={activity.id}
                      href={`/activity/${activity.id}`}
                      className="block group"
                    >
                      <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)]">
                        <div className={`relative h-36 ${gradientClass}`}>
                          {activity.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activity.image_url}
                              alt={activity.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900">
                              {c.emoji} {c.label}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-tight line-clamp-2">
                              {activity.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 md:p-6 space-y-3">
                          <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2 min-w-0">
                              <span>📅</span>
                              <span>{dateLabel}</span>
                              <span className="text-gray-300">•</span>
                              <span>{timeLabel}</span>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                              {activity.spots_available} spots left
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                            <span>📍</span>
                            <span className="truncate">{getStoredLocationLabel(activity.location)}</span>
                          </div>

                          {activity.description && (
                            <p className="text-sm text-gray-600 leading-6 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <FAB />
    </div>
  );
}
