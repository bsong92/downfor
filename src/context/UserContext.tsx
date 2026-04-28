"use client";

import { createContext, useContext } from "react";
import { MOCK_USER } from "@/lib/mock-user";
import type { Profile } from "@/types/database";

const UserContext = createContext<Profile>(MOCK_USER);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={MOCK_USER}>{children}</UserContext.Provider>
  );
}
