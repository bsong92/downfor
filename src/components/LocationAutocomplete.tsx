"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredLocationLabel } from "@/lib/location";

export type LocationSelection = {
  label: string;
  latitude: number;
  longitude: number;
};

type LocationAutocompleteProps = {
  label: string;
  value: string;
  latitude: number | null;
  longitude: number | null;
  placeholder: string;
  helperText: string;
  onChange: (next: {
    value: string;
    latitude: number | null;
    longitude: number | null;
  }) => void;
};

export function LocationAutocomplete({
  label,
  value,
  latitude,
  longitude,
  placeholder,
  helperText,
  onChange,
}: LocationAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(getStoredLocationLabel(value));
  const [suggestions, setSuggestions] = useState<LocationSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(getStoredLocationLabel(value));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/location-search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        setSuggestions((data.results ?? []).slice(0, 6));
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  function selectLocation(selection: LocationSelection) {
    setQuery(selection.label);
    onChange({
      value: selection.label,
      latitude: selection.latitude,
      longitude: selection.longitude,
    });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
        {label}
      </label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          onChange({ value: next, latitude: null, longitude: null });
        }}
        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <p className="mt-2 text-xs text-gray-500">{helperText}</p>

      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching places...</div>
          )}
          {!loading &&
            suggestions.map((selection) => (
              <button
                key={`${selection.label}-${selection.latitude}-${selection.longitude}`}
                type="button"
                onClick={() => selectLocation(selection)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">{selection.label}</p>
                <p className="text-xs text-gray-500">
                  {selection.latitude.toFixed(4)}, {selection.longitude.toFixed(4)}
                </p>
              </button>
            ))}
        </div>
      )}

      {latitude !== null && longitude !== null && (
        <p className="mt-2 text-xs text-emerald-700">
          Selected coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
}
