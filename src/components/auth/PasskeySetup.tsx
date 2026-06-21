import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { startRegistration } from "@simplewebauthn/browser";

interface PasskeySetupProps {
  onComplete: () => void;
}

export function PasskeySetup({ onComplete }: PasskeySetupProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateRegistrationOptions = useAction(
    api.actions.passkeys.generateRegistrationOptionsAction
  );
  const verifyRegistration = useAction(
    api.actions.passkeys.verifyRegistrationAction
  );

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const { options, challengeId } = await generateRegistrationOptions();

      const registrationResponse = await startRegistration(
        options as Parameters<typeof startRegistration>[0]
      );

      await verifyRegistration({
        response: registrationResponse,
        challengeId,
      });

      onComplete();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Registration was cancelled. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to set up passkey");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set up a passkey to sign in using your device&apos;s biometric authentication (fingerprint, face recognition, or security key).
      </p>
      <Button onClick={handleSetup} className="w-full" disabled={loading}>
        {loading ? "Setting up..." : "Set Up Passkey"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
