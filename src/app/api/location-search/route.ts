import { searchLocationSuggestions } from "@/lib/location";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const rateLimit = checkRateLimit(`location-search:${clientIp}`, {
    limit: 30,
    windowMs: 60_000,
  });

  if (query.length < 2) {
    return Response.json({ results: [] });
  }

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many location searches. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
        },
      }
    );
  }

  const results = await searchLocationSuggestions(query, 6);
  return Response.json(
    { results },
    {
      headers: {
        "X-RateLimit-Limit": "30",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
      },
    }
  );
}
