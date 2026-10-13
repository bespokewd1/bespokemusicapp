import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { SongImage } from "@/lib/songs";

export function useImageUrl(path: string) {
  const { imageUrl } = useStore();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    imageUrl(path).then((u) => alive && setUrl(u));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return url;
}

function Img({ img, onRemove }: { img: SongImage; onRemove?: (() => void) | undefined }) {
  const url = useImageUrl(img.path);
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {url ? <img src={url} alt={img.caption || "Song reference image"} className="h-auto w-full" draggable={false} /> : <div className="h-40 animate-pulse bg-secondary" />}
      {img.caption && <figcaption className="px-3 py-2 text-sm text-muted-foreground">{img.caption}</figcaption>}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove image" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-soft">
          <X className="h-4 w-4" />
        </button>
      )}
    </figure>
  );
}

export function SongImages({ images, onRemove }: { images: SongImage[]; onRemove?: (path: string) => void }) {
  if (!images.length) return null;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {images.map((img) => <Img key={img.path} img={img} onRemove={onRemove ? () => onRemove(img.path) : undefined} />)}
    </div>
  );
}
