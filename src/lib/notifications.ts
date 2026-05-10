import type { SupabaseClient } from "@supabase/supabase-js";
import { getUnreadChatCounts, getUnreadChatStats } from "@/lib/chat-notifications";
import type { Profile } from "@/types/database";

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  tone: "indigo" | "emerald" | "amber" | "rose" | "gray";
  createdAt: string;
};

function activityHref(activityId: string) {
  return `/activity/${activityId}`;
}

export async function getNotifications(
  supabase: SupabaseClient,
  profile: Profile | null
) {
  if (!profile) {
    return {
      items: [] as NotificationItem[],
      unreadCount: 0,
    };
  }

  const [hostedRes, sentRes] = await Promise.all([
    supabase
      .from("activities")
      .select(
        "id, title, poster_id, created_at, join_requests!activity_id(id, status, requester_id, created_at, requester:profiles!requester_id(id, name))"
      )
      .eq("poster_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("join_requests")
      .select("id, status, activity_id, created_at, updated_at, activities(id, title)")
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const hostedActivities = (hostedRes.data ?? []) as unknown as Array<{
    id: string;
    title: string;
    created_at: string;
    join_requests: Array<{
      id: string;
      status: "pending" | "approved" | "declined";
      requester_id: string;
      requester: { id: string; name: string } | { id: string; name: string }[];
      created_at: string;
    }>;
  }>;
  const sentRequests = (sentRes.data ?? []) as unknown as Array<{
    id: string;
    status: "pending" | "approved" | "declined";
    activity_id: string;
    created_at: string;
    updated_at: string;
    activities: { id: string; title: string } | null;
  }>;

  const relevantActivityIds = hostedActivities.map((activity) => activity.id);
  const unreadChatStats = await getUnreadChatStats(supabase, relevantActivityIds, profile.id);

  const items: NotificationItem[] = [];

  for (const activity of hostedActivities) {
    const unread = unreadChatStats.get(activity.id)?.count ?? 0;
    const pending = activity.join_requests.filter((request) => request.status === "pending").length;
    const latestPending = activity.join_requests
      .filter((request) => request.status === "pending")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (pending > 0) {
      items.push({
        id: `host-pending-${activity.id}-${latestPending?.created_at ?? activity.created_at}`,
        title: `${pending} pending request${pending === 1 ? "" : "s"}`,
        subtitle: activity.title,
        href: activityHref(activity.id),
        tone: "amber",
        createdAt: latestPending?.created_at ?? activity.created_at,
      });
    }

    if (unread > 0) {
      items.push({
        id: `host-chat-${activity.id}-${unreadChatStats.get(activity.id)?.latestUnreadAt ?? activity.created_at}`,
        title: `${unread} unread chat message${unread === 1 ? "" : "s"}`,
        subtitle: activity.title,
        href: activityHref(activity.id) + "#activity-chat",
        tone: "indigo",
        createdAt: unreadChatStats.get(activity.id)?.latestUnreadAt ?? activity.created_at,
      });
    }
  }

  for (const request of sentRequests) {
    if (!request.activities || request.status === "pending") continue;

    items.push({
      id: `sent-${request.id}-${request.updated_at ?? request.created_at}`,
      title:
        request.status === "approved"
          ? "Request approved"
          : "Request declined",
      subtitle: request.activities.title,
      href: activityHref(request.activities.id),
      tone: request.status === "approved" ? "emerald" : "rose",
      createdAt: request.updated_at ?? request.created_at,
    });
  }

  return {
    items: items.slice(0, 8),
    unreadCount: items.length,
  };
}
