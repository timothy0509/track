import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const convex = useMemo(() => {
    const url = import.meta.env.VITE_CONVEX_URL;
    if (!url) {
      console.error("Missing VITE_CONVEX_URL environment variable");
      return null;
    }
    return new ConvexReactClient(url);
  }, []);

  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground">Missing Convex URL. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}