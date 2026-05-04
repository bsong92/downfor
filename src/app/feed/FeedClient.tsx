"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { getCategoryConfig, ALL_CATEGORIES } from "@/components/CategoryBadge";
import { FAB } from "@/components/FAB";
import type { ActivityWithAttendees } from "@/types/app";

export function FeedClient({ activities }: { activities: ActivityWithAttendees[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? activities.filter((a) => a.category === activeCategory)
    : activities;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-gray-900 mb-2">No activities yet</p>
          <p className="text-gray-500 mb-6">Be the first to post something in this category</p>
          <Link
            href="/create"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Create activity
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <FAB />
    </div>
  );
}
