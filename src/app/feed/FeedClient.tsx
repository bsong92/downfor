"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { getCategoryConfig, ALL_CATEGORIES } from "@/components/CategoryBadge";
import type { ActivityWithPoster } from "@/types/app";

export function FeedClient({ activities }: { activities: ActivityWithPoster[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? activities.filter((a) => a.category === activeCategory)
    : activities;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">What&apos;s happening</h1>
        <Link
          href="/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Post activity
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Nothing here yet</p>
          <p className="text-sm">Be the first to post something</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
