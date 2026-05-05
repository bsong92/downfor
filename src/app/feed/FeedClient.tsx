"use client";

import { useState } from "react";
import Link from "next/link";
import { FeedItem } from "@/components/FeedItem";
import { getCategoryConfig, ALL_CATEGORIES } from "@/components/CategoryBadge";
import { FAB } from "@/components/FAB";
import type { ActivityWithAttendees } from "@/types/app";

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const activityDay = new Date(d);
  activityDay.setHours(0, 0, 0, 0);

  if (activityDay.getTime() === today.getTime()) return "Today";
  if (activityDay.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
}

function groupByDay(
  activities: ActivityWithAttendees[]
): Map<string, ActivityWithAttendees[]> {
  const groups = new Map<string, ActivityWithAttendees[]>();
  activities.forEach((activity) => {
    const key = getDateKey(activity.activity_date);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(activity);
  });
  return groups;
}

export function FeedClient({ activities }: { activities: ActivityWithAttendees[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date();

  // Filter by category
  const filtered = activeCategory
    ? activities.filter((a) => a.category === activeCategory)
    : activities;

  // Split upcoming vs past
  const upcomingActivities = filtered.filter((a) => new Date(a.activity_date) >= now);
  const pastActivities = filtered.filter((a) => new Date(a.activity_date) < now).reverse();

  const displayActivities = activeTab === "upcoming" ? upcomingActivities : pastActivities;
  const grouped = groupByDay(displayActivities);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">What&apos;s happening</h1>
            <p className="text-gray-500 text-sm mt-1">Find activities with your community</p>
          </div>
          <Link
            href="/create"
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap"
          >
            + Post activity
          </Link>
        </div>

        {/* Upcoming/Past Toggle */}
        <div className="flex gap-4 border-b border-gray-200 mb-4 pb-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "upcoming"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "past"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Past
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap pb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === null
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const c = getCategoryConfig(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      {displayActivities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab} activities yet
          </p>
          <p className="text-gray-500 mb-6">
            {activeCategory
              ? `Be the first to post a ${activeCategory} activity`
              : activeTab === "upcoming"
                ? "Be the first to post something"
                : "No past activities to show"}
          </p>
          {activeTab === "upcoming" && (
            <Link
              href="/create"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Create activity
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([dateKey, dayActivities]) => (
            <div key={dateKey}>
              {/* Date header with sidebar */}
              <div className="flex items-start gap-4 mb-4">
                {/* Sidebar: date label + line */}
                <div className="w-20 flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {getDateLabel(dayActivities[0].activity_date)}
                  </div>
                  <div className="w-0.5 h-12 bg-gray-300 mx-auto"></div>
                </div>
                {/* Activities for this day */}
                <div className="flex-1 space-y-3">
                  {dayActivities.map((activity) => (
                    <FeedItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <FAB />
    </div>
  );
}
