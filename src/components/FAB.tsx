"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function FAB() {
  const pathname = usePathname();

  // Hide FAB on the create page since we're already there
  if (pathname === "/create") {
    return null;
  }

  return (
    <Link
      href="/create"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200"
    >
      <span className="text-2xl font-bold">+</span>
    </Link>
  );
}
