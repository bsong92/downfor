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
  const joinedCount = profile.interests.length;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

        <section className="overflow-hidden rounded-[32px] border border-gray-200/80 bg-white/90 backdrop-blur shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="relative h-52 bg-gradient-to-br from-indigo-600 via-violet-500 to-cyan-400">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_26%)]" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-[32px] border-4 border-white/90 bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-semibold text-white overflow-hidden flex-shrink-0 shadow-lg">
                  {profile.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80 mb-2">
                    Public member
                  </p>
                  <h1 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight">
                    {profile.name}
                  </h1>
                  {profile.bio && (
                    <p className="mt-3 max-w-2xl text-sm md:text-base text-white/85 leading-6 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden md:block rounded-[24px] bg-white/15 backdrop-blur px-5 py-4 text-sm text-white/90 border border-white/20">
                <div className="font-semibold mb-1">
                  Joined {memberSince}
                </div>
                <div>{hostedActivities.length} active hosted activit{hostedActivities.length === 1 ? "y" : "ies"}</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)] lg:items-start">
              <div className="space-y-4">
                {profile.bio && (
                  <p className="max-w-3xl text-base leading-7 text-gray-600">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {profile.interests.length > 0 ? (
                    profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No interests listed yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Host</div>
                  <div className="font-semibold text-gray-900">{hostedActivities.length} active</div>
                </div>
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Member since</div>
                  <div className="font-semibold text-gray-900">{memberSince}</div>
                </div>
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Interests</div>
                  <div className="font-semibold text-gray-900">{joinedCount} listed</div>
                </div>
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Visibility</div>
                  <div className="font-semibold text-gray-900">Public profile</div>
                </div>
              </div>
            </div>
          </div>
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
                  <div
                    className={`relative h-44 bg-gradient-to-br ${
                      activity.image_url ? "" : "from-indigo-600 to-cyan-400"
                    }`}
                  >
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                        {getCategoryConfig(activity.category).emoji} {getCategoryConfig(activity.category).label}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="mt-3 font-display text-xl font-semibold text-white leading-tight line-clamp-2">
                        {activity.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">When</p>
                        <div className="text-sm font-semibold text-gray-950">
                          {getDateLabelInTimeZone(
                            activity.activity_date,
                            getStoredLocationTimezone(activity.location),
                            now
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatInTimeZone(activity.activity_date, getStoredLocationTimezone(activity.location), {
                          hour: "numeric",
                          minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap">
                        {activity.spots_available} spots left
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                      <span>📍</span>
                      <span className="truncate">{getStoredLocationLabel(activity.location)}</span>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-gray-600 leading-6 line-clamp-3">
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
