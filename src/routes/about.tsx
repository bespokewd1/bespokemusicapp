import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, Card, meta, SUPPORT_EMAIL } from "@/components/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => meta("About", "Bespoke Music is an independently built personal guitar songbook, made in Canada and currently in Beta."),
  component: () => (
    <InfoPage eyebrow="About Bespoke Music" title="Built for musicians who love to play.">
      <section>
        <p>Bespoke Music started as a simple idea: create a clean, distraction-free place to keep chords, lyrics, tabs, and favourite songs organized.</p>
        <p>As a guitarist, I wanted an easier way to keep my own collection together instead of searching through different apps, websites, and notes every time I wanted to play.</p>
        <p>Bespoke Music is designed for guitarists, singers, songwriters, and anyone who wants a personal music library that grows with them.</p>
        <p>Add your songs, organize playlists, customize your arrangements, and keep everything ready for your next practice, jam session, or performance.</p>
        <p className="font-semibold">No ads. No unnecessary distractions. Just your music.</p>
      </section>
      <Card>
        <h2>Currently in Beta</h2>
        <p>Bespoke Music is an independently developed application and a work in progress.</p>
        <p>Features may change, bugs may occur, and improvements will be made as the project grows.</p>
        <p>Thanks for trying it and being part of its early development.</p>
        <p className="font-semibold">Built with care in Canada. 🇨🇦</p>
      </Card>
      <p>
        Say hello at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · <Link to="/whats-new">See what's new</Link>
      </p>
    </InfoPage>
  ),
});
