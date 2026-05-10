import type { SupabaseClient } from "@supabase/supabase-js";

type ChatReadRow = {
  activity_id: string;
  last_read_at: string;
};

type ChatMessageRow = {
  activity_id: string;
  sender_id: string;
  created_at: string;
};

export async function getUnreadChatCounts(
  supabase: SupabaseClient,
  activityIds: string[],
  profileId: string
) {
  const counts = new Map<string, number>();
  const uniqueIds = Array.from(new Set(activityIds)).filter(Boolean);

  if (!uniqueIds.length || !profileId) {
    return counts;
  }

  const [readsRes, messagesRes] = await Promise.all([
    supabase
      .from("activity_chat_reads")
      .select("activity_id, last_read_at")
      .eq("profile_id", profileId)
      .in("activity_id", uniqueIds),
    supabase
      .from("activity_messages")
      .select("activity_id, sender_id, created_at")
      .in("activity_id", uniqueIds)
      .order("created_at", { ascending: true }),
  ]);

  const reads = ((readsRes.data ?? []) as ChatReadRow[]).reduce<Record<string, string>>(
    (acc, row) => {
      acc[row.activity_id] = row.last_read_at;
      return acc;
    },
    {}
  );

  for (const message of (messagesRes.data ?? []) as ChatMessageRow[]) {
    if (message.sender_id === profileId) {
      continue;
    }

    const lastRead = reads[message.activity_id];
    const isUnread = !lastRead || new Date(message.created_at) > new Date(lastRead);

    if (!isUnread) {
      continue;
    }

    counts.set(message.activity_id, (counts.get(message.activity_id) ?? 0) + 1);
  }

  return counts;
}

export async function upsertChatReadCursor(
  supabase: SupabaseClient,
  activityId: string,
  profileId: string
) {
  return supabase.from("activity_chat_reads").upsert(
    {
      activity_id: activityId,
      profile_id: profileId,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "activity_id,profile_id" }
  );
}
