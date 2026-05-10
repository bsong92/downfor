"use client";

import { createContext, useContext } from "react";
import type { NotificationItem } from "@/lib/notifications";

const NotificationContext = createContext<NotificationItem[]>([]);

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({
  children,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialNotifications: NotificationItem[];
}) {
  return (
    <NotificationContext.Provider value={initialNotifications}>
      {children}
    </NotificationContext.Provider>
  );
}
