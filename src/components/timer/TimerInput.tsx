import { useState } from "react";
import { Play, Square, Plus, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { AutoComplete } from "./AutoComplete";
import { ProjectSelector } from "./ProjectSelector";
import { TagSelector } from "./TagSelector";
import { TimerDisplay } from "./TimerDisplay";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";

interface TimerInputProps {
  workspaceId: Id<"workspaces"> | undefined;
  projects: Array<{ _id: Id<"projects">; name: string; color: string; archived: boolean }>;
  tags: Array<{ _id: Id<"tags">; name: string; color?: string }>;
  descriptionSuggestions: string[];
  onManualEntryToggle: () => void;
}

export function TimerInput({
  workspaceId,
  projects,
  tags,
  descriptionSuggestions,
  onManualEntryToggle,
}: TimerInputProps) {
  const timer = useTimer({ workspaceId });
  const [localDescription, setLocalDescription] = useState(timer.description);

  const handleStart = async () => {
    if (timer.isRunning) {
      await timer.stop();
    } else {
      await timer.start({
        description: localDescription || undefined,
        projectId: timer.projectId,
        taskId: timer.taskId,
        tagIds: timer.tagIds,
        billable: timer.billable,
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex-1">
          <AutoComplete
            value={localDescription}
            onChange={(v) => {
              setLocalDescription(v);
              timer.setDescription(v);
            }}
            onSelect={(v) => {
              setLocalDescription(v);
              timer.setDescription(v);
            }}
            suggestions={descriptionSuggestions}
            placeholder="What are you working on?"
            className="w-full"
          />
        </div>

        <ProjectSelector
          projects={projects}
          value={timer.projectId}
          onChange={(id) => timer.setProjectId(id)}
        />

        <TagSelector
          tags={tags}
          value={timer.tagIds}
          onChange={(ids) => timer.setTagIds(ids)}
        />

        <div className="flex items-center gap-2">
          <Switch
            id="billable"
            checked={timer.billable}
            onCheckedChange={(checked) => timer.setBillable(checked)}
          />
          <Label htmlFor="billable" className="flex items-center gap-1 text-sm">
            <DollarSign className="h-3 w-3" />
            Billable
          </Label>
        </div>

        {timer.isRunning ? (
          <TimerDisplay elapsed={timer.elapsed} isRunning={true} className="min-w-32" />
        ) : (
          <div className="min-w-32 font-mono text-4xl font-bold tracking-wider text-muted-foreground">
            00:00:00
          </div>
        )}

        <Button
          size="lg"
          onClick={handleStart}
          className={cn(
            "h-12 w-12 rounded-full p-0",
            timer.isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          )}
        >
          {timer.isRunning ? (
            <Square className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onManualEntryToggle}
          className="h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
