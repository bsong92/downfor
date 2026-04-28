"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/create", label: "Post Activity" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useUser();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isSignedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="text-lg font-bold text-indigo-600 tracking-tight">
          downfor
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {hasClerk ? (
            isSignedIn ? (
              <>
                <Link
                  href="/profile"
                  className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Profile
                </Link>
                <div className="ml-1">
                  <UserButton />
                </div>
              </>
            ) : (
              <SignInButton mode="redirect">
                <button className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  Sign in
                </button>
              </SignInButton>
            )
          ) : user ? (
            <Link href="/profile" className="ml-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {user.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-indigo-600">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
