import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Id } from "../../../convex/_generated/dataModel";

interface OfflineIndicatorProps {
  workspaceId: Id<"workspaces"> | undefined;
}

export function OfflineIndicator({ workspaceId }: OfflineIndicatorProps) {
  const { isOnline, pendingCount, isSyncing, syncError, sync } = useOfflineSync(workspaceId);

  if (isOnline && pendingCount === 0 && !syncError) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 text-sm ${
        !isOnline
          ? "bg-amber-500 text-white"
          : syncError
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Changes will sync when connected.</span>
        </>
      ) : syncError ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>{syncError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-white hover:bg-white/20"
            onClick={sync}
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>Syncing {pendingCount} pending {pendingCount === 1 ? "entry" : "entries"}...</span>
          {isSyncing && <RefreshCw className="h-3 w-3 animate-spin" />}
        </>
      )}
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
          {pendingCount} pending
        </Badge>
      )}
    </div>
  );
}
