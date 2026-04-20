import { useState, useRef, useEffect } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../convex/_generated/dataModel";

interface Tag {
  _id: Id<"tags">;
  name: string;
  color?: string;
}

interface TagSelectorProps {
  tags: Tag[];
  value: Id<"tags">[];
  onChange: (ids: Id<"tags">[]) => void;
  onCreateTag?: (name: string) => void;
  className?: string;
}

export function TagSelector({
  tags,
  value,
  onChange,
  onCreateTag,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = tags.filter((t) => value.includes(t._id));
  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTag = (tagId: Id<"tags">) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const removeTag = (tagId: Id<"tags">) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const handleCreate = () => {
    if (search.trim() && onCreateTag) {
      onCreateTag(search.trim());
      setSearch("");
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 min-w-24 items-center gap-1 rounded-md border border-input px-2 text-sm hover:bg-accent",
            className
          )}
        >
          {selectedTags.length > 0 ? (
            <div className="flex items-center gap-1">
              {selectedTags.slice(0, 2).map((tag) => (
                <span
                  key={tag._id}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {selectedTags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{selectedTags.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Tags</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        {value.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge
                key={tag._id}
                variant="secondary"
                className="flex items-center gap-1"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag._id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="max-h-48 overflow-auto">
          {filtered.map((tag) => (
            <button
              key={tag._id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                value.includes(tag._id) && "bg-accent"
              )}
              onClick={() => toggleTag(tag._id)}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color || "#94a3b8" }}
              />
              <span className="truncate">{tag.name}</span>
              {value.includes(tag._id) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </button>
          ))}
          {onCreateTag && search.trim() && filtered.length === 0 && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4" />
              Create "{search.trim()}"
            </button>
          )}
          {filtered.length === 0 && !search.trim() && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tags yet
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
