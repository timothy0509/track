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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientForm } from "@/components/clients/ClientForm";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Search,
  FolderKanban,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  const clients = useQuery(
    api.queries.clients.getWithProjectCount,
    { workspaceId: WORKSPACE_ID, archived: showArchived }
  ) ?? [];

  const filteredClients = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      )
    : clients;

  const archiveClient = useMutation(api.mutations.clients.archive);
  const deleteClient = useMutation(api.mutations.clients.deleteClient);
  const bulkArchive = useMutation(api.mutations.clients.bulkArchive);

  const handleArchive = async (clientId: Id<"clients">, archived: boolean) => {
    await archiveClient({ clientId, archived });
  };

  const handleDelete = async (clientId: Id<"clients">) => {
    try {
      await deleteClient({ clientId });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBulkArchive = async (archived: boolean) => {
    await bulkArchive({
      clientIds: Array.from(selectedClients) as Id<"clients">[],
      archived,
    });
    setSelectedClients(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedClients((prev) => {
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
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your clients and their projects
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="show-archived">Show archived</Label>
          </div>
        </div>

        {selectedClients.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
            <span className="text-sm text-muted-foreground">
              {selectedClients.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkArchive(true)}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkArchive(false)}
            >
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Selected
            </Button>
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={filteredClients.length > 0 && selectedClients.size === filteredClients.length}
                    onChange={() => {
                      if (selectedClients.size === filteredClients.length) {
                        setSelectedClients(new Set());
                      } else {
                        setSelectedClients(new Set(filteredClients.map((c) => c._id)));
                      }
                    }}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    {search ? "No clients found" : "No clients yet. Create your first client!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client._id)}
                        onChange={() => toggleSelect(client._id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {client.archived && (
                          <Badge variant="secondary" className="text-xs">Archived</Badge>
                        )}
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <span>{client.projectCount ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleArchive(client._id, !client.archived)}
                        >
                          {client.archived ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(client._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ClientForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={WORKSPACE_ID}
        />

        {editingClient && (
          <ClientForm
            open={!!editingClient}
            onOpenChange={(open) => !open && setEditingClient(null)}
            workspaceId={WORKSPACE_ID}
            client={editingClient}
          />
        )}
      </div>
    </AppLayout>
  );
}
