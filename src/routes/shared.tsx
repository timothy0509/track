import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { rootRoute } from "./__root";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Share2, Check, User } from "lucide-react";

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

export const sharedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "shared",
  component: SharedPage,
});

function SharedPage() {
  const workspaceId = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;
  const [activeTab, setActiveTab] = useState("with-me");

  const sharedWithMe = useQuery(api.queries.timeEntries.getShared, { workspaceId }) ?? [];
  const sharedByMe: any[] = [];
  const acceptShare = useMutation(api.mutations.timeEntries.acceptShare);

  const handleAccept = async (entryId: Id<"timeEntries">) => {
    await acceptShare({ entryId });
  };

  const renderEntryRow = (entry: any, showActions: boolean) => (
    <TableRow key={entry._id}>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(entry.startTime)}
      </TableCell>
      <TableCell className="font-medium max-w-48 truncate">
        <div className="flex items-center gap-2">
          <Share2 className="h-3 w-3 text-blue-500" />
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
      <TableCell className="font-mono">
        {formatDuration(entry.duration)}
      </TableCell>
      <TableCell>
        {entry.sharedWithUsers && entry.sharedWithUsers.length > 0 ? (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {entry.sharedWithUsers.map((u: any) => u.name ?? u.email).join(", ")}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex items-center gap-1">
            {entry.sharedAccepted && entry.sharedAccepted.includes(entry.userId) ? (
              <Badge variant="secondary" className="text-xs">
                <Check className="mr-1 h-3 w-3" />
                Accepted
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAccept(entry._id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Accept
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shared Entries</h1>
            <p className="text-muted-foreground">
              Manage shared time entries with your team
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="with-me">
              Shared with me ({sharedWithMe.length})
            </TabsTrigger>
            <TabsTrigger value="by-me">
              Shared by me ({sharedByMe.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-me" className="mt-4">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Shared by</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedWithMe.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                        No entries have been shared with you yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sharedWithMe.map((entry: any) => renderEntryRow(entry, true))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="by-me" className="mt-4">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Shared with</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedByMe.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        You haven't shared any entries yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sharedByMe.map((entry: any) => renderEntryRow(entry, false))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
