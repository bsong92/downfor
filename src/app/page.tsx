import Link from "next/link";
import { hasClerkCredentials } from "@/lib/current-user";
import { Brand } from "@/components/Brand";

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
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Brand href="/feed" iconSize="h-10 w-10" textSize="text-xl" />
        <Link
          href={primaryHref}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Sign in
        </Link>
      </header>

      <div className="flex-1 px-6 py-14 lg:py-16">
        <div className="max-w-7xl mx-auto grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700 mb-5">
              DownFor
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[0.95] mb-5">
              Who&apos;s{" "}
              <span className="text-indigo-600">down?</span>
            </h1>
            <p className="max-w-xl text-xl text-gray-500 mb-8 leading-relaxed">
              Post what you&apos;re doing and let people come to you. Skip the
              noisy group chat and get straight to who actually wants in.
            </p>

            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors"
            >
              {hasClerkCredentials() ? "Sign in with Google →" : "See what&apos;s happening →"}
            </Link>
          </div>

          <div className="space-y-3">
            <div className="rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] p-4">
              <div className="flex items-center gap-3 mb-4">
                <Brand href="/feed" iconSize="h-12 w-12" textSize="text-2xl" />
              </div>
              <div className="space-y-3">
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
            </div>
            <p className="text-xs text-gray-400">
              For trusted circles. No strangers, no pressure.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
