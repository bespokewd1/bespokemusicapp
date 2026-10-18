import type { ReactNode } from "react";
import { siteUrl } from "@/lib/site";
import { PageHeader } from "@/components/PageHeader";

export const SUPPORT_EMAIL = "bespokewd1@gmail.com";
export const mailto = (subject: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
export const EFFECTIVE_DATE = "October 14, 2026";

export function InfoPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">{children}</section>;
}

export function meta(title: string, description: string, path: string) {
  return {
    meta: [
      { title: `${title} — Bespoke Music` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Bespoke Music` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl(path) },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl(path) }],
  };
}
