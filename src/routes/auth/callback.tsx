import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.has2FA) {
        navigate({ to: "/timer" });
      } else {
        navigate({ to: "/auth/setup-2fa" });
      }
    } else {
      navigate({ to: "/auth/login" });
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-muted-foreground">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
