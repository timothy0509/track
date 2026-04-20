import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ProjectSelector } from "./ProjectSelector";
import { TagSelector } from "./TagSelector";
import { Id } from "../../../convex/_generated/dataModel";

interface ManualEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: {
    description: string;
    projectId?: Id<"projects">;
    taskId?: Id<"tasks">;
    tagIds: Id<"tags">[];
    date: Date;
    startTime: string;
    endTime: string;
    billable: boolean;
  }) => void;
  projects: Array<{ _id: Id<"projects">; name: string; color: string; archived: boolean }>;
  tags: Array<{ _id: Id<"tags">; name: string; color?: string }>;
}

export function ManualEntryForm({
  open,
  onOpenChange,
  onSave,
  projects,
  tags,
}: ManualEntryFormProps) {
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(undefined);
  const [taskId, setTaskId] = useState<Id<"tasks"> | undefined>(undefined);
  const [tagIds, setTagIds] = useState<Id<"tags">[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [billable, setBillable] = useState(false);

  const handleSave = () => {
    onSave({
      description,
      projectId,
      taskId,
      tagIds,
      date,
      startTime,
      endTime,
      billable,
    });
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setDescription("");
    setProjectId(undefined);
    setTaskId(undefined);
    setTagIds([]);
    setDate(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setBillable(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Manual Time Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <ProjectSelector
              projects={projects}
              value={projectId}
              onChange={setProjectId}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagSelector
              tags={tags}
              value={tagIds}
              onChange={setTagIds}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="manual-billable">Billable</Label>
            <Switch
              id="manual-billable"
              checked={billable}
              onCheckedChange={setBillable}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
