"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteActivityMessage } from "@/app/actions";
import { useToast } from "@/context/ToastContext";

export function DeleteMessageButton({
  messageId,
  activityId,
  className = "",
  label = "Delete",
  confirmMessage = "Delete this message?",
}: {
  messageId: string;
  activityId: string;
  className?: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { pushToast } = useToast();

  function handleDelete() {
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      await deleteActivityMessage(messageId, activityId);
      pushToast({ title: "Message deleted" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Deleting..." : label}
    </button>
  );
}
