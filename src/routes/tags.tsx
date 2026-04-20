import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { rootRoute } from "./__root";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagForm } from "@/components/tags/TagForm";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "tags",
  component: TagsPage,
});

function TagsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const tags = useQuery(api.queries.tags.list, { workspaceId: WORKSPACE_ID }) ?? [];

  const filteredTags = search
    ? tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const deleteTag = useMutation(api.mutations.tags.deleteTag);
  const bulkDelete = useMutation(api.mutations.tags.bulkDelete);

  const handleDelete = async (tagId: Id<"tags">) => {
    await deleteTag({ tagId });
  };

  const handleBulkDelete = async () => {
    await bulkDelete({
      tagIds: Array.from(selectedTags) as Id<"tags">[],
    });
    setSelectedTags(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedTags((prev) => {
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
            <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
            <p className="text-muted-foreground">
              Organize your time entries with tags
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {selectedTags.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
            <span className="text-sm text-muted-foreground">
              {selectedTags.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
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
                    checked={filteredTags.length > 0 && selectedTags.size === filteredTags.length}
                    onChange={() => {
                      if (selectedTags.size === filteredTags.length) {
                        setSelectedTags(new Set());
                      } else {
                        setSelectedTags(new Set(filteredTags.map((t) => t._id)));
                      }
                    }}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    {search ? "No tags found" : "No tags yet. Create your first tag!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((tag) => (
                  <TableRow key={tag._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTags.has(tag._id)}
                        onChange={() => toggleSelect(tag._id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{
                          backgroundColor: tag.color ?? "#94a3b8",
                          borderColor: tag.color ? "transparent" : "hsl(var(--border))",
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {tag.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tag.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingTag(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tag._id)}
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

        <TagForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={WORKSPACE_ID}
        />

        {editingTag && (
          <TagForm
            open={!!editingTag}
            onOpenChange={(open) => !open && setEditingTag(null)}
            workspaceId={WORKSPACE_ID}
            tag={editingTag}
          />
        )}
      </div>
    </AppLayout>
  );
}
