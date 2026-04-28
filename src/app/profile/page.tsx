import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
import { CategoryBadge } from "@/components/CategoryBadge";
import { getRequiredProfile } from "@/lib/current-user";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithPoster } from "@/types/app";

export default async function ProfilePage() {
  const user = await getRequiredProfile();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("activities")
    .select("*, poster:profiles!poster_id(*)")
    .eq("poster_id", user.id)
    .order("created_at", { ascending: false });

  const myActivities = (data ?? []) as ActivityWithPoster[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 overflow-hidden shrink-0">
              {user.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {user.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <CategoryBadge key={interest} category={interest} />
              ))}
            </div>
          )}
        </div>

        {/* My activities */}
        <h2 className="font-semibold text-gray-900 mb-3">Your activities</h2>

        {myActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-1">Nothing posted yet</p>
            <p className="text-sm">
              <a href="/create" className="text-indigo-500 hover:underline">
                Post your first activity →
              </a>
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {myActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
