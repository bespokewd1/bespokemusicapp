import { siteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CloudCheck, Download, LogOut, MessageSquare, Share2, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT, LanguageToggle } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { BackupDialog } from "@/components/BackupDialog";
import { FeedbackDialog, shareLink, APP_URL, APP_TITLE } from "@/components/AccountExtras";
import { SignedOutState } from "@/components/SignedOutState";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { property: "og:url", content: siteUrl("/profile") },
      { title: "My Profile — Bespoke Music" },
      { name: "description", content: "Your Bespoke Music profile, collection stats, preferences, backup and account settings." },
      { property: "og:title", content: "My Profile — Bespoke Music" },
      { property: "og:description", content: "Your Bespoke Music profile, collection stats, preferences, backup and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/profile") }],
  }),
  component: ProfilePage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useT();
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t(title)}</h2>
      {children}
    </section>
  );
}

function ProfilePage() {
  const { ready, signedIn, user, signOut } = useStore();
  const { t } = useT();
  const [backupOpen, setBackupOpen] = useState(false);
  const [fbOpen, setFbOpen] = useState(false);

  if (!ready) return null;
  if (!signedIn || !user) {
    return <SignedOutState title="Your profile" text="Sign in to see your profile, preferences and library backup." />;
  }

  const name = (user.user_metadata?.["full_name"] as string) || user.email?.split("@")[0] || t("Musician");
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("My Profile")}</h1>

      {/* 1. Profile information */}
      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-display text-xl font-semibold text-accent-foreground">
          {user.user_metadata?.["avatar_url"]
            ? <img src={user.user_metadata["avatar_url"] as string} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            : name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{t("Member since {date}", { date: memberSince })}</p>
        </div>
      </section>

      {/* 2. Preferences */}
      <Section title="Preferences">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium">{t("Appearance")}</span>
          <ThemeToggle />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-sm font-medium">{t("Language")}</span>
          <LanguageToggle />
        </div>
      </Section>

      {/* 4. Library cloud + backup */}
      <Section title="My Library">
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-3">
          <CloudCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">{t("Your music is saved to the cloud")}</p>
            <p className="text-xs text-muted-foreground">{t("Your songs and playlists are saved automatically and available when you sign in on another device.")}</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Button variant="outline" className="h-11 w-full justify-start rounded-full" onClick={() => setBackupOpen(true)}>
            <Download className="mr-2 h-4 w-4" /> {t("Backup My Library")}
          </Button>
          <p className="px-1 text-xs text-muted-foreground">{t("Download a personal copy of your music collection. Images and drawings aren't included in the file.")}</p>
          <Button variant="outline" className="h-11 w-full justify-start rounded-full" onClick={() => setBackupOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> {t("Restore Library")}
          </Button>
          <p className="px-1 text-xs text-muted-foreground">{t("Import a previous Bespoke Music backup. Existing songs are kept — duplicates are skipped.")}</p>
        </div>
      </Section>

      {/* 5. Support */}
      <Section title="Support">
        <div className="space-y-2">
          <Button variant="outline" className="h-11 w-full justify-start rounded-full" onClick={() => setFbOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" /> {t("Send Feedback")}
          </Button>
          <Button variant="outline" className="h-11 w-full justify-start rounded-full" onClick={() => shareLink(APP_URL, APP_TITLE, t("Link copied"))}>
            <Share2 className="mr-2 h-4 w-4" /> {t("Share Bespoke Music")}
          </Button>
        </div>
      </Section>

      {/* 6. Sign out */}
      <div className="border-t border-border pt-4 pb-2">
        <Button variant="ghost" className="h-11 w-full rounded-full text-muted-foreground" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> {t("Sign out")}
        </Button>
      </div>

      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
      <FeedbackDialog open={fbOpen} onOpenChange={setFbOpen} />
    </div>
  );
}
