import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listQuerySchema,
} from '../../schemas/transaction';

// 正常系・異常系テスト用の基本データ
const validData = {
  date: '2024-01-15',
  type: 'income' as const,
  category: '給与',
  description: '1月分給与',
  amount: 300000,
};

describe('createTransactionSchema', () => {
  // ---- 正常系 ----
  it('正常データは検証を通過する', () => {
    const result = createTransactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('type が expense でも検証を通過する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, type: 'expense' });
    expect(result.success).toBe(true);
  });

  it('category が 50 文字ちょうどなら通過する', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      category: 'あ'.repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it('description が 200 文字ちょうどなら通過する', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      description: 'a'.repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it('amount が 1 (最小値) で通過する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: 1 });
    expect(result.success).toBe(true);
  });

  // ---- 異常系 ----
  it('date が YYYY-MM-DD 形式でない場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, date: '2024/01/15' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/YYYY-MM-DD/);
    }
  });

  it('date が不完全な形式の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, date: '2024-1-5' });
    expect(result.success).toBe(false);
  });

  it('type が income/expense 以外の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, type: 'other' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/income.*expense|expense.*income/i);
    }
  });

  it('category が空文字の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, category: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/1文字以上/);
    }
  });

  it('category が 51 文字の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      category: 'あ'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/50文字以内/);
    }
  });

  it('amount が 0 の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/1以上/);
    }
  });

  it('amount が負数の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: -100 });
    expect(result.success).toBe(false);
  });

  it('amount が小数の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: 1000.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/整数/);
    }
  });

  it('amount が文字列の場合は失敗する', () => {
    const result = createTransactionSchema.safeParse({ ...validData, amount: '1000' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/数値/);
    }
  });

  it('必須フィールド (date) が欠如した場合は失敗する', () => {
    const { date: _, ...withoutDate } = validData;
    const result = createTransactionSchema.safeParse(withoutDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/必須/);
    }
  });
});

describe('updateTransactionSchema', () => {
  it('createTransactionSchema と同じ検証ルールを持つ（正常系）', () => {
    const result = updateTransactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('amount が 0 の場合は失敗する（異常系）', () => {
    const result = updateTransactionSchema.safeParse({ ...validData, amount: 0 });
    expect(result.success).toBe(false);
  });
});

describe('listQuerySchema', () => {
  // ---- 正常系 ----
  it('month パラメータなしで通過する', () => {
    const result = listQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBeUndefined();
    }
  });

  it('YYYY-MM 形式の month で通過する', () => {
    const result = listQuerySchema.safeParse({ month: '2024-01' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBe('2024-01');
    }
  });

  // ---- 異常系 ----
  it('YYYY/MM 形式の month で失敗する', () => {
    const result = listQuerySchema.safeParse({ month: '2024/01' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/YYYY-MM/);
    }
  });

  it('月が欠けた形式で失敗する', () => {
    const result = listQuerySchema.safeParse({ month: '2024' });
    expect(result.success).toBe(false);
  });

  it('日付まで含む形式で失敗する', () => {
    const result = listQuerySchema.safeParse({ month: '2024-01-01' });
    expect(result.success).toBe(false);
  });
});
