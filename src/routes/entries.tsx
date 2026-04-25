import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AppLayout } from "@/components/layout/AppLayout";
import { ManualEntryForm } from "@/components/timer/ManualEntryForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  DollarSign,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjectSelector } from "@/components/timer/ProjectSelector";
import { TagSelector } from "@/components/timer/TagSelector";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const Route = createFileRoute("/entries")({
  component: EntriesPage,
});

function EntriesPage() {
  const workspaceId = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterTagId, setFilterTagId] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    projectId: undefined as Id<"projects"> | undefined,
    tagIds: [] as Id<"tags">[],
    billable: false,
  });

  const projects = useQuery(api.queries.timeEntries.getProjects, { workspaceId }) ?? [];
  const tags = useQuery(api.queries.timeEntries.getTags, { workspaceId }) ?? [];

  const startDateMs = startDate ? startDate.getTime() : undefined;
  const endDateMs = endDate
    ? new Date(endDate).setHours(23, 59, 59, 999)
    : undefined;

  const entriesData = useQuery(api.queries.timeEntries.list, {
    workspaceId,
    startDate: startDateMs,
    endDate: endDateMs,
    projectId: filterProjectId !== "all" ? (filterProjectId as Id<"projects">) : undefined,
    tagIds: filterTagId !== "all" ? [filterTagId as Id<"tags">] : undefined,
    limit: 20,
    cursor: page * 20,
  });

  const entries = entriesData?.entries ?? [];
  const hasMore = entriesData?.hasMore ?? false;

  const deleteEntry = useMutation(api.mutations.timeEntries.deleteEntry);
  const toggleFavorite = useMutation(api.mutations.timeEntries.toggleFavorite);
  const updateEntry = useMutation(api.mutations.timeEntries.update);
  const createEntry = useMutation(api.mutations.timeEntries.create);

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
    setSelectedEntries((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedEntries) {
      await deleteEntry({ entryId: id as Id<"timeEntries"> });
    }
    setSelectedEntries(new Set());
  };

  const handleToggleFavorite = async (id: Id<"timeEntries">) => {
    await toggleFavorite({ entryId: id });
  };

  const openEditDialog = (entry: any) => {
    setEditingEntry(entry);
    setEditForm({
      description: entry.description ?? "",
      projectId: entry.projectId,
      tagIds: entry.tagIds ?? [],
      billable: entry.billable,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    await updateEntry({
      entryId: editingEntry._id,
      description: editForm.description || undefined,
      projectId: editForm.projectId,
      tagIds: editForm.tagIds.length > 0 ? editForm.tagIds : undefined,
      billable: editForm.billable,
    });
    setEditingEntry(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e: any) => e._id)));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Time Entries</h1>
            <p className="text-muted-foreground">
              View and manage your time entries
            </p>
          </div>
          <Button onClick={() => setManualEntryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={filterProjectId} onValueChange={setFilterProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p: any) => (
                <SelectItem key={p._id} value={p._id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTagId} onValueChange={setFilterTagId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((t: any) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(startDate || endDate || filterProjectId !== "all" || filterTagId !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
                setFilterProjectId("all");
                setFilterTagId("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {selectedEntries.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
            <span className="text-sm text-muted-foreground">
              {selectedEntries.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={entries.length > 0 && selectedEntries.size === entries.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-24">Billable</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    No entries found. Start tracking your time!
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry: any) => (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry._id)}
                        onChange={() => toggleSelect(entry._id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(entry.startTime)}
                    </TableCell>
                    <TableCell className="font-medium max-w-48 truncate">
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
                    <TableCell className="max-w-32 truncate">
                      {entry.task ? entry.task.name : "-"}
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
                    <TableCell className="font-mono">
                      {formatDuration(entry.duration)}
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
                          className="h-8 w-8"
                          onClick={() => openEditDialog(entry)}
                        >
                          <Pencil className="h-4 w-4" />
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {entries.length} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ManualEntryForm
          open={manualEntryOpen}
          onOpenChange={setManualEntryOpen}
          onSave={handleManualSave}
          projects={projects}
          tags={tags}
        />

        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="What did you work on?"
                />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <ProjectSelector
                  projects={projects}
                  value={editForm.projectId}
                  onChange={(id) => setEditForm((f) => ({ ...f, projectId: id }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagSelector
                  tags={tags}
                  value={editForm.tagIds}
                  onChange={(ids) => setEditForm((f) => ({ ...f, tagIds: ids }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-billable">Billable</Label>
                <Switch
                  id="edit-billable"
                  checked={editForm.billable}
                  onCheckedChange={(checked) =>
                    setEditForm((f) => ({ ...f, billable: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
