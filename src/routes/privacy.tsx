import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, meta, SUPPORT_EMAIL, EFFECTIVE_DATE } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy Policy", "How Bespoke Music collects, uses and protects your information, in plain language."),
  component: () => (
    <InfoPage eyebrow={`Effective ${EFFECTIVE_DATE}`} title="Privacy Policy">
      <p>Bespoke Music is a small, independently developed Beta app. This page explains, in plain language, what we collect and why.</p>
      <section><h2>Information We Collect</h2><ul>
        <li>Your email address and basic account details (such as the name and picture provided by Google, if you sign in with Google).</li>
        <li>Sign-in identifiers needed to keep you logged in securely.</li>
        <li>Songs, playlists, notes, annotations, images, and settings you save.</li>
        <li>Essential technical data (such as server logs) needed for security and to keep the app running.</li>
      </ul><p>We don't run advertising or tracking cookies. Your browser stores a sign-in session and a few display preferences on your device.</p></section>
      <section><h2>How Information Is Used</h2><ul>
        <li>To provide and maintain the app.</li><li>To save and sync your collection across devices.</li><li>To sign you in.</li><li>To respond to support requests.</li><li>To improve reliability and features.</li>
      </ul><p>We don't sell your information.</p></section>
      <section><h2>Your Song Content</h2><p>Songs, playlists, notes, and images you add are private to your account. Access is restricted by account-level permissions in our database, so other users can't see them. The site administrator can technically access stored data for maintenance and support. Only demo songs chosen by the administrator are public. Your content is not end-to-end encrypted.</p></section>
      <section><h2>Third-Party Services</h2><ul>
        <li><b>Lovable / Lovable Cloud</b> — app hosting, database, file storage, and sign-in.</li>
        <li><b>Google</b> — if you choose "Continue with Google".</li>
      </ul></section>
      <section><h2>Data Security</h2><p>We use reasonable security measures, such as encrypted connections and per-account access rules. No online service can guarantee absolute security.</p></section>
      <section><h2>Data Retention and Deletion</h2><p>We keep your data while your account is active. You can request deletion of your account and data at any time — see <Link to="/account-deletion">Account & Data Deletion</Link>. Backups or logs may take a short time to clear.</p></section>
      <section><h2>Changes</h2><p>This policy may be updated as the app evolves. We'll update the effective date above.</p></section>
      <section><h2>Contact</h2><p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p></section>
    </InfoPage>
  ),
});
