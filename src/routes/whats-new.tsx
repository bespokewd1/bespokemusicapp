import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Card, meta } from "@/components/InfoPage";

const RELEASES = [
  { date: "October 14, 2026", title: "Help, support & email sign-in", items: ["Sign in with your email as well as Google, with password reset.", "New Help, Support, About, Privacy, Terms and Account Deletion pages.", "Refreshed How It Works and a new site footer."] },
  { date: "October 2026", title: "Song page refresh", items: ["One Play button with a simple speed slider.", "Swiping no longer stops auto-scroll.", "Clearer Add Song steps with Convert & Preview."] },
  { date: "October 2026", title: "Tuner upgrades", items: ["Normal, Drop D and Drop C tuning.", "More accurate note detection and a tap sound on string buttons."] },
  { date: "October 2026", title: "Your library, saved", items: ["Songs, playlists and notes saved to your account across devices.", "Backup and restore your library.", "PDF export, Nashville numbers and annotations."] },
];

export const Route = createFileRoute("/whats-new")({
  head: () => meta("What's New", "New features, fixes and improvements in the Bespoke Music Beta.", "/whats-new"),
  component: () => (
    <InfoPage eyebrow="Beta updates" title="What's New">
      <p>Small notes on what's changed. Thanks for testing along the way!</p>
      {RELEASES.map((r) => (
        <Card key={r.title}>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{r.date} · <span className="rounded-full bg-secondary px-2 py-0.5">Beta</span></p>
          <h2 className="mt-2">{r.title}</h2>
          <ul>{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </Card>
      ))}
    </InfoPage>
  ),
});
