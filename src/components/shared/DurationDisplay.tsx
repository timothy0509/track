import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoundingDirection, formatDurationDisplay, formatDecimalHours, formatHHMMSS } from "@/lib/rounding";
import { Clock } from "lucide-react";

interface DurationDisplayProps {
  durationMs: number;
  rounded?: {
    originalDuration: number;
    roundedDuration: number;
    minutes: number;
    direction: RoundingDirection;
  };
  format?: "hhmm" | "decimal" | "hhmmss";
  showRounded?: boolean;
}

export function DurationDisplay({
  durationMs,
  rounded,
  format = "hhmm",
  showRounded = true,
}: DurationDisplayProps) {
  const display = formatDurationDisplay(durationMs, showRounded ? rounded : undefined);

  const formatValue = (ms: number): string => {
    switch (format) {
      case "decimal":
        return formatDecimalHours(ms);
      case "hhmmss":
        return formatHHMMSS(ms);
      default:
        return display.primary;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <span className="font-mono">{formatValue(rounded ? rounded.roundedDuration : durationMs)}</span>
            {rounded && rounded.originalDuration !== rounded.roundedDuration && (
              <span className="text-xs text-muted-foreground">
                ({formatValue(rounded.originalDuration)})
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Duration Details</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>{" "}
              {formatHHMMSS(rounded ? rounded.roundedDuration : durationMs)}
            </div>
            <div>
              <span className="text-muted-foreground">Decimal:</span>{" "}
              {formatDecimalHours(rounded ? rounded.roundedDuration : durationMs)}
            </div>
            {rounded && rounded.originalDuration !== rounded.roundedDuration && (
              <>
                <div>
                  <span className="text-muted-foreground">Original:</span>{" "}
                  {formatHHMMSS(rounded.originalDuration)}
                </div>
                <div>
                  <span className="text-muted-foreground">Rounded:</span>{" "}
                  {rounded.minutes}min {rounded.direction}
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
