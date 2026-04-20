import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Clock, DollarSign } from "lucide-react";
import "react-calendar/dist/Calendar.css";

interface EntryCalendarProps {
  entries: any[];
  view: "month" | "week";
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function EntryCalendar({
  entries,
  view: _view,
  selectedDate,
  onDateSelect,
}: EntryCalendarProps) {
  const [showDetails, setShowDetails] = useState(false);

  const entriesByDate = entries.reduce<Record<string, any[]>>((acc, entry) => {
    const dateKey = format(new Date(entry.startTime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedEntries = entriesByDate[selectedDateKey] ?? [];

  const getTotalTime = (dayEntries: any[]): number => {
    return dayEntries.reduce((sum, e) => sum + e.duration, 0);
  };

  const formatTotalTime = (ms: number): string => {
    const totalMinutes = Math.round(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const tileContent = ({ date, view: tileView }: any) => {
    if (tileView !== "month") return null;

    const dateKey = format(date, "yyyy-MM-dd");
    const dayEntries = entriesByDate[dateKey];

    if (!dayEntries || dayEntries.length === 0) return null;

    const total = getTotalTime(dayEntries);

    return (
      <div className="mt-1 space-y-0.5">
        <div className="flex items-center gap-1">
          <Badge
            variant="secondary"
            className="h-4 px-1 text-[10px] leading-none"
          >
            {dayEntries.length}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatTotalTime(total)}
          </span>
        </div>
        <div className="flex gap-0.5">
          {dayEntries.slice(0, 3).map((entry: any, i: number) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-sm"
              style={{
                backgroundColor: entry.project?.color ?? "#888",
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      <Card className="flex-1">
        <CardContent className="p-4">
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                onDateSelect(value);
                setShowDetails(true);
              }
            }}
            value={selectedDate}
            tileContent={tileContent}
            className="w-full border-0"
            tileClassName={({ date }) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const hasEntries = entriesByDate[dateKey];
              return cn(
                "rounded-md",
                hasEntries && "bg-accent/50"
              );
            }}
          />
        </CardContent>
      </Card>

      {showDetails && (
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No entries for this day
              </p>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {selectedEntries.map((entry: any) => (
                    <div
                      key={entry._id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {entry.description || "No description"}
                        </span>
                        {entry.isFavorite && (
                          <span className="text-yellow-400">★</span>
                        )}
                      </div>

                      {entry.project && (
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.project.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {entry.project.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(entry.startTime), "HH:mm")} -{" "}
                            {entry.endTime
                              ? format(new Date(entry.endTime), "HH:mm")
                              : "running"}
                          </span>
                        </div>
                        <span className="font-mono">
                          {formatTotalTime(entry.duration)}
                        </span>
                      </div>

                      {entry.billable && (
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                          <DollarSign className="h-3 w-3" />
                          <span>Billable</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="rounded-lg bg-accent p-3 text-center">
                    <span className="text-sm font-medium">
                      Total: {formatTotalTime(getTotalTime(selectedEntries))}
                    </span>
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
