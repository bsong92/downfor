import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
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
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
              No active public activities yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {hostedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
