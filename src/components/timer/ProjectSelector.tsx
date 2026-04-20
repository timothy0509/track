import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Id } from "../../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  color: string;
  archived: boolean;
}

interface ProjectSelectorProps {
  projects: Project[];
  value: Id<"projects"> | undefined;
  onChange: (id: Id<"projects"> | undefined) => void;
  className?: string;
}

export function ProjectSelector({
  projects,
  value,
  onChange,
  className,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = projects.find((p) => p._id === value);

  const filtered = projects.filter(
    (p) => !p.archived && p.name.toLowerCase().includes(search.toLowerCase())
  );

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
            "flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-accent",
            className
          )}
        >
          {selected ? (
            <>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              <span className="max-w-32 truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Project</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="max-h-60 overflow-auto">
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
              !value && "bg-accent"
            )}
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            <span className="h-3 w-3 rounded-full bg-muted" />
            <span>No project</span>
            {!value && <Check className="ml-auto h-4 w-4" />}
          </button>
          {filtered.map((project) => (
            <button
              key={project._id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                value === project._id && "bg-accent"
              )}
              onClick={() => {
                onChange(project._id);
                setOpen(false);
              }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate">{project.name}</span>
              {value === project._id && <Check className="ml-auto h-4 w-4" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No projects found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
