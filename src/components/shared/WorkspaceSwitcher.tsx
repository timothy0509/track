import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Workspace {
  _id: string;
  name: string;
  slug: string;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
  onSelectWorkspace: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
  onSelectWorkspace,
}: WorkspaceSwitcherProps) {
  const currentWorkspace = workspaces.find(
    (w) => w._id === currentWorkspaceId
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">
            {currentWorkspace?.name || "Select Workspace"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace._id}
            onClick={() => onSelectWorkspace(workspace._id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{workspace.name}</span>
            {workspace._id === currentWorkspaceId && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = "/workspaces/new"}>
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workspace
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
