"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CATEGORIES } from "@/types/database";
import { getCategoryConfig, getCategoryGradient } from "@/components/CategoryBadge";
import { createActivity, uploadActivityPhoto } from "@/app/actions";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [form, setForm] = useState({
    category: "workout",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    spots: "2",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);

    const result = await uploadActivityPhoto(file);
    if (result.success && result.photoUrl) {
      setCoverPhotoUrl(result.photoUrl);
    } else {
      setError(result.error ?? "Unable to upload photo.");
    }
    setUploadingCover(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createActivity({
        ...form,
        image_url: coverPhotoUrl || undefined,
      });
      if (result.success) {
        router.push("/feed");
        return;
      }

      setError(result.error ?? "Unable to post activity.");
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to post activity.");
      setLoading(false);
    }
  }

  const spotsValue = parseInt(form.spots, 10) || 0;
  const gradientClass = getCategoryGradient(form.category);
  const defaultGradient = "bg-gradient-to-br from-indigo-500 to-purple-600";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">What are you doing?</h1>
          <p className="text-gray-500 mt-1">Post an activity and find people to join</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pb-40">
          {/* Cover Photo Section */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative mx-0 h-48 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
              coverPhotoUrl ? "" : gradientClass || defaultGradient
            }`}
          >
            {coverPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPhotoUrl}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white">
              {uploadingCover ? (
                <span className="text-sm font-medium">Uploading...</span>
              ) : (
                <>
                  <span className="text-3xl mb-1">📷</span>
                  <span className="text-sm font-medium opacity-90">
                    {coverPhotoUrl ? "Change photo" : "Add cover photo (optional)"}
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Category Section */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Pick a category
            </p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const c = getCategoryConfig(cat);
                const selected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set("category", cat)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      selected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-lg mr-1">{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Section */}
          <div>
            <input
              type="text"
              required
              placeholder="Pickup basketball at 6pm"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={60}
              className="w-full text-3xl font-bold text-gray-900 bg-transparent placeholder:text-gray-400 focus:outline-none"
            />
            <div className="text-xs text-gray-400 mt-2">{form.title.length}/60</div>
          </div>

          {/* Date & Time Section */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">When</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Where
            </p>
            <input
              type="text"
              required
              placeholder="Jackson Park, gym, coffee shop..."
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Spots Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              How many spots?
            </p>
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-2">
              <button
                type="button"
                onClick={() => set("spots", Math.max(1, spotsValue - 1).toString())}
                className="w-12 h-12 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-bold text-gray-600"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900">{spotsValue}</span>
              <button
                type="button"
                onClick={() => set("spots", Math.min(20, spotsValue + 1).toString())}
                className="w-12 h-12 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-bold text-gray-600"
              >
                +
              </button>
            </div>
          </div>

          {/* Description - Collapsible */}
          {!showDescription ? (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              + Add description (optional)
            </button>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Details
              </p>
              <textarea
                rows={3}
                placeholder="Any details people should know?"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              <button
                type="button"
                onClick={() => setShowDescription(false)}
                className="text-xs text-gray-400 hover:text-gray-600 mt-2"
              >
                Hide
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={loading || uploadingCover || !form.title || !form.date || !form.time || !form.location}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200"
          >
            {loading ? "Posting..." : "Post activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
