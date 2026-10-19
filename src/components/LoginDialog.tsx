import { useT } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import pick from "@/assets/bespoke-pick.png.asset.json";
import { DEMO_SAVE_REASON, DEMO_SAVE_KEY, demoSavePath } from '@/lib/demo-save';

type Mode = "choose" | "signin" | "signup" | "forgot" | "sent";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, loginReason, signInWithGoogle } = useStore();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [sentMsg, setSentMsg] = useState("");
  const demoSave = loginReason === DEMO_SAVE_REASON;

  const close = (o: boolean) => { setLoginOpen(o); if (!o) { setMode("choose"); setPw(""); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        close(false);
      } else if (mode === "signup") {
        const pending = localStorage.getItem(DEMO_SAVE_KEY);
        const redirectPath = demoSave && pending ? demoSavePath(pending) : '/';
        const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}${redirectPath}` } });
        if (error) throw error;
        if (data.session) close(false);
        else { setSentMsg(t("We sent a confirmation link to {email}. Open it to finish creating your account.", { email })); setMode("sent"); }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSentMsg(t("If an account exists for {email}, a reset link is on its way.", { email })); setMode("sent");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  const title = t(mode === 'choose' && demoSave ? DEMO_SAVE_REASON : mode === "signup" ? "Create your Bespoke Music account" : mode === "forgot" ? "Reset your password" : mode === "sent" ? "Check your email" : "Sign in to Bespoke Music");

  return (
    <Dialog open={loginOpen} onOpenChange={close}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <img src={pick.url} alt="Bespoke Music" width={300} height={349} className="mb-2 h-14 w-auto dark:invert" />
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {mode === "sent" ? sentMsg : t(demoSave ? 'Create your free account to save your favorite songs, organize chords and lyrics, and build playlists.' : loginReason || "Sign in to create playlists, save your favourite songs, and keep your music organized.")}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="space-y-2">
            {demoSave && <>
              <Button className="h-12 w-full rounded-full" onClick={() => setMode('signup')}>Create Free Account</Button>
              <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setMode('signin')}>Log In</Button>
            </>}
            <Button className="h-12 w-full rounded-full" disabled={busy} onClick={async () => { setBusy(true); await signInWithGoogle(); setBusy(false); }}>
              <GoogleIcon /> {busy ? t("Opening Google…") : t("Continue with Google")}
            </Button>
            {!demoSave && <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setMode("signin")}>{t("Continue with Email")}</Button>}
          </div>
        )}

        {(mode === "signin" || mode === "signup" || mode === "forgot") && (
          <form onSubmit={submit} className="space-y-2">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Email")} aria-label={t("Email")} className="h-12" />
            {mode !== "forgot" && (
              <Input type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={mode === "signup" ? t("Password (8+ characters)") : t("Password")} aria-label={t("Password")} className="h-12" />
            )}
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">
              {t(busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link")}
            </Button>
            <div className="flex justify-between text-sm">
              {mode === "signin" ? (
                <>
                  <button type="button" className="text-primary hover:underline" onClick={() => setMode("signup")}>{t("New here? Create account")}</button>
                  <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>{t("Forgot password?")}</button>
                </>
              ) : (
                <button type="button" className="text-primary hover:underline" onClick={() => setMode("signin")}>{t("Have an account? Sign in")}</button>
              )}
            </div>
            <button type="button" className="w-full pt-1 text-xs text-muted-foreground hover:underline" onClick={() => setMode("choose")}>{t("← Other sign-in options")}</button>
          </form>
        )}

        {mode === "sent" && <Button className="h-11 w-full rounded-full" onClick={() => setMode("signin")}>{t("Back to sign in")}</Button>}

        <div className="space-y-1">
          {mode === "choose" && <Button variant="ghost" className="h-11 w-full rounded-full" onClick={() => close(false)}>{t("Cancel")}</Button>}
          <p className="text-center text-xs text-muted-foreground">{t("Free during Beta. No ads. No distractions.")}</p>
          <p className="text-center text-xs text-muted-foreground/70">
            {t("By continuing you agree to our")} <Link to="/terms" onClick={() => close(false)} className="underline">{t("Terms")}</Link> {t("and")} <Link to="/privacy" onClick={() => close(false)} className="underline">{t("Privacy Policy")}</Link>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.72 14.56 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51Z" />
    </svg>
  );
}
