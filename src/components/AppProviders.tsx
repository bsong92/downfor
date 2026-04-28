"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";
import type { Profile } from "@/types/database";

function hasClerkPublishableKey() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function AppProviders({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: Profile | null;
}) {
  const content = <UserProvider initialUser={initialUser}>{children}</UserProvider>;

  if (!hasClerkPublishableKey()) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
