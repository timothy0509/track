import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Share2, Pencil, Trash2, MoreVertical } from "lucide-react";

interface EntryActionsProps {
  entry: any;
  onEdit: (entry: any) => void;
  onDelete: (id: Id<"timeEntries">) => void;
  onShare?: (entryId: Id<"timeEntries">, userId: Id<"users">) => Promise<void>;
  workspaceMembers?: any[];
}

export function EntryActions({ entry, onEdit, onDelete, onShare, workspaceMembers }: EntryActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUserId, setShareUserId] = useState("");

  const toggleFavorite = useMutation(api.mutations.timeEntries.toggleFavorite);

  const handleToggleFavorite = async () => {
    await toggleFavorite({ entryId: entry._id });
  };

  const handleShare = async () => {
    if (!shareUserId || !onShare) return;
    await onShare(entry._id, shareUserId as Id<"users">);
    setShareOpen(false);
    setShareUserId("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleFavorite}>
            <Star
              className={`mr-2 h-4 w-4 ${entry.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            {entry.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(entry)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(entry._id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Time Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Share this entry with a team member.
            </p>
            {workspaceMembers && workspaceMembers.length > 0 ? (
              <div className="space-y-2">
                {workspaceMembers.map((member: any) => (
                  <Button
                    key={member.userId}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShareUserId(member.userId)}
                  >
                    {member.name ?? member.email}
                  </Button>
                ))}
              </div>
            ) : (
              <Input
                placeholder="Enter user ID"
                value={shareUserId}
                onChange={(e) => setShareUserId(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={!shareUserId}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
