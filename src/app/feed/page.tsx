"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
import { MOCK_ACTIVITIES } from "@/lib/mock-data";
import { getCategoryConfig, ALL_CATEGORIES } from "@/components/CategoryBadge";
import Link from "next/link";

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? MOCK_ACTIVITIES.filter((a) => a.category === activeCategory)
    : MOCK_ACTIVITIES;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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

        {/* Category filters */}
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

        {/* Activity grid */}
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
    </div>
  );
}
