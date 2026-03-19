import { describe, it, expect, vi, afterEach } from 'vitest';

// モジュールはテストごとに再インポートして env を制御するため vi.resetModules() を使用
afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('apiUrl', () => {
  // ---- 正常系 ----
  it('NEXT_PUBLIC_API_URL が未設定の場合、パスをそのまま返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    const { apiUrl } = await import('../../lib/api');
    expect(apiUrl('/api/transactions')).toBe('/api/transactions');
  });

  it('NEXT_PUBLIC_API_URL が設定されている場合、ベース URL + パスを返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    const { apiUrl } = await import('../../lib/api');
    expect(apiUrl('/api/transactions')).toBe('http://localhost:3001/api/transactions');
  });

  it('パスが空文字の場合、ベース URL のみを返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    const { apiUrl } = await import('../../lib/api');
    expect(apiUrl('')).toBe('http://localhost:3001');
  });
});
