"use client";

import { useState } from "react";
import Link from "next/link";
import { FeedItem } from "@/components/FeedItem";
import { EmptyState } from "@/components/EmptyState";
import { getCategoryConfig, ALL_CATEGORIES, normalizeCategory } from "@/components/CategoryBadge";
import { FAB } from "@/components/FAB";
import { getStoredLocationTimezone } from "@/lib/location";
import type { ActivityWithAttendees } from "@/types/app";

type FeedSort = "soonest" | "latest" | "most-spots";

export function FeedClient({
  activities,
  unreadCounts,
}: {
  activities: ActivityWithAttendees[];
  unreadCounts: Record<string, number>;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<FeedSort>("soonest");

  const now = new Date();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredByCategory = activeCategory
    ? activities.filter((a) => normalizeCategory(a.category) === activeCategory)
    : activities;

  const filtered = normalizedSearch
    ? filteredByCategory.filter((activity) => {
        const haystack = [
          activity.title,
          activity.description ?? "",
          activity.location,
          activity.poster.name,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
    : filteredByCategory;

  // Split upcoming vs past
  const upcomingActivities = filtered.filter((a) => new Date(a.activity_date) >= now);
  const pastActivities = filtered.filter((a) => new Date(a.activity_date) < now).reverse();

  const displayActivities = activeTab === "upcoming" ? upcomingActivities : pastActivities;
  const sortedActivities = [...displayActivities].sort((a, b) => {
    const dateA = new Date(a.activity_date).getTime();
    const dateB = new Date(b.activity_date).getTime();

    if (sortBy === "latest") {
      return dateB - dateA;
    }

    if (sortBy === "most-spots") {
      return b.spots_available - a.spots_available;
    }

    return dateA - dateB;
  });

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

        <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-gray-200/80 bg-white/85 backdrop-blur p-4 md:flex-row md:items-center md:justify-between">
          <label className="flex-1">
            <span className="sr-only">Search activities</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, location, host, or description"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <label className="flex items-center gap-3 md:min-w-56">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FeedSort)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 md:w-52"
            >
              <option value="soonest">Soonest</option>
              <option value="latest">Latest</option>
              <option value="most-spots">Most spots left</option>
            </select>
          </label>
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
        <EmptyState
          icon={activeTab === "upcoming" ? "✨" : "🕒"}
          title={`No ${activeTab} activities yet`}
          description={
            activeCategory
              ? `Be the first to post a ${activeCategory} activity.`
              : activeTab === "upcoming"
                ? "Be the first to post something and start the feed."
                : "There are no past activities to show right now."
          }
          actionHref={activeTab === "upcoming" ? "/create" : undefined}
          actionLabel={activeTab === "upcoming" ? "Create activity" : undefined}
          className="mt-8 bg-white/80"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2 items-stretch">
          {sortedActivities.map((activity) => (
            <FeedItem
              key={activity.id}
              activity={activity}
              unreadCount={unreadCounts[activity.id] ?? 0}
            />
          ))}
        </div>
      )}
      <FAB />
    </div>
  );
}
