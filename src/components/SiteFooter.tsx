import { useT, LanguageToggle, SHOW_LANGUAGE } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { mailto, SUPPORT_EMAIL } from "@/components/InfoPage";

const cls = "text-muted-foreground hover:text-foreground";

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="mt-16 border-t border-border pt-8 pb-2 text-sm">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg font-semibold">Bespoke Music</p>
          <p className="mt-1 text-muted-foreground italic">{t("Your songs. Your chords. Your music library.")}</p>
          {SHOW_LANGUAGE && <LanguageToggle className="mt-3 w-fit" />}
        </div>
        <nav aria-label={t("Product")} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Product")}</p>
          <Link to="/features" className={cls}>{t("Features")}</Link>
          <Link to="/about" className={cls}>{t("About")}</Link>
          <Link to="/whats-new" className={cls}>{t("What's New")}</Link>
        </nav>
        <nav aria-label={t("Help")} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Help")}</p>
          <Link to="/support" className={cls}>{t("Support")}</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={cls}>{t("Contact")}</a>
          <a href={mailto("Bespoke Music — Problem report")} className={cls}>{t("Report a Problem")}</a>
        </nav>
        <nav aria-label={t("Legal")} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Legal")}</p>
          <Link to="/privacy" className={cls}>{t("Privacy Policy")}</Link>
          <Link to="/terms" className={cls}>{t("Terms of Service")}</Link>
          <Link to="/account-deletion" className={cls}>{t("Account & Data Deletion")}</Link>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-1 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© 2026 Bespoke Music. <a href="https://bespokewebdesign.ca" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t("Built by Bespoke Web Design")}</a></p>
        <p>{t("Independently built in Canada 🇨🇦 · Currently in Beta")}</p>
      </div>
    </footer>
  );
}
