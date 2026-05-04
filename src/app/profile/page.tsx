import { Navbar } from "@/components/Navbar";
import { ProfileClient } from "./ProfileClient";
import { ProfileActivities } from "@/components/ProfileActivities";
import { FAB } from "@/components/FAB";
import { getRequiredProfile } from "@/lib/current-user";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithAttendees } from "@/types/app";

export default async function ProfilePage() {
  const user = await getRequiredProfile();
  const supabase = createServiceClient();

  const { data: hostedData } = await supabase
    .from("activities")
    .select(
      "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url))"
    )
    .eq("poster_id", user.id)
    .order("created_at", { ascending: false });

  const { data: joinedData } = await supabase
    .from("join_requests")
    .select(
      "activities(*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url)))"
    )
    .eq("requester_id", user.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const hostedActivities = (hostedData ?? []) as ActivityWithAttendees[];
  const joinedActivities = (joinedData ?? [])
    .map((req: any) => req.activities)
    .filter(Boolean) as ActivityWithAttendees[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProfileClient initialUser={user} />

        <div className="mt-12">
          <ProfileActivities
            hostedActivities={hostedActivities}
            joinedActivities={joinedActivities}
          />
        </div>

        <FAB />
      </div>
    </div>
  );
}
