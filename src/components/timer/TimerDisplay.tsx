import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  elapsed: number;
  isRunning: boolean;
  className?: string;
}

export function TimerDisplay({ elapsed, isRunning, className }: TimerDisplayProps) {
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const display = [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");

  return (
    <div className={cn("font-mono text-4xl font-bold tracking-wider", className)}>
      <span
        className={cn(
          isRunning && "animate-pulse",
          isRunning ? "text-emerald-500" : "text-foreground"
        )}
      >
        {display}
      </span>
    </div>
  );
}
