import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

// Prisma クライアントをモック化（DB 接続なしでテスト可能にする）
vi.mock('../../lib/prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// モック済みの prisma を取得
import { prisma } from '../../lib/prisma';
const mockPrisma = prisma.transaction as {
  findMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const app = createApp();

// テスト用サンプルデータ
const sampleTransaction = {
  id: 1,
  date: '2024-01-15',
  type: 'income',
  category: '給与',
  description: '1月分給与',
  amount: 300000,
  createdAt: new Date('2024-01-15T00:00:00Z'),
  updatedAt: new Date('2024-01-15T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---- ヘルスチェック ----
describe('GET /health', () => {
  it('200 で { status: "ok" } を返す', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

// ---- GET /api/transactions ----
describe('GET /api/transactions', () => {
  it('正常系: トランザクション一覧を 200 で返す', async () => {
    mockPrisma.findMany.mockResolvedValue([sampleTransaction]);
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(1);
  });

  it('正常系: month パラメータ付きで 200 を返す', async () => {
    mockPrisma.findMany.mockResolvedValue([sampleTransaction]);
    const res = await request(app).get('/api/transactions?month=2024-01');
    expect(res.status).toBe(200);
    expect(mockPrisma.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { date: { gte: '2024-01-01', lte: '2024-01-31' } },
      }),
    );
  });

  it('異常系: 不正な month 形式で 400 を返す', async () => {
    const res = await request(app).get('/api/transactions?month=invalid');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('異常系: YYYY-MM-DD 形式の month で 400 を返す', async () => {
    const res = await request(app).get('/api/transactions?month=2024-01-01');
    expect(res.status).toBe(400);
  });
});

// ---- GET /api/transactions/:id ----
describe('GET /api/transactions/:id', () => {
  it('正常系: 存在する id で 200 とデータを返す', async () => {
    mockPrisma.findUnique.mockResolvedValue(sampleTransaction);
    const res = await request(app).get('/api/transactions/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('異常系: 存在しない id で 404 を返す', async () => {
    mockPrisma.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/transactions/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('異常系: 数値でない id で 404 を返す', async () => {
    const res = await request(app).get('/api/transactions/abc');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ---- POST /api/transactions ----
describe('POST /api/transactions', () => {
  const newTransactionBody = {
    date: '2024-01-20',
    type: 'expense',
    category: '食費',
    description: 'スーパーでの買い物',
    amount: 5000,
  };

  it('正常系: 正常データで 201 と作成されたデータを返す', async () => {
    const created = { id: 2, ...newTransactionBody, createdAt: new Date(), updatedAt: new Date() };
    mockPrisma.create.mockResolvedValue(created);
    const res = await request(app).post('/api/transactions').send(newTransactionBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(2);
    expect(mockPrisma.create).toHaveBeenCalledTimes(1);
  });

  it('異常系: amount が 0 の場合は 400 を返す', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ ...newTransactionBody, amount: 0 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('異常系: type が不正な場合は 400 を返す', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ ...newTransactionBody, type: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('異常系: 必須フィールド欠如で 400 を返す', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ date: '2024-01-20', type: 'expense' });
    expect(res.status).toBe(400);
  });
});

// ---- PUT /api/transactions/:id ----
describe('PUT /api/transactions/:id', () => {
  const updateBody = {
    date: '2024-01-15',
    type: 'income',
    category: '給与',
    description: '修正済み給与',
    amount: 350000,
  };

  it('正常系: 正常データで 200 と更新データを返す', async () => {
    const updated = { id: 1, ...updateBody, createdAt: new Date(), updatedAt: new Date() };
    mockPrisma.update.mockResolvedValue(updated);
    const res = await request(app).put('/api/transactions/1').send(updateBody);
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('修正済み給与');
  });

  it('異常系: 存在しない id (P2025) で 404 を返す', async () => {
    mockPrisma.update.mockRejectedValue({ code: 'P2025' });
    const res = await request(app).put('/api/transactions/999').send(updateBody);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('異常系: バリデーション失敗で 400 を返す', async () => {
    const res = await request(app)
      .put('/api/transactions/1')
      .send({ ...updateBody, amount: -100 });
    expect(res.status).toBe(400);
  });
});

// ---- DELETE /api/transactions/:id ----
describe('DELETE /api/transactions/:id', () => {
  it('正常系: 存在する id で 200 とメッセージを返す', async () => {
    mockPrisma.delete.mockResolvedValue(sampleTransaction);
    const res = await request(app).delete('/api/transactions/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('異常系: 存在しない id (P2025) で 404 を返す', async () => {
    mockPrisma.delete.mockRejectedValue({ code: 'P2025' });
    const res = await request(app).delete('/api/transactions/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('異常系: 数値でない id で 404 を返す', async () => {
    const res = await request(app).delete('/api/transactions/abc');
    expect(res.status).toBe(404);
  });
});

// ---- 存在しないルート ----
describe('存在しないルート', () => {
  it('異常系: /api/unknown は 404 を返す', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
