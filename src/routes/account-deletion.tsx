import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Card, meta, mailto, SUPPORT_EMAIL } from "@/components/InfoPage";

export const Route = createFileRoute("/account-deletion")({
  head: () => meta("Account & Data Deletion", "How to delete your Bespoke Music account and all your saved songs, playlists and notes."),
  component: () => (
    <InfoPage eyebrow="Your data, your choice" title="Account & Data Deletion">
      <Card>
        <h2>How to delete your account</h2>
        <p>Self-service deletion isn't available yet during Beta. Email <a href={mailto("Delete my Bespoke Music account")}>{SUPPORT_EMAIL}</a> from the email address you sign in with, asking to delete your account. We'll confirm by email and process it, usually within 30 days.</p>
      </Card>
      <section><h2>What gets deleted</h2><ul>
        <li>Your account and sign-in details.</li><li>All songs you added, including images.</li><li>Your playlists, notes, annotations, saved songs, and settings.</li>
      </ul></section>
      <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
        <h2>Before you go</h2>
        <p><b>Deletion is permanent and can't be undone.</b> Download a backup first from your account menu (Backup My Library) if you'd like to keep your songs.</p>
      </section>
      <section><h2>What we may keep</h2><p>Basic records like the deletion request email and short-lived security logs may be kept for a limited time where needed for legal or security reasons, then removed.</p></section>
    </InfoPage>
  ),
});
