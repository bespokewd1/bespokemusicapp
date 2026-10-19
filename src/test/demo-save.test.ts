import { describe, expect, it } from 'vitest';
import { demoSavePath, pendingDemoId } from '@/lib/demo-save';

describe('Explicit demo-save intent', () => {
  it('returns to the selected song after email confirmation', () => {
    expect(demoSavePath('demo-123')).toBe('/song/demo-123?saveDemo=1');
    expect(pendingDemoId('?saveDemo=1', '/song/demo-123', null)).toBe('demo-123');
  });
  it('does not save merely because a visitor opened a demo', () => {
    expect(pendingDemoId('', '/song/demo-123', null)).toBeNull();
  });
  it('remembers an explicit save across authentication on the homepage', () => {
    expect(pendingDemoId('', '/', 'selected-demo')).toBe('selected-demo');
  });
  it('rejects external redirect-like stored values', () => {
    expect(pendingDemoId('', '/', 'https://evil.example')).toBeNull();
  });
});