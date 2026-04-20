export type RoundingDirection = "up" | "down" | "nearest";

export interface RoundingConfig {
  enabled: boolean;
  minutes: number;
  direction: RoundingDirection;
}

export function roundDuration(
  durationMs: number,
  minutes: number,
  direction: RoundingDirection
): number {
  const durationMinutes = durationMs / (1000 * 60);
  const roundedMinutes = Math[
    direction === "up"
      ? "ceil"
      : direction === "down"
      ? "floor"
      : "round"
  ](durationMinutes / minutes) * minutes;

  return roundedMinutes * 1000 * 60;
}

export function applyRounding(
  entry: { duration: number; rounded?: any },
  config: RoundingConfig
): { duration: number; rounded: any | undefined } {
  if (!config.enabled || config.minutes <= 0) {
    return { duration: entry.duration, rounded: undefined };
  }

  const roundedDuration = roundDuration(entry.duration, config.minutes, config.direction);

  return {
    duration: roundedDuration,
    rounded: {
      originalDuration: entry.duration,
      roundedDuration,
      minutes: config.minutes,
      direction: config.direction,
    },
  };
}

export function formatDurationDisplay(
  durationMs: number,
  rounded?: { originalDuration: number; roundedDuration: number; minutes: number; direction: RoundingDirection }
): { primary: string; secondary?: string } {
  const displayDuration = rounded ? rounded.roundedDuration : durationMs;
  const primary = formatHHMM(displayDuration);

  if (rounded && rounded.originalDuration !== rounded.roundedDuration) {
    const secondary = `Original: ${formatHHMM(rounded.originalDuration)}`;
    return { primary, secondary };
  }

  return { primary };
}

export function formatHHMM(ms: number): string {
  const totalMinutes = Math.round(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatDecimalHours(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  return `${hours.toFixed(2)}h`;
}

export function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
