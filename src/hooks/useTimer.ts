import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  queueOfflineOperation,
  isOnline,
} from "@/lib/offline";

interface UseTimerOptions {
  workspaceId: Id<"workspaces"> | undefined;
}

interface UseTimerReturn {
  isRunning: boolean;
  elapsed: number;
  startTime: number | null;
  entryId: Id<"timeEntries"> | null;
  description: string;
  projectId: Id<"projects"> | undefined;
  taskId: Id<"tasks"> | undefined;
  tagIds: Id<"tags">[];
  billable: boolean;
  start: (options?: {
    description?: string;
    projectId?: Id<"projects">;
    taskId?: Id<"tasks">;
    tagIds?: Id<"tags">[];
    billable?: boolean;
  }) => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
  setDescription: (desc: string) => void;
  setProjectId: (id: Id<"projects"> | undefined) => void;
  setTaskId: (id: Id<"tasks"> | undefined) => void;
  setTagIds: (ids: Id<"tags">[]) => void;
  setBillable: (b: boolean) => void;
}

export function useTimer({ workspaceId }: UseTimerOptions): UseTimerReturn {
  const startTimer = useMutation(api.mutations.timeEntries.startTimer);
  const stopTimer = useMutation(api.mutations.timeEntries.stopTimer);
  const runningEntry = useQuery(api.queries.timeEntries.getRunning, workspaceId ? { workspaceId } : "skip");

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [entryId, setEntryId] = useState<Id<"timeEntries"> | null>(null);
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(undefined);
  const [taskId, setTaskId] = useState<Id<"tasks"> | undefined>(undefined);
  const [tagIds, setTagIds] = useState<Id<"tags">[]>([]);
  const [billable, setBillable] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (runningEntry && runningEntry.isRunning) {
      setIsRunning(true);
      setStartTime(runningEntry.startTime);
      setEntryId(runningEntry._id);
      setDescription(runningEntry.description ?? "");
      setProjectId(runningEntry.projectId);
      setTaskId(runningEntry.taskId);
      setTagIds(runningEntry.tagIds ?? []);
      setBillable(runningEntry.billable);
    }
  }, [runningEntry]);

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRunning, startTime]);

  const start = useCallback(
    async (options?: {
      description?: string;
      projectId?: Id<"projects">;
      taskId?: Id<"tasks">;
      tagIds?: Id<"tags">[];
      billable?: boolean;
    }) => {
      if (!workspaceId) return;

      const desc = options?.description ?? description;
      const projId = options?.projectId ?? projectId;
      const tId = options?.taskId ?? taskId;
      const tIds = options?.tagIds ?? tagIds;
      const bill = options?.billable ?? billable;

      if (isOnline()) {
        const result = await startTimer({
          workspaceId,
          description: desc || undefined,
          projectId: projId,
          taskId: tId,
          tagIds: tIds.length > 0 ? tIds : undefined,
          billable: bill,
        });

        const now = Date.now();
        setIsRunning(true);
        setStartTime(now);
        setEntryId(result.entryId as Id<"timeEntries">);
        setElapsed(0);
      } else {
        const offlineId = `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const now = Date.now();

        await queueOfflineOperation(
          {
            id: offlineId,
            description: desc,
            projectId: projId,
            taskId: tId,
            tagIds: tIds,
            startTime: now,
            duration: 0,
            billable: bill,
            workspaceId,
          },
          "create"
        );

        setIsRunning(true);
        setStartTime(now);
        setEntryId(offlineId as Id<"timeEntries">);
        setElapsed(0);
      }
    },
    [workspaceId, description, projectId, taskId, tagIds, billable, startTimer]
  );

  const stop = useCallback(async () => {
    if (!entryId) return;

    if (isOnline() && !entryId.startsWith("offline-")) {
      await stopTimer({ entryId });
    } else if (entryId.startsWith("offline-")) {
      const entries = await import("@/lib/offline").then((m) => m.getOfflineEntries());
      const offlineEntry = entries.find((e) => e.id === entryId);
      if (offlineEntry) {
        const endTime = Date.now();
        const duration = endTime - offlineEntry.startTime;

        await import("@/lib/offline").then((m) =>
          m.saveOfflineEntry({
            ...offlineEntry,
            endTime,
            duration,
          })
        );
      }
    } else {
      const duration = Date.now() - (startTime ?? Date.now());
      await queueOfflineOperation(
        {
          id: entryId,
          description,
          projectId,
          taskId,
          tagIds,
          startTime: startTime ?? Date.now(),
          endTime: Date.now(),
          duration,
          billable,
          workspaceId: workspaceId!,
        },
        "update"
      );
    }

    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
    setEntryId(null);
    setDescription("");
    setProjectId(undefined);
    setTaskId(undefined);
    setTagIds([]);
    setBillable(false);
  }, [entryId, startTime, description, projectId, taskId, tagIds, billable, workspaceId, stopTimer]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
    setEntryId(null);
    setDescription("");
    setProjectId(undefined);
    setTaskId(undefined);
    setTagIds([]);
    setBillable(false);
  }, []);

  return {
    isRunning,
    elapsed,
    startTime,
    entryId,
    description,
    projectId,
    taskId,
    tagIds,
    billable,
    start,
    stop,
    reset,
    setDescription,
    setProjectId,
    setTaskId,
    setTagIds,
    setBillable,
  };
}
