import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";
import { TotpSetup } from "@/components/auth/TotpSetup";
import { PasskeySetup } from "@/components/auth/PasskeySetup";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/auth/setup-2fa")({
  component: Setup2FAPage,
});

type SetupMethod = "choose" | "totp" | "passkey";

function Setup2FAPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<SetupMethod>("choose");

  if (loading) {
    return (
      <AuthLayout title="Loading...">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    navigate({ to: "/auth/login" });
    return null;
  }

  if (user.has2FA) {
    navigate({ to: "/timer" });
    return null;
  }

  const handleComplete = () => {
    navigate({ to: "/timer" });
  };

  if (method === "totp") {
    return (
      <AuthLayout
        title="Set up authenticator"
        description="Add an authenticator app for two-factor authentication"
      >
        <TotpSetup onComplete={handleComplete} />
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setMethod("choose")} className="text-sm text-muted-foreground">
            ← Back to options
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (method === "passkey") {
    return (
      <AuthLayout
        title="Set up passkey"
        description="Add a passkey for secure biometric sign-in"
      >
        <PasskeySetup onComplete={handleComplete} />
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setMethod("choose")} className="text-sm text-muted-foreground">
            ← Back to options
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Secure your account"
      description="Choose a two-factor authentication method. You only need to set up one."
    >
      <div className="space-y-3">
        <Button
          onClick={() => setMethod("totp")}
          className="w-full justify-start gap-3 h-auto py-4"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-medium">Authenticator App</div>
            <div className="text-xs text-muted-foreground font-normal">
              Google Authenticator, Authy, 1Password, etc.
            </div>
          </div>
        </Button>
        <Button
          onClick={() => setMethod("passkey")}
          className="w-full justify-start gap-3 h-auto py-4"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-medium">Passkey</div>
            <div className="text-xs text-muted-foreground font-normal">
              Fingerprint, face recognition, or security key
            </div>
          </div>
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        You must set up at least one method to continue.
      </p>
    </AuthLayout>
  );
}
