import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: Id<"workspaces">;
  projects: { _id: Id<"projects">; name: string; color: string }[];
  task?: {
    _id: Id<"tasks">;
    name: string;
    description?: string;
    projectId: Id<"projects">;
    color?: string;
    estimateHours?: number;
    billableRate?: number;
  };
}

export function TaskForm({ open, onOpenChange, workspaceId, projects, task }: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState<string>(
    task?.projectId ?? (projects[0]?._id ?? "")
  );
  const [estimateHours, setEstimateHours] = useState(
    task?.estimateHours?.toString() ?? ""
  );
  const [billableRate, setBillableRate] = useState(
    task?.billableRate?.toString() ?? ""
  );

  const createTask = useMutation(api.mutations.tasks.create);
  const updateTask = useMutation(api.mutations.tasks.update);

  const isEditing = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    try {
      if (isEditing && task) {
        await updateTask({
          taskId: task._id,
          name: name.trim(),
          description: description.trim() || undefined,
          estimateHours: estimateHours ? parseFloat(estimateHours) : undefined,
          billableRate: billableRate ? parseFloat(billableRate) : undefined,
        });
      } else {
        await createTask({
          workspaceId,
          projectId: projectId as Id<"projects">,
          name: name.trim(),
          description: description.trim() || undefined,
          estimateHours: estimateHours ? parseFloat(estimateHours) : undefined,
          billableRate: billableRate ? parseFloat(billableRate) : undefined,
        });
      }
      onOpenChange(false);
      setName("");
      setDescription("");
      setEstimateHours("");
      setBillableRate("");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Name *</Label>
              <Input
                id="task-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Task name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description..."
                rows={2}
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
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
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-estimate">Estimate (hours)</Label>
                <Input
                  id="task-estimate"
                  type="number"
                  value={estimateHours}
                  onChange={(e) => setEstimateHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-rate">Billable Rate ($/hr)</Label>
                <Input
                  id="task-rate"
                  type="number"
                  value={billableRate}
                  onChange={(e) => setBillableRate(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
