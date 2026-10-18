import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta, SUPPORT_EMAIL, EFFECTIVE_DATE, mailto } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms of Service", "Terms for using the Bespoke Music Beta, including copyright and Beta disclaimers.", "/terms"),
  component: () => (
    <InfoPage eyebrow={`Effective ${EFFECTIVE_DATE}`} title="Terms of Service">
      <section><h2>Beta Status</h2><p>Bespoke Music is currently in Beta and provided for testing, personal use, and feedback. Features may change, become temporarily unavailable, or contain errors.</p></section>
      <section><h2>Service Availability</h2><p>We can't guarantee uninterrupted access, error-free functionality, or permanent availability.</p></section>
      <section><h2>Your Responsibility</h2><p>You're responsible for the content you add, upload, save, or share. Only upload material you own or have permission or another lawful basis to use.</p></section>
      <section><h2>Personal Backups</h2><p>Please keep your own backups of important songs. You can download one anytime from your account menu.</p></section>
      <section id="copyright" className="scroll-mt-24"><h2>Copyright</h2>
        <p>Songs, lyrics, tablature, and other musical content may be protected by copyright. Bespoke Music doesn't grant permission to copy or distribute third-party copyrighted content. Bespoke Music is primarily a personal songbook tool, not a public distribution platform, and privately saved songs are never made public automatically.</p>
        <p>We respect the rights of artists, songwriters, publishers, and other rights holders.</p>
        <h2 className="mt-4">Report Copyright Infringement</h2>
        <p>Email <a href={mailto("Copyright notice")}>{SUPPORT_EMAIL}</a> with:</p>
        <ul><li>Identification of the copyrighted work.</li><li>The specific content or location at issue.</li><li>Your contact information.</li><li>A statement explaining the claimed infringement.</li><li>Information showing you are the rights holder or an authorized representative.</li></ul>
        <p>We may review complaints and remove or restrict access to content where appropriate or legally required. Canadian notices are handled consistent with the Copyright Act's notice-and-notice approach, and U.S. notices in the spirit of the DMCA. We don't claim formal DMCA safe-harbour registration.</p>
        <p><b>Mistaken complaint?</b> If your content was removed and you believe it was a mistake, email us explaining why you have the right to use it, and we'll review it.</p>
      </section>
      <section><h2>Limitation of Liability</h2><p>The app is provided on an "as available" basis, without guarantees of uninterrupted or error-free operation. To the extent permitted by applicable law, we aren't liable for indirect losses, such as lost content, arising from use of the Beta. Nothing here limits rights you have that can't be limited by law.</p></section>
      <section><h2>Updates and Changes</h2><p>Features, these terms, and service availability may change as Beta development continues.</p></section>
      <section><h2>Governing Law</h2><p>These terms are governed by the laws of Alberta, Canada, subject to applicable mandatory consumer and privacy laws.</p></section>
      <section><h2>Contact</h2><p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p></section>
    </InfoPage>
  ),
});
