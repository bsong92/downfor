import { searchLocationSuggestions } from "@/lib/location";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ results: [] });
  }

  const results = await searchLocationSuggestions(query, 6);
  return Response.json({ results });
}
