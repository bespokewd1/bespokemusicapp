import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { FeedbackDialog } from "@/components/AccountExtras";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

const cls = "flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-8";

export function SiteFooter() {
  const { t } = useT();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  return (
    <footer className="mt-16 border-t border-border pt-8 pb-2 text-sm">
      <div className="mb-6">
          <p className="font-display text-lg font-semibold">Bespoke Music</p>
          <p className="mt-1 text-muted-foreground italic">{t("Your personal guitar songbook.")}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Smartphone className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            <Monitor className="-ml-1 h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            <span>{t("Play on mobile or desktop. No download required.")}</span>
          </p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <nav aria-label={t("Product")} className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Product")}</p>
          <Link to="/features" className={cls}>{t("Features")}</Link>
          <Link to="/about" className={cls}>{t("About")}</Link>
          <Link to="/whats-new" className={cls}>{t("What's New")}</Link>
        </nav>
        <nav aria-label={t("Community")} className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Community")}</p>
          <Link to="/support" className={cls}>{t("Help & Support")}</Link>
          <Button variant="ghost" onClick={() => setFeedbackOpen(true)} className="h-10 w-fit justify-start rounded-none p-0 font-normal text-muted-foreground hover:bg-transparent hover:text-foreground sm:h-8">{t("Send Feedback")}</Button>
        </nav>
        <nav aria-label={t("Legal")} className="col-span-2 flex flex-col sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Legal")}</p>
          <Link to="/privacy" className={cls}>{t("Privacy Policy")}</Link>
          <Link to="/terms" className={cls}>{t("Terms of Service")}</Link>
          <Link to="/account-deletion" className={cls}>{t("Delete Account & Data")}</Link>
        </nav>
      </div>
      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground lg:flex-row lg:justify-between">
        <p>{t("Beta · Designed & built in Canada 🇨🇦")}</p>
        <p>© 2026 Bespoke Music · <a href="https://bespokewebdesign.ca" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t("Built by Bespoke Web Design")}</a></p>
      </div>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </footer>
  );
}
