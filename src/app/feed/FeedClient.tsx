"use client";

import { useState } from "react";
import Link from "next/link";
import { FeedItem } from "@/components/FeedItem";
import { getCategoryConfig, ALL_CATEGORIES } from "@/components/CategoryBadge";
import { FAB } from "@/components/FAB";
import { getStoredLocationTimezone } from "@/lib/location";
import type { ActivityWithAttendees } from "@/types/app";

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
  const sortedActivities = [...displayActivities].sort(
    (a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
              Downfor feed
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 leading-tight">
              What&apos;s happening
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-xl">
              Find activities with your community, scan the weather, and jump into something
              actually worth doing.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-lg shadow-indigo-200"
          >
            + Post activity
          </Link>
        </div>

        {/* Upcoming/Past Toggle */}
        <div className="flex gap-4 border-b border-gray-200 mb-5 pb-4">
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
        <div className="flex gap-2 flex-wrap pb-5 border-b border-gray-200">
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
        <div className="grid gap-6 xl:grid-cols-2 items-stretch">
          {sortedActivities.map((activity) => (
            <FeedItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <FAB />
    </div>
  );
}
