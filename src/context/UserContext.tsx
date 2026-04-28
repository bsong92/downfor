"use client";

import { createContext, useContext } from "react";
import type { Profile } from "@/types/database";

const UserContext = createContext<Profile | null>(null);

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
