import type { Category } from "@/types/database";

const CATEGORY_ALIASES: Record<string, string> = {
  workout: "fitness",
  golf: "outdoors",
  climbing: "outdoors",
  concerts: "arts-culture",
  movies: "entertainment",
  food: "food-drink",
  study: "learning",
};

export function normalizeCategory(category: string) {
  return CATEGORY_ALIASES[category] ?? category;
}

export function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    fitness: "bg-gradient-to-br from-rose-500 to-orange-400",
    outdoors: "bg-gradient-to-br from-emerald-600 to-lime-400",
    sports: "bg-gradient-to-br from-indigo-700 to-sky-500",
    "food-drink": "bg-gradient-to-br from-amber-500 to-orange-500",
    social: "bg-gradient-to-br from-pink-600 to-fuchsia-500",
    "arts-culture": "bg-gradient-to-br from-violet-700 to-purple-500",
    entertainment: "bg-gradient-to-br from-slate-900 to-slate-600",
    learning: "bg-gradient-to-br from-cyan-700 to-sky-500",
    wellness: "bg-gradient-to-br from-teal-600 to-emerald-400",
    other: "bg-gradient-to-br from-slate-500 to-gray-400",
  };
  const normalized = normalizeCategory(category);
  return gradients[normalized] ?? gradients.other;
}

const config: Record<string, { label: string; emoji: string; classes: string }> = {
  fitness:      { label: "Fitness",      emoji: "💪", classes: "bg-rose-100 text-rose-700" },
  outdoors:     { label: "Outdoors",     emoji: "🌲", classes: "bg-emerald-100 text-emerald-700" },
  sports:       { label: "Sports",       emoji: "🏀", classes: "bg-indigo-100 text-indigo-700" },
  "food-drink":  { label: "Food & Drink", emoji: "🍽️", classes: "bg-amber-100 text-amber-700" },
  social:       { label: "Social",       emoji: "🎉", classes: "bg-pink-100 text-pink-700" },
  "arts-culture": { label: "Arts & Culture", emoji: "🎭", classes: "bg-violet-100 text-violet-700" },
  entertainment:{ label: "Entertainment", emoji: "🎬", classes: "bg-slate-100 text-slate-700" },
  learning:     { label: "Learning",     emoji: "📚", classes: "bg-cyan-100 text-cyan-700" },
  wellness:     { label: "Wellness",     emoji: "🫶", classes: "bg-teal-100 text-teal-700" },
  other:        { label: "Other",        emoji: "✨", classes: "bg-gray-100 text-gray-600" },
};

export function CategoryBadge({ category }: { category: string }) {
  const c = config[normalizeCategory(category)] ?? config.other;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.classes}`}>
      {c.emoji} {c.label}
    </span>
  );
}

export function getCategoryConfig(category: string) {
  return config[normalizeCategory(category)] ?? config.other;
}

export const ALL_CATEGORIES = Object.keys(config) as Category[];
