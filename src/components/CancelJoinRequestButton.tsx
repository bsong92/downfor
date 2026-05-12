"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelJoinRequest } from "@/app/actions";
import { useToast } from "@/context/ToastContext";

export function CancelJoinRequestButton({
  activityId,
  className = "",
  label = "Cancel request",
}: {
  activityId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { pushToast } = useToast();

  function handleCancel() {
    startTransition(async () => {
      await cancelJoinRequest(activityId);
      pushToast({ title: "Request canceled" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Canceling..." : label}
    </button>
  );
}
