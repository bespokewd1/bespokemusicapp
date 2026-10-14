import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FR } from "@/lib/i18n-fr";

export type Lang = "en" | "fr";
const KEY = "bm-lang";

/** Translate an English source string. Unknown strings fall back to English. `{name}` placeholders are filled from vars. */
export function translate(lang: Lang, s: string, vars?: Record<string, string | number>): string {
  let out = lang === "fr" ? (FR[s] ?? s) : s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string, vars?: Record<string, string | number>) => string };
const g = globalThis as unknown as { __bmLangCtx?: React.Context<Ctx | null> };
const LangContext = (g.__bmLangCtx ??= createContext<Ctx | null>(null));

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "fr") setLangState(saved);
    else if (navigator.language?.toLowerCase().startsWith("fr")) setLangState("fr");
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "fr" ? "fr-CA" : "en"; }, [lang]);
  const setLang = useCallback((l: Lang) => { setLangState(l); try { localStorage.setItem(KEY, l); } catch { /* private mode */ } }, []);
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (s, vars) => translate(lang, s, vars) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): Ctx {
  return useContext(LangContext) ?? { lang: "en", setLang: () => {}, t: (s, vars) => translate("en", s, vars) };
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useT();
  return (
    <div role="group" aria-label={t("Language")} className={`flex shrink-0 rounded-full border border-border p-0.5 text-xs font-semibold ${className}`}>
      {(["en", "fr"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}
          className={`min-h-8 min-w-9 rounded-full px-2 uppercase transition ${lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
