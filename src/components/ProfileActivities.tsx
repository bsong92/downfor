"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityCard } from "./ActivityCard";
import type { ActivityWithAttendees } from "@/types/app";

interface ProfileActivitiesProps {
  hostedActivities: ActivityWithAttendees[];
  joinedActivities: ActivityWithAttendees[];
}

export function ProfileActivities({
  hostedActivities,
  joinedActivities,
}: ProfileActivitiesProps) {
  const [activeTab, setActiveTab] = useState<"hosting" | "joined">("hosting");

  const now = new Date();

  // Split activities into upcoming and past
  const upcomingHosted = hostedActivities.filter(
    (a) => new Date(a.activity_date) >= now
  );
  const pastHosted = hostedActivities.filter((a) => new Date(a.activity_date) < now);

  const upcomingJoined = joinedActivities.filter(
    (a) => new Date(a.activity_date) >= now
  );
  const pastJoined = joinedActivities.filter((a) => new Date(a.activity_date) < now);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("hosting")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "hosting"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Hosting ({hostedActivities.length})
        </button>
        <button
          onClick={() => setActiveTab("joined")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "joined"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Joined ({joinedActivities.length})
        </button>
      </div>

      {activeTab === "hosting" ? (
        <>
          {hostedActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                You haven&apos;t hosted anything yet
              </p>
              <p className="text-gray-500 mb-6">Be the first to share an activity</p>
              <Link
                href="/create"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Create activity →
              </Link>
            </div>
          ) : (
            <>
              {upcomingHosted.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Upcoming
                  </h3>
                  <div className="space-y-4">
                    {upcomingHosted.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}

              {pastHosted.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Past
                  </h3>
                  <div className="space-y-4 opacity-60">
                    {pastHosted.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {joinedActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                You haven&apos;t joined anything yet
              </p>
              <p className="text-gray-500 mb-6">Explore activities on the feed</p>
              <Link
                href="/feed"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Browse the feed →
              </Link>
            </div>
          ) : (
            <>
              {upcomingJoined.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Upcoming
                  </h3>
                  <div className="space-y-4">
                    {upcomingJoined.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}

              {pastJoined.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Past
                  </h3>
                  <div className="space-y-4 opacity-60">
                    {pastJoined.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
