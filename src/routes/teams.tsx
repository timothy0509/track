import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Users,
  Trash2,
  Edit,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const Route = createFileRoute("/teams")({
  component: TeamsPage,
});

function TeamsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");

  const teams = useQuery(api.queries.teams.list, { workspaceId: WORKSPACE_ID }) ?? [];
  const createTeam = useMutation(api.mutations.teams.create);
  const updateTeam = useMutation(api.mutations.teams.update);
  const deleteTeam = useMutation(api.mutations.teams.deleteTeam);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createTeam({
        workspaceId: WORKSPACE_ID,
        name: name.trim(),
        description: description.trim() || undefined,
        color: color.trim() || undefined,
      });
      setName("");
      setDescription("");
      setColor("");
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editTeam || !name.trim()) return;
    try {
      await updateTeam({
        teamId: editTeam._id,
        name: name.trim(),
        description: description.trim() || undefined,
        color: color.trim() || undefined,
      });
      setName("");
      setDescription("");
      setColor("");
      setEditTeam(null);
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  const handleDelete = async (teamId: Id<"teams">) => {
    try {
      await deleteTeam({ teamId });
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const openEdit = (team: any) => {
    setEditTeam(team);
    setName(team.name);
    setDescription(team.description ?? "");
    setColor(team.color ?? "");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Manage your teams and members
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Team name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Team description"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>No teams yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((team) => (
              <Card key={team._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {team.color && (
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                      )}
                      {team.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(team)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(team._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {team.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{team.members.length} members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editTeam} onOpenChange={(open) => !open && setEditTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Team name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Team description"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
              <Button onClick={handleUpdate} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
