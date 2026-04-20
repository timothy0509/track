import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { rootRoute } from "./__root";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskForm } from "@/components/tasks/TaskForm";
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Search,
  CheckCircle2,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "tasks",
  component: TasksPage,
});

function TasksPage() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const projects = useQuery(
    api.queries.projects.list,
    { workspaceId: WORKSPACE_ID, archived: false }
  ) ?? [];

  const allTasks = useQuery(api.queries.tasks.getByProject, {
    projectId: filterProject !== "all" ? filterProject as Id<"projects"> : (projects[0]?._id as Id<"projects">),
    archived: showArchived,
  }) ?? [];

  const tasksByProject: Record<string, any[]> = {};
  if (filterProject !== "all") {
    tasksByProject[filterProject] = allTasks;
  } else {
    for (const project of projects) {
      const projectTasks = allTasks.filter((t) => t.projectId === project._id);
      if (projectTasks.length > 0) {
        tasksByProject[project._id] = projectTasks;
      }
    }
  }

  const filteredTasksByProject: Record<string, any[]> = {};
  if (search) {
    const lower = search.toLowerCase();
    for (const [projectId, tasks] of Object.entries(tasksByProject)) {
      const filtered = tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          (t.description && t.description.toLowerCase().includes(lower))
      );
      if (filtered.length > 0) {
        filteredTasksByProject[projectId] = filtered;
      }
    }
  } else {
    Object.assign(filteredTasksByProject, tasksByProject);
  }

  const archiveTask = useMutation(api.mutations.tasks.archive);
  const deleteTask = useMutation(api.mutations.tasks.deleteTask);

  const handleArchive = async (taskId: Id<"tasks">, archived: boolean) => {
    await archiveTask({ taskId, archived });
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    await deleteTask({ taskId });
  };

  const displayProjects = filterProject !== "all"
    ? projects.filter((p) => p._id === filterProject)
    : projects.filter((p) => filteredTasksByProject[p._id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage tasks across your projects
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
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

          <div className="flex items-center gap-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <label htmlFor="show-archived" className="text-sm">Show archived</label>
          </div>
        </div>

        {displayProjects.length === 0 || Object.keys(filteredTasksByProject).length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? "No tasks found" : "No tasks yet. Create your first task!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayProjects.map((project) => {
              const tasks = filteredTasksByProject[project._id] ?? [];
              if (tasks.length === 0) return null;

              return (
                <div key={project._id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="rounded-lg border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Estimate</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {task.archived && (
                                  <Badge variant="secondary" className="text-xs">Archived</Badge>
                                )}
                                {task.name}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-48 truncate text-muted-foreground">
                              {task.description || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {task.estimateHours ? `${task.estimateHours}h` : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {task.billableRate ? `$${task.billableRate}/hr` : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleArchive(task._id, !task.archived)}
                                >
                                  {task.archived ? (
                                    <ArchiveRestore className="h-4 w-4" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(task._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TaskForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={WORKSPACE_ID}
          projects={projects}
        />

        {editingTask && (
          <TaskForm
            open={!!editingTask}
            onOpenChange={(open) => !open && setEditingTask(null)}
            workspaceId={WORKSPACE_ID}
            projects={projects}
            task={editingTask}
          />
        )}
      </div>
    </AppLayout>
  );
}
