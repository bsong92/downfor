import type { Category } from "@/types/database";

export function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    workout: "bg-gradient-to-br from-blue-600 to-cyan-400",
    golf: "bg-gradient-to-br from-green-700 to-emerald-400",
    concerts: "bg-gradient-to-br from-purple-700 to-pink-500",
    climbing: "bg-gradient-to-br from-orange-600 to-amber-400",
    movies: "bg-gradient-to-br from-slate-800 to-slate-600",
    food: "bg-gradient-to-br from-red-600 to-orange-400",
    sports: "bg-gradient-to-br from-indigo-700 to-blue-500",
    study: "bg-gradient-to-br from-teal-700 to-cyan-500",
    other: "bg-gradient-to-br from-slate-500 to-gray-400",
  };
  return gradients[category] ?? gradients.other;
}

const config: Record<string, { label: string; emoji: string; classes: string }> = {
  workout:  { label: "Workout",  emoji: "💪", classes: "bg-green-100 text-green-700" },
  golf:     { label: "Golf",     emoji: "⛳", classes: "bg-emerald-100 text-emerald-700" },
  concerts: { label: "Concerts", emoji: "🎵", classes: "bg-purple-100 text-purple-700" },
  climbing: { label: "Climbing", emoji: "🧗", classes: "bg-orange-100 text-orange-700" },
  movies:   { label: "Movies",   emoji: "🎬", classes: "bg-blue-100 text-blue-700" },
  food:     { label: "Food",     emoji: "🍜", classes: "bg-red-100 text-red-700" },
  sports:   { label: "Sports",   emoji: "🏀", classes: "bg-yellow-100 text-yellow-700" },
  study:    { label: "Study",    emoji: "📚", classes: "bg-cyan-100 text-cyan-700" },
  other:    { label: "Other",    emoji: "✨", classes: "bg-gray-100 text-gray-600" },
};

export function CategoryBadge({ category }: { category: string }) {
  const c = config[category] ?? config.other;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.classes}`}>
      {c.emoji} {c.label}
    </span>
  );
}

export function getCategoryConfig(category: string) {
  return config[category] ?? config.other;
}

export const ALL_CATEGORIES = Object.keys(config) as Category[];
