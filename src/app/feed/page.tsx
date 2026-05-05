import { Navbar } from "@/components/Navbar";
import { FeedClient } from "./FeedClient";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithAttendees } from "@/types/app";

export default async function FeedPage() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("activities")
    .select(
      "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url))"
    )
    .eq("status", "active")
    .order("activity_date", { ascending: true });

  const activities = (data ?? []) as ActivityWithAttendees[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <FeedClient activities={activities} />
    </div>
  );
}
