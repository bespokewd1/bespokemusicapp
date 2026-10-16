import { useT } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { uniqueChords, type Song } from "@/lib/songs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SongCard({ song, action, playlistId, compact }: { song: Song; action?: React.ReactNode; playlistId?: string; compact?: boolean }) {
  const { saved, toggleSaved, requireAuth, signedIn } = useStore();
  const { t } = useT();
  const isSaved = signedIn && saved.includes(song.id);
  const chords = uniqueChords(song);
  return (
    <div className="group relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="soundhole grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-primary">
        {song.key}
      </div>
      <Link to="/song/$id" params={{ id: song.id }} search={playlistId ? { pl: playlistId } : {}} className="min-w-0 flex-1 after:absolute after:inset-0">
        <h3 className="truncate font-display text-lg font-semibold leading-tight">{song.title}</h3>
        <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
        {!compact && <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {chords.slice(0, 5).map((c) => (
            <span key={c} className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
              {c}
            </span>
          ))}
          {chords.length > 5 && <span className="text-xs text-muted-foreground">+{chords.length - 5}</span>}
          <span className="ml-auto text-xs text-muted-foreground">
            {song.difficulty}
            {song.capo ? ` · Capo ${song.capo}` : ""}
          </span>
        </div>}
      </Link>
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-1">
        <button
          aria-label={isSaved ? t("Unsave song") : t("Save song")}
          onClick={() => requireAuth("Sign in to save songs to your collection.", () => toggleSaved(song.id))}
          className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary"
        >
          <Heart className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
        </button>
        {action}
      </div>
    </div>
  );
}
