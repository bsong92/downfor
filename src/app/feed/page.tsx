import { Navbar } from "@/components/Navbar";
import { FeedClient } from "./FeedClient";
import { createServiceClient } from "@/lib/supabase-server";
import type { ActivityWithPoster } from "@/lib/mock-data";

export default async function FeedPage() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("activities")
    .select("*, poster:profiles!poster_id(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const activities = (data ?? []) as ActivityWithPoster[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <FeedClient activities={activities} />
    </div>
  );
}
