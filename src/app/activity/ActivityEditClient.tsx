"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types/database";
import { updateActivity } from "@/app/actions";
import { CategoryBadge } from "@/components/CategoryBadge";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { getStoredLocationCoordinates, getStoredLocationLabel } from "@/lib/location";
import type { ActivityWithPoster } from "@/types/app";

export function ActivityEditClient({ activity }: { activity: ActivityWithPoster }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityDate = new Date(activity.activity_date);
  const dateStr = activityDate.toISOString().split("T")[0];
  const timeStr = activityDate.toTimeString().slice(0, 5);
  const storedLocation = getStoredLocationCoordinates(activity.location);

  const [form, setForm] = useState({
    category: activity.category,
    title: activity.title,
    description: activity.description || "",
    date: dateStr,
    time: timeStr,
    location: getStoredLocationLabel(activity.location),
    locationLatitude: storedLocation?.latitude ?? null,
    locationLongitude: storedLocation?.longitude ?? null,
    spots: activity.spots_available.toString(),
    is_outdoor: activity.is_outdoor ?? true,
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const result = await updateActivity(activity.id, form);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error ?? "Unable to update activity.");
    }
    setLoading(false);
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
      <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Edit Activity</h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setError(null);
            }}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set("category", cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.category === cat
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">optional</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell people what this activity is about..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <LocationAutocomplete
              label="Location"
              value={form.location}
              latitude={form.locationLatitude}
              longitude={form.locationLongitude}
              placeholder="Where should people meet?"
              helperText="Pick a real place so weather can track it reliably."
              onChange={({ value, latitude, longitude }) =>
                setForm((prev) => ({
                  ...prev,
                  location: value,
                  locationLatitude: latitude,
                  locationLongitude: longitude,
                }))
              }
            />
          </div>

          {/* Spots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spots Available</label>
            <input
              type="number"
              min="1"
              value={form.spots}
              onChange={(e) => set("spots", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>

          {/* Outdoor Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Is this outdoor?</p>
              <p className="text-xs text-gray-500 mt-1">Get weather forecasts for outdoor activities</p>
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

          {/* Buttons */}
          <div className="flex gap-2 pt-2 pb-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
