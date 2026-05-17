import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from '../src/lib/fetchJson.js';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves on first successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'ok' }),
    });
    const result = await fetchWithRetry('http://test.local/data.json');
    expect(result).toEqual({ data: 'ok' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries once on failure then succeeds', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'retry-ok' }),
      });
    const result = await fetchWithRetry('http://test.local/data.json', { retries: 1, backoffMs: 0 });
    expect(result).toEqual({ data: 'retry-ok' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws after all retries exhausted', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(
      fetchWithRetry('http://test.local/data.json', { retries: 1, backoffMs: 0 }),
    ).rejects.toThrow('always fails');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
