import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import pick from "@/assets/bespoke-pick.png.asset.json";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, loginReason, signInWithGoogle } = useStore();
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <img src={pick.url} alt="" width={300} height={349} className="mb-2 h-14 w-auto dark:invert" />
          <DialogTitle className="font-display text-2xl">Create Your Personal Songbook</DialogTitle>
          <DialogDescription>
            {loginReason || "Sign in to create playlists, save your favourite songs, and keep your music organized."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            className="h-12 w-full rounded-full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await signInWithGoogle();
              setBusy(false);
            }}
          >
            <GoogleIcon /> {busy ? "Opening Google…" : "Continue with Google"}
          </Button>
          <Button variant="ghost" className="h-11 w-full rounded-full" onClick={() => setLoginOpen(false)}>
            Cancel
          </Button>
          <p className="text-center text-xs text-muted-foreground">Free forever. No ads. No distractions.</p>
          <p className="text-center text-xs text-muted-foreground/70">We're in Beta and continuously improving. Thanks for being part of our early community.</p>
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
