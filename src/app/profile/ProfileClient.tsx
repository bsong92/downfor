"use client";

import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/types/database";
import type { Profile } from "@/types/database";
import { getCategoryConfig } from "@/components/CategoryBadge";
import { updateProfile, uploadProfilePhoto } from "@/app/actions";

const STORAGE_KEY = "profile-draft";

export function ProfileClient({ initialUser }: { initialUser: Profile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [form, setForm] = useState({
    name: initialUser.name,
    bio: initialUser.bio || "",
    photo_url: initialUser.photo_url || "",
    interests: initialUser.interests,
    public_profile: initialUser.public_profile,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setForm(parsed);
        console.log("Loaded draft from localStorage:", parsed);
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  }, []);

  // Log form state whenever it changes
  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);

  // Save form to localStorage whenever it changes (only while editing)
  useEffect(() => {
    if (!isEditing) return;
    try {
      const serialized = JSON.stringify(form);
      localStorage.setItem(STORAGE_KEY, serialized);
      console.log("Saved form to localStorage:", form);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [form, isEditing]);

  function set(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(interest: string) {
    set("interests", form.interests.includes(interest)
      ? form.interests.filter((i) => i !== interest)
      : [...form.interests, interest]
    );
  }

  function addCustomInterest(interest: string) {
    const trimmed = interest.trim().toLowerCase();
    if (trimmed && !form.interests.includes(trimmed)) {
      set("interests", [...form.interests, trimmed]);
    }
    setCustomInterestInput("");
  }

  function removeInterest(interest: string) {
    set("interests", form.interests.filter((i) => i !== interest));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    const result = await uploadProfilePhoto(file);
    if (result.success && result.photoUrl) {
      set("photo_url", result.photoUrl);
    } else {
      setError(result.error ?? "Unable to upload photo.");
    }
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    console.log("Saving form to database:", form);
    const result = await updateProfile(form);
    console.log("Save result:", result);

    if (result.success) {
      localStorage.removeItem(STORAGE_KEY);
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

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo <span className="text-gray-400 font-normal">optional</span>
              </label>
              <div className="flex items-center gap-3">
                {form.photo_url && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photo_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? "Uploading..." : "Choose Photo"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>

              {/* Predefined interests */}
              <div className="flex gap-2 flex-wrap mb-3">
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

              {/* Custom interests display */}
              {form.interests.some((i) => !CATEGORIES.includes(i as any)) && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {form.interests
                    .filter((i) => !CATEGORIES.includes(i as any))
                    .map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
                      >
                        {interest} ✕
                      </button>
                    ))}
                </div>
              )}

              {/* Custom interest input */}
              <input
                type="text"
                value={customInterestInput}
                onChange={(e) => setCustomInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomInterest(customInterestInput);
                  }
                }}
                placeholder="Type interest and press Enter to add custom ones"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <input
                type="checkbox"
                id="public-profile"
                checked={form.public_profile}
                onChange={(e) => set("public_profile", e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="public-profile" className="flex-1 cursor-pointer">
                <p className="text-sm font-medium text-gray-900">Show on Members page</p>
                <p className="text-xs text-gray-500">Other users can see your profile</p>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || uploadingPhoto}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setCustomInterestInput("");
                  // Revert to saved values, but keep localStorage for next time
                  setForm({
                    name: initialUser.name,
                    bio: initialUser.bio || "",
                    photo_url: initialUser.photo_url || "",
                    interests: initialUser.interests,
                    public_profile: initialUser.public_profile,
                  });
                }}
                disabled={loading || uploadingPhoto}
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
