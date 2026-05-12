"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateRequestStatus } from "@/app/actions";

export function RequestStatusButton({
  requestId,
  activityId,
  status,
  label,
  className = "",
  confirmMessage,
}: {
  requestId: string;
  activityId: string;
  status: "approved" | "declined" | "pending";
  label: string;
  className?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    startTransition(async () => {
      await updateRequestStatus(requestId, status, activityId);
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? "Saving..." : label}
    </button>
  );
}
