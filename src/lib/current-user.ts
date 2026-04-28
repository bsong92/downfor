import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

export function hasClerkCredentials() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) return "Unknown User";
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "Unknown User"
  );
}

async function syncProfileFromClerk(): Promise<Profile | null> {
  const user = await currentUser();

  if (!user) return null;

  const supabase = createServiceClient();
  const email = user.primaryEmailAddress?.emailAddress;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_user_id: user.id,
        name: getDisplayName(user),
        email: email ?? `${user.id}@example.invalid`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to sync profile: ${error.message}`);
  }

  return data as Profile;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasClerkCredentials()) {
    return null;
  }

  try {
    return await syncProfileFromClerk();
  } catch {
    return null;
  }
}

export async function getRequiredProfile(): Promise<Profile> {
  if (hasClerkCredentials()) {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    throw new Error("No active user profile");
  }

  return profile;
}
