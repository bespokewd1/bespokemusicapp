// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { renderDemoOg } from '@/lib/demo-og.server';
import { decode } from '@sdxc/png';
import { isFailure } from '@sdxc/result';
import logo from '@/assets/demo-share-pick.png.asset.json';
import font from '@/assets/demo-share-font.ttf.asset.json';
import { siteUrl } from '@/lib/site';

describe('Demo share artwork', () => {
  it('renders a 1200 by 630 PNG with the exact unchanged uploaded logo pixels', async () => {
    const [fontResponse, logoResponse] = await Promise.all([fetch(siteUrl(font.url)), fetch(siteUrl(logo.url))]);
    const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
    const original = await decode(logoBytes);
    const output = await decode(await renderDemoOg('A long song title with multiple words for a social media preview', 'A long artist name and the acoustic guitar ensemble', new Uint8Array(await fontResponse.arrayBuffer()), logoBytes));
    if (isFailure(output) || isFailure(original)) throw new Error('PNG decoding failed');
    expect([output.data.width, output.data.height]).toEqual([1200, 630]);
    const left = Math.round((425 - original.data.width) / 2);
    const top = Math.round((630 - original.data.height) / 2);
    const actual: number[] = [], expected: number[] = [];
    for (let y = 0; y < original.data.height; y++) for (let x = 0; x < original.data.width; x++) {
      const source = (y * original.data.width + x) * 4;
      const target = ((top + y) * 1200 + left + x) * 4;
      actual.push(...output.data.data.slice(target, target + 4));
      expected.push(...original.data.data.slice(source, source + 4));
    }
    expect(actual).toEqual(expected);
  }, 30000);
});