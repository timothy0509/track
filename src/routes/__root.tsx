import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@/styles/app.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const Route = createRootRoute({
  component: RootComponent,
});

export const rootRoute = Route;

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TimoTrack</title>
      </head>
      <body>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </body>
    </html>
  );
}
