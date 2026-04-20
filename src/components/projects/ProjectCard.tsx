import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Archive, ArchiveRestore, Trash2, MoreVertical } from "lucide-react";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    clientId?: string;
    client?: { name: string };
    isPrivate: boolean;
    archived: boolean;
    estimateHours?: number;
    budgetAmount?: number;
    budgetType?: string;
    billableRate?: number;
  };
  totalTime?: number;
  onEdit: () => void;
  onArchive: (archived: boolean) => void;
  onDelete: () => void;
}

export function ProjectCard({ project, totalTime, onEdit, onArchive, onDelete }: ProjectCardProps) {
  let budgetProgress = null;
  if (project.budgetType === "hours" && project.estimateHours) {
    const hoursUsed = (totalTime ?? 0) / (1000 * 60 * 60);
    const percentage = Math.min((hoursUsed / project.estimateHours) * 100, 100);
    budgetProgress = {
      used: hoursUsed.toFixed(1),
      total: project.estimateHours,
      percentage,
    };
  } else if (project.budgetType === "amount" && project.budgetAmount) {
    const rate = project.billableRate || 0;
    const hoursUsed = (totalTime ?? 0) / (1000 * 60 * 60);
    const amountUsed = hoursUsed * rate;
    const percentage = Math.min((amountUsed / project.budgetAmount) * 100, 100);
    budgetProgress = {
      used: `$${amountUsed.toFixed(0)}`,
      total: `$${project.budgetAmount}`,
      percentage,
    };
  }

  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: project.color }}
      />

      <div className="flex items-start justify-between pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{project.name}</h3>
            {project.isPrivate && (
              <Badge variant="secondary" className="text-xs">Private</Badge>
            )}
            {project.archived && (
              <Badge variant="secondary" className="text-xs">Archived</Badge>
            )}
          </div>
          {project.client && (
            <p className="text-sm text-muted-foreground mt-1">
              {project.client.name}
            </p>
          )}
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive(!project.archived)}>
              {project.archived ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {budgetProgress && (
        <div className="mt-4 pl-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Budget</span>
            <span>{budgetProgress.used} / {budgetProgress.total}</span>
          </div>
          <Progress value={budgetProgress.percentage} className="h-2" />
        </div>
      )}

      {project.billableRate && (
        <div className="mt-2 pl-2 text-xs text-muted-foreground">
          ${project.billableRate}/hr
        </div>
      )}
    </div>
  );
}
