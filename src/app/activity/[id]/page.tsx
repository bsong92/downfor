import { Navbar } from "@/components/Navbar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { createServiceClient } from "@/lib/supabase-server";
import { getRequiredProfile } from "@/lib/current-user";
import { createJoinRequest, updateRequestStatus } from "@/app/actions";
import type { ActivityWithPoster, JoinRequestWithRequester } from "@/types/app";
import Link from "next/link";
import { ActivityEditClient } from "@/app/activity/ActivityEditClient";

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const currentUser = await getRequiredProfile();

  const { data: activityData } = await supabase
    .from("activities")
    .select("*, poster:profiles!poster_id(*)")
    .eq("id", id)
    .single();

  const activity = activityData as ActivityWithPoster | null;

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
          Activity not found.{" "}
          <Link href="/feed" className="text-indigo-500 underline">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const { data: requestsData } = await supabase
    .from("join_requests")
    .select("*, requester:profiles!requester_id(*)")
    .eq("activity_id", id)
    .order("created_at", { ascending: true });

  const requests = (requestsData ?? []) as JoinRequestWithRequester[];
  const isMyActivity = activity.poster_id === currentUser.id;
  const myRequest = requests.find((r) => r.requester_id === currentUser.id);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        <Link
          href="/feed"
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          ← Back
        </Link>

        {/* Activity details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <CategoryBadge category={activity.category} />
            <span className="text-xs text-gray-400">
              {activity.spots_available} spot
              {activity.spots_available !== 1 ? "s" : ""} available
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h1>

          {activity.description && (
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {activity.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>{formatDateTime(activity.activity_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                {activity.poster.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-500">
                Posted by {activity.poster.name}
              </span>
            </div>
            {isMyActivity && <ActivityEditClient activity={activity} />}
          </div>
        </div>

        {/* Request to join (non-poster) */}
        {!isMyActivity && (
          <div className="mb-6">
            {myRequest ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium text-center">
                ✓ Request sent —{" "}
                {myRequest.status === "pending"
                  ? `${activity.poster.name} will review it`
                  : myRequest.status === "approved"
                  ? "you're in!"
                  : "request was declined"}
              </div>
            ) : (
              <form action={createJoinRequest.bind(null, id)}>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  I&apos;m down — request to join
                </button>
              </form>
            )}
          </div>
        )}

        {/* Approval queue (poster only) */}
        {isMyActivity && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1.5 bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {pendingRequests.length} pending
                </span>
              )}
            </h2>

            {requests.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0">
                      {req.requester.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">
                        {req.requester.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {req.requester.interests.join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form
                        action={updateRequestStatus.bind(null, req.id, "approved", id)}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      </form>
                      <form
                        action={updateRequestStatus.bind(null, req.id, "declined", id)}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  </div>
                ))}

                {resolvedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
                      {req.requester.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-700">
                        {req.requester.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status === "approved" && (
                        <form
                          action={updateRequestStatus.bind(null, req.id, "declined", id)}
                        >
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Revoke
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
