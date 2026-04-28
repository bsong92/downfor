import Link from "next/link";
import { hasClerkCredentials } from "@/lib/current-user";

const examples = [
  { emoji: "⛳", text: "9 holes Saturday — anyone down?" },
  { emoji: "🎬", text: "Catching the new movie tonight — join?" },
  { emoji: "💪", text: "Morning run along the lake — come along" },
  { emoji: "🍜", text: "Trying that new ramen spot — who's in?" },
];

export default function LandingPage() {
  const primaryHref = hasClerkCredentials() ? "/sign-in" : "/feed";

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="text-lg font-bold text-indigo-600 tracking-tight">downfor</span>
        <Link
          href={primaryHref}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Sign in
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Who&apos;s{" "}
            <span className="text-indigo-600">down?</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 leading-relaxed">
            Post what you&apos;re doing and let people come to you — no group
            chat blasts, no awkward one-by-ones.
          </p>

          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors"
          >
            {hasClerkCredentials() ? "Sign in with Google →" : "See what&apos;s happening →"}
          </Link>
        </div>

        <div className="mt-16 w-full max-w-sm space-y-3">
          {examples.map((ex) => (
            <div
              key={ex.text}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left"
            >
              <span className="text-2xl">{ex.emoji}</span>
              <span className="text-sm text-gray-600">{ex.text}</span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-gray-400">
          For trusted circles. No strangers, no pressure.
        </p>
      </div>
    </main>
  );
}
