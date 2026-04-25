import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/timer" });
  },
  component: IndexComponent,
});

function IndexComponent() {
  return null;
}
