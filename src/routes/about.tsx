import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Guitar, MessageSquare, ArrowRight } from "lucide-react";
import { meta } from "@/components/InfoPage";
import { FeedbackDialog } from "@/components/AccountExtras";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { showSongbookInvitation } from "@/lib/about";

export const Route = createFileRoute("/about")({
  head: () => meta("About — Built by a Musician, for Musicians", "Discover the story behind Bespoke Music, an independently built guitar songbook from Canada. No ads, no distractions—just your music and your collection.", "/about"),
  component: About,
});

function About() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { signedIn, ready, requireAuth } = useStore();
  const navigate = useNavigate();

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-6 border-b border-border pb-6 sm:mb-8 sm:pb-8">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-accent-foreground"><Guitar className="h-4 w-4" aria-hidden="true" /> About Bespoke Music · Beta</p>
        <h1 className="max-w-2xl break-words font-display text-3xl font-semibold leading-tight md:text-4xl">Built by a Musician, for Musicians.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">A personal guitar songbook, independently built in Canada. One place for your songs, and more time for playing.</p>
      </header>
      <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90 sm:space-y-10 [&_p+p]:mt-3 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-foreground">
        <section aria-label="The Bespoke Music story">
          <p>I've been playing guitar for years, and like many musicians, I've tried different apps and tools to keep my music organized.</p>
          <p>From Google Keep and Apple Notes to chord websites and subscription-based apps, I've used just about everything to save my favorite songs, chords, and lyrics.</p>
          <p>But I kept running into the same problem: <strong>my music was scattered across different places.</strong></p>
          <p>Some apps had too many ads. Others felt cluttered with features I didn't need or required subscriptions just to access the tools I wanted.</p>
          <p>I simply wanted one place where I could keep my songs, organize playlists, and focus on playing music without distractions.</p>
          <p className="font-semibold text-foreground">That's why I created Bespoke Music.</p>
        </section>
        <section aria-labelledby="about-collection">
          <h2 id="about-collection">Your Music. Your Collection. Your Way.</h2>
          <p>Bespoke Music is a personal guitar songbook designed to keep things simple.</p>
          <p>Whether you're practicing at home, learning a new song, performing with friends, or writing your own music, the goal is to give you a clean space to build and organize your collection.</p>
          <p>Save your favorite chords and lyrics, create playlists, transpose songs, and use helpful tools—all in one place.</p>
          <p className="border-l-2 border-primary pl-4 font-semibold text-foreground">No ads. No distractions. Just you and your music.</p>
        </section>
        <section aria-labelledby="about-community">
          <h2 id="about-community">Let's Build Something Useful Together.</h2>
          <p>Bespoke Music is independently built in Canada and is currently in Beta.</p>
          <p>I'm still improving it, and I'd love to hear from fellow guitarists, songwriters, and musicians.</p>
          <p>If you find it useful, have an idea, or think something could work better, please share your feedback. Your suggestions can help shape what Bespoke Music becomes.</p>
          <p>At the end of the day, my goal is simple:</p>
          <p className="font-semibold text-foreground">Spend less time searching for your music and more time playing it.</p>
          <p className="italic">Thanks for being part of the journey.</p>
          <p className="text-sm text-muted-foreground">— Founder, Bespoke Music</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button className="h-11 rounded-full px-5" onClick={() => setFeedbackOpen(true)}><MessageSquare className="h-4 w-4" />Send Feedback</Button>
            {showSongbookInvitation(ready, signedIn) && <Button variant="ghost" className="h-11 rounded-full px-4" onClick={() => requireAuth("Create your free Beta account.", () => navigate({ to: "/my-songs" }))}>Start Your Songbook<ArrowRight className="h-4 w-4" /></Button>}
          </div>
        </section>
        <p className="border-t border-border pt-5 text-xs text-muted-foreground">
          Credits: chord audio uses steel-string acoustic guitar samples from the FluidR3 GM SoundFont by Frank Wen, rendered by Benjamin Gleitzman (<a className="underline underline-offset-2 hover:text-foreground" href="https://github.com/gleitz/midi-js-soundfonts">midi-js-soundfonts</a>), licensed <a className="underline underline-offset-2 hover:text-foreground" href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.
        </p>
      </div>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </article>
  );
}
