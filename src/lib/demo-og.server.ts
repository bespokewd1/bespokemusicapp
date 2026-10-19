import { Canvas, color } from '@sdxc/raster';
import { parseFont } from '@sdxc/font';
import { decode, encode } from '@sdxc/png';
import { isFailure } from '@sdxc/result';

// Fixed artwork palette, separate from the app's light/dark UI theme.
const PALETTE = { paper: '#ffffff', ink: '#111111', muted: '#626262', rule: '#dedede' };

export async function renderDemoOg(title: string, artist: string, fontBytes: Uint8Array, logoBytes: Uint8Array) {
  const font = parseFont(fontBytes);
  const logo = await decode(logoBytes);
  if (isFailure(font) || isFailure(logo)) throw new Error('Share artwork could not be read');
  const canvas = new Canvas(1200, 630);
  canvas.fillRect(0, 0, 1200, 630, color(PALETTE.paper));
  canvas.fillRect(425, 105, 1, 420, color(PALETTE.rule));
  const text = (content: string, y: number, size: number, minSize: number, maxLines: number, ink: string) =>
    canvas.text(content, { font: font.data, x: 485, y, size, minSize, maxLines, maxWidth: 635, tracking: 0, paint: color(ink) });
  text('bespokemusic.app', 120, 26, 26, 1, PALETTE.muted);
  text(artist, 220, 34, 18, 2, PALETTE.muted);
  text(title, 320, 64, 18, 3, PALETTE.ink);
  text('Chords & Lyrics', 535, 30, 30, 1, PALETTE.ink);
  const image = canvas.toImage();
  // Composite the original bitmap at its native dimensions: no redraw, crop or distortion.
  const left = Math.round((425 - logo.data.width) / 2);
  const top = Math.round((630 - logo.data.height) / 2);
  for (let y = 0; y < logo.data.height; y++) for (let x = 0; x < logo.data.width; x++) {
    const source = (y * logo.data.width + x) * 4;
    const target = ((top + y) * 1200 + left + x) * 4;
    const alpha = (logo.data.data[source + 3] ?? 255) / 255;
    for (let channel = 0; channel < 3; channel++) image.data[target + channel] = Math.round((logo.data.data[source + channel] ?? 0) * alpha + 255 * (1 - alpha));
    image.data[target + 3] = 255;
  }
  return encode(image);
}