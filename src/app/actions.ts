"use server";

import { createServiceClient } from "@/lib/supabase-server";
import { getRequiredProfile } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function createActivity(data: {
  category: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  spots: string;
}) {
  const supabase = createServiceClient();
  const user = await getRequiredProfile();
  const activityDate = new Date(`${data.date}T${data.time}`).toISOString();

  const { error } = await supabase.from("activities").insert({
    poster_id: user.id,
    category: data.category,
    title: data.title,
    description: data.description || null,
    activity_date: activityDate,
    location: data.location,
    spots_available: parseInt(data.spots, 10),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  revalidatePath("/profile");
  return { success: true };
}

// Used as a form action (must return void)
export async function createJoinRequest(activityId: string): Promise<void> {
  const supabase = createServiceClient();
  const user = await getRequiredProfile();
  await supabase.from("join_requests").insert({
    activity_id: activityId,
    requester_id: user.id,
  });
  revalidatePath(`/activity/${activityId}`);
}

// Used as a form action (must return void)
export async function updateRequestStatus(
  requestId: string,
  status: "approved" | "declined",
  activityId: string
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("join_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  revalidatePath(`/activity/${activityId}`);
}
