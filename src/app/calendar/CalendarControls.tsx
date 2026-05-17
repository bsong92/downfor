"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type MonthKey = {
  year: number;
  month: number;
};

type MonthOption = {
  value: string;
  label: string;
};

function monthKeyToString(month: MonthKey) {
  return `${month.year}-${String(month.month + 1).padStart(2, "0")}`;
}

export function CalendarControls({
  selectedMonth,
  prevMonth,
  nextMonth,
  canGoPrev,
  canGoNext,
  upcomingCount,
  monthOptions,
}: {
  selectedMonth: MonthKey;
  prevMonth: MonthKey;
  nextMonth: MonthKey;
  canGoPrev: boolean;
  canGoNext: boolean;
  upcomingCount: number;
  monthOptions: MonthOption[];
}) {
  const router = useRouter();
  const currentValue = monthKeyToString(selectedMonth);

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-500">{upcomingCount} upcoming activities</div>
      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
        {canGoPrev ? (
          <Link
            href={`/calendar?month=${monthKeyToString(prevMonth)}`}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            ←
          </Link>
        ) : (
          <span className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300" aria-label="Previous month">
            ←
          </span>
        )}
        {canGoNext ? (
          <Link
            href={`/calendar?month=${monthKeyToString(nextMonth)}`}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            →
          </Link>
        ) : (
          <span className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300" aria-label="Next month">
            →
          </span>
        )}
      </div>
      <div className="min-w-[12rem]">
        <label className="sr-only" htmlFor="calendar-month">
          Select month
        </label>
        <select
          id="calendar-month"
          value={currentValue}
          onChange={(e) => router.push(`/calendar?month=${e.target.value}`)}
          className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-colors hover:border-indigo-300 focus:border-indigo-400"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
