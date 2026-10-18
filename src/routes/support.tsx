import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, Card, meta, mailto, SUPPORT_EMAIL } from "@/components/InfoPage";

const FAQ = [
  ["How do I add a song?", "Sign in, then tap + Add Song. Paste your chords and lyrics or write from scratch, preview, and save."],
  ["How do I create a playlist?", "Sign in, then tap + Create Playlist on Home or open Playlists. Add songs from any song page."],
  ["How does auto-scroll work?", "On a song page tap Play. The sheet scrolls by itself; drag the speed slider to adjust. Tap again to pause."],
  ["How do I change the key or capo?", "Use the key − / + buttons on the song page. Capo is set when you add or edit a song."],
  ["How do I save my songs?", "Songs you add are saved to your account automatically and appear on any device you sign in with. You can also download a backup from your account menu."],
  ["Can I access songs offline?", "Not yet. Bespoke Music currently needs an internet connection. You can export a song as PDF to keep a copy."],
  ["How do I delete my account?", "See Account & Data Deletion — email us from your account's address and we'll remove everything."],
] as const;

export const Route = createFileRoute("/support")({
  head: () => meta("Support", "Help, common questions and how to contact Bespoke Music support.", "/support"),
  component: () => (
    <InfoPage eyebrow="We're here to help" title="Support">
      <Card><h2>Getting Started</h2><p>New here? The <Link to="/help">Getting Started guide</Link> walks through the basics in a few minutes.</p></Card>
      <section>
        <h2>Common Questions</h2>
        <div className="mt-3 space-y-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-xl border border-border bg-card px-4 py-3">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-muted-foreground">{a}{q.includes("delete") && <> <Link to="/account-deletion">Read more</Link>.</>}</p>
            </details>
          ))}
        </div>
      </section>
      <Card>
        <h2>Help Improve Bespoke Music</h2>
        <p>Bespoke Music is an independent project currently in Beta. Your feedback, suggestions, and bug reports help make it better.</p>
        <p>Found something that isn't working, or have an idea for an improvement? We'd love to hear from you.</p>
        <p><a href={mailto("Bespoke Music — Problem report")}>Report a problem</a> · <a href={mailto("Bespoke Music — Idea")}>Share an idea</a></p>
      </Card>
      <section>
        <h2>Contact Support</h2>
        <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. It's a small, independent project, so replies come from a real person as soon as possible.</p>
        <p>Copyright concern? See the <Link to="/terms" hash="copyright">copyright section of our Terms</Link>.</p>
      </section>
    </InfoPage>
  ),
});
