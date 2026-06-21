import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { startRegistration } from "@simplewebauthn/browser";

export function PasskeyManager() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const twoFAStatus = useQuery(api.queries.auth.get2FAStatus);

  const generateRegistrationOptions = useAction(
    api.actions.passkeys.generateRegistrationOptionsAction
  );
  const verifyRegistration = useAction(
    api.actions.passkeys.verifyRegistrationAction
  );

  const handleAddPasskey = async () => {
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
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Registration was cancelled.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to add passkey");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!twoFAStatus) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Passkeys</h3>
          <p className="text-xs text-muted-foreground">
            {twoFAStatus.hasPasskey
              ? "You have a passkey registered."
              : "No passkeys registered."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddPasskey}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Passkey"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
