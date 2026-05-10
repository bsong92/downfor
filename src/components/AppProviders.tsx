"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { CLERK_ALLOWED_ORIGINS } from "@/lib/clerk-origins";
import type { NotificationItem } from "@/lib/notifications";
import type { Profile } from "@/types/database";

function hasClerkPublishableKey() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function AppProviders({
  children,
  initialUser,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialUser: Profile | null;
  initialNotifications: NotificationItem[];
}) {
  const content = (
    <NotificationProvider initialNotifications={initialNotifications}>
      <UserProvider initialUser={initialUser}>{children}</UserProvider>
    </NotificationProvider>
  );

  if (!hasClerkPublishableKey()) {
    return content;
  }

  return <ClerkProvider allowedRedirectOrigins={CLERK_ALLOWED_ORIGINS}>{content}</ClerkProvider>;
}
