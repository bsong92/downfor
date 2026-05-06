import { Navbar } from "@/components/Navbar";
import { getCategoryGradient, getCategoryConfig } from "@/components/CategoryBadge";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { createServiceClient } from "@/lib/supabase-server";
import { getRequiredProfile } from "@/lib/current-user";
import {
  createActivityMessage,
  createJoinRequest,
  deleteActivityMessage,
  updateRequestStatus,
} from "@/app/actions";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import { formatInTimeZone } from "@/lib/date-time";
import type { ActivityMessageWithSender, ActivityWithPoster, JoinRequestWithRequester } from "@/types/app";
import Link from "next/link";
import { ActivityEditClient } from "@/app/activity/ActivityEditClient";

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

  const { data: messagesData } = await supabase
    .from("activity_messages")
    .select("*, sender:profiles!sender_id(id, name, photo_url)")
    .eq("activity_id", id)
    .order("created_at", { ascending: true });

  const requests = (requestsData ?? []) as JoinRequestWithRequester[];
  const messages = (messagesData ?? []) as ActivityMessageWithSender[];
  const isMyActivity = activity.poster_id === currentUser.id;
  const myRequest = requests.find((r) => r.requester_id === currentUser.id);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const canChat = isMyActivity || myRequest?.status === "approved";

  const c = getCategoryConfig(activity.category);
  const gradientClass = getCategoryGradient(activity.category);
  const timeZone = getStoredLocationTimezone(activity.location);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero section */}
      <div className={`relative h-56 overflow-hidden ${gradientClass}`}>
        {activity.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.image_url}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          href="/feed"
          className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
        >
          ← Back
        </Link>

        {/* Category pill */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900 px-2.5 py-1 rounded-full">
          {c.emoji} {c.label}
        </div>

        {/* Title + location at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white mb-1 line-clamp-2">
            {activity.title}
          </h1>
          <p className="text-white/80 text-sm flex items-center gap-1">
            📍 {getStoredLocationLabel(activity.location)}
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-10">
        {/* Host info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 overflow-hidden flex-shrink-0">
              {activity.poster.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activity.poster.photo_url}
                  alt={activity.poster.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                activity.poster.name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Hosted by</p>
              <p className="text-sm font-semibold text-gray-900">
                {activity.poster.name}
              </p>
            </div>
          </div>
          {isMyActivity && (
            <div className="flex items-center gap-2">
              {approvedRequests.length > 0 && (
                <Link
                  href="#activity-chat"
                  className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  Open chat
                </Link>
              )}
              <ActivityEditClient activity={activity} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <span>📅</span>
            <span className="text-sm">
              {formatInTimeZone(activity.activity_date, timeZone, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span>🎟️</span>
            <span className="text-sm">
              {activity.spots_available} spot{activity.spots_available !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {activity.description}
          </p>
        )}

        {/* Weather for outdoor activities */}
        {activity.is_outdoor && activity.weather_data && (
          <WeatherDisplay
            weather={activity.weather_data}
            variant="full"
            category={activity.category}
          />
        )}
        {activity.is_outdoor && !activity.weather_data && (
          <div className="mb-6 text-sm text-gray-500">
            Weather pending for this outdoor activity.
          </div>
        )}

        {/* Who's going section */}
        {approvedRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              Who's going?{" "}
              <span className="text-gray-400 font-normal text-sm">
                {approvedRequests.length}
              </span>
            </h2>
            <div className="flex items-center gap-2 mb-2">
              {approvedRequests.slice(0, 5).map((req) => (
                <div
                  key={req.requester.id}
                  className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-700 border border-white overflow-hidden"
                >
                  {req.requester.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={req.requester.photo_url}
                      alt={req.requester.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    req.requester.name.charAt(0)
                  )}
                </div>
              ))}
              {approvedRequests.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  +{approvedRequests.length - 5}
                </div>
              )}
            </div>
            {approvedRequests.length > 0 && (
              <p className="text-sm text-gray-600">
                {approvedRequests[0].requester.name}
                {approvedRequests.length > 1 && (
                  <>
                    {" "}
                    and <span className="font-semibold">{approvedRequests.length - 1} other</span>
                    {approvedRequests.length > 2 ? "s" : ""} are going
                  </>
                )}{" "}
                {approvedRequests.length === 1 && "is going"}
              </p>
            )}
          </div>
        )}

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
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition-colors"
                >
                  I&apos;m down — request to join
                </button>
              </form>
            )}
          </div>
        )}

        <section
          id="activity-chat"
          className="mb-6 rounded-[28px] border border-gray-200/80 bg-white/90 backdrop-blur p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]"
        >
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                Activity chat
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                One shared thread
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              {approvedRequests.length} approved
            </div>
          </div>

          {canChat ? (
            <>
              {messages.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="font-semibold text-gray-900 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-500">
                    {isMyActivity
                      ? "Welcome the group and start the conversation here."
                      : "Be the first to say hi once you’re approved."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                  {messages.map((message) => {
                    const isMine = message.sender_id === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-3xl border px-4 py-3 shadow-sm ${
                            isMine
                              ? "border-indigo-200 bg-indigo-600 text-white"
                              : "border-gray-200 bg-gray-50 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-white/80 flex items-center justify-center shrink-0">
                              {message.sender.photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={message.sender.photo_url}
                                  alt={message.sender.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span
                                  className={`text-xs font-semibold ${
                                    isMine ? "text-indigo-700" : "text-gray-600"
                                  }`}
                                >
                                  {message.sender.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-semibold truncate ${
                                  isMine ? "text-indigo-50" : "text-gray-700"
                                }`}
                              >
                                {message.sender.name}
                              </p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <p
                                className={`text-[11px] ${
                                  isMine ? "text-indigo-100/80" : "text-gray-400"
                                }`}
                              >
                                {formatInTimeZone(message.created_at, timeZone, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                              {isMine && (
                                <form
                                  action={deleteActivityMessage.bind(null, message.id, id)}
                                >
                                  <button
                                    type="submit"
                                    className="rounded-full border border-white/30 px-2 py-1 text-[11px] font-semibold hover:bg-white/10 transition-colors"
                                    aria-label="Delete message"
                                  >
                                    Delete
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          <p className="text-sm leading-6 whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <form action={createActivityMessage.bind(null, id)} className="mt-5 space-y-3">
                <textarea
                  name="message"
                  rows={3}
                  placeholder={isMyActivity ? "Message the group..." : "Say hi to the host and group..."}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    Send message
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <p className="font-semibold text-gray-900 mb-2">Chat unlocks after approval</p>
              <p className="text-sm text-gray-500">
                Once your request is approved, you’ll join the shared activity thread with the host and other approved attendees.
              </p>
            </div>
          )}
        </section>

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
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0 overflow-hidden">
                      {req.requester.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={req.requester.photo_url}
                          alt={req.requester.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        req.requester.name.charAt(0)
                      )}
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
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0 overflow-hidden">
                      {req.requester.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={req.requester.photo_url}
                          alt={req.requester.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        req.requester.name.charAt(0)
                      )}
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
