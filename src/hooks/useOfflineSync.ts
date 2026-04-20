import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  getPendingEntries,
  markSynced,
  isOnline,
  onOnlineChange,
} from "@/lib/offline";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncError: string | null;
  sync: () => Promise<void>;
}

export function useOfflineSync(workspaceId: Id<"workspaces"> | undefined): UseOfflineSyncReturn {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const createEntry = useMutation(api.mutations.timeEntries.create);
  const updateEntry = useMutation(api.mutations.timeEntries.update);
  const deleteEntry = useMutation(api.mutations.timeEntries.deleteEntry);

  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingEntries();
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const cleanup = onOnlineChange((newOnline) => {
      setOnline(newOnline);
      if (newOnline) {
        syncPending();
      }
    });
    return cleanup;
  }, []);

  const syncPending = useCallback(async () => {
    if (syncingRef.current || !workspaceId) return;
    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const pending = await getPendingEntries();

      for (const entry of pending) {
        try {
          switch (entry.operation) {
            case "create": {
              await createEntry({
                workspaceId: workspaceId,
                description: entry.description,
                projectId: entry.projectId as Id<"projects"> | undefined,
                taskId: entry.taskId as Id<"tasks"> | undefined,
                tagIds: entry.tagIds as Id<"tags">[] | undefined,
                startTime: entry.startTime,
                endTime: entry.endTime ?? entry.startTime + entry.duration,
                billable: entry.billable,
              });
              break;
            }
            case "update": {
              await updateEntry({
                entryId: entry.id as Id<"timeEntries">,
                description: entry.description,
                projectId: entry.projectId as Id<"projects"> | undefined,
                taskId: entry.taskId as Id<"tasks"> | undefined,
                tagIds: entry.tagIds as Id<"tags">[] | undefined,
                startTime: entry.startTime,
                endTime: entry.endTime,
                billable: entry.billable,
              });
              break;
            }
            case "delete": {
              await deleteEntry({ entryId: entry.id as Id<"timeEntries"> });
              break;
            }
          }
          await markSynced(entry.id);
        } catch (err) {
          console.error(`Failed to sync entry ${entry.id}:`, err);
          setSyncError(`Failed to sync entry: ${entry.description ?? "Untitled"}`);
        }
      }

      await refreshPendingCount();
    } catch (err) {
      setSyncError("Sync failed");
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [workspaceId, createEntry, updateEntry, deleteEntry, refreshPendingCount]);

  const sync = useCallback(async () => {
    await syncPending();
  }, [syncPending]);

  return {
    isOnline: online,
    pendingCount,
    isSyncing,
    syncError,
    sync,
  };
}
