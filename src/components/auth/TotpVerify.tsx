import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TotpVerifyProps {
  onSuccess: () => void;
  onUsePasskey: () => void;
  hasPasskey: boolean;
}

export function TotpVerify({ onSuccess, onUsePasskey, hasPasskey }: TotpVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyLogin = useMutation(api.mutations.totp.verifyLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyLogin({ code });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totp-login-code">Verification code</Label>
          <Input
            id="totp-login-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
      {hasPasskey && (
        <Button variant="outline" className="w-full" onClick={onUsePasskey}>
          Use passkey instead
        </Button>
      )}
    </div>
  );
}
