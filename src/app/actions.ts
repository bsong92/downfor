"use server";

import { createServiceClient } from "@/lib/supabase-server";
import { getRequiredProfile } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function createActivity(data: {
  category: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  spots: string;
}) {
  try {
    const supabase = createServiceClient();
    const user = await getRequiredProfile();
    const activityDate = new Date(`${data.date}T${data.time}`);

    if (Number.isNaN(activityDate.getTime())) {
      return { success: false, error: "Please enter a valid date and time." };
    }

    const { error } = await supabase.from("activities").insert({
      poster_id: user.id,
      category: data.category,
      title: data.title,
      description: data.description || null,
      activity_date: activityDate.toISOString(),
      location: data.location,
      spots_available: parseInt(data.spots, 10),
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/feed");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong while posting.";
    return { success: false, error: message };
  }
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

export async function uploadProfilePhoto(file: File) {
  try {
    const user = await getRequiredProfile();
    const supabase = createServiceClient();

    const fileBuffer = await fileToBuffer(file);
    const filename = `${user.id}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filename, fileBuffer, { contentType: file.type });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(filename);
    return { success: true, photoUrl: data.publicUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload photo.";
    return { success: false, error: message };
  }
}

export async function updateProfile(data: {
  name: string;
  bio: string;
  photo_url: string;
  interests: string[];
  public_profile: boolean;
}) {
  try {
    const supabase = createServiceClient();
    const user = await getRequiredProfile();

    console.log("updateProfile - incoming data:", data);

    // Split updates: interests needs special handling in Postgres
    console.log("Updating user ID:", user.id);

    const { data: updateResult, error: error1 } = await supabase
      .from("profiles")
      .update({
        name: data.name || "",
        bio: data.bio ? data.bio.trim() : null,
        photo_url: data.photo_url ? data.photo_url.trim() : null,
        public_profile: data.public_profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select();

    console.log("Update result:", { data: updateResult, error: error1 });

    if (error1) {
      console.error("Error updating profile fields:", error1);
      return { success: false, error: error1.message };
    }

    const { error: error2 } = await supabase
      .from("profiles")
      .update({
        interests: data.interests || [],
      })
      .eq("id", user.id);

    if (error2) {
      console.error("Error updating interests:", error2);
      return { success: false, error: error2.message };
    }

    console.log("Profile updated successfully");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profile update failed.";
    console.error("updateProfile exception:", message);
    return { success: false, error: message };
  }
}
