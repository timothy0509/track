import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const workspaceId = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;
  const [page, setPage] = useState(0);

  const favorites = useQuery(api.queries.timeEntries.getFavorites, { workspaceId }) ?? [];
  const toggleFavorite = useMutation(api.mutations.timeEntries.toggleFavorite);
  const deleteEntry = useMutation(api.mutations.timeEntries.deleteEntry);

  const handleToggleFavorite = async (id: Id<"timeEntries">) => {
    await toggleFavorite({ entryId: id });
  };

  const handleDelete = async (id: Id<"timeEntries">) => {
    await deleteEntry({ entryId: id });
  };

  const pageSize = 20;
  const pagedFavorites = favorites.slice(page * pageSize, (page + 1) * pageSize);
  const hasMore = (page + 1) * pageSize < favorites.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
            <p className="text-muted-foreground">
              Your starred time entries for quick access
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
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
              {pagedFavorites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No favorite entries yet. Star entries from the time entries page.
                  </TableCell>
                </TableRow>
              ) : (
                pagedFavorites.map((entry: any) => (
                  <TableRow key={entry._id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(entry.startTime)}
                    </TableCell>
                    <TableCell className="font-medium max-w-48 truncate">
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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
                        <span className="text-emerald-500">$</span>
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
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(entry._id)}
                        >
                          <span className="sr-only">Delete</span>
                          ×
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {pagedFavorites.length} of {favorites.length} favorites
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
        )}
      </div>
    </AppLayout>
  );
}
