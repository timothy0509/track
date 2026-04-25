import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Archive,
  ArchiveRestore,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const projects = useQuery(
    api.queries.projects.list,
    { workspaceId: WORKSPACE_ID, archived: showArchived }
  ) ?? [];

  const clients = useQuery(
    api.queries.clients.list,
    { workspaceId: WORKSPACE_ID }
  ) ?? [];

  let filtered = projects;

  if (filterClient !== "all") {
    filtered = filtered.filter((p) => p.clientId === filterClient);
  }

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description && p.description.toLowerCase().includes(lower))
    );
  }

  const archiveProject = useMutation(api.mutations.projects.archive);
  const deleteProject = useMutation(api.mutations.projects.deleteProject);
  const bulkArchive = useMutation(api.mutations.projects.bulkArchive);

  const handleArchive = async (projectId: Id<"projects">, archived: boolean) => {
    await archiveProject({ projectId, archived });
  };

  const handleDelete = async (projectId: Id<"projects">) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await deleteProject({ projectId });
  };

  const handleBulkArchive = async (archived: boolean) => {
    await bulkArchive({
      projectIds: Array.from(selectedProjects) as Id<"projects">[],
      archived,
    });
    setSelectedProjects(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your projects and track progress
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
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

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedProjects.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
            <span className="text-sm text-muted-foreground">
              {selectedProjects.size} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => handleBulkArchive(true)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkArchive(false)}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Selected
            </Button>
          </div>
        )}

        <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsContent value="grid" className="mt-0">
            {filtered.length === 0 ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  {search ? "No projects found" : "No projects yet. Create your first project!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project: any) => (
                  <div key={project._id} className="relative">
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project._id)}
                      onChange={() => toggleSelect(project._id)}
                      className="absolute right-3 top-3 h-4 w-4 z-10"
                    />
                    <ProjectCard
                      project={project}
                      onEdit={() => setEditingProject(project)}
                      onArchive={(archived) => handleArchive(project._id, archived)}
                      onDelete={() => handleDelete(project._id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="w-12 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedProjects.size === filtered.length}
                        onChange={() => {
                          if (selectedProjects.size === filtered.length) {
                            setSelectedProjects(new Set());
                          } else {
                            setSelectedProjects(new Set(filtered.map((p: any) => p._id)));
                          }
                        }}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Budget</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        {search ? "No projects found" : "No projects yet. Create your first project!"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((project: any) => (
                      <tr key={project._id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProjects.has(project._id)}
                            onChange={() => toggleSelect(project._id)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="font-medium">{project.name}</span>
                            {project.isPrivate && (
                              <Badge variant="secondary" className="text-xs">Private</Badge>
                            )}
                            {project.archived && (
                              <Badge variant="secondary" className="text-xs">Archived</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {project.client?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {project.budgetType === "hours" && project.estimateHours
                            ? `${project.estimateHours}h`
                            : project.budgetType === "amount" && project.budgetAmount
                            ? `$${project.budgetAmount}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {project.billableRate ? `$${project.billableRate}/hr` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingProject(project)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleArchive(project._id, !project.archived)}
                            >
                              {project.archived ? (
                                <ArchiveRestore className="h-4 w-4" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(project._id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <ProjectForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={WORKSPACE_ID}
          clients={clients}
        />

        {editingProject && (
          <ProjectForm
            open={!!editingProject}
            onOpenChange={(open) => !open && setEditingProject(null)}
            workspaceId={WORKSPACE_ID}
            project={editingProject}
            clients={clients}
          />
        )}
      </div>
    </AppLayout>
  );
}
