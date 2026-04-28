import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
import { ProfileClient } from "./ProfileClient";
import { getRequiredProfile } from "@/lib/current-user";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithPoster } from "@/types/app";

export default async function ProfilePage() {
  const user = await getRequiredProfile();
  const supabase = createServiceClient();

  const { data: hostedData } = await supabase
    .from("activities")
    .select("*, poster:profiles!poster_id(*)")
    .eq("poster_id", user.id)
    .order("created_at", { ascending: false });

  const { data: joinedData } = await supabase
    .from("join_requests")
    .select("activities(*, poster:profiles!poster_id(*))")
    .eq("requester_id", user.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const hostedActivities = (hostedData ?? []) as ActivityWithPoster[];
  const joinedActivities = (joinedData ?? [])
    .map((req: any) => req.activities)
    .filter(Boolean) as ActivityWithPoster[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        <ProfileClient initialUser={user} />

        {/* Hosted activities */}
        <h2 className="font-semibold text-gray-900 mb-3">Activities you're hosting</h2>

        {hostedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-100 mb-8">
            <p className="mb-1">Nothing posted yet</p>
            <p className="text-sm">
              <a href="/create" className="text-indigo-500 hover:underline">
                Post your first activity →
              </a>
            </p>
          </div>
        ) : (
          <div className="grid gap-3 mb-8">
            {hostedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Joined activities */}
        <h2 className="font-semibold text-gray-900 mb-3">Activities you've joined</h2>

        {joinedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-100">
            <p className="mb-1">You haven't joined any activities yet</p>
            <p className="text-sm">
              <a href="/feed" className="text-indigo-500 hover:underline">
                Browse activities →
              </a>
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {joinedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
