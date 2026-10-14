import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/reset-password")({
  head: () => meta("Reset Password", "Choose a new password for your Bespoke Music account."),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <InfoPage eyebrow="Account" title="Set a new password">
      <form
        className="max-w-sm space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) { toast.error(error.message); return; }
          toast.success("Password updated.");
          navigate({ to: "/" });
        }}
      >
        <Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" aria-label="New password" className="h-12" />
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">{busy ? "Saving…" : "Save new password"}</Button>
      </form>
    </InfoPage>
  );
}
