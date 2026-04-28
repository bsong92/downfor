"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { MOCK_ACTIVITIES, MOCK_JOIN_REQUESTS, type JoinRequestWithRequester } from "@/lib/mock-data";
import { MOCK_USER } from "@/lib/mock-user";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const activity = MOCK_ACTIVITIES.find((a) => a.id === id);

  const [requests, setRequests] = useState<JoinRequestWithRequester[]>(
    MOCK_JOIN_REQUESTS.filter((r) => r.activity_id === id)
  );
  const [hasRequested, setHasRequested] = useState(
    MOCK_JOIN_REQUESTS.some((r) => r.activity_id === id && r.requester_id === MOCK_USER.id)
  );
  const [loading, setLoading] = useState(false);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
          Activity not found.
        </div>
      </div>
    );
  }

  const isMyActivity = activity.poster_id === MOCK_USER.id;

  async function handleRequest() {
    setLoading(true);
    // TODO: save to Supabase
    await new Promise((r) => setTimeout(r, 400));
    setHasRequested(true);
    setLoading(false);
  }

  async function handleApproval(requestId: string, status: "approved" | "declined") {
    // TODO: save to Supabase
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Activity details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start justify-between mb-3">
            <CategoryBadge category={activity.category} />
            <span className="text-xs text-gray-400">
              {activity.spots_available} spot{activity.spots_available !== 1 ? "s" : ""} available
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h1>

          {activity.description && (
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{activity.description}</p>
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

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
              {activity.poster.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-500">Posted by {activity.poster.name}</span>
          </div>
        </div>

        {/* Request to join (non-poster) */}
        {!isMyActivity && (
          <div className="mb-6">
            {hasRequested ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium text-center">
                ✓ Request sent — {activity.poster.name} will review it
              </div>
            ) : (
              <button
                onClick={handleRequest}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending request..." : "I'm down — request to join"}
              </button>
            )}
          </div>
        )}

        {/* Approval queue (poster only) */}
        {isMyActivity && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">
              Requests{" "}
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
                  <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0">
                      {req.requester.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{req.requester.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {req.requester.interests.join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproval(req.id, "approved")}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(req.id, "declined")}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}

                {resolvedRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 opacity-60">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
                      {req.requester.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-700">{req.requester.name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {req.status}
                    </span>
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
