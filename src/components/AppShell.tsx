import { Link } from "@tanstack/react-router";
import { Compass, Library, ListMusic, Wrench, Music2 } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./LoginDialog";

const TABS = [
  { to: "/", label: "Explore", icon: Compass },
  { to: "/my-songs", label: "My Songs", icon: Library },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/tools", label: "Tools", icon: Wrench },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
        <Music2 className="h-4 w-4" />
      </span>
      <span className="truncate font-display text-xl font-semibold tracking-tight">
        Bespoke <span className="italic text-accent-foreground">Music</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { signedIn, signOut, setLoginOpen } = useStore();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:flex md:justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          {signedIn ? (
            <button onClick={signOut} className="flex items-center gap-2 text-sm" title="Sign out (demo)">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display font-semibold text-accent-foreground">
                A
              </span>
            </button>
          ) : (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setLoginOpen(true)}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
      <LoginDialog />
    </div>
  );
}
