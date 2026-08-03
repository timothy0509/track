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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  BarChart3,
  FileText,
  Users,
  DollarSign,
  Trash2,
  Edit,
} from "lucide-react";

const WORKSPACE_ID = "j5793xqk4z8w5q06m40k77q9v70g3j6e" as Id<"workspaces">;

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("summary");

  const reports = useQuery(api.queries.reports.list, { workspaceId: WORKSPACE_ID }) ?? [];
  const createReport = useMutation(api.mutations.reports.create);
  const deleteReport = useMutation(api.mutations.reports.deleteReport);

  const filtered = reports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    try {
      await createReport({
        workspaceId: WORKSPACE_ID,
        name: name.trim(),
        type: type as any,
        isPublic: false,
        config: {
          dateRange: {
            type: "thisWeek",
            start: weekAgo,
            end: now,
          },
        },
      });
      setName("");
      setType("summary");
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  const handleDelete = async (reportId: Id<"reports">) => {
    try {
      await deleteReport({ reportId });
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const reportTypeIcon = (t: string) => {
    switch (t) {
      case "summary":
        return <FileText className="h-5 w-5" />;
      case "detailed":
        return <BarChart3 className="h-5 w-5" />;
      case "workload":
        return <Users className="h-5 w-5" />;
      case "profitability":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Analyze your time tracking data
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Report name"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="workload">Workload</SelectItem>
                      <SelectItem value="profitability">Profitability</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>No reports yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((report) => (
              <Card key={report._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {reportTypeIcon(report.type)}
                      {report.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(report._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{report.type}</span>
                    <span className="text-xs">
                      {new Date(report.config.dateRange.start).toLocaleDateString()} -{" "}
                      {new Date(report.config.dateRange.end).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
