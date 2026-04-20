import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { rootRoute } from "../__root";
import { AppLayout } from "@/components/layout/AppLayout";
import { EntryCalendar } from "@/components/entries/EntryCalendar";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";

export const timerCalendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "calendar",
  component: CalendarPage,
});

function CalendarPage() {
  const workspaceId = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).getTime();

  const entries = useQuery(api.queries.timeEntries.getCalendarEntries, {
    workspaceId,
    startDate,
    endDate,
  }) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View your time entries on a calendar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              <List className="mr-2 h-4 w-4" />
              Week
            </Button>
          </div>
        </div>

        <EntryCalendar
          entries={entries}
          view={view}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
    </AppLayout>
  );
}
