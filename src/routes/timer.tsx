import { useState } from "react";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimerInput } from "@/components/timer/TimerInput";
import { ManualEntryForm } from "@/components/timer/ManualEntryForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  Trash2,
  DollarSign,
  Clock,
} from "lucide-react";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const Route = createFileRoute("/timer")({
  component: TimerPage,
});

function TimerPage() {
  const workspaceId = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

  const projects = useQuery(api.queries.timeEntries.getProjects, { workspaceId }) ?? [];
  const tags = useQuery(api.queries.timeEntries.getTags, { workspaceId }) ?? [];
  const todayEntries = useQuery(api.queries.timeEntries.getToday, { workspaceId }) ?? [];
  const stats = useQuery(api.queries.timeEntries.getStats, { workspaceId });

  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  const deleteEntry = useMutation(api.mutations.timeEntries.deleteEntry);
  const toggleFavorite = useMutation(api.mutations.timeEntries.toggleFavorite);
  const createEntry = useMutation(api.mutations.timeEntries.create);

  const descriptionSuggestions = useQuery(
    api.queries.timeEntries.getDescriptionSuggestions,
    { workspaceId, query: "" }
  ) ?? [];

  const handleManualSave = async (entry: {
    description: string;
    projectId?: Id<"projects">;
    taskId?: Id<"tasks">;
    tagIds: Id<"tags">[];
    date: Date;
    startTime: string;
    endTime: string;
    billable: boolean;
  }) => {
    const startDateTime = new Date(entry.date);
    const [startH, startM] = entry.startTime.split(":").map(Number);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(entry.date);
    const [endH, endM] = entry.endTime.split(":").map(Number);
    endDateTime.setHours(endH, endM, 0, 0);

    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    await createEntry({
      workspaceId,
      description: entry.description || undefined,
      projectId: entry.projectId,
      taskId: entry.taskId,
      tagIds: entry.tagIds.length > 0 ? entry.tagIds : undefined,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      billable: entry.billable,
    });
  };

  const handleDelete = async (id: Id<"timeEntries">) => {
    await deleteEntry({ entryId: id });
  };

  const handleToggleFavorite = async (id: Id<"timeEntries">) => {
    await toggleFavorite({ entryId: id });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Timer</h1>
            <p className="text-muted-foreground">Track your time</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {stats && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Today: {formatDuration(stats.todayTotal)}
                </span>
                <span>This week: {formatDuration(stats.weekTotal)}</span>
              </>
            )}
          </div>
        </div>

        <TimerInput
          workspaceId={workspaceId}
          projects={projects}
          tags={tags}
          descriptionSuggestions={descriptionSuggestions}
          onManualEntryToggle={() => setManualEntryOpen(true)}
        />

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Today's Entries</h2>
          {todayEntries.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No entries today. Start the timer or add a manual entry.
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-24">Billable</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayEntries.map((entry: any) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium max-w-64 truncate">
                        <div className="flex items-center gap-2">
                          {entry.isFavorite && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                          {entry.description || (
                            <span className="text-muted-foreground italic">No description</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.project ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.project.color }}
                            />
                            <span className="max-w-32 truncate">{entry.project.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No project</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.tags && entry.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.slice(0, 2).map((tag: any) => (
                              <Badge
                                key={tag._id}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: tag.color || undefined,
                                  color: tag.color || undefined,
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {entry.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.isRunning ? (
                          <span className="text-emerald-500">Running...</span>
                        ) : (
                          `${formatTime(entry.startTime)} - ${entry.endTime ? formatTime(entry.endTime) : "..."}`
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {entry.isRunning ? (
                          <span className="text-emerald-500">--</span>
                        ) : (
                          formatDuration(entry.duration)
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.billable && (
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFavorite(entry._id)}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                entry.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(entry._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <ManualEntryForm
          open={manualEntryOpen}
          onOpenChange={setManualEntryOpen}
          onSave={handleManualSave}
          projects={projects}
          tags={tags}
        />
      </div>
    </AppLayout>
  );
}
