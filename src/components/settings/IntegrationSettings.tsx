import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Trash2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

interface IntegrationSettingsProps {
  workspaceId: Id<"workspaces">;
}

export function IntegrationSettings({ workspaceId }: IntegrationSettingsProps) {
  const [disconnectDialog, setDisconnectDialog] = useState<string | null>(null);

  const integrations = useQuery(api.queries.integrations.list, { workspaceId }) ?? [];

  const googleIntegration = integrations.find((i: any) => i.type === "googleCalendar");
  const outlookIntegration = integrations.find((i: any) => i.type === "outlookCalendar");

  const disconnectIntegration = useMutation(api.mutations.integrations.disconnect);

  const handleDisconnect = async (integrationId: Id<"integrations">) => {
    await disconnectIntegration({ integrationId });
    setDisconnectDialog(null);
  };

  const handleGoogleConnect = () => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "https://www.googleapis.com/auth/calendar.readonly";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleOutlookConnect = () => {
    const outlookClientId = (import.meta as any).env?.VITE_OUTLOOK_CLIENT_ID ?? "";
    const redirectUri = `${window.location.origin}/auth/outlook/callback`;
    const scope = "Calendars.Read";
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${outlookClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const isConnected = (integration: any) => {
    if (!integration) return false;
    return integration.expiresAt > Date.now();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Calendar Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect your calendar to import events as time entries
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Import events from your Google Calendar
                </CardDescription>
              </div>
            </div>
            {googleIntegration && (
              <Badge
                variant={isConnected(googleIntegration) ? "default" : "destructive"}
              >
                {isConnected(googleIntegration) ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Expired
                  </>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleIntegration ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-import-google">Auto-import events</Label>
                <Switch id="auto-import-google" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Connected on {new Date(googleIntegration.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sync Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setDisconnectDialog("google")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGoogleConnect}>
              Connect Google Calendar
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div>
                <CardTitle>Outlook Calendar</CardTitle>
                <CardDescription>
                  Import events from your Outlook Calendar
                </CardDescription>
              </div>
            </div>
            {outlookIntegration && (
              <Badge
                variant={isConnected(outlookIntegration) ? "default" : "destructive"}
              >
                {isConnected(outlookIntegration) ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Expired
                  </>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {outlookIntegration ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-import-outlook">Auto-import events</Label>
                <Switch id="auto-import-outlook" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Connected on {new Date(outlookIntegration.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sync Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setDisconnectDialog("outlook")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleOutlookConnect}>
              Connect Outlook Calendar
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!disconnectDialog} onOpenChange={() => setDisconnectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Calendar</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {disconnectDialog === "google" ? "Google" : "Outlook"} Calendar? You will need to re-authenticate to use it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (disconnectDialog === "google" && googleIntegration) {
                  handleDisconnect(googleIntegration._id);
                } else if (disconnectDialog === "outlook" && outlookIntegration) {
                  handleDisconnect(outlookIntegration._id);
                }
              }}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
