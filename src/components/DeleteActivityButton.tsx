"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteActivity } from "@/app/actions";
import { useToast } from "@/context/ToastContext";

export function DeleteActivityButton({
  activityId,
  className = "",
  label = "Delete activity",
  confirmMessage = "Delete this activity and all of its requests/messages?",
}: {
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
      await deleteActivity(activityId);
      pushToast({ title: "Activity deleted" });
      router.push("/feed");
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
