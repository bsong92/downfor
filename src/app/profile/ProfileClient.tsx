"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types/database";
import type { Profile } from "@/types/database";
import { getCategoryConfig } from "@/components/CategoryBadge";
import { updateProfile } from "@/app/actions";

export function ProfileClient({ initialUser }: { initialUser: Profile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initialUser.name,
    bio: initialUser.bio || "",
    photo_url: initialUser.photo_url || "",
    interests: initialUser.interests,
  });

  function set(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(interest: string) {
    set("interests", form.interests.includes(interest)
      ? form.interests.filter((i) => i !== interest)
      : [...form.interests, interest]
    );
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const result = await updateProfile(form);
    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error ?? "Unable to update profile.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
      {!isEditing ? (
        /* View mode */
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 overflow-hidden shrink-0">
                {form.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo_url} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  form.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">{form.name}</h1>
                <p className="text-sm text-gray-500">{initialUser.email}</p>
                {form.bio && <p className="text-sm text-gray-600 mt-2">{form.bio}</p>}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Edit
            </button>
          </div>

          {form.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.interests.map((interest) => {
                const c = getCategoryConfig(interest);
                return (
                  <div key={interest} className="px-2.5 py-1 rounded-full bg-indigo-50 text-sm text-indigo-700">
                    {c.emoji} {c.label}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Edit mode */
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio <span className="text-gray-400 font-normal">optional</span>
              </label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo URL <span className="text-gray-400 font-normal">optional</span>
              </label>
              <input
                type="url"
                value={form.photo_url}
                onChange={(e) => set("photo_url", e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const c = getCategoryConfig(cat);
                  const selected = form.interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setForm({
                    name: initialUser.name,
                    bio: initialUser.bio || "",
                    photo_url: initialUser.photo_url || "",
                    interests: initialUser.interests,
                  });
                }}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
