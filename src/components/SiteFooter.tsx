import { Link } from "@tanstack/react-router";
import { mailto, SUPPORT_EMAIL } from "@/components/InfoPage";

const cls = "text-muted-foreground hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8 pb-2 text-sm">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg font-semibold">Bespoke Music</p>
          <p className="mt-1 text-muted-foreground italic">Your songs. Your chords. Your music library.</p>
        </div>
        <nav aria-label="Product" className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Product</p>
          <Link to="/features" className={cls}>Features</Link>
          <Link to="/about" className={cls}>About</Link>
          <Link to="/whats-new" className={cls}>What's New</Link>
        </nav>
        <nav aria-label="Help" className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Help</p>
          <Link to="/support" className={cls}>Support</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={cls}>Contact</a>
          <a href={mailto("Bespoke Music — Problem report")} className={cls}>Report a Problem</a>
        </nav>
        <nav aria-label="Legal" className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Legal</p>
          <Link to="/privacy" className={cls}>Privacy Policy</Link>
          <Link to="/terms" className={cls}>Terms of Service</Link>
          <Link to="/account-deletion" className={cls}>Account & Data Deletion</Link>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-1 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© 2026 Bespoke Music.</p>
        <p>Independently built in Canada 🇨🇦 · Currently in Beta</p>
      </div>
    </footer>
  );
}
