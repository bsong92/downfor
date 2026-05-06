import { createServiceClient } from "@/lib/supabase-server";
import { getWeatherForLocation } from "@/lib/weather";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    const { data: activities } = await supabase
      .from("activities")
      .select("id, location, activity_date, is_outdoor")
      .eq("is_outdoor", true)
      .is("weather_data", null);

    let updated = 0;
    let failed = 0;

    for (const activity of activities ?? []) {
      const activityDateStr = activity.activity_date.split("T")[0];
      const weatherData = await getWeatherForLocation(activity.location, activityDateStr);

      if (weatherData) {
        const { error } = await supabase
          .from("activities")
          .update({
            weather_data: weatherData,
            weather_last_updated: new Date().toISOString(),
          })
          .eq("id", activity.id);

        if (!error) {
          updated++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${updated} activities, ${failed} failed`,
      total: activities?.length ?? 0,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
