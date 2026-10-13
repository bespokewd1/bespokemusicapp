import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import pick from "@/assets/bespoke-pick.png.asset.json";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, loginReason, signIn } = useStore();
  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <img src={pick.url} alt="" width={300} height={349} className="mb-2 h-14 w-auto dark:invert" />
          <DialogTitle className="font-display text-2xl">Your songbook awaits</DialogTitle>
          <DialogDescription>
            {loginReason || "Sign in to save songs, add your own, and build playlists."} It's free — no ads, ever.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <Input type="email" placeholder="you@example.com" className="h-11" />
          <Button type="submit" className="h-11 w-full rounded-full">Continue with email</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={signIn}>
            Continue as demo user
          </Button>
          <p className="text-center text-xs text-muted-foreground">Prototype only — no real account is created.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
