import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "@/routes/__root";

export const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "auth/callback",
  beforeLoad: () => {
    throw redirect({ to: "/timer" });
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Redirecting...</h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
