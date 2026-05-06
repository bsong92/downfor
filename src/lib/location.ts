type GeocodingResult = {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
  country?: string;
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

export async function resolveLocation(location: string): Promise<{
  displayLocation: string;
  latitude: number;
  longitude: number;
} | null> {
  for (const candidate of buildLocationCandidates(location)) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&language=en&format=json`
    );

    if (!response.ok) continue;

    const data = await response.json();
    const result = data.results?.[0] as GeocodingResult | undefined;

    if (result) {
      return {
        displayLocation: formatResolvedLocation(result),
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }
  }

  return null;
}
