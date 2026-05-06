"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CATEGORIES } from "@/types/database";
import { getCategoryConfig, getCategoryGradient } from "@/components/CategoryBadge";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { createActivity, uploadActivityPhoto } from "@/app/actions";
import { formatInTimeZone, getBrowserTimeZone } from "@/lib/date-time";
import { getStoredLocationLabel } from "@/lib/location";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [timeZone, setTimeZone] = useState("America/Chicago");
  const [form, setForm] = useState({
    category: "fitness",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    locationLatitude: null as number | null,
    locationLongitude: null as number | null,
    locationTimezone: "America/Chicago",
    spots: "2",
    is_outdoor: true,
  });

  useEffect(() => {
    const browserTimeZone = getBrowserTimeZone();
    setTimeZone(browserTimeZone);
    setForm((prev) => ({
      ...prev,
      locationTimezone: browserTimeZone,
    }));
  }, []);

  function set(field: string, value: string | boolean) {
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
        category: form.category,
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        location: form.location,
        locationLatitude: form.locationLatitude,
        locationLongitude: form.locationLongitude,
        locationTimezone: form.locationTimezone || timeZone,
        spots: form.spots,
        is_outdoor: form.is_outdoor,
        image_url: coverPhotoUrl || undefined,
      });

      if (result.success) {
        router.push("/feed");
        return;
      }

      setError(result.error ?? "Unable to post activity.");
      setLoading(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to post activity."
      );
      setLoading(false);
    }
  }

  const spotsValue = parseInt(form.spots, 10) || 0;
  const gradientClass = getCategoryGradient(form.category);
  const defaultGradient = "bg-gradient-to-br from-indigo-500 to-purple-600";
  const previewLocation = form.location ? getStoredLocationLabel(form.location) : "Choose a place";
  const previewTime =
    form.date && form.time
      ? formatInTimeZone(`${form.date}T${form.time}:00`, form.locationTimezone || timeZone, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Date and time";
  const previewDescription = form.description.trim()
    ? form.description.trim().split(/\s+/).slice(0, 18).join(" ")
    : "Add a short description so people know what to expect.";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-[1500px] w-full mx-auto px-4 lg:px-6 py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_380px] items-start">
          <div className="space-y-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
                Post activity
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 leading-tight">
                What are you doing?
              </h1>
              <p className="text-gray-500 mt-3 text-base max-w-xl">
                Post something people can actually join, with a place, time, and a little context.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white/85 backdrop-blur rounded-[30px] border border-gray-200/80 shadow-[0_30px_80px_rgba(17,24,39,0.08)] overflow-hidden">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-56 cursor-pointer transition-transform hover:scale-[1.01] ${
                    coverPhotoUrl ? "" : gradientClass || defaultGradient
                  }`}
                >
                  {coverPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPhotoUrl}
                      alt="Cover"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    {uploadingCover ? (
                      <span className="text-sm font-medium">Uploading...</span>
                    ) : (
                      <>
                        <span className="text-4xl mb-2">📷</span>
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

                <div className="p-6 md:p-8 space-y-6">
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
                            className={`px-4 py-3 rounded-full text-sm font-semibold transition-all ${
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

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Picnic at Millennium Park"
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        maxLength={60}
                        className="w-full font-display text-4xl md:text-5xl font-semibold text-gray-950 bg-transparent placeholder:text-gray-400 focus:outline-none leading-tight"
                      />
                      <div className="text-xs text-gray-400 mt-2">{form.title.length}/60</div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        Audience
                      </p>
                      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-3">
                        <button
                          type="button"
                          onClick={() => set("spots", Math.max(1, spotsValue - 1).toString())}
                          className="w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-bold text-gray-600"
                        >
                          −
                        </button>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-950">{spotsValue}</div>
                          <div className="text-[11px] uppercase tracking-wide text-gray-500">
                            spots
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => set("spots", Math.min(20, spotsValue + 1).toString())}
                          className="w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-bold text-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        When
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          required
                          value={form.date}
                          onChange={(e) => set("date", e.target.value)}
                          className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <input
                          type="time"
                          required
                          value={form.time}
                          onChange={(e) => set("time", e.target.value)}
                          className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        Outdoor
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Is this outdoor?</p>
                          <p className="text-xs text-gray-500 mt-1">
                            We&apos;ll surface weather and recommendations.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set("is_outdoor", !form.is_outdoor)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            form.is_outdoor ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              form.is_outdoor ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-gray-50 p-4">
                    <LocationAutocomplete
                      label="Where"
                      value={form.location}
                      latitude={form.locationLatitude}
                      longitude={form.locationLongitude}
                      placeholder="Jackson Park, a coffee shop, a gym..."
                      helperText="Pick a real place so weather can use map coordinates."
                      onChange={({ value, latitude, longitude, timezone }) =>
                        setForm((prev) => ({
                          ...prev,
                          location: value,
                          locationLatitude: latitude,
                          locationLongitude: longitude,
                          locationTimezone: timezone || prev.locationTimezone || timeZone,
                        }))
                      }
                    />
                  </div>

                  {!showDescription ? (
                    <button
                      type="button"
                      onClick={() => setShowDescription(true)}
                      className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
                    >
                      + Add description (optional)
                    </button>
                  ) : (
                    <div className="rounded-3xl bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        Details
                      </p>
                      <textarea
                        rows={4}
                        placeholder="Any details people should know?"
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
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

                  <button
                    type="submit"
                    disabled={loading || uploadingCover || !form.title || !form.date || !form.time || !form.location}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-200"
                  >
                    {loading ? "Posting..." : "Post activity"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="hidden lg:block sticky top-24">
            <div className="rounded-[30px] border border-gray-200/80 bg-white/85 backdrop-blur shadow-[0_25px_70px_rgba(17,24,39,0.08)] overflow-hidden">
              <div className={`relative h-44 ${coverPhotoUrl ? "" : gradientClass || defaultGradient}`}>
                {coverPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPhotoUrl}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 right-4">
                  <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 mb-3">
                    Live preview
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-white leading-tight line-clamp-2">
                    {form.title || "Your activity title"}
                  </h2>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 gap-4">
                  <span className="truncate">📍 {previewLocation}</span>
                  <span className="flex-shrink-0">{previewTime}</span>
                </div>

                <p className="text-sm leading-6 text-gray-600">
                  {previewDescription}
                </p>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    What people will see
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• A clear place picked with autocomplete</li>
                    <li>• Weather and recommendation support</li>
                    <li>• A cleaner desktop-friendly card layout</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
