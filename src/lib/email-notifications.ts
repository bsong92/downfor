import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

type NotificationProfile = {
  id: string;
  name: string;
  email: string;
  email_notifications_chat: boolean;
  email_notifications_requests: boolean;
};

function buildActivityUrl(activityId: string) {
  return `${process.env.DOWNFOR_API_URL ?? "https://downfor.vercel.app"}/activity/${activityId}`;
}

function previewText(body: string) {
  const trimmed = body.trim();
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}...`;
}

export async function sendRequestStatusNotification(
  supabase: SupabaseClient,
  input: { activityId: string; requestId: string; newStatus: "approved" | "declined" }
) {
  const { data: request } = await supabase
    .from("join_requests")
    .select(
      "id, status, requester:profiles!requester_id(id, name, email, email_notifications_requests), activities(id, title)"
    )
    .eq("id", input.requestId)
    .maybeSingle();

  const recipient = request?.requester as NotificationProfile | undefined;
  const activity = request?.activities as { id: string; title: string } | undefined;

  if (!recipient || !activity) {
    return;
  }

  if (!recipient.email_notifications_requests) {
    return;
  }

  const subject =
    input.newStatus === "approved"
      ? `You're in: ${activity.title}`
      : `Update on ${activity.title}`;

  const text =
    input.newStatus === "approved"
      ? [
          `Your request to join "${activity.title}" was approved.`,
          `Open the activity: ${buildActivityUrl(activity.id)}`,
        ].join("\n\n")
      : [
          `Your request to join "${activity.title}" was declined.`,
          `Open the activity: ${buildActivityUrl(activity.id)}`,
        ].join("\n\n");

  await sendEmail({
    to: recipient.email,
    subject,
    text,
  });
}

export async function sendNewJoinRequestNotification(
  supabase: SupabaseClient,
  input: { activityId: string; requesterId: string }
) {
  const { data: activity } = await supabase
    .from("activities")
    .select(
      "id, title, poster:profiles!poster_id(id, name, email, email_notifications_requests)"
    )
    .eq("id", input.activityId)
    .maybeSingle();

  if (!activity) return;

  const posterRaw = Array.isArray(activity.poster) ? activity.poster[0] : activity.poster;
  const poster = posterRaw as NotificationProfile | undefined;

  if (!poster || !poster.email_notifications_requests) {
    return;
  }

  if (poster.id === input.requesterId) {
    return;
  }

  const subject = `New request for ${activity.title}`;
  const text = [
    `Someone requested to join "${activity.title}".`,
    `Open the activity: ${buildActivityUrl(activity.id)}`,
  ].join("\n\n");

  await sendEmail({
    to: poster.email,
    subject,
    text,
  });
}

export async function sendChatMessageNotifications(
  supabase: SupabaseClient,
  input: { activityId: string; senderId: string; body: string }
) {
  const { data: activity } = await supabase
    .from("activities")
    .select(
      "id, title, poster:profiles!poster_id(id, name, email, email_notifications_chat), join_requests!activity_id(status, requester_id, requester:profiles!requester_id(id, name, email, email_notifications_chat))"
    )
    .eq("id", input.activityId)
    .maybeSingle();

  if (!activity) return;

  const recipients = new Map<string, NotificationProfile>();

  const posterRaw = Array.isArray(activity.poster) ? activity.poster[0] : activity.poster;
  const poster = posterRaw as NotificationProfile | undefined;
  if (poster && poster.id !== input.senderId && poster.email_notifications_chat) {
    recipients.set(poster.id, poster);
  }

  for (const request of (activity.join_requests ?? []) as Array<{
    status: "pending" | "approved" | "declined";
    requester_id: string;
    requester: NotificationProfile | NotificationProfile[];
  }>) {
    if (request.status !== "approved") continue;

    const requesterRaw = Array.isArray(request.requester)
      ? request.requester[0]
      : request.requester;
    const requester = requesterRaw as NotificationProfile | undefined;
    if (
      requester &&
      requester.id !== input.senderId &&
      requester.email_notifications_chat
    ) {
      recipients.set(requester.id, requester);
    }
  }

  if (!recipients.size) return;

  const subject = `New message in ${activity.title}`;
  const text = [
    `You have a new message in "${activity.title}".`,
    `Message preview: ${previewText(input.body)}`,
    `Open the chat: ${buildActivityUrl(input.activityId)}#activity-chat`,
  ].join("\n\n");

  await Promise.allSettled(
    [...recipients.values()].map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject,
        text,
      })
    )
  );
}
