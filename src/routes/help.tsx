import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InfoPage, Card, meta, mailto } from "@/components/InfoPage";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/help")({
  head: () => meta("Getting Started", "A quick guide to saving, organizing and playing your songs with Bespoke Music."),
  component: Help,
});

function Help() {
  const { allSongs } = useStore();
  const demo = allSongs.filter((s) => !s.ownerId && s.published !== false && s.pickUp).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))[0];
  return (
    <InfoPage eyebrow="Help" title="Welcome to Bespoke Music">
      <p>Bespoke Music is your personal space for saving, organizing, and playing the songs you love. Whether you're learning guitar, practising your favourite songs, or preparing for a jam session, here's how to get started.</p>
      <Card>
        <h2>1. Try a Demo Song</h2>
        <p>Open a demo song on the Home page to see how the player works.</p>
        <Button asChild className="mt-3 rounded-full">
          {demo ? <Link to="/song/$id" params={{ id: demo.id }}>Try a Demo Song</Link> : <Link to="/" hash="demo-songs">Try a Demo Song</Link>}
        </Button>
      </Card>
      <Card>
        <h2>2. Learn the Player</h2>
        <ul>
          <li><b>Auto-scroll:</b> tap Play to start, tap again to pause and resume.</li>
          <li><b>Speed:</b> drag the slider from Slow to Fast.</li>
          <li><b>Size:</b> use the − / + size buttons to resize chords and lyrics.</li>
          <li><b>Key & capo:</b> use the key − / + buttons to transpose; the capo is shown with the song details.</li>
          <li><b>Nashville numbers:</b> switch chords to numbers for any key.</li>
          <li><b>Notes & annotations:</b> add private notes or draw on the sheet (sign-in needed).</li>
          <li><b>Tuner:</b> open Tools → Guitar Tuner.</li>
        </ul>
      </Card>
      <Card><h2>3. Create an Account</h2><p>Sign in with Google or email to save and manage your personal song collection.</p></Card>
      <Card><h2>4. Add Your First Song</h2><p>Paste chords, lyrics, or tabs, or create your own song from scratch. Preview the formatting and save it to My Songs.</p></Card>
      <Card><h2>5. Build Your Playlists</h2><p>Organize songs for practice, acoustic sessions, jam nights, or performances.</p></Card>
      <Card><h2>6. Start Playing</h2><p>Open your songs, adjust the display, and use the player to follow along. The more songs you add, the more useful your personal music library becomes.</p></Card>
      <section>
        <h2>Still Need Help?</h2>
        <p>Can't find what you're looking for? <a href={mailto("Bespoke Music — Help")}>Send us an email</a>, and we'll do our best to help.</p>
      </section>
    </InfoPage>
  );
}
