"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";

const toneClasses = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  gray: "bg-gray-50 text-gray-700 border-gray-100",
} as const;

export function NotificationBell() {
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("downfor-notification-read-ids");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          setReadIds(parsed.filter((value): value is string => typeof value === "string"));
        }
      } catch {
        // Ignore malformed local state.
      }
    }
  }, []);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !readIds.includes(notification.id)),
    [notifications, readIds]
  );

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function markRead(notificationId: string) {
    setReadIds((current) => {
      if (current.includes(notificationId)) return current;

      const next = [...current, notificationId];
      window.localStorage.setItem("downfor-notification-read-ids", JSON.stringify(next));
      return next;
    });
  }

  function toggleOpen() {
    setOpen((value) => !value);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative inline-flex items-center justify-center rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <span className="text-lg">🔔</span>
        {unreadNotifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadNotifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Notifications
              </p>
              <p className="text-sm text-gray-500">
                {unreadNotifications.length
                  ? `${unreadNotifications.length} unread item${unreadNotifications.length === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-gray-900">No notifications yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  New requests, approvals, and chat messages will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const isRead = readIds.includes(notification.id);

                  return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markRead(notification.id);
                      setOpen(false);
                    }}
                    className={`block rounded-2xl border px-4 py-3 transition-colors hover:shadow-sm ${
                      isRead ? "opacity-60" : ""
                    } ${toneClasses[notification.tone]}`}
                  >
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-sm opacity-80">{notification.subtitle}</p>
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
