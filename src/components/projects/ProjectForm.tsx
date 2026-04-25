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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: Id<"workspaces">;
  project?: {
    _id: Id<"projects">;
    name: string;
    description?: string;
    color: string;
    clientId?: Id<"clients">;
    isPrivate: boolean;
    startDate?: number;
    endDate?: number;
    estimateHours?: number;
    budgetAmount?: number;
    budgetType?: "hours" | "amount" | "fixedFee";
    billableRate?: number;
    billableRateType?: "workspace" | "project" | "custom";
  };
  clients?: { _id: Id<"clients">; name: string }[];
}

export function ProjectForm({ open, onOpenChange, workspaceId, project, clients = [] }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [color, setColor] = useState(project?.color ?? "#3b82f6");
  const [clientId, setClientId] = useState<string>(project?.clientId ?? "none");
  const [isPrivate, setIsPrivate] = useState(project?.isPrivate ?? false);
  const [estimateHours, setEstimateHours] = useState(
    project?.estimateHours?.toString() ?? ""
  );
  const [budgetAmount, setBudgetAmount] = useState(
    project?.budgetAmount?.toString() ?? ""
  );
  const [budgetType, setBudgetType] = useState<string>(
    project?.budgetType ?? ""
  );
  const [billableRate, setBillableRate] = useState(
    project?.billableRate?.toString() ?? ""
  );
  const [startDate, setStartDate] = useState(
    project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""
  );

  const createProject = useMutation(api.mutations.projects.create);
  const updateProject = useMutation(api.mutations.projects.update);

  const isEditing = !!project;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const baseArgs = {
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        clientId: clientId !== "none" ? (clientId as Id<"clients">) : undefined,
        isPrivate,
        estimateHours: estimateHours ? parseFloat(estimateHours) : undefined,
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : undefined,
        budgetType: (budgetType as "hours" | "amount" | "fixedFee") || undefined,
        billableRate: billableRate ? parseFloat(billableRate) : undefined,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
      };

      if (isEditing && project) {
        await updateProject({
          projectId: project._id,
          name: baseArgs.name,
          description: baseArgs.description,
          color: baseArgs.color,
          clientId: baseArgs.clientId,
          isPrivate: baseArgs.isPrivate,
          estimateHours: baseArgs.estimateHours,
          budgetAmount: baseArgs.budgetAmount,
          billableRate: baseArgs.billableRate,
        });
      } else {
        await createProject({
          ...baseArgs,
          isTemplate: false,
        });
      }
      onOpenChange(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name *</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="project-private">Private</Label>
              <Switch
                id="project-private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-start">Start Date</Label>
                <Input
                  id="project-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-end">End Date</Label>
                <Input
                  id="project-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Budget Type</Label>
              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="fixedFee">Fixed Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {budgetType === "hours" && (
              <div className="space-y-2">
                <Label htmlFor="project-hours">Estimated Hours</Label>
                <Input
                  id="project-hours"
                  type="number"
                  value={estimateHours}
                  onChange={(e) => setEstimateHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            )}

            {(budgetType === "amount" || budgetType === "fixedFee") && (
              <div className="space-y-2">
                <Label htmlFor="project-budget">Budget Amount</Label>
                <Input
                  id="project-budget"
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="project-rate">Billable Rate ($/hr)</Label>
              <Input
                id="project-rate"
                type="number"
                value={billableRate}
                onChange={(e) => setBillableRate(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
