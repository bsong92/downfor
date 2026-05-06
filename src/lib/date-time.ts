type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function parseDateParts(dateStr: string, timeStr: string): DateParts | null {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? Number(value) : NaN;
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getBrowserTimeZone() {
  if (typeof Intl === "undefined") return "America/Chicago";

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
  } catch {
    return "America/Chicago";
  }
}

export function zonedDateTimeToUtcIso(
  dateStr: string,
  timeStr: string,
  timeZone: string | null | undefined
) {
  const parsed = parseDateParts(dateStr, timeStr);
  if (!parsed) return null;

  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : "America/Chicago";
  let guess = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute)
  );

  for (let i = 0; i < 3; i += 1) {
    const zoned = getZonedParts(guess, zone);
    if (
      Number.isNaN(zoned.year) ||
      Number.isNaN(zoned.month) ||
      Number.isNaN(zoned.day) ||
      Number.isNaN(zoned.hour) ||
      Number.isNaN(zoned.minute)
    ) {
      break;
    }

    const desiredUtc = Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute);
    const observedUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute);
    const delta = desiredUtc - observedUtc;

    if (delta === 0) break;
    guess = new Date(guess.getTime() + delta);
  }

  return guess.toISOString();
}

export function formatInTimeZone(
  dateStr: string,
  timeZone: string | null | undefined,
  options: Intl.DateTimeFormatOptions
) {
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  return new Date(dateStr).toLocaleString("en-US", {
    timeZone: zone,
    ...options,
  });
}

export function getDateKeyInTimeZone(dateStr: string, timeZone: string | null | undefined) {
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const parts = zone ? getZonedParts(new Date(dateStr), zone) : getZonedParts(new Date(dateStr), "UTC");

  if (
    Number.isNaN(parts.year) ||
    Number.isNaN(parts.month) ||
    Number.isNaN(parts.day)
  ) {
    return new Date(dateStr).toISOString().split("T")[0];
  }

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function getDateLabelInTimeZone(
  dateStr: string,
  timeZone: string | null | undefined,
  now = new Date()
) {
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const activityKey = getDateKeyInTimeZone(dateStr, zone);
  const todayKey = getDateKeyInTimeZone(now.toISOString(), zone);
  const tomorrowKey = getDateKeyInTimeZone(new Date(now.getTime() + 86400000).toISOString(), zone);

  if (activityKey === todayKey) return "Today";
  if (activityKey === tomorrowKey) return "Tomorrow";

  return formatInTimeZone(dateStr, zone, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
