"use client";

import { createContext, useContext } from "react";
import { MOCK_USER } from "@/lib/mock-user";
import type { Profile } from "@/types/database";

const UserContext = createContext<Profile | null>(MOCK_USER);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: Profile | null;
}) {
  return (
    <UserContext.Provider value={initialUser}>{children}</UserContext.Provider>
  );
}
