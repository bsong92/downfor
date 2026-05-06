type GeocodingResult = {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
  country?: string;
  timezone?: string;
};

export type ResolvedLocation = {
  label: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

type EncodedLocation = {
  label: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

function buildLocationCandidates(location: string): string[] {
  const trimmed = location.trim();
  const candidates = [
    trimmed,
    `${trimmed}, Chicago, IL`,
    `${trimmed}, Chicago`,
    "Chicago, IL",
  ];

  return Array.from(
    new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))
  );
}

function formatResolvedLocation(result: GeocodingResult) {
  return [result.name, result.admin1, result.country]
    .filter(Boolean)
    .join(", ");
}

export function encodeStoredLocation(
  label: string,
  latitude: number | null,
  longitude: number | null,
  timezone?: string | null
) {
  if (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  ) {
    const payload: EncodedLocation = {
      label: label.trim(),
      latitude,
      longitude,
    };

    if (timezone) {
      payload.timezone = timezone.trim();
    }

    return JSON.stringify(payload);
  }

  return label.trim();
}

export function decodeStoredLocation(raw: string): ResolvedLocation | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<EncodedLocation>;
      if (
        typeof parsed.label === "string" &&
        typeof parsed.latitude === "number" &&
        typeof parsed.longitude === "number"
      ) {
        return {
          label: parsed.label,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          timezone:
            typeof parsed.timezone === "string" && parsed.timezone.trim()
              ? parsed.timezone.trim()
              : undefined,
        };
      }
    } catch {
      // Fall through to plain-text handling.
    }
  }

  return null;
}

export function getStoredLocationLabel(raw: string) {
  return decodeStoredLocation(raw)?.label ?? raw;
}

export function getStoredLocationCoordinates(raw: string) {
  const decoded = decodeStoredLocation(raw);
  if (!decoded) return null;

  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude,
  };
}

export function getStoredLocationTimezone(raw: string) {
  return decodeStoredLocation(raw)?.timezone ?? null;
}

export async function searchLocationSuggestions(
  query: string,
  count = 6
): Promise<ResolvedLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`
  );

  if (!response.ok) return [];

  const data = await response.json();
  const results = (data.results ?? []) as GeocodingResult[];

  return results.map((result) => ({
    label: formatResolvedLocation(result),
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: typeof result.timezone === "string" ? result.timezone : undefined,
  }));
}

export async function resolveLocation(location: string): Promise<ResolvedLocation | null> {
  for (const candidate of buildLocationCandidates(location)) {
    const suggestions = await searchLocationSuggestions(candidate, 1);
    const result = suggestions[0];

    if (result) {
      return {
        label: result.label,
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone,
      };
    }
  }

  return null;
}
