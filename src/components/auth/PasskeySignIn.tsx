import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { startAuthentication } from "@simplewebauthn/browser";

interface PasskeySignInProps {
  onSuccess: () => void;
  onUseTotp: () => void;
}

export function PasskeySignIn({ onSuccess, onUseTotp }: PasskeySignInProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAuthenticationOptions = useAction(
    api.actions.passkeys.generateAuthenticationOptionsAction
  );
  const verifyAuthentication = useAction(
    api.actions.passkeys.verifyAuthenticationAction
  );

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { options, challengeId } = await generateAuthenticationOptions();

      const authenticationResponse = await startAuthentication(
        options as Parameters<typeof startAuthentication>[0]
      );

      await verifyAuthentication({
        response: authenticationResponse,
        challengeId,
      });

      onSuccess();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Authentication was cancelled. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Passkey authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use your passkey (fingerprint, face recognition, or security key) to verify your identity.
      </p>
      <Button onClick={handleSignIn} className="w-full" disabled={loading}>
        {loading ? "Authenticating..." : "Use Passkey"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button variant="outline" className="w-full" onClick={onUseTotp}>
        Use authenticator app instead
      </Button>
    </div>
  );
}
