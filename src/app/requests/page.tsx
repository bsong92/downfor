import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { FAB } from "@/components/FAB";
import { getCategoryConfig, getCategoryGradient } from "@/components/CategoryBadge";
import { createServiceClient } from "@/lib/supabase-server";
import { getRequiredProfile } from "@/lib/current-user";
import { getStoredLocationLabel, getStoredLocationTimezone } from "@/lib/location";
import { formatInTimeZone, getDateLabelInTimeZone } from "@/lib/date-time";
import { updateRequestStatus } from "@/app/actions";
import type { ActivityWithAttendees, ActivityWithPoster } from "@/types/app";
import type { JoinRequest } from "@/types/database";

type SentRequestRow = JoinRequest & {
  activities: ActivityWithPoster;
};

type RequestStatusFilter = "all" | "pending" | "approved" | "declined";

const REQUEST_STATUS_FILTERS: Array<{
  value: RequestStatusFilter;
  label: string;
  activeClassName: string;
}> = [
  { value: "all", label: "All", activeClassName: "bg-indigo-600 text-white" },
  { value: "pending", label: "Pending", activeClassName: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", activeClassName: "bg-emerald-100 text-emerald-700" },
  { value: "declined", label: "Declined", activeClassName: "bg-rose-100 text-rose-700" },
];

function getDescriptionPreview(description: string | null) {
  if (!description) return null;

  const trimmed = description.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= 16) return trimmed;
  return `${words.slice(0, 16).join(" ")}...`;
}

function formatActivityTime(activityDate: string, timeZone: string | null) {
  return formatInTimeZone(activityDate, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRequestNote(status: SentRequestRow["status"], hostName: string) {
  if (status === "pending") return `Waiting for ${hostName} to review`;
  if (status === "approved") return "You're in";
  return "Request declined";
}

function statusTone(status: SentRequestRow["status"]) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "declined") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function smallStatusTone(status: SentRequestRow["status"]) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "declined") return "bg-gray-100 text-gray-500";
  return "bg-indigo-100 text-indigo-700";
}

function getFilterLabel(status: RequestStatusFilter) {
  return REQUEST_STATUS_FILTERS.find((filter) => filter.value === status)?.label ?? "All";
}

function getFilterHref(status: RequestStatusFilter) {
  return status === "all" ? "/requests" : `/requests?status=${status}`;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string | string[] }>;
}) {
  const supabase = createServiceClient();
  const user = await getRequiredProfile();
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const rawStatus = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams?.status;
  const activeStatus: RequestStatusFilter =
    rawStatus === "pending" || rawStatus === "approved" || rawStatus === "declined"
      ? rawStatus
      : "all";

  const [sentRes, hostedRes] = await Promise.all([
    supabase
      .from("join_requests")
      .select("*, activities(*, poster:profiles!poster_id(*))")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select(
        "*, poster:profiles!poster_id(*), join_requests!activity_id(id, status, requester:profiles!requester_id(*))"
      )
      .eq("poster_id", user.id)
      .order("activity_date", { ascending: true }),
  ]);

  const sentRequests = ((sentRes.data ?? []) as SentRequestRow[]).filter(
    (request) => Boolean(request.activities)
  );
  const hostedActivities = (hostedRes.data ?? []) as ActivityWithAttendees[];
  const visibleSentRequests =
    activeStatus === "all"
      ? sentRequests
      : sentRequests.filter((request) => request.status === activeStatus);
  const visibleIncomingRequests = hostedActivities.reduce(
    (count, activity) =>
      count +
      activity.join_requests.filter((request) =>
        activeStatus === "all" ? true : request.status === activeStatus
      ).length,
    0
  );

  const sentPending = sentRequests.filter((request) => request.status === "pending").length;
  const sentApproved = sentRequests.filter((request) => request.status === "approved").length;
  const incomingPending = hostedActivities.reduce(
    (count, activity) =>
      count + activity.join_requests.filter((request) => request.status === "pending").length,
    0
  );
  const incomingApproved = hostedActivities.reduce(
    (count, activity) =>
      count + activity.join_requests.filter((request) => request.status === "approved").length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
              Request center
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 leading-tight">
              Requests
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-xl">
              Track what you asked to join and what people are asking of you, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 w-full xl:w-auto">
            <div className="rounded-2xl border border-gray-200 bg-white/85 backdrop-blur px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Sent</p>
              <p className="text-2xl font-semibold text-gray-950">{sentRequests.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/85 backdrop-blur px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-semibold text-gray-950">{sentPending + incomingPending}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/85 backdrop-blur px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Approved</p>
              <p className="text-2xl font-semibold text-gray-950">{sentApproved + incomingApproved}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/85 backdrop-blur px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Hosting</p>
              <p className="text-2xl font-semibold text-gray-950">{hostedActivities.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-[24px] border border-gray-200/80 bg-white/80 backdrop-blur p-3">
          <span className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            Filter
          </span>
          {REQUEST_STATUS_FILTERS.map((filter) => {
            const active = activeStatus === filter.value;

            return (
              <Link
                key={filter.value}
                href={getFilterHref(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active ? filter.activeClassName : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
          {activeStatus !== "all" && (
            <Link
              href="/requests"
              className="ml-auto text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear filter
            </Link>
          )}
        </div>

        <div className="grid xl:grid-cols-2 gap-6 items-start">
          <section className="rounded-[32px] border border-gray-200/80 bg-white/85 backdrop-blur p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                  Outgoing
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                  Requests you sent
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {activeStatus === "all"
                  ? `${sentRequests.length} total`
                  : `${visibleSentRequests.length} ${getFilterLabel(activeStatus).toLowerCase()}`}
              </div>
            </div>

            {visibleSentRequests.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <p className="font-semibold text-gray-900 mb-2">
                  {activeStatus === "all"
                    ? "No requests yet"
                    : `No ${getFilterLabel(activeStatus).toLowerCase()} requests`}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {activeStatus === "all"
                    ? "Browse the feed and request to join an activity to start tracking here."
                    : "Try another status filter to see more requests."}
                </p>
                {activeStatus === "all" ? (
                  <Link
                    href="/feed"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    Browse feed
                  </Link>
                ) : (
                  <Link
                    href="/requests"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    Show all
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleSentRequests.map((request) => {
                  const activity = request.activities;
                  const c = getCategoryConfig(activity.category);
                  const gradientClass = getCategoryGradient(activity.category);
                  const timeZone = getStoredLocationTimezone(activity.location);
                  const descriptionPreview = getDescriptionPreview(activity.description);
                  const dateLabel = getDateLabelInTimeZone(activity.activity_date, timeZone);

                  return (
                    <Link
                      key={request.id}
                      href={`/activity/${activity.id}`}
                      className="block group"
                    >
                      <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)]">
                        <div className={`relative h-44 ${gradientClass}`}>
                          {activity.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activity.image_url}
                              alt={activity.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900">
                              {c.emoji} {c.label}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-tight line-clamp-2">
                              {activity.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 md:p-6 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">
                                Requested from
                              </p>
                              <p className="text-sm font-semibold text-gray-950 truncate">
                                {activity.poster.name}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${smallStatusTone(request.status)}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          {descriptionPreview && (
                            <p className="text-sm leading-6 text-gray-600 line-clamp-2">
                              {descriptionPreview}
                            </p>
                          )}

                          <div className="grid gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{dateLabel}</span>
                              <span className="text-gray-300">•</span>
                              <span>{formatActivityTime(activity.activity_date, timeZone)}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span>📍</span>
                              <span className="truncate">{getStoredLocationLabel(activity.location)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                                Status
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {getRequestNote(request.status, activity.poster.name)}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                              View activity →
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-gray-200/80 bg-white/85 backdrop-blur p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-2">
                  Incoming
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-950">
                  Requests on your activities
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {activeStatus === "all"
                  ? `${hostedActivities.length} activities`
                  : `${visibleIncomingRequests} ${getFilterLabel(activeStatus).toLowerCase()} requests`}
              </div>
            </div>

            {hostedActivities.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <p className="font-semibold text-gray-900 mb-2">No hosted activities yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Post an activity to start receiving requests here.
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Post activity
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {hostedActivities.map((activity) => {
                  const c = getCategoryConfig(activity.category);
                  const gradientClass = getCategoryGradient(activity.category);
                  const timeZone = getStoredLocationTimezone(activity.location);
                  const dateLabel = getDateLabelInTimeZone(activity.activity_date, timeZone);
                  const timeLabel = formatActivityTime(activity.activity_date, timeZone);
                  const pendingRequests = activity.join_requests.filter(
                    (request) => request.status === "pending"
                  );
                  const approvedRequests = activity.join_requests.filter(
                    (request) => request.status === "approved"
                  );
                  const filteredRequests =
                    activeStatus === "all"
                      ? activity.join_requests
                      : activity.join_requests.filter(
                          (request) => request.status === activeStatus
                        );

                  return (
                    <article
                      key={activity.id}
                      className="overflow-hidden rounded-[28px] border border-gray-200 bg-white"
                    >
                      <Link href={`/activity/${activity.id}`} className="block group">
                        <div className={`relative h-40 ${gradientClass}`}>
                          {activity.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activity.image_url}
                              alt={activity.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900">
                              {c.emoji} {c.label}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-display text-xl font-semibold text-white leading-tight line-clamp-2">
                              {activity.title}
                            </h3>
                          </div>
                        </div>
                      </Link>

                      <div className="p-5 md:p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>📅</span>
                          <span>{dateLabel}</span>
                          <span className="text-gray-300">•</span>
                          <span>{timeLabel}</span>
                          <span className="text-gray-300">•</span>
                          <span>{activity.spots_available} spots left</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                          <span>📍</span>
                          <span className="truncate">{getStoredLocationLabel(activity.location)}</span>
                        </div>

                        {activity.join_requests.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
                            <p className="text-sm font-medium text-gray-900 mb-1">No requests yet</p>
                            <p className="text-sm text-gray-500">
                              Requests will appear here when people ask to join.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeStatus === "all" && pendingRequests.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                  {pendingRequests.length} pending
                                </span>
                                {approvedRequests.length > 0 && (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {approvedRequests.length} approved
                                  </span>
                                )}
                              </div>
                            )}

                            {activeStatus !== "all" && filteredRequests.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  No {getFilterLabel(activeStatus).toLowerCase()} requests
                                </p>
                                <p className="text-sm text-gray-500">
                                  This activity does not have any requests with that status yet.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {filteredRequests.map((request) => (
                                  <div
                                    key={request.id}
                                    className={`rounded-2xl border p-4 ${
                                      request.status === "pending"
                                        ? "border-indigo-100 bg-indigo-50/40"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                          {request.requester.photo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={request.requester.photo_url}
                                              alt={request.requester.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <span className="text-sm font-semibold text-gray-600">
                                              {request.requester.name.charAt(0)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-gray-950 truncate">
                                            {request.requester.name}
                                          </p>
                                        </div>
                                      </div>
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(request.status)}`}
                                      >
                                        {request.status}
                                      </span>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                      <p className="text-sm text-gray-600">
                                        {request.status === "pending"
                                          ? "Waiting on your decision"
                                          : request.status === "approved"
                                            ? "This person is approved to join"
                                            : "This request has been declined"}
                                      </p>

                                      <div className="flex items-center gap-2">
                                        {request.status === "pending" ? (
                                          <>
                                            <form
                                              action={updateRequestStatus.bind(
                                                null,
                                                request.id,
                                                "approved",
                                                activity.id
                                              )}
                                            >
                                              <button
                                                type="submit"
                                                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                                              >
                                                Approve
                                              </button>
                                            </form>
                                            <form
                                              action={updateRequestStatus.bind(
                                                null,
                                                request.id,
                                                "declined",
                                                activity.id
                                              )}
                                            >
                                              <button
                                                type="submit"
                                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                              >
                                                Decline
                                              </button>
                                            </form>
                                          </>
                                        ) : request.status === "approved" ? (
                                          <form
                                            action={updateRequestStatus.bind(
                                              null,
                                              request.id,
                                              "declined",
                                              activity.id
                                            )}
                                          >
                                            <button
                                              type="submit"
                                              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                            >
                                              Revoke
                                            </button>
                                          </form>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <FAB />
    </div>
  );
}
