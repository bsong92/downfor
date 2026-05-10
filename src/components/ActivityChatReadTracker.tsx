"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markActivityChatRead } from "@/app/actions";

export function ActivityChatReadTracker({
  activityId,
  shouldMark,
}: {
  activityId: string;
  shouldMark: boolean;
}) {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!shouldMark || hasRun.current) return;

    hasRun.current = true;
    void markActivityChatRead(activityId)
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        hasRun.current = false;
      });
  }, [activityId, router, shouldMark]);

  return null;
}
