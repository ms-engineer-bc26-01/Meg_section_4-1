import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetcher } from '../../lib/fetcher';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetcher', () => {
  // ---- 正常系 ----
  it('fetch が成功した場合、JSON データを返す', async () => {
    const mockData = [{ id: 1, amount: 1000, type: 'income' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetcher('/api/transactions');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/transactions');
  });

  it('空配列が返ってきた場合も正しく受け取れる', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const result = await fetcher('/api/transactions');
    expect(result).toEqual([]);
  });

  // ---- 異常系 ----
  it('fetch が ok=false の場合、Error をスローする', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(fetcher('/api/transactions/999')).rejects.toThrow('Fetch error: 404');
  });

  it('fetch が ok=false (500) の場合、エラーメッセージにステータスコードが含まれる', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetcher('/api/transactions')).rejects.toThrow('Fetch error: 500');
  });

  it('ネットワークエラーが発生した場合、エラーをそのままスローする', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    await expect(fetcher('/api/transactions')).rejects.toThrow('Network Error');
  });
});
