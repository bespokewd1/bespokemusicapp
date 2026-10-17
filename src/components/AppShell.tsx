import { useT } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { Compass, Library, ListMusic, Wrench, LayoutDashboard, LogOut, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoH from "@/assets/bespoke-logo-horizontal.png.asset.json";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./LoginDialog";
import { BackupDialog } from "./BackupDialog";
import { useState } from "react";
import { LanguageToggle, SHOW_LANGUAGE } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";
import { FeedbackDialog, shareLink, APP_URL, APP_TITLE } from "./AccountExtras";
import { MessageSquare, Share2 } from "lucide-react";
import { GlobalSearchProvider, SearchAction } from './GlobalSearch';
import { useRouterState } from '@tanstack/react-router';

const TABS = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/my-songs", label: "My Songs", icon: Library },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/tools", label: "Tools", icon: Wrench },
] as const;

export function Logo() {
  return (
    <Link to="/" aria-label="Bespoke Music" className="flex shrink-0 items-center py-1">
      <img src={logoH.url} alt="Bespoke Music" width={1398} height={349} className="h-8 w-auto dark:invert sm:h-9 md:h-10" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { signedIn, ready, setLoginOpen } = useStore();
  const { t: tr } = useT();
  const path = useRouterState({ select: state => state.location.pathname });
  return (
    <GlobalSearchProvider>
    <div className="min-h-screen bg-background text-foreground">
      <header data-chrome className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 px-4 py-3 md:flex md:justify-between">
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
                {tr(t.label)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
          {signedIn && path !== '/' && <SearchAction compact />}
          <span className={signedIn ? "" : "hidden md:block"}><ThemeToggle /></span>
          {!ready ? (
            <span className="h-9 w-20" />
          ) : signedIn ? (
            <AccountMenu />
          ) : (
            <Button size="sm" variant="outline" className="h-10 rounded-full px-4" onClick={() => setLoginOpen(true)}>
              {tr("Sign in")}
            </Button>
          )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-16">{children}<SiteFooter /></main>

      <nav data-chrome className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
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
              {tr(t.label)}
            </Link>
          ))}
        </div>
      </nav>
      <LoginDialog />
    </div>
    </GlobalSearchProvider>
  );
}

function AccountMenu() {
  const { user, isAdmin, signOut } = useStore();
  const { t: tr } = useT();
  const [backupOpen, setBackupOpen] = useState(false);
  const [fbOpen, setFbOpen] = useState(false);
  const name = (user?.user_metadata?.["full_name"] as string) || user?.email || tr("Account");
  const avatar = user?.user_metadata?.["avatar_url"] as string | undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={tr("Account menu")} className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-accent font-display font-semibold text-accent-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : name.charAt(0).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="truncate font-normal">
          <span className="block truncate font-semibold">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /> {tr("Admin Dashboard")}</Link>
          </DropdownMenuItem>
        )}
        {SHOW_LANGUAGE && <><div className="px-2 py-1.5">
          <p className="text-sm font-medium">{tr("Language")}</p>
          <p className="mb-1.5 text-xs text-muted-foreground">{tr("Choose your preferred language.")}</p>
          <LanguageToggle />
        </div>
        <DropdownMenuSeparator /></>}
        <DropdownMenuItem onClick={() => setBackupOpen(true)}><Download className="mr-2 h-4 w-4" /> {tr("Backup My Library")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFbOpen(true)} className="items-start">
          <MessageSquare className="mr-2 mt-0.5 h-4 w-4" />
          <span><span className="block">{tr("Send Feedback")}</span><span className="block text-xs text-muted-foreground">{tr("Have a suggestion or found a bug? We'd love to hear from you.")}</span></span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareLink(APP_URL, APP_TITLE, tr("Link copied"))} className="items-start">
          <Share2 className="mr-2 mt-0.5 h-4 w-4" />
          <span><span className="block">{tr("Share Bespoke Music")}</span><span className="block text-xs text-muted-foreground">{tr("Know a fellow musician? Share Bespoke Music with them.")}</span></span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> {tr("Sign out")}</DropdownMenuItem>
      </DropdownMenuContent>
      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
      <FeedbackDialog open={fbOpen} onOpenChange={setFbOpen} />
    </DropdownMenu>
  );
}
