import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TotpSetupProps {
  onComplete: () => void;
}

export function TotpSetup({ onComplete }: TotpSetupProps) {
  const [step, setStep] = useState<"generate" | "verify">("generate");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSecret = useMutation(api.mutations.totp.generateSecret);
  const verify = useMutation(api.mutations.totp.verify);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateSecret();
      setSecret(result.secret);
      setUri(result.uri);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate secret");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verify({ code });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "generate") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set up an authenticator app (like Google Authenticator, Authy, or 1Password) to secure your account.
        </p>
        <Button onClick={handleGenerate} className="w-full" disabled={loading}>
          {loading ? "Generating..." : "Set Up Authenticator"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Your secret key:</p>
        <p className="font-mono text-sm break-all select-all">{secret}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={uri}
          className="text-xs text-primary underline hover:text-primary/80"
        >
          Open in authenticator app
        </a>
      </div>
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totp-code">Enter the 6-digit code</Label>
          <Input
            id="totp-code"
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
          {loading ? "Verifying..." : "Verify & Enable"}
        </Button>
      </form>
    </div>
  );
}
