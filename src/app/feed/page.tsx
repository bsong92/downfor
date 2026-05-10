import { Navbar } from "@/components/Navbar";
import { FeedClient } from "./FeedClient";
import { createServiceClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/current-user";
import { getUnreadChatCounts } from "@/lib/chat-notifications";
import type { ActivityWithAttendees } from "@/types/app";

export default async function FeedPage() {
  const supabase = createServiceClient();
  const currentUser = await getCurrentProfile();

  const { data } = await supabase
    .from("activities")
    .select(
      "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(id, name, photo_url))"
    )
    .eq("status", "active")
    .order("activity_date", { ascending: true });

  const activities = (data ?? []) as ActivityWithAttendees[];
  const relevantActivityIds = currentUser
    ? activities
        .filter(
          (activity) =>
            activity.poster_id === currentUser.id ||
            activity.join_requests.some(
              (request) =>
                request.status === "approved" &&
                request.requester.id === currentUser.id
            )
        )
        .map((activity) => activity.id)
    : [];
  const unreadCounts = currentUser
    ? Object.fromEntries(
        [...(await getUnreadChatCounts(
          supabase,
          relevantActivityIds,
          currentUser.id
        )).entries()]
      )
    : {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <FeedClient activities={activities} unreadCounts={unreadCounts} />
    </div>
  );
}
