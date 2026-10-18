import { useState } from "react";
import { siteUrl } from "@/lib/site";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const APP_URL = siteUrl();
export const APP_TITLE = "Bespoke Music — Your Personal Guitar Songbook";

/** Native share sheet when available, otherwise copy the link. */
export async function shareLink(url: string, title: string, copiedMsg: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast(copiedMsg); } catch { toast(url); }
}

export function FeedbackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState(user?.email ?? "");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    const m = msg.trim();
    if (m.length < 3) { setErr(t("Please write a short message first.")); return; }
    const e = email.trim();
    if (e && !/^\S+@\S+\.\S+$/.test(e)) { setErr(t("That email address doesn't look right.")); return; }
    setErr(""); setSending(true);
    const { error } = await supabase.from("feedback").insert({ message: m.slice(0, 5000), email: e || null, user_id: user?.id ?? null });
    setSending(false);
    if (error) { toast.error(t("Couldn't send your feedback. Please try again.")); return; }
    toast.success(t("Thanks! Your feedback was sent."));
    setMsg(""); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("Send Feedback")}</DialogTitle>
          <DialogDescription>{t("Have a suggestion or found a bug? We'd love to hear from you.")}</DialogDescription>
        </DialogHeader>
        <label className="grid gap-1 text-sm font-medium">{t("Email address (optional)")}
          <Input type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium">{t("Your Feedback")}
          <Textarea value={msg} maxLength={5000} required onChange={(e) => setMsg(e.target.value)} className="min-h-32" />
        </label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="rounded-full" disabled={sending} onClick={submit}>{t(sending ? "Sending…" : "Submit Feedback")}</Button>
      </DialogContent>
    </Dialog>
  );
}
