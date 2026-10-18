import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useT } from "@/lib/i18n";
import { approximateScrollBpm, SCROLL_PACE_PRESETS } from "@/lib/scroll-pace";

export function ScrollPaceSettings({ speed, onChange }: { speed: number; onChange: (speed: number) => void }) {
  const { t } = useT();
  return (
    <section aria-label={t("Auto-Scroll Speed")} className="min-w-0">
      <h2 className="text-sm font-semibold">{t("Auto-Scroll Speed")}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <output className="rounded-full bg-secondary px-3 py-1.5 font-mono text-sm font-semibold text-secondary-foreground" aria-live="polite">
          {speed.toFixed(1)}× · ≈{approximateScrollBpm(speed)} BPM
        </output>
        <span className="text-xs text-muted-foreground">{t("Approximate BPM guide")}</span>
      </div>
      <Slider className="mt-5" min={0.3} max={3} step={0.1} value={[speed]} onValueChange={([v]) => onChange(v ?? 1)} aria-label={t("Auto-scroll speed")} aria-valuetext={`${speed.toFixed(1)}×, ≈${approximateScrollBpm(speed)} BPM`} />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{t("Slow")}</span><span>{t("Normal")}</span><span>{t("Fast")}</span></div>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground"><span>≈20 BPM</span><span>≈100 BPM</span><span>≈180 BPM</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label={t("Pace presets")}>
        {SCROLL_PACE_PRESETS.map((preset) => (
          <Button key={preset.label} variant={Math.abs(speed - preset.speed) < 0.01 ? "default" : "secondary"} aria-pressed={Math.abs(speed - preset.speed) < 0.01} onClick={() => onChange(preset.speed)} className="h-auto min-h-12 flex-col gap-0.5 rounded-lg px-2 py-2">
            <span className="text-xs font-semibold">{t(preset.label)}</span>
            <span className="text-[11px] font-normal">≈{preset.bpm} BPM</span>
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("Use BPM as a guide to match a comfortable scrolling pace while playing.")}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t("Auto-scroll BPM is approximate and may vary depending on song length and formatting.")}</p>
    </section>
  );
}