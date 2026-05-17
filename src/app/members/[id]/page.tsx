import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { Navbar } from "@/components/Navbar";
import { getCategoryConfig } from "@/components/CategoryBadge";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import { formatInTimeZone, getDateLabelInTimeZone } from "@/lib/date-time";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithAttendees } from "@/types/app";
import type { Profile } from "@/types/database";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("public_profile", true)
    .maybeSingle();

  if (!member) {
    notFound();
  }

  const profile = member as Profile;

  const { data: hostedData } = await supabase
    .from("activities")
    .select(
      "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url))"
    )
    .eq("poster_id", profile.id)
    .eq("status", "active")
    .order("activity_date", { ascending: true });

  const hostedActivities = (hostedData ?? []) as ActivityWithAttendees[];
  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
          >
            ← Back to members
          </Link>
        </div>

        <section className="rounded-[32px] border border-gray-200/80 bg-white/90 backdrop-blur p-6 md:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-semibold text-indigo-600 overflow-hidden flex-shrink-0">
                {profile.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
                  Public member
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 leading-tight">
                  {profile.name}
                </h1>
                {profile.bio && (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <div className="font-semibold text-gray-900 mb-1">
                {hostedActivities.length} active hosted activit{hostedActivities.length === 1 ? "y" : "ies"}
              </div>
              <div>Public profile visible to the community.</div>
            </div>
          </div>

          {profile.interests.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                Hosted activities
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                Upcoming from {profile.name}
              </h2>
            </div>
          </div>

          {hostedActivities.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No active public activities yet"
              description="This member has not posted any active public activities."
              className="bg-white/80"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {hostedActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activity/${activity.id}`}
                  className="block overflow-hidden rounded-[28px] border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)]"
                >
                  <div className={`relative h-40 bg-gradient-to-br ${activity.image_url ? "" : "from-indigo-600 to-cyan-400"}`}>
                    {activity.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-cyan-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                        {getCategoryConfig(activity.category).emoji} {getCategoryConfig(activity.category).label}
                      </span>
                      <h3 className="mt-3 font-display text-xl font-semibold text-white leading-tight line-clamp-2">
                        {activity.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>📅</span>
                        <span>{getDateLabelInTimeZone(activity.activity_date, getStoredLocationTimezone(activity.location), now)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatInTimeZone(activity.activity_date, getStoredLocationTimezone(activity.location), {
                          hour: "numeric",
                          minute: "2-digit",
                        })}</span>
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
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
