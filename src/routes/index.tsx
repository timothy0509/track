import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/timer" });
  },
  component: IndexComponent,
});

function IndexComponent() {
  return null;
}
