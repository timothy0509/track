import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@/styles/app.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConvexClientProvider } from "@/providers/ConvexProvider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TimoTrack</title>
        <HeadContent />
      </head>
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </ConvexClientProvider>
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </body>
    </html>
  );
}
